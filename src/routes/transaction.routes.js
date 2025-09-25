
import express from "express";
import { protect, adminOnly } from "../middleware/auth.middleware.js";
import {
  issueBook,
  returnBook,
  getMyIssuedBooks,
  getMyFines,
  getFineReport
} from "../controllers/transaction.controller.js";

const router = express.Router();

// Admin
router.post("/issue", protect, adminOnly, issueBook);
router.put("/return/:transactionId", protect, adminOnly, returnBook);
router.get("/fine-report", protect, adminOnly, getFineReport);

// Student
router.get("/my-books", protect, getMyIssuedBooks);
router.get("/my-fines", protect, getMyFines);

export default router;

