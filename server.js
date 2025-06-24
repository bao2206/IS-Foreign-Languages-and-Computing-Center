require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const mongoose = require("mongoose");
const AccountService = require("./src/services/accountService");
const AuthModel = require("./src/models/AuthModel");
const RoleModel = require("./src/models/RoleModel");
const {generateUsername} = require("./src/utils/userUtils");
const AuthService = require("./src/services/AuthService");
const UserModel = require("./src/models/UserModel");
const StudentModel = require("./src/models/StudentModel")
const ClassModel =  require("./src/models/ClassModel")
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
const { connectDB } = require("./src/config/database");

// const createAdmin = async () => {
//   const admin = await AccountService.FindUserByRoleAdmin({ role: "admin" });
//   console.log("TEST", admin);
//   if (admin) {
//     console.log("Admin already exists");
//     return;
//   }
//   const newAdmin = new AuthModel({
//     username: process.env.ADMIN_NAME,
//     email: process.env.ADMIN_EMAIL,
//     password: process.env.ADMIN_PASSWORD,
//     role: "admin",
//   });
//   await newAdmin.save();
//   console.log("Admin created successfully");
// };

async function createTenStudentsAndAssignToClass() {
  // 1. Get the student role
  const studentRole = "6800d06932b289b2fe5b0403";


  const studentsData = [];
  for (let i = 1; i <= 10; i++) {
    // Generate fake data
    const name = `Student ${i}`;
    const email = `student${i}@example.com`;
    const phone = `09000000${i.toString().padStart(2, "0")}`;
    const username = generateUsername(email);
    const password = "123456Abc";
    const classId = '68527221304cc3a59f87f71f'
    // 2. Create Auth account
    const auth = await AuthService.createAccount(username, password, studentRole);

    // 3. Create User
    const user = await UserModel.create({
      name,
      email,
      phone,
      authId: auth._id,
    });

    // 4. Create StudentModel
    const student = await StudentModel.create({
      userId: user._id,
      classId,
    });

    // 5. Add student to class
    await ClassModel.findByIdAndUpdate(
      classId ,
      { $push: { students: { student: user._id, status: "paid" } } }
    );

    studentsData.push({
      user,
      auth: { username, password },
      student,
    });
  }

  return studentsData;
}
(async () => {
  await connectDB();
  // await createTenStudentsAndAssignToClass()
 
})();

// Config view
const configView = require("./src/config/configView");
configView(app);

// Create a new admin

app.use("/", require("./src/routes/homepageRoute"));
const indexRouter = require("./src/routes/index");
app.use("/api", indexRouter);
const errorHandler = require("./src/middlewares/errorHandle");
app.use(errorHandler);

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(` Server running on http://localhost:${PORT}`)
);
