const centreFormationModel = require("../models/centreFormation.model");
const userModel = require("../models/user.model");
const config = require("../config/config");

const sanitizeCentre = (centre) => {
  const obj = centre.toObject ? centre.toObject() : { ...centre };

  // ── Fix logo URL ─────────────────────────────────────────
  if (obj.logo) {
    let p = obj.logo;
    // Strip any accidental baseUrl prefix already in the stored path
    if (p.startsWith(config.baseUrl)) {
      p = p.slice(config.baseUrl.length);
    }
    // Ensure leading slash
    if (!p.startsWith('/') && !p.startsWith('http')) {
      p = '/' + p;
    }
    obj.logo = p.startsWith('http') ? p : `${config.baseUrl}${p}`;
  }

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
    // By default, only show approved centres. Admins can see all.
    const filter = req.user && req.user.role === 'admin' ? {} : { status: "approved" };
    
    const centres = await centreFormationModel.find(filter).populate("responsableId", "-password");
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
      .populate("responsableId", "-password");
    res.status(200).json({ message: "My centres retrieved successfully", data: centres.map(sanitizeCentre) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── GET FORMATEUR CENTRES ─────
module.exports.getFormateurCentres = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    const user = await userModel.findById(userId).populate({ path: "centreIds", model: "CentreFormation", populate: { path: "responsableId", select: "-password" } });
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
    const centre = await centreFormationModel.findById(req.params.id).populate("responsableId", "-password");
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
    const centre = await centreFormationModel.findById(req.params.id).populate("responsableId", "-password");
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
    
    // If admin created it, they might already have the role, but we ensure consistency
    if (isAdmin) {
      const user = await userModel.findById(finalResponsableId);
      if (user && user.role !== 'admin' && user.role !== 'responsableCF') {
        user.role = 'responsableCF';
        await user.save();
      }
    }
    
    const populatedCentre = await centreFormationModel.findById(newCentre._id)
      .populate("responsableId", "-password");
      
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
    ).populate("responsableId", "-password");

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

    centre.status = 'approved';
    await centre.save();

    // Update user role to responsableCF
    const user = await userModel.findById(centre.responsableId);
    if (user && user.role !== 'admin' && user.role !== 'responsableCF') {
      user.role = 'responsableCF';
      await user.save();
    }

    res.status(200).json({ 
      message: "Centre approved successfully and user promoted to responsableCF", 
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

    res.status(200).json({ message: "Centre request rejected", data: sanitizeCentre(centre) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ───── ADMIN: GET PENDING CENTRES ─────
module.exports.getPendingCentres = async (req, res) => {
  try {
    const statuses = req.query.status ? req.query.status.split(',') : ["pending"];
    const centres = await centreFormationModel.find({ status: { $in: statuses } }).populate("responsableId", "-password");
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
    const centres = await centreFormationModel.find(query).populate("responsableId", "-password");
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
