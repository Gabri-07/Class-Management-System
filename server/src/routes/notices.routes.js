const router = require("express").Router();
const { authRequired } = require("../middlewares/auth.middleware");
const { adminOnly } = require("../middlewares/admin.middleware");

const {
  createNotice,
  getMyNotices,
  listNotices,
  deleteNotice,
} = require("../controllers/notice.controller");

// STUDENT
router.get("/me", authRequired, getMyNotices);

// ADMIN
router.post("/", authRequired, adminOnly, createNotice);
router.get("/", authRequired, adminOnly, listNotices);
router.delete("/:id", authRequired, adminOnly, deleteNotice);

module.exports = router;
