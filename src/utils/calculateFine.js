export const calculateFine = (dueDate, returnDate) => {
  const finePerDay = 10; // ₹10/day (change as needed)
  if (!returnDate || returnDate <= dueDate) return 0;

  const lateDays = Math.ceil((returnDate - dueDate) / (1000 * 60 * 60 * 24));
  return lateDays * finePerDay;
};
