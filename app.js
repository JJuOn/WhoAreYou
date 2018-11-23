const express=require('express')
const bodyParser=require('body-parser')
const fs=require('fs')
const session=require('express-session')
const path=require('path')
const bcrypt=require('bcrypt-nodejs')
const rp=require('request-promise')
const morgan=require('morgan')
const cheerio=require('cheerio')
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

app.use(session({
    secret:'ambc@!vsmkv#!&*!#EDNAnsv#!$()_*#@',
    resave:false,
    saveUninitialized:true
}))

app.get('/',(req,res)=>{
    res.redirect('/main')
})

app.get('/main',(req,res)=>{
    fs.readFile('./views/main')
    res.writeHead(200,{'Content-Type':'text/html'})

})