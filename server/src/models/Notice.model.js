const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    grade: { type: String, required: true }, 
    title: { type: String, required: true },
    message: { type: String, required: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

noticeSchema.index({ grade: 1, createdAt: -1 });

module.exports = mongoose.model("Notice", noticeSchema);
