import Transaction from "../models/transaction.model.js";
import Book from "../Models/book.model.js";
import { calculateFine } from "../utils/calculateFine.js";

// 📌 Issue Book (Admin only)
export const issueBook = async (req, res) => {
  try {
    const { studentId, bookId } = req.body;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });
    if (!book.available) return res.status(400).json({ message: "Book not available" });

    // 14 days borrowing period
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const transaction = await Transaction.create({
      student: studentId,
      book: bookId,
      dueDate
    });

    book.available = false;
    await book.save();

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 Return Book (Admin only)
export const returnBook = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = await Transaction.findById(transactionId).populate("book");

    if (!transaction) return res.status(404).json({ message: "Transaction not found" });
    if (transaction.status === "returned") return res.status(400).json({ message: "Book already returned" });

    const returnDate = new Date();
    const fine = calculateFine(transaction.dueDate, returnDate);

    transaction.returnDate = returnDate;
    transaction.status = "returned";
    transaction.fine = fine;
    await transaction.save();

    await Book.findByIdAndUpdate(transaction.book._id, { available: true });

    res.json({ message: "Book returned successfully", fine });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 Student → View Issued Books
export const getMyIssuedBooks = async (req, res) => {
  try {
    const transactions = await Transaction.find({ student: req.user._id })
      .populate("book", "title author")
      .sort({ issueDate: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 Student → View Fines
export const getMyFines = async (req, res) => {
  try {
    const fines = await Transaction.find({ student: req.user._id, fine: { $gt: 0 } })
      .populate("book", "title author");

    res.json(fines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 Admin → Fine Reports
export const getFineReport = async (req, res) => {
  try {
    const transactions = await Transaction.find({ fine: { $gt: 0 } })
      .populate("student", "name email")
      .populate("book", "title");

    const totalFine = transactions.reduce((acc, t) => acc + t.fine, 0);

    res.json({ totalFine, transactions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
