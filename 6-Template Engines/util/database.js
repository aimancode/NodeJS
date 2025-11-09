const { MongoClient } = require("mongodb");

let _db;

const mongoConnect = async (callback) => {
  try {
    const client = await MongoClient.connect(
      "mongodb+srv://codebyaiman:Aiman%40123@cluster0.j6gucel.mongodb.net/shop?retryWrites=true&w=majority&appName=Cluster0"
    );
    console.log("✅ Connected to MongoDB Atlas");
    _db = client.db();
    callback();
  } catch (err) {
    console.error("❌ MongoDB Atlas connection failed:", err.message);
    throw err;
  }
};

const getDb = () => {
  if (_db) return _db;
  throw "No database found!";
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
