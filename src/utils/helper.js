const { Types } = require("mongoose");

const coverIdToObjectId = id => new Types.ObjectId(id);
const removeVietnameseTones = (str) => {
    return str
    .normalize("NFD") // tách dấu
    .replace(/[\u0300-\u036f]/g, "") // xóa dấu
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^\w\s]/gi, "") // loại bỏ ký tự đặc biệt nếu cần
    .replace(/\s+/g, " ") // thay nhiều khoảng trắng bằng 1 khoảng trắng
    .trim();
}

module.exports = {
    coverIdToObjectId,
    removeVietnameseTones
}