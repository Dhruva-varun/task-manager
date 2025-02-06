const express = require("express");
const  User  = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware.js")
const bcrypt = require("bcryptjs");
const  jwt  = require("jsonwebtoken");
const router = express.Router();

router.post("/register", async(req, res)=>{
    try {
        const {name, email, password } = req.body;

        let user = await User.findOne({email});
        if(user) return res.status(400).json({message:"User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({message:"User registered successfully"});
    } catch (error) {
        res.status(500).json({message:"Server error"});
    }
})


router.post("/login", async(req, res)=>{
    try {
        const { email, password } = req.body;

        let user = await User.findOne({email});
        if(!user) return res.status(400).json({message:"Invalid Credentials" });

        const isPassword = await bcrypt.compare(password, user.password);
        if(!isPassword) return res.status(400).json({message:"Invalid Credentials" });

        const token = jwt.sign({id: user._id, role: user.role},process.env.JWT_SECRET,{expiresIn:"7d"});

        res.status(200).json({token, user: { id: user._id, name: user.name, email: user.email, role: user.role }});
    } catch (error) {
        res.status(500).json({message:"Server error"});
    }
});

router.get("/profile", authMiddleware, async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("-password");
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

module.exports = router;

