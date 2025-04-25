const express = require('express');
const router = express.Router();

// router.use("/",)

router.use("/users", require("./userRoute"));

router.use("/permission", require("./permissionRoute"));

router.use("/courses", require("./courseRoute"));
module.exports = router;