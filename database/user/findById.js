const mysql=require('../../mysql')

exports.findById=(userId)=>{
    return new Promise((resolve,reject)=>{
        mysql.getConnection((err,connection)=>{
            if(err)
                return reject({
                    code: 'connect_db_error',
                    message: 'connect_db_error'
                })
            connection.query(`select * from user where userId=\'${userId}\'`,(err,result,fields)=>{
                if(err){
                    connection.release()
                    return reject({
                        code:'select_db_error',
                        message:'select db error'
                    })
                }
                else{
                    connection.release()
                    console.log('1 result in findById ',result)
                    resolve(result)
                }
            })
        })
    })

}


