const crawler=require('./crawlerDeckCodes')
const cheerio=require('cheerio')
const addCards=require('../card/addCards')
const addDeck=require('./addDeck')
const getDeckId=require('./getDeckId')

exports.NewDeck=(req,res)=>{
    const deckOwner=req.session.sid
    const deckTitle=req.body.deckTitle || new Date()
    let deckCode=req.body.deckCode
    let cards=[]


    const DataCheck=()=>{
        return new Promise((resolve,reject)=>{
            if(!deckCode){
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
        //console.log(cards)
    }

    const AddDeck=()=>{
        const asyncAddDeck=async ()=>{
            try{
                const results=await addDeck.AddDeck(deckOwner,deckTitle,deckCode)
            }
            catch (err) {
                throw err
            }
        }
        return asyncAddDeck()
    }

    const GetId=()=>{
        const asyncGetDeckId=async ()=>{
            try{
                const results=await getDeckId.GetDeckId(deckOwner,deckTitle)
                return results
            }
            catch (err){
                throw err
            }
        }
        return asyncGetDeckId()
    }
    const AddCards=(deckId)=>{
        return addCards.AddCards(deckId,cards)
    }

    DataCheck()
        .then(CrawlPage)
        .then(DeckCrawl)
        .then(AddDeck)
        .then(GetId)
        .then(AddCards)
        .then(()=>{
            res.status(200).json({message:'Complete Adding Deck'})
        })
        .catch((err)=>{
            console.log(err)
            res.status(500).json(err || err.message)
        })
}