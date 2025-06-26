// const AuthService = require("../services/AuthService");
// const UserService = require("../services/userService");
// const ParentService = require("../services/ParentService");
function generateUsername(email) {
  return email.split("@")[0];
}

function generatePassword(length = 8) {
    if (length < 8) length = 8; // đảm bảo độ dài tối thiểu

    const lower = "abcdefghijklmnopqrstuvwxyz";
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const digits = "0123456789";
    const all = lower + upper + digits;
  
    // Đảm bảo có ít nhất 1 mỗi loại
    const passwordChars = [
      lower.charAt(Math.floor(Math.random() * lower.length)),
      upper.charAt(Math.floor(Math.random() * upper.length)),
      digits.charAt(Math.floor(Math.random() * digits.length)),
    ];
  
    // Thêm các ký tự ngẫu nhiên cho đến đủ độ dài
    for (let i = passwordChars.length; i < length; i++) {
      passwordChars.push(all.charAt(Math.floor(Math.random() * all.length)));
    }
  
    // Trộn ngẫu nhiên để tránh predictable vị trí
    for (let i = passwordChars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
    }
  
    return passwordChars.join('');
}
async function createAccount(email) {
  // Generate username and password
  const username = generateUsername(email);
  const password = "12345678Abc"
  return {
    username, password
  }
}


module.exports = {
    generateUsername,
    generatePassword,
    createAccount
}