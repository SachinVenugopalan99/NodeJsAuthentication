const asyncHandler = require("express-async-handler")
const User = require("../models/userModel")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const registerUser = asyncHandler(async (req, res) => {
    const {userName, email, password} = req.body;
    if (!userName || !email || !password) {
        res.status(400);
        throw new Error("All fields are mandatory!");
    }
    const userAvailable = await User.findOne({email})
    if (userAvailable) {
        res.status(400);
        throw new Error("User Already Registered!");
    }
    //Hash password
    const hashPassword = await bcrypt.hash(password, 10);
    const user= await User.create({
        userName,
        email,
        password: hashPassword
    })
    console.log('Hashed Password:', user);
    if (user) {
        res.status(201).json({_id: user.id, email: user.email})
    } else {
        res.status(400);
        throw new Error("User data is not valid");
    }
    res.json({message: "Register the user"})
})

const loginUser = asyncHandler(async (req, res) => {
    const {email, password} = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error('All Fields are Mandatory')
    }
    const userAvailable = await User.findOne({email})
    if (userAvailable && bcrypt.compare(password, userAvailable.password)) {
        const accessToken = jwt.sign({
            user:{
                userName: userAvailable.userName,
                email: userAvailable.email,
                id: userAvailable.id
            }
        }, process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" })
        res.status(200).json({ accessToken });
    } else {
        res.status(400)
        throw new Error('Password is not Valid')
    }
    res.json({message: 'login user'});
})

const currentUser = asyncHandler(async (req, res) => {
    res.json(req.user);
})

module.exports ={ registerUser, loginUser, currentUser }