import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

redis.on("connect", () => console.log("Kết nối Redis thành công!"));
redis.on("error", (err) => console.error("Lỗi Redis:", err));

module.exports = redis;