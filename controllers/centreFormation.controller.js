module.exports.updateCentre = async (req, res) => {
  try {
    if (req.session.user.role !== "responsableCF") {
      throw new Error("Access denied, responsableCF only");
    }

    // vérifier que le centre appartient au responsableCF connecté
    const centre = await centreFormationModel.findById(req.params.id);
    if (!centre) {
      throw new Error("Centre not found");
    }
    if (centre.responsableId.toString() !== req.session.user._id.toString()) {
      throw new Error("Access denied, you can only update your own centre");
    }

    const updatedCentre = await centreFormationModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.status(200).json({ message: "Centre updated successfully", data: updatedCentre });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.uploadLogo = async (req, res) => {
  try {
    if (req.session.user.role !== "responsableCF") {
      throw new Error("Access denied, responsableCF only");
    }
    if (!req.file) {
      throw new Error("No image provided");
    }

    // vérifier que le centre appartient au responsableCF connecté
    const centre = await centreFormationModel.findById(req.params.id);
    if (!centre) {
      throw new Error("Centre not found");
    }
    if (centre.responsableId.toString() !== req.session.user._id.toString()) {
      throw new Error("Access denied, you can only update your own centre");
    }

    const updatedCentre = await centreFormationModel.findByIdAndUpdate(
      req.params.id,
      { logo: req.file.filename },
      { new: true }
    );
    res.status(200).json({ message: "Logo updated successfully", data: updatedCentre });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// **La logique de vérification :**
// centre.responsableId == req.session.user._id -> OK autorise
// centre.responsableId != req.session.user._id -> NOT refuse