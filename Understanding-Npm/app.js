const bodyParser = require("body-parser");

const path = require("path");
const express = require("express");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

// servering static folders 
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
});

app.listen(3000);

//creating express application and storing it in app
//parsing the incoming request body

//adding the MiddleWare function
// adding function that are hooked into funnels through which the request goes to send it to the next middleware
// or to send response  Allows the request to continue to the next middleware in line
