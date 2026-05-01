const mongoose = require("mongoose");

const leconContentSchema = new mongoose.Schema(
  {
    leconId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Lecon", 
      required: true 
    },
    type: {
      type: String,
      enum: ["video", "image", "file", "test", "link"],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    order: { type: Number, default: 0 },
    
    // For video/image/link with URL or upload
    url: { type: String },
    sourceType: {
      type: String,
      enum: ["upload", "youtube", "vimeo", "url"],
    },
    
    // For uploaded files
    fileName: { type: String },
    filePath: { type: String },
    fileSize: { type: Number },
    mimeType: { type: String },
    
    // For links
    linkTitle: { type: String },
    linkUrl: { type: String },
    linkDescription: { type: String },
    
    // For tests
    passingGrade: { type: Number, default: 60 }, // percentage
    questions: [{
      questionText: { type: String, required: true },
      type: {
        type: String,
        enum: ["multiple_choice", "open"],
        default: "multiple_choice",
      },
      options: [String],
      correctAnswer: { type: mongoose.Schema.Types.Mixed },
      points: { type: Number, default: 1 },
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("LeconContent", leconContentSchema);
