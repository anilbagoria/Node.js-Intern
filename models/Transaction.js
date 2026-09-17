const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "productId is required"]
        },
        transactionType: {
            type: String,
            required: [true, "transactionType is required"],
            lowercase: true,
            enum: {
                values: ["purchase", "restock"],
                message: '{VALUE} is not a valid transaction type. Must be "purchase" or "restock".'
            }
        },
        quantity: {
            type: Number,
            required: [true, "quantity is required"],
            min: [1, "Quantity must be greater than zero"]
        },
        transactionDateTime: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Transaction", transactionSchema);
