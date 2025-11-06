// const mysql = require("mysql2");

// const pool = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   database: "node-complete",
//   password: "Aiman@123",
// });

// module.exports = pool.promise();

//connecting sequelize to database

const Sequelize = require("sequelize");

const sequelize = new Sequelize("node-complete", "root", "Aiman@123", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;
