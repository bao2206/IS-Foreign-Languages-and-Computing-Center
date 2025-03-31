require("dotenv").config();
const express = require('express');
const cors = require('cors');


const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send(" Server is running with Express!");
  });

  // Import database connection
  const {connectDB} = require("./src/config/database");
  (async () => {
    await connectDB();
  })()
    
  // // Import routes
  // const userRoutes = require("./src/routes/user.routes");
  // app.use("/api/users", userRoutes);
  
  // Khởi động server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));
  