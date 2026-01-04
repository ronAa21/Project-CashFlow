import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  port: process.env.DB_PORT || 3307,
  password: process.env.PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 5 
});

pool.getConnection()
  .then(connection => {
    console.log("Connected to the database");
    connection.release();
  })
  .catch(error => {
    console.error("Error connecting to the database:", error);
  });

export { pool };
