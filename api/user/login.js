const findById=require('../../database/user/findById')
const mysql=require('../../mysql')
const bcrypt=require('bcrypt-nodejs')
const session=require('express-session')
const app=require('express')()

app.use(session({
    secret:'ambc@!vsmkv#!&*!#EDNAnsv#!$()_*#@',
    resave:false,
    saveUninitialized:true
}))


exports.Login=(req,res)=>{
    const userId=req.body.userId
    const password=req.body.password

    const DataCheck=()=>{
        return new Promise((resolve,reject)=>{
            console.log('1')
            if(!userId || !password){
                console.log('1 err')
                return reject({
                    code: 'request_body_error',
                    message: 'request body is not defined'
                })
            }
            else resolve()
        })
    }

    const IdCheck=()=>{
        let user={}
        const findUser= async ()=>{
            try{
                user =await findById.findById(userId)
                return user
            }
            catch (err) {
                return Promise.reject(err)
            }
        }
        return findUser()
    }

    const PwCheck=(user)=>{
        if (user[0]==null){
            console.log('2 err')
            return Promise.reject({
                code:'id_wrong',
                message:'id wrong'
            })
        }
        console.log('3')
        if(bcrypt.compareSync(password,user[0].password)){
            console.log(`3 success\nLogin : ${userId}`)
            req.session.sid=userId
            req.session.save(()=>{
                res.status(200).json({userId:userId})
            })
        }
        else{
            console.log('3 err')
            return Promise.reject({
                code:'pw_wrong',
                message:'pw wrong'
            })
        }
    }

    DataCheck()
        .then(IdCheck)
        .then(PwCheck)
        .catch((err)=>{
            console.log(err)
            res.status(500).json(err.message|err)
        })
}