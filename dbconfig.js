require('dotenv').config()
const mysql=require('mysql')

module.exports={
    host:process.env.DB_HOST,
        user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:'WhoAreYou',
    port:process.env.DB_PORT
}