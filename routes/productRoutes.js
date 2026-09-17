const express = require("express");
const router = express.Router();
const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    purchaseProduct,
    restockProduct,
    getProductTransactionHistory,
    getAllTransactions
} = require("../controllers/productControllers");

// Product routes
router.post("/products", createProduct);
router.get("/products", getAllProducts);
router.get("/products/:productId", getProductById);
router.put("/products/:productId", updateProduct);
router.delete("/products/:productId", deleteProduct);

// Inventory transaction actions
router.post("/products/purchase", purchaseProduct);
router.post("/products/restock", restockProduct);

// Transaction history routes
router.get("/products/:productId/transactions", getProductTransactionHistory);
router.get("/transactions", getAllTransactions);

module.exports = router;