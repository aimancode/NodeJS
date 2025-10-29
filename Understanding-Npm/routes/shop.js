const express = require("express");

const router = express.Router();

router.get("/", (req, res, next) => {
  res.send("<h1>Hello from Express</h1>"); //send allows us to attach a body
});

module.exports = router;
