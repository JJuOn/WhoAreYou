const getCardId=require('./getCardId')
const puppeteer=require('puppeteer')
const cheerio=require('cheerio')
const fs=require('fs')
const ejs=require('ejs')
let globalMulligan
let globalDecks
exports.GetResult=(req,res)=>{
    const deckId=req.session.deckId
    const opponentClass=req.session.opponentClass
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

    const GetMulContent=(cardIds)=>{
        cardIds=JSON.stringify(cardIds)
        cardIds=JSON.parse(cardIds)
        let idInQuery=cardIds[0].cardId
        for(let i=1;i<cardIds.length ;i++){
            idInQuery+= '%2C'+cardIds[i].cardId
        }
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
            console.log(deckHref)
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
            resolve(cards)
        })
    }
    const GetOppContent=()=>{
        return new Promise((resolve,reject)=>{
            const asyncFunc=async ()=>{
                const browser=await puppeteer.launch()
                try{
                    const page=await browser.newPage()
                    await page.setViewport({width:1366,height:768})
                    await page.goto(`https://hsreplay.net/decks/#playerClasses=${opponentClass}`,{waitUntil: 'networkidle2'})
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

    const GetDeckInfo=(content)=>{
        return new Promise((resolve,reject)=>{
            const $=cheerio.load(content)
            let deckNames=$('.deck-name')
            let deckGames=$('.game-count')
            let decks=[]
            for(let i=0;decks.length<3;i++) {
                let deckName = $(deckNames[i]).text()
                let deckGame = $(deckGames[i]).text()
                let j=0
                for(;j<decks.length;j++){
                    if(deckName===decks[j].deckTitle)
                        break
                }
                if(j===decks.length){
                    decks.push({deckTitle:deckName,deckGame:deckGame})
                }
            }
            resolve(decks)
        })
    }
    DataCheck()
        .then(GetCardId)
        //.then(CrawlerMulligan)
        .then(GetMulContent)
        .then(GetDeckHref)
        .then(GetDeckContent)
        .then(GetMulligan)
        .then((cards)=>{
            return new Promise((resolve,reject)=>{
                globalMulligan=cards
                resolve()
            })
        })
        .then(GetOppContent)
        .then(GetDeckInfo)
        .then((decks)=>{
            return new Promise((resolve,reject)=>{
                globalDecks=decks
                resolve()
            })
        })
        .then(()=>{
            return new Promise((resolve,reject)=>{
                let result={}
                result.cards=globalMulligan
                result.decks=globalDecks
                resolve(result)
            })
        })
        .then((result)=>{
            fs.readFile('./views/ejs/result.ejs','utf-8',(err,data)=>{
                res.writeHead(200,{'Content-Type':'text/html'})
                res.end(ejs.render(data,{
                    cards:globalMulligan || [],
                    decks:globalDecks || [],
                }))
            })
        })
        .catch((err)=>{
            console.log(err)
        })
}