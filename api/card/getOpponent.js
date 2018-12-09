const request=require('request')
const iconv=require('iconv-lite')
const charset=require('charset')
const crawler=require('./crawlerOpponent')

exports.GetOpponent=(req,res)=>{
    const opponentClass=req.body.class
    const DataCheck=()=>{
        return new Promise((resolve,reject)=>{
            if(!opponentClass){
                return reject({
                    code:'query_error',
                    message:'query_error'
                })
            }
            resolve()
        })
    }
    const CralwerOpponent=()=>{
        return crawler.getDecks(opponentClass)
    }
    DataCheck
        .then(CralwerOpponent)
        .then((decks)=>{
            res.status(200).json(decks)
        })
        .catch((err)=>{
            res.status(500).json(err)
        })
}