const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const productRoutes = require("./routes/productRoutes");

const app = express();

// CORS middleware
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

// JSON body parser
app.use(express.json());

// Base health check routes
app.get("/", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "Inventory Management System API is running",
        endpoints: {
            products: "/api/products",
            purchase: "/api/products/purchase",
            restock: "/api/products/restock",
            transactions: "/api/transactions"
        }
    });
});

app.get("/api", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "Inventory Management API",
        version: "1.0.0"
    });
});

// Route mapping
app.use("/api", productRoutes);

// 404 handler for unrecognized routes
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(err.status || 500).json({
        error: err.message || "Internal server error"
    });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/inventoryDB";

let server;

// Only start listening if executed directly
if (require.main === module) {
    mongoose
        .connect(MONGO_URI)
        .then(() => {
            console.log("Connected to MongoDB");
            server = app.listen(PORT, () => {
                console.log(`Server is running on port ${PORT}`);
            });
        })
        .catch((error) => {
            console.error("Failed to connect to MongoDB:", error.message);
            process.exit(1);
        });
}

module.exports = app;