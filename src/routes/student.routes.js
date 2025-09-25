import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  reserveBook,
  renewBook,
  addReview,
  getBookReviews,
  getRecommendations
} from "../controllers/student.controller.js";

const router = express.Router();

// Reservation / Renewal
router.post("/reserve", protect, reserveBook);
router.put("/renew/:transactionId", protect, renewBook);

// Reviews
router.post("/review", protect, addReview);
router.get("/reviews/:bookId", protect, getBookReviews);

// Recommendations
router.get("/recommendations/:bookId", protect, getRecommendations);

export default router;
