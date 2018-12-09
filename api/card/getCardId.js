const mysql=require('../../database/mysql')

exports.GetCardId=(deckId)=>{
    return new Promise((resolve,reject)=>{
        mysql.getConnection((err,connection)=>{
            if (err) throw err
            connection.query(`select cardId from card where deckId=\'${deckId}\'`,(err,results,fields)=>{
                if (err) throw err
                resolve(results)
            })
            connection.release()
        })
    })
}