const findById=require('../../database/user/findById')
const mysql=require('../../mysql')
const bcrypt=require('bcrypt-nodejs')

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
        console.log(2)
        resolve(findById.findById(userId))
    }

    const PwCheck=(user)=>{
        console.log(user)
        if (!user){
            console.log('2 err')
            return reject({
                code:'id_wrong',
                message:'id wrong'
            })
        }
        console.log('3')
        if(bcrypt.compareSync(password,user.password)){
            console.log(`Login : ${userId}`)
            resolve()
        }
        else{
            console.log('3 err')
            return reject({
                code:'pw_wrong',
                message:'pw wrong'
            })
        }
    }

    DataCheck()
        .then(IdCheck)
        .then(PwCheck)
        .then(()=>{
            req.session.sid=userId
            res.status(200).json({userId:userId})
        })
        .catch((err)=>{
            res.status(500).json(err.message|err)
        })
}