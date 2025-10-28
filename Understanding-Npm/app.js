const http = require("http");

const express = require("express");

//creating express application and storing it in app
const app = express();

const server = http.createServer(app);

server.listen(3000);
