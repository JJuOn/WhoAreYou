const rp=require('request-promise')
const mysql=require('../../database/mysql')
const crawler=require('./crawler')
const cheerio=require('cheerio')


exports.NewDeck=(req,res)=>{
    const deckOwner=req.session.sid
    const deckTitle=req.body.deckTitle
    const deckClass='paladin'
    let deckCode=req.body.deckCode
    let cards=[]

    console.log(deckOwner,deckTitle,deckCode)

    const DataCheck=()=>{
        return new Promise((resolve,reject)=>{
            if(!deckTitle || !deckCode){
                return reject({
                    code: 'request_body_error',
                    message: 'request body is not defined'
                })
            }
            else resolve()
        })
    }
    const CrawlPage=()=>{
        return crawler.Crawl(deckCode)
    }
    const DeckCrawl=(result)=>{
        //console.log(result)
        const $=cheerio.load(result)
        let cardCosts=$('div.hs-tile-info').children('.hs-tile-info-left.mdc-list-item__start-detail')
        let cardNames=$('div.hs-tile-info').find('span').find('span')
        let cardNums=$('div.hs-tile-info').children('.hs-tile-info-right.mdc-list-item__end-detail')

        for(let i=0;i<cardNames.length;i++) {
            let cardCost=$(cardCosts[i]).text()
            let cardName=$(cardNames[i]).text()
            let cardNum=$(cardNums[i]).text()
            if(cardNum.trim()==='')
                cardNum='1'
            else
                cardNum=cardNum.trim()
            cards.push({cardCost: cardCost, cardName: cardName, cardNum: cardNum})
        }
        console.log(cards)
    }

    const AddDeck=()=>{
        mysql.getConnection((err,connection)=>{
            if (err) throw err
            connection.query(`insert into deck (deckOwner,deckTitle,deckClass,deckCode) values (\'${deckOwner}\',\'${deckTitle}\',\'${deckClass}\',\'${deckCode}\');`,(err,results,fields)=>{
                if (err) throw err
                connection.release()
            })
        })
    }

    DataCheck()
        .then(CrawlPage)
        .then(DeckCrawl)
        .then(AddDeck)
        .then(()=>{
            res.status(200).json({message:'Complete Adding Deck'})
        })
        .catch((err)=>{
            console.log(err)
            res.status(500).json(err || err.message)
        })
}