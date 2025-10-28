const http = require("http");

const express = require("express");

//creating express application and storing it in app
const app = express();

//adding the MiddleWare function
app.use((req, res, next) => {
  console.log("In The MiddleWare");
  next(); // Allows the request to continue to the next middleware in line
});

app.use((req, res, next) => {
  console.log("In The another MiddleWare!");
});
const server = http.createServer(app);

server.listen(3000);
