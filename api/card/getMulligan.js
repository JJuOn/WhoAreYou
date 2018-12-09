const crawler=require('./crawlerMulligan')
const getCardId=require('./getCardId')

exports.GetMulligan=(req,res)=>{
    const deckId=req.session.deckId || 113
    const opponentClass=req.body.class || 'PALADIN'
    const DataCheck=()=>{
        return new Promise((resolve,reject)=>{
            if (!deckId || !opponentClass){
                return reject({
                    code:'query_error',
                    message:'query error',
                })
            }
            resolve()
        })
    }
    const GetCardId=()=>{
        return getCardId.GetCardId(deckId)
    }
    const CrawlerMulligan=(cardIds)=>{
        return crawler.getDecks(cardIds)
    }
    DataCheck()
        .then(GetCardId)
        .then(CrawlerMulligan)
        .then((cards)=>{
            res.status(200).json(cards)
        })
        .catch((err)=>{
            res.status(500).json(err)
        })
}