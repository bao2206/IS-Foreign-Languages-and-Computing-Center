const jwt = require("jsonwebtoken");

const decodeToken = async (token) => {
  if (!token) {
    return null;
  }

  let decoded;
  return await jwt.verify(
    token,
    process.env.JWT_SECRET,
    async (error, decoded) => {
      if (error) return next(new UnAuthorizedError("Invalid token."));
      return decoded;
    }
  );
};

module.exports = decodeToken;
