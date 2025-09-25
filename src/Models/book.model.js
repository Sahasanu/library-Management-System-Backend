import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  isbn: String,
  available: { type: Boolean, default: true }
});

export default mongoose.model("Book", bookSchema);
