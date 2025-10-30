const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

// const expressHbs = require("express-handlebars");

const app = express();

// app.set("view engine", "pug");

// app.engine("hbs", expressHbs.engine({layoutsDir:"views/layouts/", defaultLayout: 'main-layout.hbs' }));
// app.set("view engine", "hbs");
// app.set("views", "views");

app.set("view engine", "ejs");
app.set("views", "views");

const errorController = require("./controllers/erros");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

app.listen(3000);
