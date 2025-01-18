import mysql from 'mysql2/promise'

export const pool = mysql.createPool({
    user:"root",
    database:"runu",
    host:"localhost",
    password:""
})

