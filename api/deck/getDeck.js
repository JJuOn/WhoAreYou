const mysql=require('../../database/mysql')

exports.GetDeck=(res,req)=>{
    const userId='test'

    const getDeck=()=>{
        return new Promise((resolve,reject)=>{
            mysql.getConnection((err,connection)=>{
                if (err) throw err
                connection.query(`select id,deckTitle from deck where deckOwner=\'${userId}\'`,(err,results,fields)=>{
                    if (err) throw err
                    console.log(JSON.stringify(results))
                    resolve(JSON.stringify(results))
                })
                connection.release()
            })
        })

    }
    getDeck()
        .then((results)=>{
            return res.status(200).json(results)
        })
        .catch((err)=>{
            //return res.status(500).json(err||err.message)
        })
}