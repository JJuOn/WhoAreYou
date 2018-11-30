const express=require('express')
const bodyParser=require('body-parser')
const fs=require('fs')
const session=require('express-session')
const path=require('path')
const bcrypt=require('bcrypt-nodejs')
const rp=require('request-promise')
const morgan=require('morgan')
const cheerio=require('cheerio')
require('dotenv').config()
const app=express()

app.use(morgan('[:date[iso]] :method :status :url :response-time(ms) :user-agent'))

app.use('/static',express.static(path.join(__dirname, '/static')))
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH')
    res.header('Access-Control-Allow-Headers', 'content-type, x-access-token')
    next()
})

app.use('/api',require('./api'))

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
        fs.readFile('./views/html/main.html',(err,data)=>{
            res.writeHead(200, {'Content-Type': 'text/html'})
            res.end(data)
        })
    }
})

app.get('/signup',(req,res)=>{
    fs.readFile('./views/html/signup.html',(err,data)=>{
        res.writeHead(200,{'Content-Type':'text/html'})
        res.end(data)
    })
})

app.get('/login',(req,res)=>{
    fs.readFile('./views/html/login.html',(err,data)=>{
        res.writeHead(200,{'Content-Type':'text/html'})
        res.end(data)
    })
})

app.listen(process.env.SERVER_PORT || 3000,()=>{
    console.log('sample server is listening to port ' + process.env.SERVER_PORT)
})