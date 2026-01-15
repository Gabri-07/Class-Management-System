const Notice = require("../models/Notice.model");
const User = require("../models/User.model");

function getUserId(req) {
  // support both token payload styles: {userId:..} OR {id:..}
  return req.user?.userId || req.user?.id || null;
}

// ADMIN: create notice
async function createNotice(req, res) {
  try {
    const { grade, title, message, expiresAt } = req.body;

    if (!grade || !title || !message) {
      return res.status(400).json({ message: "grade, title, message are required" });
    }

    const notice = await Notice.create({
      grade,
      title,
      message,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: getUserId(req),
    });

    return res.json({ message: "Notice created", notice });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to create notice" });
  }
}

// STUDENT: get notices for own grade + ALL (not expired)
async function getMyNotices(req, res) {
  try {
    const uid = getUserId(req);
    if (!uid) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(uid).select("classId role");
    if (!user) return res.status(404).json({ message: "User not found" });

    const grade = user.classId; // e.g. "Grade 7"
    if (!grade) return res.json({ grade: "", notices: [] });

    const now = new Date();

    const notices = await Notice.find({
      grade: { $in: [grade, "ALL"] },
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    }).sort({ createdAt: -1 });

    return res.json({ grade, notices });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load notices" });
  }
}

// ADMIN: list notices by grade (optional)
async function listNotices(req, res) {
  try {
    const { grade } = req.query; // optional
    const q = {};
    if (grade) q.grade = grade;

    const notices = await Notice.find(q).sort({ createdAt: -1 });
    return res.json({ notices });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to list notices" });
  }
}

// ADMIN: delete notice
async function deleteNotice(req, res) {
  try {
    const { id } = req.params;
    await Notice.findByIdAndDelete(id);
    return res.json({ message: "Notice deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to delete notice" });
  }
}

module.exports = { createNotice, getMyNotices, listNotices, deleteNotice };
