const DiscountModel = require('../models/DiscountModel');

class DiscountService{
    async getFilteredDiscounts(query){
      const {
        code,
        discountType,
        isActive,
        page,
        limit,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = query;
    
      const currentPage = Math.max(parseInt(page) || 1, 1);
      const itemsPerPage = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
      const skip = (currentPage - 1) * itemsPerPage;
    
      const filter = {};
      if (code) filter.code = new RegExp(code, 'i');
      if (discountType) filter.discountType = discountType;
      if (isActive !== undefined) filter.isActive = isActive === 'true';
    
      const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    
      const totalCount = await DiscountModel.countDocuments(filter);
      const discounts = await DiscountModel.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(itemsPerPage);
    
      return {
        discounts,
        pagination: {
          totalCount,
          totalPages: Math.ceil(totalCount / itemsPerPage),
          currentPage,
          limit: itemsPerPage
        }
      };
    } 
    async createDiscount(discountData) {
      return await DiscountModel.create(discountData);
    }
    async getDiscountFormData(){
      return {
        fields: [
          'code',
          'discountType',
          'discountPercentage',
          'description',
          'isActive',
          'start_date',
          'end_date',
          'minimum_order_value',
          'maximum_order_value',
          'usage_limit'
        ]
      };
    }
    async getFormUpdateDiscount(id) {
      const existing = await DiscountModel.findById(id);
      if (!existing) return;
      const fields = [
        'code',
        'discountType',
        'discountPercentage',
        'description',
        'isActive',
        'start_date',
        'end_date',
        'minimum_order_value',
        'maximum_order_value',
        'usage_limit'
      ]
      const data = {};
      for(const field of fields) {
        data[field] = existing[field] ?? null;
      }
      // console.log(fields, data)
      // console.log(fields);
      return  data;
    }
    async getDiscountById(id) {
      return await DiscountModel.findById(id);
    }
    async checkCodeExists(updateCode,id) {
      return await DiscountModel.findOne({
        code: updateCode.code,
        _id: { $ne: id }
      })
    }
    async updateDiscount(id,updateData, discount){
      const currentDiscountType =
      updateData.discountType || discount.discountType;

    if (
      currentDiscountType === "returning_student" ||
      currentDiscountType === "relative"
    ) {
      // Remove fields that shouldn't be set for these types
      const fieldsToDelete = [
        "start_date",
        "end_date",
        "minimum_order_value",
        "maximum_order_value",
        "usage_limit",
        "used_count",
        "remaining",
      ];

      fieldsToDelete.forEach((field) => {
        if (updateData.hasOwnProperty(field)) {
          delete updateData[field];
        }
      });
    } else if (updateData.usage_limit !== undefined) {
      // For promotion type, recalculate remaining if usage_limit changes
      updateData.remaining =
        updateData.usage_limit - (discount.used_count || 0);
    } 

    // Set updated timestamp
    updateData.updateddAt = Date.now();
    return await DiscountModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    }
    async deleteDiscount(id) {
      return await DiscountModel.findByIdAndDelete(id);
    }
}


module.exports = new DiscountService();