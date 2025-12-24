const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

// Set EJS as the templating engine
app.set("view engine", "ejs");
app.set("views", "views");

const errorController = require("./controllers/erros"); // ⚠️ likely a typo in filename (should be 'errors.js')
const mongoConnect = require("./util/database").mongoConnect;
const User = require("./models/user");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

// Parse incoming form data
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files (CSS, JS, images, etc.)
app.use(express.static(path.join(__dirname, "public")));

// Middleware: Attach a user object to every incoming request
app.use((req, res, next) => {
  User.findById("690d9e76e3417b6d6185e810") // fetch an existing user from MongoDB
    .then((user) => {
      if (!user) {
        console.log("⚠️ User not found in database!");
        return next(); // skip attaching user, continue safely
      }
      req.user = new User(user.name, user.email, user.cart, user._id);
      next();
    })
    .catch((err) => console.log(err)); // log any database errors
});

// Register routes
app.use("/admin", adminRoutes);
app.use(shopRoutes);

// 404 error controller
app.use(errorController.get404);

// Connect to MongoDB, then start the server
mongoConnect(() => {
  app.listen(3000, () => console.log("Server running on port 3000"));
});
