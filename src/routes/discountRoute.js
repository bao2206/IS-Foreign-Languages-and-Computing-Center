const express = require('express');
const router = express.Router();
const discountController = require('../controllers/DiscountController');
const {asyncHandle} = require('../utils/asyncHandle');

// router.get('/',
//     (req, res) => {
//         res.send('Course route is working!');
//     }
// );

router.get("/", asyncHandle(discountController.getDiscount));
router.get("/get-form/:id?", asyncHandle(discountController.getDiscountForm));
router.post("/create", asyncHandle(discountController.createDiscount));
router.put("/update/:id", asyncHandle(discountController.updateDiscount));
router.delete("/delete/:id", asyncHandle(discountController.deleteDiscount));

// Registration methods
// router.get("/registration", asyncHandle(discountController.getRegistratons));
// router.post("/register", asyncHandle(discountController.registerForCourse));
// router.put("/registration", asyncHandle(discountController.updateRegistration));


module.exports = router;

