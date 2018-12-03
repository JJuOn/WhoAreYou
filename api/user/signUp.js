'use strict'

const express=require('express')
const session=require('express-session')
const findById=require('../../database/user/findById')
const mysql=require('../../database/mysql')
const bcrypt=require('bcrypt-nodejs')

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
    const UserCheck=()=>{
        let user={}
        const findUser=async ()=>{
            try{
                user= await findById.findById(userId)
                console.log(`user in UserCheck : ${JSON.stringify(user)}`)
                return user
            }
            catch(err){
                return Promise.reject(err)
            }
        }
        return findUser()
    }

    const SignUp=(user)=>{
        if(user[0]!=null){
            return Promise.reject({
                code:'User_Already_Exists',
                message:'User Already Exists'
            })
        }
        const hash=bcrypt.hashSync(password,bcrypt.genSaltSync(10),null)
        mysql.getConnection((err,connection)=>{
            if(err) throw err
            connection.query(`insert into user (userId,password) values (\'${userId}\',\'${hash}\');`,(err,results,fields)=>{
                if(err) throw err
                connection.release()
            })
        })

    }

    DataCheck()
        .then(UserCheck)
        .then(SignUp)
        .then(()=>{
            return res.status(200).json({userId:userId})
        })
        .catch((err)=>{
            console.log(err)
            res.status(500).json(err.message||err)
        })
}