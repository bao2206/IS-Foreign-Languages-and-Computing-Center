const DiscountService = require("../services/DiscountService");
const { ErrorCustom, BadRequestError, NotFoundError } = require("../core/errorCustom");
const mongoose = require('mongoose');
const { isValidObjectId } = mongoose;
class DiscountController {
  async getDiscount(req, res) {
    const data = await DiscountService.getFilteredDiscounts(req.query);
    return res.status(200).json({
      success: true,
      data,
    });
  }

  async createDiscount(req, res) {
    const {
      code,
      discountType,
      discountPercentage,
      description,
      isActive,
      start_date,
      end_date,
      minimum_order_value,
      maximum_order_value,
      usage_limit,
      used_count,
    } = req.body;

    const discountData = {
      code: code.trim(),
      discountType,
      discountPercentage,
      description,
      isActive: isActive || "active",
      start_date,
      end_date,
      minimum_order_value,
      maximum_order_value,
      usage_limit,
      used_count,
    };

    // Add fields only if not returning_student or relative type
    if (discountType !== "returning_student" && discountType !== "relative") {
      // Validate promotion-specific fields
      if (!start_date || !end_date || !usage_limit) {
        throw new BadRequestError(
          "Start date, end date, and usage limit are required for promotion discounts"
        );
      }

      discountData.start_date = start_date;
      discountData.end_date = end_date;
      discountData.minimum_order_value = minimum_order_value || 0;
      discountData.maximum_order_value = maximum_order_value || 0;
      discountData.usage_limit = usage_limit;
      discountData.used_count = used_count ;
    }

    // Create the new discount
    const newDiscount = await DiscountService.createDiscount(discountData);

    return res.status(201).json({
      success: true,
      message: "Discount created successfully",
      data: newDiscount,
    });
  }

  async updateDiscount(req, res) {
      const { id } = req.params;
      const updateData = req.body;

      // Validate ID
      if (!id || !isValidObjectId(id)) throw new BadRequestError("Valid discount ID is required");
      // Check if discount exists
      const discount = await DiscountService.getDiscountById(id);
      if (!discount) throw new NotFoundError("Discount not found");

      // If trying to update the code, check it doesn't conflict
      if (updateData.code && updateData.code !== discount.code) {
        const existingWithCode = await DiscountService.checkCodeExists(updateData, id);

        if (existingWithCode) throw new BadRequestError("Discount code already exists");
      }

      // Handle special fields for returning_student and relative types
     

      // Update the discount
      const updatedDiscount = await DiscountService.updateDiscount(id,updateData, discount);

      return res.status(200).json({
        success: true,
        message: "Discount updated successfully",
        data: updatedDiscount,
      });
    
  }


  async deleteDiscount(req, res) {
  
      const { id } = req.params;

      // Validate ID
      if (!id || !isValidObjectId(id)) throw new BadRequestError("Valid discount ID is required");
      // Check if discount exists
      const discount = await DiscountService.getDiscountById(id);
      console.log(discount);
      if (!discount)   if (!discount) throw new NotFoundError("Discount not found");
      
      // console.log(discount.used_count);

      // Check if discount has been used
      if (discount.used_count > 0) throw new ErrorCustom("Cannot delete discount that has been used");

      // Delete the discount
      // const deletedDiscount = await DiscountService.deleteDiscount(id);
      // await Discount.findByIdAndDelete(id);

      return res.status(200).json({
        message: "Discount deleted successfully",
        data: deletedDiscount,
      });
      // return ;
  }


  async validateDiscount(req, res) {
    try {
      const { code, orderAmount, userId, userType } = req.body;

      // Check if code exists and is active
      const discount = await Discount.findOne({
        code,
        isActive: "active",
      });

      if (!discount) {
        return res.status(404).json({
          success: false,
          valid: false,
          message: "Invalid or inactive discount code",
        });
      }

      // Handle validation based on discount type
      let isValid = true;
      let message = "Discount is valid";

      // For promotion type, check dates, limits and order amount
      if (discount.discountType === "promotion") {
        const now = new Date();

        // Check if discount period is valid
        if (
          now < new Date(discount.start_date) ||
          now > new Date(discount.end_date)
        ) {
          return res.status(400).json({
            success: false,
            valid: false,
            message: "Discount code has expired or not yet active",
          });
        }

        // Check if discount is still available
        if (discount.remaining <= 0) {
          return res.status(400).json({
            success: false,
            valid: false,
            message: "Discount code usage limit reached",
          });
        }

        // Check if order meets minimum amount
        if (orderAmount < discount.minimum_order_value) {
          return res.status(400).json({
            success: false,
            valid: false,
            message: `Order amount must be at least ${discount.minimum_order_value} to use this code`,
          });
        }

        // Check if order exceeds maximum amount (if set)
        if (
          discount.maximum_order_value > 0 &&
          orderAmount > discount.maximum_order_value
        ) {
          return res.status(400).json({
            success: false,
            valid: false,
            message: `Order amount cannot exceed ${discount.maximum_order_value} to use this code`,
          });
        }
      }
      // For returning student, validate user type or history
      else if (discount.discountType === "returning_student") {
        if (userType !== "returning_student") {
          return res.status(400).json({
            success: false,
            valid: false,
            message: "This discount is only for returning students",
          });
        }
      }
      // For relative, validate relationship
      else if (discount.discountType === "relative") {
        if (userType !== "relative") {
          return res.status(400).json({
            success: false,
            valid: false,
            message: "This discount is only for relatives of students",
          });
        }
      }

      // Calculate discount amount
      const discountAmount = (orderAmount * discount.discountPercentage) / 100;
      const finalAmount = orderAmount - discountAmount;

      return res.status(200).json({
        success: true,
        valid: true,
        message: "Discount code applied successfully",
        data: {
          discount,
          originalAmount: orderAmount,
          discountAmount,
          finalAmount,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to validate discount",
        error: error.message,
      });
    }
  }


  async applyDiscount(req, res) {
    try {
      const { code, orderId } = req.body;

      // Check if code exists and is active
      const discount = await Discount.findOne({
        code,
        isActive: "active",
      });

      if (!discount) {
        return res.status(404).json({
          success: false,
          message: "Invalid or inactive discount code",
        });
      }

      // Only update counters for promotion type
      if (discount.discountType === "promotion") {
        // Check if still available
        if (discount.remaining <= 0) {
          return res.status(400).json({
            success: false,
            message: "Discount code usage limit reached",
          });
        }

        // Update usage counters
        discount.used_count += 1;
        discount.remaining -= 1;

        // If no more remaining, mark as inactive
        if (discount.remaining <= 0) {
          discount.isActive = "inactive";
        }

        await discount.save();
      }

      return res.status(200).json({
        success: true,
        message: "Discount applied successfully",
        data: discount,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to apply discount",
        error: error.message,
      });
    }
  }
  async getDiscountForm(req, res) {
    let {id} = req.params;
    let formData =  await DiscountService.getDiscountFormData();
    if(id){
      const discount = await DiscountService.getDiscountById(id);
      console.log(discount)
      if (!discount) {
        throw new ErrorCustom("Discount not found", 404);
      }
      formData = await DiscountService.getFormUpdateDiscount(discount);
      // console.log("if",formData)
    } 
      // formData = await DiscountService.getDiscountFormData();
  

    // console.log("else",formData)
    return res.status(200).json({
      success: true,
      data: formData,
    });
  }
}

module.exports = new DiscountController();
