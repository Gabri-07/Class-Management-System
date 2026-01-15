const { z } = require("zod");

const createStudentSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  studentId: z.string().min(2),
});

//  Student profile update schema
const updateMyProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  password: z.string().min(6).optional(),
});

module.exports = { createStudentSchema, updateMyProfileSchema };
