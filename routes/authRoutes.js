const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const router = express.Router();

const generateToken = (data) => {
  return jwt.sign(data, process.env.PRIVATE_KEY);
};

router.post("/register", async ({ body }, res) => {
  const { username, password, email, address, phone, firstName, lastName } =
    body;

  try {
    if (!username) {
      return res.status(400).send({ message: "username required" });
    }

    const user = await User.findOne({ username }).exec();

    if (user) {
      return res.status(409).send({ message: "User already exists" });
    }

    const newUserData = {
      username,
      email,
      address,
      phone,
      firstName,
      lastName,
      orders: [],
    };

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password, salt);

    newUserData.password = hash;
    newUserData.token = generateToken(username);

    const newUser = new User(newUserData);
    const createdUser = await newUser.save();

    res.status(201).send({ ...createdUser.toJSON() });
  } catch (err) {
    res.status(500).send({ message: err });
  }
});

router.post("/login", async ({ body }, res) => {
  const { email, password } = body;

  try {
    const existingUser = await User.findOne({ email }).exec();

    if (!existingUser) {
      return res.status(401).send({ message: "No user found" });
    }

    const correctPassword = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!correctPassword) {
      return res.status(401).send({ message: "Invalid credentials" });
    }

    return res.status(200).send({ ...existingUser.toJSON() });
  } catch (err) {
    res.status(500).send({ message: err });
  }
});

module.exports = router;
