const crawler=require('./crawlerMulligan')
const getCardId=require('./getCardId')
const puppeteer=require('puppeteer')
const cheerio=require('cheerio')


exports.GetMulligan=(req,res)=>{
    const deckId=req.session.deckId || 113
    console.log('deckId in getMulligan',deckId)
    const opponentClass=req.session.opponentClass || 'PALADIN'
    console.log('opponentClass in getMulligan',opponentClass)
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

    const GetContent=(cardIds)=>{
        cardIds=JSON.stringify(cardIds)
        cardIds=JSON.parse(cardIds)
        let idInQuery=cardIds[0].cardId
        for(let i=1;i<cardIds.length ;i++){
            idInQuery+= '%2C'+cardIds[i].cardId
        }
        console.log('idInQuery in crawlerMulligan ',idInQuery)
        return new Promise((resolve,reject)=>{
            const asyncFunc=async ()=>{
                const browser=await puppeteer.launch()
                try{
                    const page=await browser.newPage()
                    await page.setViewport({width:1366,height:768})
                    await page.goto(`https://hsreplay.net/decks/#timeRange=LAST_30_DAYS&includedCards=${idInQuery}`,{waitUntil: 'networkidle2'})
                    const content=await page.content()
                    browser.close()
                    return content
                }
                catch(err)
                {
                    console.log(err)
                    browser.close()
                }
            }
            resolve(asyncFunc())
        })
    }

    const GetDeckHref=(content)=>{
        return new Promise((resolve,reject)=>{
            const $=cheerio.load(content)
            let deck=$('#decks-container > div > main > div.deck-list > ul > li:nth-child(2)').find('a')
            const deckHref=$(deck).attr('href')
            console.log('deckHref in crawlerMulligan :',deckHref)
            resolve(deckHref)
        })
    }
    const GetDeckContent=(href)=>{
        return new Promise((resolve,reject)=>{
            const asyncFunc=async ()=>{
                const browser=await puppeteer.launch()
                try{
                    const page=await browser.newPage()
                    await page.setViewport({width:1366,height:768})
                    await page.goto(`https://hsreplay.net${href}?hl=ko`,{waitUntil: 'networkidle2'})
                    const content=await page.content()
                    browser.close()
                    return content
                }
                catch(err)
                {
                    console.log(err)
                    browser.close()
                }
            }
            resolve(asyncFunc())
        })
    }
    const GetMulligan=(content)=>{
        return new Promise((resolve,reject)=>{
            const $=cheerio.load(content)
            let cardNames=$('.card-name')
            let cardWinRates=$('.table-cell')
            let cards=[]
            for(let i=0;i<cardNames.length;i++){
                let cardName=$(cardNames[i]).text()
                let cardWinRate=$(cardWinRates[6*i]).text()
                cardWinRate=cardWinRate.replace('▼','')
                cardWinRate=cardWinRate.replace('▲','')
                cardWinRate=cardWinRate.replace('%','')
                cards.push({cardName:cardName,cardWinRate:cardWinRate})
            }
            cards.sort((a,b)=>{
                return a.cardWinRate<b.cardWinRate ? 1:-1
            })
            console.log(cards)
            resolve(cards)
        })
    }
    DataCheck()
        .then(GetCardId)
        //.then(CrawlerMulligan)
        .then(GetContent)
        .then(GetDeckHref)
        .then(GetDeckContent)
        .then(GetMulligan)
        .then((cards)=>{
            return new Promise((resolve,reject)=>{
                console.log('cards in getMulligan : ',cards)
                resolve(cards)
            })
        })
        .catch((err)=>{
            console.log(err)
        })
}