const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        productName: {
            type: String,
            required: [true, "productName is required"],
            unique: true,
            trim: true
        },
        price: {
            type: Number,
            required: [true, "price is required"],
            min: [0.01, "Product price must be greater than zero"]
        },
        availableStock: {
            type: Number,
            required: [true, "availableStock is required"],
            min: [0, "Available stock cannot be negative"],
            default: 0,
            alias: "avilableStock"
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true, aliases: true },
        toObject: { virtuals: true, aliases: true }
    }
);

module.exports = mongoose.model("Product", productSchema);