const mysql=require('../mysql')

exports.GetDeckId=(deckOwner,deckTitle)=>{
    return new Promise((resolve,reject)=>{
        mysql.getConnection((err,connection)=>{
            if (err) throw err
            connection.query(`select * from deck where deckOwner=\'${deckOwner}\' and deckTitle=\'${deckTitle}\'`,(err,results,field)=>{
                if (err) throw err
                console.log('result in getDeckId'+results[0])
                connection.release()
                resolve(results[0].id)
            })
        })
    })
}