const express=require('express')
const session=require('express-session')
const findById=require('../../database/user/findById')
const mysql=require('mysql')
const bcrypt=require('bcrypt-nodejs')
const dbconfig=require('../../dbconfig')
const connection=mysql.createConnection(dbconfig)
connection.connect()

exports.SignUp=(req,res)=>{
    const userId=req.body.userId
    const password=req.body.password
    const DataCheck=()=>{
        return new Promise((resolve,reject)=>{
            if(!userId || !password){
                return reject({
                    code: 'request_body_error',
                    message: 'request body is not defined'
                })
            }
            else resolve()
        })
    }
    const SignUp=()=>{
        const user=findById(userId)
        if(!user){
            const hash=bcrypt.hashSync(password,bcrypt.genSaltSync(10),null)
            connection.query(`insert into user (userId,password) values (${userId},${hash});`,(err,results,fields)=>{
                if(err){
                    throw err
                }
                else{
                    console.log(results)
                }
            })
        }
        else{
            return reject({
                code:'User_already_exists',
                message:'User already exists'
            })
        }
    }

    DataCheck()
        .then(SignUp)
        .then(()=>{
            return res.status(200).json({userId:userId})
        })
        .catch((err)=>{
            console.log(err)
            res.status(500).json(err.message||err)
        })
}