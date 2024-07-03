const express = require("express");
const { body } = require("express-validator");
const { userSignUpHandler, userLoginHandler } = require("../controllers/auth")

const router = express.Router();

router.post("/signup", [
    body("username", "Enter a valid username").isLength({ min: 2 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Enter a valid password").isLength({ min: 8 })
],
    userSignUpHandler);

router.post("/login", [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Enter a valid password").isLength({ min: 8 })
],
    userLoginHandler);




module.exports = router;