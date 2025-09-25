import express from "express";
import { protect, adminOnly } from "../middleware/auth.middleware.js";
import {
  mostBorrowedBooks,
  studentsWithOverdue,
  totalFinesCollected,
  addStudent,
  removeStudent,
  resetPassword,
  exportTransactions
} from "../controllers/admin.controller.js";

const router = express.Router();

// Reports
router.get("/report/most-borrowed", protect, adminOnly, mostBorrowedBooks);
router.get("/report/overdue", protect, adminOnly, studentsWithOverdue);
router.get("/report/fines", protect, adminOnly, totalFinesCollected);

// Manage Students
router.post("/students", protect, adminOnly, addStudent);
router.delete("/students/:id", protect, adminOnly, removeStudent);
router.put("/students/reset/:id", protect, adminOnly, resetPassword);

// Export
router.get("/export/transactions", protect, adminOnly, exportTransactions);

export default router;
