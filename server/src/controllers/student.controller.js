const bcrypt = require("bcrypt");
const User = require("../models/User.model");
const ROLES = require("../constants/roles");

// =============================
// ADMIN: Create Student
// =============================
async function createStudent(req, res) {
  const { fullName, email, password, studentId } = req.body;

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(409).json({ message: "Email already exists" });

  const passwordHash = await bcrypt.hash(password, 10);

  const student = await User.create({
    fullName,
    email: email.toLowerCase(),
    passwordHash,
    role: ROLES.STUDENT,
    studentId,
  });

  return res.status(201).json({
    message: "Student created",
    student: {
      id: student._id,
      fullName: student.fullName,
      email: student.email,
      studentId: student.studentId,
    },
  });
}

// =============================
// ADMIN/TEACHER: List Students
// =============================
async function listStudents(req, res) {
  const students = await User.find({ role: ROLES.STUDENT })
    .select("fullName email studentId classId createdAt")
    .sort({ createdAt: -1 });

  return res.json({ students });
}

// =============================
// STUDENT: View own profile
// =============================
async function getMyProfile(req, res) {
  const userId = req.user?.userId || req.user?.id;

  const user = await User.findById(userId).select(
    "fullName email role studentId classId createdAt"
  );

  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({ user });
}


// =============================
// STUDENT: Update own profile (NO delete)
// Allowed: fullName, password only
// =============================
async function updateMyProfile(req, res) {
  const userId = req.user.userId;
  const { fullName, password } = req.body;

  const updates = {};
  if (fullName) updates.fullName = fullName;

  if (password) {
    updates.passwordHash = await bcrypt.hash(password, 10);
  }

  const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select(
    "fullName email role studentId classId createdAt"
  );

  return res.json({ message: "Profile updated", user });
}

module.exports = {
  createStudent,
  listStudents,
  getMyProfile,
  updateMyProfile,
};
