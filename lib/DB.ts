import mysql from 'mysql2/promise'
import dotenv from "dotenv"
dotenv.config()
export const pool = mysql.createPool({
    user:process.env.MYSQL_ADDON_USER,
    database:process.env.MYSQL_ADDON_DB,
    host:process.env.MYSQL_ADDON_HOST,
    password:process.env.MYSQL_ADDON_PASSWORD
})

