const errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || "Internal Server Error";

  if (err.name === "ValidationError") {
    status = 400;
    let errors = Object.values(err.errors).map((e) => e.message);
    message = errors.join(", ");
  }

  if (err.code === 11000) {
    status = 409;
    let field = Object.keys(err.keyPattern)[0];
    message = `${field} đã tồn tại`;
  }

  res.status(status).json({ message });
};

module.exports = errorHandler;
