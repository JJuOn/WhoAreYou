const express=require('express')
const bodyParser=require('body-parser')
const fs=require('fs')
const session=require('express-session')
const path=require('path')
const bcrypt=require('bcrypt-nodejs')
const rp=require('request-promise')
const morgan=require('morgan')
const cheerio=require('cheerio')
const mysql=require('mysql')
require('dotenv').config()
const app=express()

app.use(morgan('[:date[iso]] :method :status :url :response-time(ms) :user-agent'))

app.use(express.static(path.join(__dirname, '/static')))
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH')
    res.header('Access-Control-Allow-Headers', 'content-type, x-access-token')
    next()
})

const connection=mysql.createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:'user',
    port:''
})

let allCards=[]
fs.readFile('cardskoKR.json',(err,data)=>{
    allCards=JSON.parse(data)
})

app.use(session({
    secret:'ambc@!vsmkv#!&*!#EDNAnsv#!$()_*#@',
    resave:false,
    saveUninitialized:true
}))

app.get('/',(req,res)=>{
    res.redirect('/main')
})

app.get('/main',(req,res)=>{
    if(!req.session.sid)
        res.redirect('/login')
    else {
        fs.readFile('./views/main')
        res.writeHead(200, {'Content-Type': 'text/html'})
    }
})

app.listen(process.env.SERVER_PORT || 3000,()=>{
    console.log('sample server is listening to port ' + process.env.SERVER_PORT)
})