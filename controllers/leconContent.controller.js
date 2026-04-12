const leconContentModel = require("../models/leconContent.model");
const leconModel = require("../models/lecon.model");

const formatContent = (c) => ({
  _id: c._id,
  leconId: c.leconId,
  type: c.type,
  title: c.title,
  description: c.description,
  order: c.order,
  url: c.url,
  sourceType: c.sourceType,
  fileName: c.fileName,
  fileSize: c.fileSize,
  mimeType: c.mimeType,
  linkTitle: c.linkTitle,
  linkUrl: c.linkUrl,
  linkDescription: c.linkDescription,
  passingGrade: c.passingGrade,
  questions: c.questions,
  createdAt: c.createdAt,
});

module.exports.getContentsByLecon = async (req, res) => {
  try {
    const { leconId } = req.params;

    const lecon = await leconModel.findById(leconId);
    if (!lecon) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const contents = await leconContentModel.find({ leconId })
      .sort({ order: 1, createdAt: 1 });

    res.status(200).json({ data: contents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getContentById = async (req, res) => {
  try {
    const content = await leconContentModel.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }
    res.status(200).json({ data: formatContent(content) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createContent = async (req, res) => {
  try {
    const { leconId, type, title, description, order, sourceType, linkTitle, linkUrl, linkDescription, passingGrade, questions } = req.body;

    if (!leconId || !type || !title) {
      return res.status(400).json({ message: "leconId, type, and title are required" });
    }

    const validTypes = ["video", "image", "file", "test", "link"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: `type must be one of: ${validTypes.join(", ")}` });
    }

    const lecon = await leconModel.findById(leconId);
    if (!lecon) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    let url, fileName, filePath, fileSize, mimeType;

    if (req.file) {
      url = `/${req.file.folder}/${req.file.filename}`;
      fileName = req.file.originalname;
      filePath = req.file.path;
      fileSize = req.file.size;
      mimeType = req.file.mimetype;
    }

    const newContent = new leconContentModel({
      leconId,
      type,
      title,
      description,
      order: order || 0,
      sourceType: req.file ? 'upload' : (sourceType || 'url'),
      url: url || req.body.url,
      fileName,
      filePath,
      fileSize,
      mimeType,
      linkTitle,
      linkUrl,
      linkDescription,
      passingGrade: passingGrade || 60,
      questions: type === 'test' ? questions : undefined,
    });

    await newContent.save();
    res.status(201).json({ message: "Content created successfully", data: formatContent(newContent) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.updateContent = async (req, res) => {
  try {
    const content = await leconContentModel.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    const { title, description, order, url, sourceType, linkTitle, linkUrl, linkDescription, passingGrade, questions } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (order !== undefined) updates.order = order;
    if (url !== undefined) updates.url = url;
    if (sourceType !== undefined) updates.sourceType = sourceType;
    if (linkTitle !== undefined) updates.linkTitle = linkTitle;
    if (linkUrl !== undefined) updates.linkUrl = linkUrl;
    if (linkDescription !== undefined) updates.linkDescription = linkDescription;
    if (passingGrade !== undefined) updates.passingGrade = passingGrade;
    if (questions !== undefined) updates.questions = questions;

    if (req.file) {
      updates.url = `/${req.file.folder}/${req.file.filename}`;
      updates.fileName = req.file.originalname;
      updates.filePath = req.file.path;
      updates.fileSize = req.file.size;
      updates.mimeType = req.file.mimetype;
      updates.sourceType = 'upload';
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const updatedContent = await leconContentModel.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: "Content updated successfully", data: formatContent(updatedContent) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.deleteContent = async (req, res) => {
  try {
    const content = await leconContentModel.findByIdAndDelete(req.params.id);
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }
    res.status(200).json({ message: "Content deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.submitTest = async (req, res) => {
  try {
    const { answers } = req.body;
    const content = await leconContentModel.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    if (content.type !== 'test') {
      return res.status(400).json({ message: "This content is not a test" });
    }

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: "answers array is required" });
    }

    let totalPoints = 0;
    let earnedPoints = 0;

    content.questions.forEach((question, index) => {
      totalPoints += question.points || 1;
      const userAnswer = answers[index];

      if (question.type === 'multiple_choice') {
        if (userAnswer === question.correctAnswer) {
          earnedPoints += question.points || 1;
        }
      } else {
        earnedPoints += question.points || 1;
      }
    });

    const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = percentage >= content.passingGrade;

    res.status(200).json({
      message: passed ? "Test passed!" : "Test not passed",
      data: {
        totalPoints,
        earnedPoints,
        percentage,
        passingGrade: content.passingGrade,
        passed,
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
