const puppeteer=require('puppeteer');
const cheerio=require('cheerio');

exports.getDecks=(cardIds)=>{
    console.log('cardIds in crawlerMulligan ',cardIds)
    cardIds=JSON.stringify(cardIds)
    cardIds=JSON.parse(cardIds)
    console.log('stringified cardIds in crawlerMulligan ',cardIds)
    console.log(cardIds[0])
    let idInQuery=cardIds[0].cardId
    for(let i=1;i<cardIds.length && i<10;i++){
        idInQuery+= '%2C'+cardIds[i].cardId
    }
    console.log('idInQuery in crawlerMulligan ',idInQuery)
    const getContent=()=>{
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

    const getDeckHref=(content)=>{
        return new Promise((resolve,reject)=>{
            const $=cheerio.load(content)
            let deck=$('#decks-container > div > main > div.deck-list > ul > li:nth-child(2)').find('a')
            const deckHref=$(deck).attr('href')
            console.log('deckHref in crawlerMulligan :',deckHref)
            resolve(deckHref)
        })
    }
    const getDeckContent=(href)=>{
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
    const getMulligan=(content)=>{
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
    getContent()
        .then(getDeckHref)
        .then(getDeckContent)
        .then(getMulligan)
}
