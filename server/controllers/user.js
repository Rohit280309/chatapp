const User = require("../models/User");
const path = require('path');

const getUserData = async (req, res) => {
    try {
        
        const user = await User.findById(req.user.id).select(["-password","-date"]);
        if (!user) {
            return res.json({ message: "User not found" }).status(404);
        }

        res.json({ user: user }).status(200);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
}

const updateUserProfileImage = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const imagePath = path.join('logo', req.file.filename);

        user.logo = imagePath;

        await user.save();

        res.status(201).json({ message: "Profile Updated" });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
}

const getContactDetails = async (req, res) => {
    try {
        
        const user = await User.findById(req.user.id).select(["-password","-date"]);
        if (!user) {
            return res.json({ message: "User not found" }).status(404);
        }

        let responseData = [];
        const contactPromises = user.contacts.map(async (user) => {
            const contact = await User.findById(user).select(["-password", "-date", "-contacts"]);
            responseData.push(contact);
        });

        await Promise.all(contactPromises);

        res.status(200).json({ contacts: responseData })

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
}

const findContact = async (req, res) => {
    try {
        
        const { email } = req.body;
        
        const user = await User.find({ email: email }).select(["-password", "-date", "-contacts", "-friendRequests"]);
        if (!user) {
            return res.json({ message: "User not found" }).status(404);
        }
        
        user.length > 0 ? res.status(200).json({ message: user }) : res.status(200).json({ message: "No such user" });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
}

const sendRequest = async (req, res) => {
    try {
        
        const { email } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.json({ message: "User not found" }).status(404);
        }

        const friend = await User.find({ email: email });
        if (!friend) {
            return res.json({ message: "Enter valid email" }).status(404);
        }

        user.contacts.push(friend._id);

        res.status(200).json({ message: "Friend Added"});

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
}

const getUserById = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId).select(["-password", "-date", "-contacts", "-friendRequests"])
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user: user });
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error"); 
    }
}

const addFriend = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const loggedInUser = await User.findById(req.user.id);
        if (!loggedInUser) {
            return res.status(404).json({ message: "Please login" });
        }
        user.contacts.push(loggedInUser._id);
        loggedInUser.contacts.push(user._id);

        await user.save();
        await loggedInUser.save();

        res.status(200).json({ message: "Friend added" });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
}

module.exports = { getUserData, updateUserProfileImage, getContactDetails, sendRequest, findContact, getUserById, addFriend };
