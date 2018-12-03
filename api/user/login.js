const findById=require('../../database/user/findById')
const bcrypt=require('bcrypt-nodejs')

exports.Login=(req,res)=>{
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
            return Promise.reject({
                code:'id_wrong',
                message:'id wrong'
            })
        }
        if(bcrypt.compareSync(password,user[0].password)){
            console.log(`Login : ${userId}`)
            req.session.sid=userId
            req.session.save(()=>{
                res.status(200).json({userId:userId})
            })
        }
        else{
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