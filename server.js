require("dotenv").config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const mongoose = require("mongoose");
const AccountService = require("./src/services/accountService");
const AuthModel = require("./src/models/AuthModel");
app.get("/", (req, res) => {
    res.send(" Server is running with Express!");
  });
// console.log(process.env.ADMIN_USERNAME,
//   process.env.ADMIN_EMAIL,
//   process.env.ADMIN_PASSWORD,
// );
  // Import database connection
  const {connectDB} = require("./src/config/database");
  const createAdmin = async () => {
    const admin = await AccountService.FindUserByRoleAdmin({role: "admin"});
    console.log('TEST',admin)
    if(admin){
      console.log("Admin already exists");
      return;
    }
    const newAdmin = new AuthModel({
      username: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: "admin"
    });
    await newAdmin.save();
    console.log("Admin created successfully");
  }
  (async () => {
    await connectDB();
    // await createAdmin();
  })()
    
  // Create a new admin


  app.use("/", require("./src/routes/homepageRoute"));
  const indexRouter = require("./src/routes/index");
  app.use("/api", indexRouter);
  

  // Khởi động server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));
  