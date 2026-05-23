const centreFormationModel = require("../models/centreFormation.model");
const userModel = require("../models/user.model");
const formationModel = require("../models/formation.model");
const inscriptionModel = require("../models/inscription.model");
const paiementModel = require("../models/paiement.model");
const config = require("../config/config");

// Fields exposed when a user object is embedded in a public/semi-public response.
// Role, block status, and all auth fields are intentionally excluded.
const PUBLIC_USER_FIELDS = "nom prenom email telephone user_image";

const sanitizeCentre = (centre) => {
  const obj = centre.toObject ? centre.toObject() : { ...centre };

  // ── Fix logo URL ─────────────────────────────────────────
  const fixUrl = (val) => {
    if (!val) return val;
    let p = val;
    if (p.startsWith(config.baseUrl)) p = p.slice(config.baseUrl.length);
    if (!p.startsWith('/') && !p.startsWith('http')) p = '/' + p;
    return p.startsWith('http') ? p : `${config.baseUrl}${p}`;
  };
  obj.logo = fixUrl(obj.logo);
  obj.proofImage = fixUrl(obj.proofImage);

  // ── Replace raw document paths with a secure proxy viewUrl ──
  // Private files must never be exposed as direct public URLs.
  // The frontend should call GET /centres/:id/documents/:docId to view them.
  if (obj.documents && Array.isArray(obj.documents)) {
    obj.documents = obj.documents.map(doc => {
      const safeDoc = { ...doc };
      delete safeDoc.path; // never expose raw disk path
      safeDoc.viewUrl = `/centres/${obj._id}/documents/${doc._id}`;
      return safeDoc;
    });
  }

  return obj;
};


module.exports.getAllCentres = async (req, res) => {
  try {
    // By default, only show approved and paid centres. Admins can see all.
    const filter = req.user && req.user.role === 'admin' ? {} : { status: "approved", paiementStatus: "paid" };
    
    const centres = await centreFormationModel.find(filter).populate("responsableId", PUBLIC_USER_FIELDS);
    res.status(200).json({ message: "Centres retrieved successfully", data: centres.map(sanitizeCentre) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── GET MY CENTRES (responsableCF) ─────
module.exports.getMyCentres = async (req, res) => {
  try {
    const centres = await centreFormationModel
      .find({ responsableId: req.user._id })
      .populate("responsableId", PUBLIC_USER_FIELDS);
    res.status(200).json({ message: "My centres retrieved successfully", data: centres.map(sanitizeCentre) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── GET FORMATEUR CENTRES ─────
module.exports.getFormateurCentres = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    const user = await userModel.findById(userId).populate({ path: "centreIds", model: "CentreFormation", populate: { path: "responsableId", select: PUBLIC_USER_FIELDS } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "Formateur centres retrieved successfully", data: (user.centreIds || []).map(sanitizeCentre) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getCentreById = async (req, res) => {
  try {
    const centre = await centreFormationModel.findById(req.params.id).populate("responsableId", PUBLIC_USER_FIELDS);
    if (!centre) {
      return res.status(404).json({ message: "Centre not found" });
    }
    res.status(200).json({ message: "Centre retrieved successfully", data: sanitizeCentre(centre) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── USER: GET APPLICATION STATUS WITH DOCUMENT FEEDBACK ─────
module.exports.getApplicationStatus = async (req, res) => {
  try {
    const centre = await centreFormationModel.findById(req.params.id).populate("responsableId", PUBLIC_USER_FIELDS);
    if (!centre) return res.status(404).json({ message: "Centre not found" });

    // Only owner or admin can see this
    const isOwner = centre.responsableId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "Access denied." });

    const DOCUMENT_LABELS = {
      registration:  "Commercial Registration (Registre de Commerce)",
      tax_id:        "Tax Identification (Matricule Fiscal)",
      identity:      "Identity Document (CIN/Passport)",
      authorization: "Official Authorization/Accreditation",
      lease:         "Lease Agreement"
    };

    const documentFeedback = centre.documents.map(doc => ({
      docId:     doc._id,
      type:      doc.type,
      label:     DOCUMENT_LABELS[doc.type] || doc.type,
      status:    doc.status,
      adminNote: doc.adminNote || null,
      action:    doc.status === 'invalid'
        ? `Please re-upload a valid copy of: "${DOCUMENT_LABELS[doc.type] || doc.type}"${doc.adminNote ? ` — Reason: ${doc.adminNote}` : ''}`
        : null
    }));

    const invalidDocs = documentFeedback.filter(d => d.status === 'invalid');
    const pendingDocs = documentFeedback.filter(d => d.status === 'pending');

    let userMessage;
    if (centre.status === 'approved') {
      userMessage = "🎉 Congratulations! Your centre has been approved. You are now a Responsible CF.";
    } else if (centre.status === 'rejected') {
      userMessage = `❌ Your application was rejected. Reason: "${centre.adminMessage || 'No reason provided.'}"`;
    } else if (invalidDocs.length > 0) {
      userMessage = `⚠️ ${invalidDocs.length} document(s) need correction before your application can be approved.`;
    } else if (pendingDocs.length > 0) {
      userMessage = "⏳ Your application is under review. Please wait for the administrator to check your documents.";
    } else {
      userMessage = "⏳ Your application is under review.";
    }

    res.status(200).json({
      status:           centre.status,
      message:          userMessage,
      adminMessage:     centre.adminMessage || null,
      documentFeedback: documentFeedback,
      hasIssues:        invalidDocs.length > 0,
      summary: {
        total:   centre.documents.length,
        valid:   documentFeedback.filter(d => d.status === 'valid').length,
        invalid: invalidDocs.length,
        pending: pendingDocs.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createCentre = async (req, res) => {
  try {
    const { nom, adresse, description, telephone } = req.body;

    if (!nom) {
      return res.status(400).json({ message: "Centre name is required" });
    }

    const finalResponsableId = req.user._id;

    // Handle logo
    let logo = req.body.logo;
    
    // Process files (logo + verification documents)
    const documents = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const filePath = `${file.folder}/${file.filename}`;
        const isPublic = file.isPublic !== false;
        
        // If it's the logo field
        if (file.fieldname === 'logo') {
          logo = filePath;
        } else {
          // It's a verification document
          const allowedTypes = ["registration", "tax_id", "identity", "authorization", "lease"];
          if (allowedTypes.includes(file.fieldname)) {
            documents.push({
              type: file.fieldname,
              path: filePath,
              status: "pending",
              isPublic: isPublic
            });
          }
        }
      });
    }

    // Validation: Check if mandatory documents are present (skip for Admin)
    const isAdmin = req.user.role === 'admin';
    const mandatoryTypes = ["registration", "tax_id", "identity"];
    const presentTypes = documents.map(d => d.type);
    const missing = mandatoryTypes.filter(t => !presentTypes.includes(t));

    if (!isAdmin && missing.length > 0) {
      return res.status(400).json({ 
        message: "Missing mandatory verification documents", 
        missing: missing,
        required: mandatoryTypes
      });
    }

    const newCentre = new centreFormationModel({
      nom,
      adresse,
      description,
      telephone,
      responsableId: finalResponsableId,
      logo,
      documents,
      status: isAdmin ? "approved" : "pending"
    });

    await newCentre.save();
    
    const { createNotification, notifyAdmins } = require("../utils/notification");
    
    if (isAdmin) {
      const user = await userModel.findById(finalResponsableId);
      if (user && user.role !== 'admin' && user.role !== 'responsableCF') {
        user.role = 'responsableCF';
        await user.save();
      }
    } else {
      // Notify Admin about new request
      await notifyAdmins({
        type: "centre_verification_request",
        title: "Nouvelle demande de centre",
        message: `Une nouvelle demande de création de centre "${newCentre.nom}" a été soumise par ${req.user.prenom} ${req.user.nom}.`,
        relatedId: newCentre._id,
        relatedModel: "CentreFormation"
      });
    }
    
    const populatedCentre = await centreFormationModel.findById(newCentre._id)
      .populate("responsableId", PUBLIC_USER_FIELDS);
      
    res.status(201).json({ 
      message: isAdmin ? "Centre created successfully" : "Centre creation request submitted successfully. It will be reviewed by an administrator.", 
      data: sanitizeCentre(populatedCentre) 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.updateCentre = async (req, res) => {
  try {
    const centre = await centreFormationModel.findById(req.params.id);
    if (!centre) {
      return res.status(404).json({ message: "Centre not found" });
    }

    const isOwner = centre.responsableId && centre.responsableId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Access denied. You can only update your own centres." });
    }

    const { nom, adresse, description, telephone, logo } = req.body;

    const updates = {};
    if (nom) updates.nom = nom;
    if (adresse !== undefined) updates.adresse = adresse;
    if (description !== undefined) updates.description = description;
    if (telephone !== undefined) updates.telephone = telephone;
    if (logo !== undefined) updates.logo = logo;
    if (req.file) updates.logo = `${req.file.folder}/${req.file.filename}`;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const updatedCentre = await centreFormationModel.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate("responsableId", PUBLIC_USER_FIELDS);

    res.status(200).json({ message: "Centre updated successfully", data: sanitizeCentre(updatedCentre) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── ADMIN: APPROVE CENTRE ─────
module.exports.approveCentre = async (req, res) => {
  try {
    const centreId = req.params.id;
    const centre = await centreFormationModel.findById(centreId);

    if (!centre) {
      return res.status(404).json({ message: "Centre not found" });
    }

    if (centre.status === 'approved') {
      return res.status(400).json({ message: "Centre is already approved" });
    }

    // Automatically assign the unified platform creation fee from global config
    centre.montant = config.creationFee;
    centre.status = 'approved';
    centre.paiementStatus = 'unpaid';
    await centre.save();

    const { createNotification } = require("../utils/notification");
    await createNotification({
      userId: centre.responsableId,
      type: "centre_verified",
      title: "Centre Approved! 🎉",
      message: `Congratulations! Your centre "${centre.nom}" has been approved. The creation fee of ${config.creationFee} DT has been applied.`,
      relatedId: centre._id,
      relatedModel: "CentreFormation"
    });

    res.status(200).json({ 
      message: "Centre approved successfully. Unified creation fee applied.", 
      data: sanitizeCentre(centre) 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── ADMIN: REJECT CENTRE ─────
module.exports.rejectCentre = async (req, res) => {
  try {
    const { adminMessage } = req.body;
    const centre = await centreFormationModel.findById(req.params.id);

    if (!centre) {
      return res.status(404).json({ message: "Centre not found" });
    }

    centre.status = 'rejected';
    centre.adminMessage = adminMessage || "Your request was rejected after review.";
    await centre.save();

    const { createNotification } = require("../utils/notification");
    await createNotification({
      userId: centre.responsableId,
      type: "centre_rejected",
      title: "Demande de centre rejetée",
      message: `Votre demande pour le centre "${centre.nom}" a été rejetée. Motif : ${centre.adminMessage}`,
      relatedId: centre._id,
      relatedModel: "CentreFormation"
    });

    res.status(200).json({ message: "Centre request rejected", data: sanitizeCentre(centre) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── ADMIN: GET PENDING CENTRES ─────
module.exports.getPendingCentres = async (req, res) => {
  try {
    const statuses = req.query.status ? req.query.status.split(',') : ["pending"];
    const centres = await centreFormationModel.find({ status: { $in: statuses } }).populate("responsableId", PUBLIC_USER_FIELDS);
    // Admin endpoint — responsable name/email needed for management UI,
    // but role is not returned (managed via the admin user panel separately)
    res.status(200).json({ message: "Centres retrieved successfully", data: centres.map(sanitizeCentre) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── ADMIN: GET ALL CENTRES ─────
module.exports.adminGetAllCentres = async (req, res) => {
  try {
    const query = {};
    if (req.query.status) {
      query.status = { $in: req.query.status.split(',') };
    }
    const centres = await centreFormationModel.find(query).populate("responsableId", PUBLIC_USER_FIELDS);
    res.status(200).json({ message: "All centres retrieved successfully", data: centres.map(sanitizeCentre) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ───── PUBLIC: GET VERIFICATION REQUIREMENTS ─────
module.exports.getVerificationRequirements = async (req, res) => {
  const requirements = [
    {
      type: "registration",
      name: "Commercial Registration (Registre de Commerce)",
      description: "Official legal document proving the center's business registration.",
      mandatory: true
    },
    {
      type: "tax_id",
      name: "Tax Identification (Matricule Fiscal)",
      description: "Document proving the center's tax registration status.",
      mandatory: true
    },
    {
      type: "identity",
      name: "Identity Document (CIN/Passport)",
      description: "A valid ID of the legal representative or owner.",
      mandatory: true
    },
    {
      type: "authorization",
      name: "Official Authorization/Accreditation",
      description: "Authorization from the Ministry of Vocational Training or relevant authority.",
      mandatory: false
    },
    {
      type: "lease",
      name: "Lease Agreement",
      description: "Proof of physical location/premises for the training center.",
      mandatory: false
    }
  ];
  
  res.status(200).json({ 
    message: "Training center verification requirements", 
    data: requirements,
    // Unified creation fee applied to ALL centers upon approval
    creationFee: config.creationFee,
    technical: {
      maxFileSize: "100MB",
      allowedFormats: ["PDF", "JPG", "PNG", "DOCX"]
    }
  });
};

// ───── USER: UPDATE VERIFICATION DOCUMENTS ─────
module.exports.updateDocuments = async (req, res) => {
  try {
    const centre = await centreFormationModel.findById(req.params.id);
    if (!centre) return res.status(404).json({ message: "Centre not found" });

    // Only owner can update documents
    if (centre.responsableId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied." });
    }

    if (centre.status === 'approved') {
      return res.status(400).json({ message: "Cannot update documents for an approved centre." });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded." });
    }

    // Process new files
    req.files.forEach(file => {
      const filePath = `${file.folder}/${file.filename}`;
      const isPublic = file.isPublic !== false;
      const allowedTypes = ["registration", "tax_id", "identity", "authorization", "lease"];
      
      if (allowedTypes.includes(file.fieldname)) {
        // Find if this type already exists
        const existingIdx = centre.documents.findIndex(d => d.type === file.fieldname);
        if (existingIdx !== -1) {
          centre.documents[existingIdx].path = filePath;
          centre.documents[existingIdx].status = "pending";
          centre.documents[existingIdx].isPublic = isPublic;
        } else {
          centre.documents.push({
            type: file.fieldname,
            path: filePath,
            status: "pending",
            isPublic: isPublic
          });
        }
      }
    });

    // Reset status to pending if it was rejected
    if (centre.status === 'rejected') {
      centre.status = 'pending';
    }

    await centre.save();
    res.status(200).json({ message: "Documents updated successfully and status reset to pending.", data: sanitizeCentre(centre) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── ADMIN: UPDATE DOCUMENT STATUS ─────
module.exports.updateDocumentStatus = async (req, res) => {
  try {
    const { docId, status, adminNote } = req.body; // status: "valid" or "invalid", adminNote: optional reason
    const centre = await centreFormationModel.findById(req.params.id);
    
    if (!centre) return res.status(404).json({ message: "Centre not found" });

    const doc = centre.documents.id(docId);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    doc.status = status;
    if (adminNote) doc.adminNote = adminNote;
    await centre.save();

    // Build a user-facing notification about the document issue
    const DOCUMENT_LABELS = {
      registration: "Commercial Registration (Registre de Commerce)",
      tax_id:       "Tax Identification (Matricule Fiscal)",
      identity:     "Identity Document (CIN/Passport)",
      authorization:"Official Authorization/Accreditation",
      lease:        "Lease Agreement"
    };

    // Collect all invalid documents to notify the user in one place
    const invalidDocs = centre.documents
      .filter(d => d.status === 'invalid')
      .map(d => ({
        docId:       d._id,
        type:        d.type,
        label:       DOCUMENT_LABELS[d.type] || d.type,
        adminNote:   d.adminNote || null,
        action:      `Please re-upload a valid copy of: "${DOCUMENT_LABELS[d.type] || d.type}"`
      }));

    const notification = invalidDocs.length > 0
      ? {
          hasIssues: true,
          message:   `Your centre application has ${invalidDocs.length} document(s) that need correction.`,
          invalidDocuments: invalidDocs
        }
      : { hasIssues: false, message: "All documents reviewed successfully." };

    res.status(200).json({ 
      message: "Document status updated", 
      notification,
      data: sanitizeCentre(centre) 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── ADMIN/USER: VIEW PRIVATE DOCUMENT ─────
module.exports.viewDocument = async (req, res) => {
  try {
    const { id, docId } = req.params;
    const centre = await centreFormationModel.findById(id);
    
    if (!centre) return res.status(404).json({ message: "Centre not found" });

    // Permissions check: Admin or the Responsable themselves
    const isAdmin = req.user.role === 'admin';
    const isOwner = centre.responsableId.toString() === req.user._id.toString();
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Access denied." });
    }

    const doc = centre.documents.id(docId);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    const fs = require('fs');
    const path = require('path');
    const absolutePath = path.join(__dirname, '..', doc.path);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: "File not found on disk" });
    }

    res.sendFile(absolutePath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── RESPONSABLE CF: GET MY DASHBOARD STATS ─────
module.exports.getMyStats = async (req, res) => {
  try {
    // 1. Get all centres for this responsable
    const myCentres = await centreFormationModel
      .find({ responsableId: req.user._id })
      .select('_id nom status');

    const centreIds = myCentres.map(c => c._id);

    // 2. Get all formations in these centres
    const myFormations = await formationModel
      .find({ centreId: { $in: centreIds } })
      .select('_id titre prix centreId');

    const formationIds = myFormations.map(f => f._id);

    // 3. Get inscriptions for these formations
    const myInscriptions = await inscriptionModel
      .find({ formationId: { $in: formationIds } })
      .select('_id statut');

    const inscriptionIds = myInscriptions.map(i => i._id);

    // 4. Get payments for these inscriptions
    const myPayments = await paiementModel
      .find({ inscriptionId: { $in: inscriptionIds } })
      .select('_id statut montant');

    // 5. Compute stats
    const approvedCentres   = myCentres.filter(c => c.status === 'approved').length;
    const pendingCentres    = myCentres.filter(c => c.status === 'pending').length;
    const pendingInscriptions = myInscriptions.filter(i => i.statut === 'en_attente').length;
    const acceptedInscriptions = myInscriptions.filter(i => i.statut === 'acceptee').length;
    const confirmedRevenue  = myPayments
      .filter(p => p.statut === 'confirme')
      .reduce((sum, p) => sum + (p.montant || 0), 0);
    const pendingRevenue    = myPayments
      .filter(p => p.statut === 'en_attente')
      .reduce((sum, p) => sum + (p.montant || 0), 0);

    res.status(200).json({
      data: {
        centres: {
          total: myCentres.length,
          approved: approvedCentres,
          pending: pendingCentres,
        },
        formations: {
          total: myFormations.length,
        },
        inscriptions: {
          total: myInscriptions.length,
          pending: pendingInscriptions,
          accepted: acceptedInscriptions,
        },
        revenue: {
          confirmed: confirmedRevenue,
          pending: pendingRevenue,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.deleteCentre = async (req, res) => {
  try {
    const centre = await centreFormationModel.findById(req.params.id);
    if (!centre) {
      return res.status(404).json({ message: "Centre not found" });
    }

    // Only allow deletion if the centre is explicitly rejected
    if (centre.status !== 'rejected') {
      return res.status(400).json({ message: "You can only delete centres that have been rejected." });
    }

    await centreFormationModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Centre deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── CF: INITIATE CENTRE CREATION FEE PAYMENT ─────
module.exports.initiateCentrePayment = async (req, res) => {
  try {
    const { methodePaiement } = req.body;
    if (!methodePaiement || !["carte", "virement", "especes"].includes(methodePaiement)) {
      return res.status(400).json({ message: "Invalid payment method. Choose: carte, virement, or especes." });
    }

    const centre = await centreFormationModel.findById(req.params.id);
    if (!centre) return res.status(404).json({ message: "Centre not found" });

    const isOwner = centre.responsableId?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "Access denied." });

    if (centre.status !== 'approved') {
      return res.status(400).json({ message: "Centre must be approved before payment." });
    }
    if (centre.paiementStatus === 'paid') {
      return res.status(400).json({ message: "Creation fee already paid." });
    }

    centre.methodePaiement = methodePaiement;

    if (methodePaiement === 'carte') {
      centre.paiementStatus = 'paid';
      centre.datePaiement = new Date();
    } else {
      centre.paiementStatus = 'pending';
    }

    await centre.save();

    const { createNotification } = require("../utils/notification");
    if (methodePaiement === 'carte') {
      await createNotification({
        userId: centre.responsableId,
        type: "centre_payment_confirmed",
        title: "Payment Confirmed",
        message: `Your payment of ${centre.montant} DT for centre "${centre.nom}" has been confirmed.`,
        relatedId: centre._id,
        relatedModel: "CentreFormation"
      });
    } else {
      await createNotification({
        userId: centre.responsableId,
        type: "centre_payment_pending",
        title: "Payment Pending",
        message: `Your payment of ${centre.montant} DT for centre "${centre.nom}" is pending. Please upload your proof of payment.`,
        relatedId: centre._id,
        relatedModel: "CentreFormation"
      });
    }

    res.status(200).json({ message: "Payment initiated successfully.", data: sanitizeCentre(centre) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── CF: UPLOAD PROOF OF PAYMENT ─────
module.exports.uploadCentreProof = async (req, res) => {
  try {
    const centre = await centreFormationModel.findById(req.params.id);
    if (!centre) return res.status(404).json({ message: "Centre not found" });

    const isOwner = centre.responsableId?.toString() === req.user._id.toString();
    if (!isOwner) return res.status(403).json({ message: "Access denied." });

    if (centre.paiementStatus !== 'pending') {
      return res.status(400).json({ message: "Payment is not in pending status." });
    }

    if (!req.file) return res.status(400).json({ message: "No proof file uploaded." });

    centre.proofImage = `${req.file.folder}/${req.file.filename}`;
    await centre.save();

    res.status(200).json({ message: "Proof uploaded successfully.", data: sanitizeCentre(centre) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── ADMIN: CONFIRM CENTRE CREATION FEE PAYMENT ─────
module.exports.confirmCentrePayment = async (req, res) => {
  try {
    const centre = await centreFormationModel.findById(req.params.id);
    if (!centre) return res.status(404).json({ message: "Centre not found" });

    if (centre.paiementStatus !== 'pending') {
      return res.status(400).json({ message: "Payment is not pending." });
    }

    centre.paiementStatus = 'paid';
    centre.datePaiement = new Date();
    await centre.save();

    const { createNotification } = require("../utils/notification");
    await createNotification({
      userId: centre.responsableId,
      type: "centre_payment_confirmed",
      title: "Payment Confirmed 🎉",
      message: `Your payment of ${centre.montant} DT for centre "${centre.nom}" has been confirmed by the administrator.`,
      relatedId: centre._id,
      relatedModel: "CentreFormation"
    });

    res.status(200).json({ message: "Centre payment confirmed successfully.", data: sanitizeCentre(centre) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── GET CENTRE PAYMENT STATUS ─────
module.exports.getCentrePaymentInfo = async (req, res) => {
  try {
    const centre = await centreFormationModel.findById(req.params.id).select("montant paiementStatus methodePaiement proofImage datePaiement status responsableId");
    if (!centre) return res.status(404).json({ message: "Centre not found" });

    const isOwner = centre.responsableId?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "Access denied." });

    res.status(200).json({ message: "Payment info retrieved.", data: centre });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
