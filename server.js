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
const RoleModel = require("./src/models/RoleModel");
// const {initAdminRole} = require("./src/init/initAdminRole");
const { updatePermissionByCode } = require("./src/data/updatePermissionByCode"); 
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
    // await initAdminRole();
    // await AuthModel.updateOne(
    // 
    // );  { username: "superadmin" },
    //   { $set: { role: new mongoose.Types.ObjectId("6800d06a32b289b2fe5b040c") } }
  
    // console.log("Cập nhật role thành công!");
    
    // await updatePermissionByCode("baopro2206", ["6800b2d25b1c6802f149dc88"]);
  

  })()
  

  // Config view
  const configView = require("./src/config/configView");
  configView(app);

  // Create a new admin


  app.use("/", require("./src/routes/homepageRoute"));
  const indexRouter = require("./src/routes/index");
  app.use("/api", indexRouter);
  const errorHandler = require('./src/middlewares/errorHandle');
  app.use(errorHandler);

  // Khởi động server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));
  