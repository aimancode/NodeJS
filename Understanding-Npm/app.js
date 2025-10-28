const express = require("express");

//creating express application and storing it in app
const app = express();

//adding the MiddleWare function
// adding function that are hooked into funnels through which the request goes to send it to the next middleware
// or to send response  Allows the request to continue to the next middleware in line

app.use('/add-product',(req, res, next) => {
  res.send("<h1>Hello from Add Product Page</h1>"); //send allows us to attach a body

});

app.use('/',(req, res, next) => {
  res.send("<h1>Hello from Express</h1>"); //send allows us to attach a body
});


app.listen(3000);
