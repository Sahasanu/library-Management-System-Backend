import Book from "../Models/book.model.js";
import Transaction from "../Models/transaction.model.js";
import User from "../Models/user.model.js"
import { Parser } from "json2csv";
import fs from "fs";

// Add Book
export const addBook = async (req, res) => {
  try {
    const { title, author, isbn } = req.body;
    const book = await Book.create({ title, author, isbn });
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Book
export const updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Book
export const deleteBook = async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: "Book deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// View all books
export const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("student", "name email")
      .populate("book", "title author");
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📊 Most borrowed books
export const mostBorrowedBooks = async (req, res) => {
  try {
    const report = await Transaction.aggregate([
      { $group: { _id: "$book", borrowCount: { $sum: 1 } } },
      { $sort: { borrowCount: -1 } },
      { $limit: 5 }
    ]);

    const populated = await Book.populate(report, { path: "_id", select: "title author" });
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Students with overdue books
export const studentsWithOverdue = async (req, res) => {
  try {
    const today = new Date();
    const overdue = await Transaction.find({
      dueDate: { $lt: today },
      status: "issued"
    }).populate("student", "name email");

    res.json(overdue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Total fines collected
export const totalFinesCollected = async (req, res) => {
  try {
    const report = await Transaction.aggregate([
      { $group: { _id: null, total: { $sum: "$fine" } } }
    ]);

    res.json({ totalFines: report[0]?.total || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add Student
export const addStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const student = await User.create({ name, email, password, role: "student" });
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove Student
export const removeStudent = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Student removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset Student Password
export const resetPassword = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.password = "123456"; // default
    await student.save();

    res.json({ message: "Password reset to default (123456)" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export Transactions as CSV
export const exportTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("student", "name email")
      .populate("book", "title author");

    const json = transactions.map(t => ({
      student: t.student.name,
      email: t.student.email,
      book: t.book.title,
      issueDate: t.issueDate,
      dueDate: t.dueDate,
      returnDate: t.returnDate,
      fine: t.fine
    }));

    const parser = new Parser();
    const csv = parser.parse(json);

    fs.writeFileSync("transactions.csv", csv);
    res.download("transactions.csv");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
