const userModel = require("../models/user.model");
const formationModel = require("../models/formation.model");
const inscriptionModel = require("../models/inscription.model");
const paiementModel = require("../models/paiement.model");
const blockHistoryModel = require("../models/blockHistory.model");

module.exports.getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      blockedUsers,
      usersByRole,
      totalFormations,
      totalEnrollments,
      confirmedPayments,
    ] = await Promise.all([
      userModel.countDocuments(),
      userModel.countDocuments({ block: false }),
      userModel.countDocuments({ block: true }),
      userModel.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } }
      ]),
      formationModel.countDocuments(),
      inscriptionModel.countDocuments(),
      paiementModel.aggregate([
        { $match: { statut: "confirmé" } },
        { $group: { _id: null, total: { $sum: "$montant" } } }
      ]),
    ]);

    res.status(200).json({
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          blocked: blockedUsers,
          byRole: usersByRole.reduce((acc, r) => { acc[r._id] = r.count; return acc; }, {}),
        },
        formations: {
          total: totalFormations,
        },
        enrollments: {
          total: totalEnrollments,
        },
        revenue: {
          total: confirmedPayments[0]?.total || 0,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getUsers = async (req, res) => {
  try {
    const { role, blocked, search, page = 1, limit = 20 } = req.query;
    let query = {};

    if (role) query.role = role;
    if (blocked !== undefined) query.block = blocked === "true";
    if (search) {
      query.$or = [
        { nom: { $regex: search, $options: "i" } },
        { prenom: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      userModel.find(query)
        .select("-password -loginAttempts -resetPasswordToken -resetPasswordExpires")
        .populate("blockedBy", "nom prenom")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      userModel.countDocuments(query),
    ]);

    res.status(200).json({
      data: users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getUserById = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id)
      .select("-password -loginAttempts -resetPasswordToken -resetPasswordExpires")
      .populate("blockedBy", "nom prenom");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const [inscriptions, paiements, favoris] = await Promise.all([
      inscriptionModel.find({ apprenantId: req.params.id })
        .populate("formationId", "titre")
        .sort({ createdAt: -1 }),
      paiementModel.find({ apprenantId: req.params.id })
        .populate("inscriptionId", "formationId")
        .sort({ createdAt: -1 }),
      blockHistoryModel.find({ userId: req.params.id })
        .populate("adminId", "nom prenom")
        .sort({ createdAt: -1 }),
    ]);

    res.status(200).json({
      data: {
        user: {
          _id: user._id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          role: user.role,
          telephone: user.telephone,
          user_image: user.user_image,
          block: user.block,
          blockReason: user.blockReason,
          blockedAt: user.blockedAt,
          blockExpiresAt: user.blockExpiresAt,
          blockedBy: user.blockedBy,
          createdAt: user.createdAt,
        },
        activity: {
          inscriptions: inscriptions.map(i => ({
            _id: i._id,
            statut: i.statut,
            formationTitre: i.formationId?.titre,
            createdAt: i.createdAt,
          })),
          payments: paiements.map(p => ({
            _id: p._id,
            montant: p.montant,
            statut: p.statut,
            methodePaiement: p.methodePaiement,
            createdAt: p.createdAt,
          })),
        },
        blockHistory,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.blockUser = async (req, res) => {
  try {
    const { reason, expiresInDays } = req.body;
    const userId = req.params.id;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot block yourself" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.block) {
      return res.status(400).json({ message: "User is already blocked" });
    }

    const updates = {
      block: true,
      blockReason: reason || null,
      blockedAt: new Date(),
      blockedBy: req.user._id,
    };

    if (expiresInDays) {
      updates.blockExpiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
    }

    await userModel.findByIdAndUpdate(userId, updates);

    await blockHistoryModel.create({
      userId,
      action: "blocked",
      reason: reason || null,
      adminId: req.user._id,
    });

    res.status(200).json({ message: "User blocked successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.unblockUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.block) {
      return res.status(400).json({ message: "User is not blocked" });
    }

    await userModel.findByIdAndUpdate(userId, {
      block: false,
      blockReason: null,
      blockedAt: null,
      blockedBy: null,
      blockExpiresAt: null,
    });

    await blockHistoryModel.create({
      userId,
      action: "unblocked",
      adminId: req.user._id,
    });

    res.status(200).json({ message: "User unblocked successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getFormationStats = async (req, res) => {
  try {
    const [formationsPerCentre, enrollmentsPerFormation, categoriesDistribution, topFormations] = await Promise.all([
      formationModel.aggregate([
        {
          $group: {
            _id: "$centreId",
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "centreformations",
            localField: "_id",
            foreignField: "_id",
            as: "centre",
          },
        },
        { $unwind: { path: "$centre", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            centreNom: "$centre.nom",
            count: 1,
          },
        },
      ]),
      inscriptionModel.aggregate([
        { $group: { _id: "$formationId", count: { $sum: 1 } } },
        {
          $lookup: {
            from: "formations",
            localField: "_id",
            foreignField: "_id",
            as: "formation",
          },
        },
        { $unwind: "$formation" },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $project: {
            formationTitre: "$formation.titre",
            count: 1,
          },
        },
      ]),
      formationModel.aggregate([
        { $group: { _id: "$categorieId", count: { $sum: 1 } } },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "categorie",
          },
        },
        { $unwind: { path: "$categorie", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            categorieNom: "$categorie.nom",
            count: 1,
          },
        },
      ]),
      formationModel.aggregate([
        {
          $lookup: {
            from: "inscriptions",
            localField: "_id",
            foreignField: "formationId",
            as: "inscriptions",
          },
        },
        {
          $lookup: {
            from: "paiements",
            localField: "inscriptions._id",
            foreignField: "inscriptionId",
            as: "paiements",
          },
        },
        { $match: { "paiements.statut": "confirmé" } },
        {
          $project: {
            titre: 1,
            prix: 1,
            revenue: {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: "$paiements",
                      as: "p",
                      cond: { $eq: ["$$p.statut", "confirmé"] },
                    },
                  },
                  as: "p",
                  in: "$$p.montant",
                },
              },
            },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
      ]),
    ]);

    res.status(200).json({
      data: {
        formationsPerCentre,
        enrollmentsPerFormation,
        categoriesDistribution,
        topEarningFormations: topFormations,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getPaiementStats = async (req, res) => {
  try {
    const [totalRevenue, pendingPayments, revenueByCentre, recentPayments] = await Promise.all([
      paiementModel.aggregate([
        { $match: { statut: "confirmé" } },
        { $group: { _id: null, total: { $sum: "$montant" }, count: { $sum: 1 } } },
      ]),
      paiementModel.aggregate([
        { $match: { statut: "en_attente" } },
        { $group: { _id: null, total: { $sum: "$montant" }, count: { $sum: 1 } } },
      ]),
      paiementModel.aggregate([
        { $match: { statut: "confirmé" } },
        {
          $lookup: {
            from: "inscriptions",
            localField: "inscriptionId",
            foreignField: "_id",
            as: "inscription",
          },
        },
        { $unwind: "$inscription" },
        {
          $lookup: {
            from: "formations",
            localField: "inscription.formationId",
            foreignField: "_id",
            as: "formation",
          },
        },
        { $unwind: "$formation" },
        {
          $lookup: {
            from: "centreformations",
            localField: "formation.centreId",
            foreignField: "_id",
            as: "centre",
          },
        },
        { $unwind: { path: "$centre", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: "$formation.centreId",
            centreNom: { $first: "$centre.nom" },
            total: { $sum: "$montant" },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ]),
      paiementModel.find()
        .populate("inscriptionId", "formationId")
        .populate("apprenantId", "nom prenom")
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    res.status(200).json({
      data: {
        totalRevenue: totalRevenue[0] || { total: 0, count: 0 },
        pendingPayments: pendingPayments[0] || { total: 0, count: 0 },
        revenueByCentre,
        recentPayments: recentPayments.map(p => ({
          _id: p._id,
          montant: p.montant,
          statut: p.statut,
          apprenantNom: p.apprenantId?.nom,
          apprenantPrenom: p.apprenantId?.prenom,
          createdAt: p.createdAt,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getReportUsers = async (req, res) => {
  try {
    const days = Number(req.query.days) || 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const count = await userModel.countDocuments({ createdAt: { $gte: since } });

    res.status(200).json({
      data: {
        period: `${days} days`,
        newUsers: count,
        since: since.toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getReportEnrollments = async (req, res) => {
  try {
    const days = Number(req.query.days) || 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const count = await inscriptionModel.countDocuments({ createdAt: { $gte: since } });

    res.status(200).json({
      data: {
        period: `${days} days`,
        newEnrollments: count,
        since: since.toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getReportRevenue = async (req, res) => {
  try {
    const days = Number(req.query.days) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const revenue = await paiementModel.aggregate([
      { $match: { statut: "confirmé", createdAt: { $gte: since } } },
      { $group: { _id: null, total: { $sum: "$montant" }, count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      data: {
        period: `${days} days`,
        revenue: revenue[0]?.total || 0,
        transactions: revenue[0]?.count || 0,
        since: since.toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
