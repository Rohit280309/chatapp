const express = require("express");
const { body } = require("express-validator");
const fetchUser = require("../middlewares/fetchUser");
const { getUserData, updateUserProfileImage, getContactDetails, findContact, sendRequest, getUserById, addFriend } = require("../controllers/user");
const multer = require('multer');
const path = require('path');

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'uploads', 'profileImages'));
    },
    filename: function (req, file, cb) {
        cb(null, req.user.id + path.extname(file.originalname)); // Naming the file with user's _id and preserving the file extension
    }
});

const upload = multer({ storage: storage });

router.get("/getUser", fetchUser, getUserData);
router.put("/updateProfileImage", fetchUser, upload.single('image'), updateUserProfileImage);
router.get("/getContactDetails", fetchUser, getContactDetails);
router.post("/findContact", findContact);
router.post("/sendRequest", fetchUser, sendRequest);
router.post("/getUserById", getUserById);
router.post("/addFriend", fetchUser, addFriend);

module.exports = router;
