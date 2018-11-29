const mysql=require('mysql')
const dbconfig=require('../../dbconfig')

exports.findById=(userId)=>{
    const connection=mysql.createConnection(dbconfig)
    connection.connect()

    connection.query(`select * from user where userId=${userId}`,(err,result,fields)=>{
        if(err){
            throw err
        }
        else{
            return result
        }
    })
}


