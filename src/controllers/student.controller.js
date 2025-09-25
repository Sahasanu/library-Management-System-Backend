import Transaction from "../Models/transaction.model.js";
import { calculateFine } from "../utils/calculateFine.js";
import Book from "../Models/book.model.js";
import Review from "../Models/review.model.js";
// Search books
export const searchBooks = async (req, res) => {
  try {
    const { query } = req.query;
    const books = await Book.find({
      title: { $regex: query, $options: "i" }
    });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Issue a book
export const issueBook = async (req, res) => {
  try {
    const { bookId } = req.body;
    const book = await Book.findById(bookId);

    if (!book) return res.status(404).json({ message: "Book not found" });
    if (!book.available) return res.status(400).json({ message: "Book already issued" });

    // Calculate due date (14 days later)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const transaction = await Transaction.create({
      student: req.user._id,
      book: book._id,
      dueDate
    });

    // Update book availability
    book.available = false;
    await book.save();

    res.json({ message: "Book issued successfully", transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};






// Return book + calculate fine
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

    // update book availability
    await Book.findByIdAndUpdate(transaction.book._id, { available: true });

    res.json({ message: "Book returned successfully", fine });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get all issued books for a student
export const getIssuedBooks = async (req, res) => {
  try {
    const transactions = await Transaction.find({ student: req.user._id, status: "issued" })
      .populate("book");
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Students Fine 
// Student can see their fines
export const getMyFines = async (req, res) => {
  try {
    const fines = await Transaction.find({ student: req.user._id, fine: { $gt: 0 } })
      .populate("book", "title author");

    res.json(fines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Reserve Book
export const reserveBook = async (req, res) => {
  try {
    const { bookId } = req.body;
    const book = await Book.findById(bookId);

    if (!book) return res.status(404).json({ message: "Book not found" });
    if (book.available) return res.status(400).json({ message: "Book is available, no need to reserve" });

    const existing = await Transaction.findOne({
      student: req.user._id,
      book: bookId,
      status: "reserved"
    });

    if (existing) return res.status(400).json({ message: "Already reserved" });

    const reservation = await Transaction.create({
      student: req.user._id,
      book: bookId,
      status: "reserved"
    });

    res.status(201).json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Renew Book
export const renewBook = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) return res.status(404).json({ message: "Transaction not found" });
    if (transaction.status !== "issued") return res.status(400).json({ message: "Book not currently issued" });

    // Add 7 more days
    transaction.dueDate.setDate(transaction.dueDate.getDate() + 7);
    await transaction.save();

    res.json({ message: "Book renewed for 7 days", dueDate: transaction.dueDate });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




// Add Review
export const addReview = async (req, res) => {
  try {
    const { bookId, rating, comment } = req.body;
    const review = await Review.create({ student: req.user._id, book: bookId, rating, comment });
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Reviews for a Book
export const getBookReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ book: req.params.bookId }).populate("student", "name");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// get reccomendations

export const getRecommendations = async (req, res) => {
  try {
    const { bookId } = req.params;

    // Find students who borrowed this book
    const transactions = await Transaction.find({ book: bookId }).select("student");
    const studentIds = transactions.map(t => t.student);

    // Find other books borrowed by those students
    const recs = await Transaction.find({
      student: { $in: studentIds },
      book: { $ne: bookId }
    })
      .populate("book", "title author")
      .limit(5);

    res.json(recs.map(r => r.book));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
