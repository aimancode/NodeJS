const { validationResult } = require("express-validator");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.signup = async (req, res, next) => {
  try {
    // Validate incoming request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed");
      error.statusCode = 422; // Client sent invalid data
      error.data = errors.array(); // Detailed validation errors
      throw error;
    }

    // Extract user input from request body
    const { email, name, password } = req.body;

    // Hash password before storing in DB
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user with hashed password
    const user = new User({
      email,
      password: hashedPassword,
      name,
    });

    // Save user to database
    const result = await user.save();

    // Send success response
    res.status(201).json({
      message: "User created successfully",
      userId: result._id,
    });
  } catch (err) {
    // Set default status code for unexpected errors
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err); // Forward to global error handler
  }
};

exports.login = async (req, res, next) => {
  try {
    // Extract login credentials
    const email = req.body.email;
    const password = req.body.password;

    // Find user by email
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("A user with this email could not be found.");
      error.statusCode = 401;
      throw error;
    }

    // Compare entered password with stored hash
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Wrong password!");
      error.statusCode = 401;
      throw error;
    }

    // Create JWT token
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      "secret", // move this to env in real apps
      { expiresIn: "1h" }
    );

    // Send success response
    res.status(200).json({
      token: token,
      userId: user._id.toString(),
    });
  } catch (err) {
    // Default error code
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getStatus = (req, res, next) => {
  res.status(200).json({ status: "OK" });
};
