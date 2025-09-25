
# Library Management System Backend API

This API provides endpoints for managing a library system, including authentication, book management, transactions (issue/return), reviews, recommendations, and student/admin operations.

## Base URL

```
http://localhost:<PORT>/api
```

Replace `<PORT>` with your configured port (default: 5000).

---

## Authentication

### Register
- **POST** `/api/auth/register`
- Body: `{ name, email, password, role }`
- Response: User info + JWT token

### Login
- **POST** `/api/auth/login`
- Body: `{ email, password }`
- Response: User info + JWT token (in cookie)

---

## Admin Endpoints
> All require authentication and `admin` role.

### Book Management
- **POST** `/api/admin/books` — Add Book
- **PUT** `/api/admin/books/:id` — Update Book
- **DELETE** `/api/admin/books/:id` — Delete Book
- **GET** `/api/admin/books` — Get All Books

### Transaction Management
- **GET** `/api/admin/transactions` — Get All Transactions
- **GET** `/api/admin/export/transactions` — Export Transactions as CSV

### Reports
- **GET** `/api/admin/report/most-borrowed` — Most Borrowed Books
- **GET** `/api/admin/report/overdue` — Students with Overdue Books
- **GET** `/api/admin/report/fines` — Total Fines Collected

### Student Management
- **POST** `/api/admin/students` — Add Student
- **DELETE** `/api/admin/students/:id` — Remove Student
- **PUT** `/api/admin/students/reset/:id` — Reset Student Password

---

## Student Endpoints
> All require authentication.

### Book Search & Actions
- **GET** `/api/student/search?query=...` — Search Books
- **POST** `/api/student/reserve` — Reserve Book
- **PUT** `/api/student/renew/:transactionId` — Renew Book

### Reviews
- **POST** `/api/student/review` — Add Review
- **GET** `/api/student/reviews/:bookId` — Get Reviews for a Book

### Recommendations
- **GET** `/api/student/recommendations/:bookId` — Get Book Recommendations

---

## Transaction Endpoints

### Issue/Return (Admin only)
- **POST** `/api/transactions/issue` — Issue Book (Body: `{ studentId, bookId }`)
- **PUT** `/api/transactions/return/:transactionId` — Return Book
- **GET** `/api/transactions/fine-report` — Fine Report

### Student Transaction Views
- **GET** `/api/transactions/my-books` — View My Issued Books
- **GET** `/api/transactions/my-fines` — View My Fines

---

## Middleware
- `protect`: Requires JWT authentication
- `adminOnly`: Requires user to have admin role

---

## Error Handling
- Standard JSON error responses: `{ message: string }`

---

## Environment Variables
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT
- `PORT`: Server port (default: 5000)

---

## Start Server
```
npm run dev
```

---

## Models (File Naming)
- All models are now named as `*.model.js` (e.g., `book.model.js`, `user.model.js`, etc.)

---

## Authors
- See project contributors
