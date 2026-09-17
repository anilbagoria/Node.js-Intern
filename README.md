# Inventory Management System API

A simple REST API built using **Node.js**, **Express.js**, and **MongoDB** to manage product inventory and track stock transactions.

---

## 🚀 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose ODM)
- **Environment Management:** dotenv
- **Development Tool:** nodemon

---

## ⚙️ Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) running locally or a MongoDB Atlas connection URI

### 2. Installation

Clone or open the repository folder, then install dependencies:

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory (or copy from `.env.example`):

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/inventoryDB
```

### 4. Run the Application

- **Development Mode (with auto-reload):**
  ```bash
  npm run dev
  ```

- **Production Mode:**
  ```bash
  npm start
  ```

The server will start at: `http://localhost:5000`

---

## 📡 API Endpoints

### Base URL: `http://localhost:5000/api`

### 1. Products

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/products` | Create a new product |
| `GET` | `/api/products` | Get list of all products |
| `GET` | `/api/products/:productId` | Get product details by ID |
| `PUT` | `/api/products/:productId` | Update product details |
| `DELETE` | `/api/products/:productId` | Delete a product & its history |

#### Example: Create Product (`POST /api/products`)
```json
{
  "productName": "Wireless Mouse",
  "price": 25.99,
  "availableStock": 50
}
```

---

### 2. Stock Transactions

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/products/purchase` | Deduct stock on purchase |
| `POST` | `/api/products/restock` | Add stock on restock |
| `GET` | `/api/products/:productId/transactions` | Get transactions for a product |
| `GET` | `/api/transactions` | Get all transaction records |

#### Example: Purchase Product (`POST /api/products/purchase`)
```json
{
  "productId": "65f1a2b3c4d5e6f7a8b9c0d1",
  "quantity": 2
}
```

#### Example: Restock Product (`POST /api/products/restock`)
```json
{
  "productId": "65f1a2b3c4d5e6f7a8b9c0d1",
  "quantity": 10
}
```

---

## 📂 Project Structure

```text
├── controllers/
│   └── productControllers.js    # Request handlers & business logic
├── models/
│   ├── product.js               # Product schema
│   └── Transaction.js           # Transaction schema
├── routes/
│   └── productRoutes.js         # API route definitions
├── .env.example                 # Example environment variables
├── package.json                 # Project scripts & dependencies
├── server.js                    # Application entry point
└── README.md                    # Project documentation
```

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).