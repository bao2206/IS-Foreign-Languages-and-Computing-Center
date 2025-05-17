const mongoose = require("mongoose");
const { Schema } = mongoose;

const DiscountSchema = new Schema(
  {
    code: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["returning_student", "relative", "promotion"],
      required: true,
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    description: {
      type: String,
    },
    isActive: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    start_date: {
      type: Date,
      validate: {
        validator: function (value) {
          if (this.discountType === "promotion") return !!value;
          return true;
        },
        message: "start_date is required for promotion discounts.",
      },
    },
    end_date: {
      type: Date,
      validate: {
        validator: function (value) {
          if (this.discountType === "promotion") return !!value;
          return true;
        },
        message: "end_date is required for promotion discounts.",
      },
    },
    minimum_order_value: {
      type: Number,
      required: true,
      min: [0, "Minimum order value must be at least 0"],
      validate: {
        validator: function (value) {
          if (
            this.maximum_order_value !== undefined &&
            this.maximum_order_value !== null
          ) {
            return value <= this.maximum_order_value;
          }
          return true;
        },
        message:
          "minimum_order_value must be less than or equal to maximum_order_value",
      },
    },
    maximum_order_value: {
      type: Number,
      min: [0, "Maximum order value must be at least 0"],
      validate: [
        {
          validator: function (value) {
            if (this.discountType === "promotion")
              return value !== undefined && value !== null;
            return true;
          },
          message: "maximum_order_value is required for promotion discounts",
        },
        {
          validator: function (value) {
            return value === undefined || value >= this.minimum_order_value;
          },
          message:
            "maximum_order_value must be greater than or equal to minimum_order_value",
        },
      ],
    },
    usage_limit: {
      type: Number,
      min: [0, "Usage limit must be at least 0"],
      validate: {
        validator: function (value) {
          if (this.discountType === "promotion")
            return value !== undefined && value !== null;
          return true;
        },
        message: "usage_limit is required for promotion discounts",
      },
    },
    used_count: {
      type: Number,
      min: [0, "Used count must be at least 0"],
      validate: [
        {
          validator: function (value) {
            if (this.discountType === "promotion")
              return value !== undefined && value !== null;
            return true;
          },
          message: "used_count is required for promotion discounts",
        },
        {
          validator: function (value) {
            return this.usage_limit === undefined || value <= this.usage_limit;
          },
          message: "Used count cannot exceed usage limit",
        },
      ],
    },
    remaining: {
      type: Number,
      validate: [
        {
          validator: function (value) {
            if (this.discountType === "promotion")
              return value !== undefined && value !== null;
            return true;
          },
          message: "remaining is required for promotion discounts",
        },
        {
          validator: function (value) {
            return (
              this.usage_limit === undefined ||
              this.used_count === undefined ||
              value === this.usage_limit - this.used_count
            );
          },
          message: "Remaining must equal usage_limit minus used_count",
        },
      ],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
); // ✅ vị trí đúng của options schema

module.exports = mongoose.model("Discount", DiscountSchema);
