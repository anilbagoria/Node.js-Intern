const mongoose = require("mongoose");
const Product = require("../models/product");
const Transaction = require("../models/Transaction");

// Helper to validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// POST /api/products - Create a new product
exports.createProduct = async (req, res) => {
    try {
        const { productName, price } = req.body;
        const stockInput = req.body.availableStock !== undefined ? req.body.availableStock : req.body.avilableStock;

        if (!productName || typeof productName !== "string" || !productName.trim()) {
            return res.status(400).json({ error: "productName is required and must be a non-empty string" });
        }

        const numPrice = Number(price);
        if (price === undefined || isNaN(numPrice) || numPrice <= 0) {
            return res.status(400).json({ error: "Price must be a number greater than zero" });
        }

        if (stockInput !== undefined) {
            const numStock = Number(stockInput);
            if (isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
                return res.status(400).json({ error: "Available stock must be a non-negative integer" });
            }
        }

        const product = new Product({
            productName: productName.trim(),
            price: numPrice,
            availableStock: stockInput !== undefined ? Number(stockInput) : 0
        });

        await product.save();
        return res.status(201).json({
            message: "Product created successfully",
            product
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: "Product name must be unique" });
        }
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ error: messages.join(", ") });
        }
        return res.status(500).json({ error: "Failed to create product", details: error.message });
    }
};

// GET /api/products - Retrieve all products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({}).sort({ createdAt: -1 });
        return res.status(200).json(products);
    } catch (error) {
        return res.status(500).json({ error: "Failed to retrieve products", details: error.message });
    }
};

// GET /api/products/:productId - Retrieve a single product by ID
exports.getProductById = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!isValidObjectId(productId)) {
            return res.status(400).json({ error: "Invalid product ID format" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        return res.status(200).json(product);
    } catch (error) {
        return res.status(500).json({ error: "Failed to retrieve product", details: error.message });
    }
};

// PUT /api/products/:productId - Update product details
exports.updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!isValidObjectId(productId)) {
            return res.status(400).json({ error: "Invalid product ID format" });
        }

        const updates = {};

        if (req.body.productName !== undefined) {
            if (typeof req.body.productName !== "string" || !req.body.productName.trim()) {
                return res.status(400).json({ error: "productName must be a non-empty string" });
            }
            updates.productName = req.body.productName.trim();
        }

        if (req.body.price !== undefined) {
            const numPrice = Number(req.body.price);
            if (isNaN(numPrice) || numPrice <= 0) {
                return res.status(400).json({ error: "Price must be a number greater than zero" });
            }
            updates.price = numPrice;
        }

        const stockInput = req.body.availableStock !== undefined ? req.body.availableStock : req.body.avilableStock;
        if (stockInput !== undefined) {
            const numStock = Number(stockInput);
            if (isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
                return res.status(400).json({ error: "Available stock must be a non-negative integer" });
            }
            updates.availableStock = numStock;
        }

        const product = await Product.findByIdAndUpdate(productId, updates, {
            returnDocument: "after",
            runValidators: true
        });

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        return res.status(200).json({ message: "Product updated successfully", product });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: "Product name must be unique" });
        }
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ error: messages.join(", ") });
        }
        return res.status(500).json({ error: "Failed to update product", details: error.message });
    }
};

// DELETE /api/products/:productId - Delete product and its transaction history
exports.deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!isValidObjectId(productId)) {
            return res.status(400).json({ error: "Invalid product ID format" });
        }

        const product = await Product.findByIdAndDelete(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        await Transaction.deleteMany({ productId });

        return res.status(200).json({
            message: "Product and associated transactions deleted successfully",
            product
        });
    } catch (error) {
        return res.status(500).json({ error: "Failed to delete product", details: error.message });
    }
};

// POST /api/products/purchase - Purchase a product (reduces stock)
exports.purchaseProduct = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (!productId) {
            return res.status(400).json({ error: "productId is required" });
        }
        if (!isValidObjectId(productId)) {
            return res.status(400).json({ error: "Invalid product ID format" });
        }

        const numQty = Number(quantity);
        if (quantity === undefined || isNaN(numQty) || numQty <= 0 || !Number.isInteger(numQty)) {
            return res.status(400).json({ error: "Quantity must be a positive integer" });
        }

        // Concurrency-safe atomic stock reduction
        const product = await Product.findOneAndUpdate(
            { _id: productId, availableStock: { $gte: numQty } },
            { $inc: { availableStock: -numQty } },
            { returnDocument: "after", runValidators: true }
        );

        if (!product) {
            const existingProduct = await Product.findById(productId);
            if (!existingProduct) {
                return res.status(404).json({ error: "Product not found" });
            }
            return res.status(400).json({
                error: "Insufficient stock available",
                availableStock: existingProduct.availableStock
            });
        }

        const transaction = new Transaction({
            productId: product._id,
            transactionType: "purchase",
            quantity: numQty
        });
        await transaction.save();

        return res.status(200).json({
            message: "Product purchased successfully",
            product,
            transaction
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ error: messages.join(", ") });
        }
        return res.status(500).json({ error: "Failed to purchase product", details: error.message });
    }
};

// POST /api/products/restock - Restock an existing product (increases stock)
exports.restockProduct = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (!productId) {
            return res.status(400).json({ error: "productId is required" });
        }
        if (!isValidObjectId(productId)) {
            return res.status(400).json({ error: "Invalid product ID format" });
        }

        const numQty = Number(quantity);
        if (quantity === undefined || isNaN(numQty) || numQty <= 0 || !Number.isInteger(numQty)) {
            return res.status(400).json({ error: "Quantity must be a positive integer" });
        }

        const product = await Product.findByIdAndUpdate(
            productId,
            { $inc: { availableStock: numQty } },
            { returnDocument: "after", runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        const transaction = new Transaction({
            productId: product._id,
            transactionType: "restock",
            quantity: numQty
        });
        await transaction.save();

        return res.status(200).json({
            message: "Product restocked successfully",
            product,
            transaction
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ error: messages.join(", ") });
        }
        return res.status(500).json({ error: "Failed to restock product", details: error.message });
    }
};

// GET /api/products/:productId/transactions - Retrieve transaction history of a product
exports.getProductTransactionHistory = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!isValidObjectId(productId)) {
            return res.status(400).json({ error: "Invalid product ID format" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        const transactions = await Transaction.find({ productId }).sort({ transactionDateTime: -1 });
        return res.status(200).json({ product, transactions });
    } catch (error) {
        return res.status(500).json({ error: "Failed to retrieve transaction history", details: error.message });
    }
};

// GET /api/transactions - Retrieve all transactions across all products
exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({})
            .populate("productId", "productName price availableStock")
            .sort({ transactionDateTime: -1 });
        return res.status(200).json(transactions);
    } catch (error) {
        return res.status(500).json({ error: "Failed to retrieve transactions", details: error.message });
    }
};
