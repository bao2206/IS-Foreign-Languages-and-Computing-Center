const Payment = require("../models/PaymentModel");

class PaymentService {
  async createPayment(data) {
    return await Payment.create(data);
  }

  async getPaymentById(id) {
    return await Payment.findById(id);
  }

  async getAllPayments(query = {}) {
    return await Payment.find(query).sort({ paymentDate: -1 });
  }

  async updatePayment(id, data) {
    return await Payment.findByIdAndUpdate(id, data, { new: true });
  }

  async deletePayment(id) {
    return await Payment.findByIdAndDelete(id);
  }

  async updatePaymentStatus(id, status) {
    return await Payment.findByIdAndUpdate(id, { status }, { new: true });
  }
}

module.exports = new PaymentService();