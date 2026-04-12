const reportModel = require("../models/report.model");
const REPORT_REASONS = require("../models/report.model").REPORT_REASONS;
const userModel = require("../models/user.model");
const formationModel = require("../models/formation.model");
const inscriptionModel = require("../models/inscription.model");

module.exports.getReasons = async (req, res) => {
  try {
    const { type } = req.query;
    if (type && REPORT_REASONS[type]) {
      return res.status(200).json({ data: REPORT_REASONS[type] });
    }
    res.status(200).json({ data: REPORT_REASONS });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createReport = async (req, res) => {
  try {
    const { type, targetId, reason, description } = req.body;
    const reporterId = req.user._id;

    if (!type || !targetId || !reason) {
      return res.status(400).json({ message: "type, targetId, and reason are required" });
    }

    const validTypes = ["user", "formation", "centre", "formateur"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: `type must be one of: ${validTypes.join(", ")}` });
    }

    const validReasons = REPORT_REASONS[type] || [];
    if (!validReasons.includes(reason)) {
      return res.status(400).json({ message: `Invalid reason for type '${type}'` });
    }

    const targetExists = await checkTargetExists(type, targetId);
    if (!targetExists) {
      return res.status(404).json({ message: `${type} not found` });
    }

    if (type === "formation") {
      const isEnrolled = await inscriptionModel.findOne({
        apprenantId: reporterId,
        formationId: targetId,
      });
      if (!isEnrolled) {
        return res.status(403).json({ message: "You must be enrolled to report this formation" });
      }
    }

    const existingReport = await reportModel.findOne({
      type,
      targetId,
      reason,
      status: { $in: ["pending", "reviewed"] },
    });

    if (existingReport) {
      const alreadyReported = existingReport.reporters.some(
        r => r.reporterId.toString() === reporterId.toString()
      );
      
      if (alreadyReported) {
        return res.status(400).json({ message: "You have already reported this with the same reason" });
      }

      existingReport.reporters.push({
        reporterId,
        reason,
        description,
        reportedAt: new Date(),
      });
      existingReport.reportsCount = existingReport.reporters.length;
      await existingReport.save();

      return res.status(200).json({
        message: "Report submitted. Your complaint has been added to the existing report.",
        data: {
          _id: existingReport._id,
          type: existingReport.type,
          targetId: existingReport.targetId,
          reason: existingReport.reason,
          reportsCount: existingReport.reportsCount,
          status: existingReport.status,
        },
      });
    }

    const newReport = new reportModel({
      reporterId,
      reporterRole: req.user.role,
      type,
      targetId,
      reason,
      description,
      reporters: [{
        reporterId,
        reason,
        description,
        reportedAt: new Date(),
      }],
    });
    await newReport.save();

    res.status(201).json({
      message: "Report submitted successfully",
      data: {
        _id: newReport._id,
        type: newReport.type,
        targetId: newReport.targetId,
        reason: newReport.reason,
        reportsCount: newReport.reportsCount,
        status: newReport.status,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getMyReports = async (req, res) => {
  try {
    const reports = await reportModel.find({
      "reporters.reporterId": req.user._id,
    })
      .sort({ createdAt: -1 });

    const formattedReports = await Promise.all(
      reports.map(async (r) => {
        const targetInfo = await getTargetInfo(r.type, r.targetId);
        return {
          _id: r._id,
          type: r.type,
          targetId: r.targetId,
          targetInfo,
          reason: r.reason,
          description: r.description,
          status: r.status,
          createdAt: r.createdAt,
        };
      })
    );

    res.status(200).json({
      message: "My reports retrieved successfully",
      data: formattedReports,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getReports = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    let query = {};

    if (status) query.status = status;
    if (type) query.type = type;

    const skip = (Number(page) - 1) * Number(limit);

    const [reports, total] = await Promise.all([
      reportModel.find(query)
        .sort({ reportsCount: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      reportModel.countDocuments(query),
    ]);

    const formattedReports = await Promise.all(
      reports.map(async (r) => {
        const targetInfo = await getTargetInfo(r.type, r.targetId);
        return {
          _id: r._id,
          type: r.type,
          targetId: r.targetId,
          targetInfo,
          reason: r.reason,
          description: r.description,
          reportsCount: r.reportsCount,
          status: r.status,
          createdAt: r.createdAt,
        };
      })
    );

    res.status(200).json({
      data: formattedReports,
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

module.exports.getReportById = async (req, res) => {
  try {
    const report = await reportModel.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const targetInfo = await getTargetInfo(report.type, report.targetId);

    const reportersInfo = await Promise.all(
      report.reporters.map(async (r) => {
        const user = await userModel.findById(r.reporterId).select("nom prenom email role");
        return {
          reporterId: r.reporterId,
          nom: user?.nom,
          prenom: user?.prenom,
          email: user?.email,
          role: user?.role,
          reason: r.reason,
          description: r.description,
          reportedAt: r.reportedAt,
        };
      })
    );

    let reviewInfo = null;
    if (report.reviewedBy) {
      const admin = await userModel.findById(report.reviewedBy).select("nom prenom");
      reviewInfo = {
        reviewedBy: {
          _id: admin._id,
          nom: admin.nom,
          prenom: admin.prenom,
        },
        reviewNote: report.reviewNote,
        action: report.action,
        resolvedAt: report.resolvedAt,
      };
    }

    res.status(200).json({
      data: {
        _id: report._id,
        type: report.type,
        targetId: report.targetId,
        targetInfo,
        reason: report.reason,
        description: report.description,
        reportsCount: report.reportsCount,
        status: report.status,
        reporters: reportersInfo,
        review: reviewInfo,
        createdAt: report.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.reviewReport = async (req, res) => {
  try {
    const { status, action, reviewNote } = req.body;

    if (!status) {
      return res.status(400).json({ message: "status is required" });
    }

    const validStatuses = ["reviewed", "resolved", "dismissed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${validStatuses.join(", ")}` });
    }

    const report = await reportModel.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (report.status !== "pending") {
      return res.status(400).json({ message: "Report has already been reviewed" });
    }

    const updates = {
      status,
      reviewedBy: req.user._id,
      reviewNote: reviewNote || null,
      action: action || null,
    };

    if (status === "resolved") {
      updates.resolvedAt = new Date();
    }

    await reportModel.findByIdAndUpdate(req.params.id, updates);

    if (status === "resolved" && action) {
      await takeAction(report.type, report.targetId, action);
    }

    res.status(200).json({ message: "Report reviewed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

async function checkTargetExists(type, targetId) {
  switch (type) {
    case "user":
      return await userModel.findById(targetId);
    case "formation":
      return await formationModel.findById(targetId);
    case "centre":
      return await require("../models/centreFormation.model").findById(targetId);
    case "formateur":
      return await userModel.findById(targetId);
    default:
      return false;
  }
}

async function getTargetInfo(type, targetId) {
  switch (type) {
    case "user":
    case "formateur": {
      const user = await userModel.findById(targetId).select("nom prenom email role user_image");
      return user ? {
        _id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        user_image: user.user_image,
      } : null;
    }
    case "formation": {
      const formation = await formationModel.findById(targetId).select("titre description prix");
      return formation ? {
        _id: formation._id,
        titre: formation.titre,
        description: formation.description,
        prix: formation.prix,
      } : null;
    }
    case "centre": {
      const centre = await require("../models/centreFormation.model").findById(targetId).select("nom adresse");
      return centre ? {
        _id: centre._id,
        nom: centre.nom,
        adresse: centre.adresse,
      } : null;
    }
    default:
      return null;
  }
}

async function takeAction(type, targetId, action) {
  switch (type) {
    case "user":
    case "formateur":
      if (action === "block") {
        await userModel.findByIdAndUpdate(targetId, { block: true, blockReason: "Violation reported by users" });
      } else if (action === "warn") {
        // Future: Add warning system
      }
      break;
    case "formation":
      if (action === "delete") {
        await formationModel.findByIdAndDelete(targetId);
      } else if (action === "hide") {
        await formationModel.findByIdAndUpdate(targetId, { hidden: true });
      }
      break;
    case "centre":
      if (action === "suspend") {
        await require("../models/centreFormation.model").findByIdAndUpdate(targetId, { suspended: true });
      }
      break;
  }
}
