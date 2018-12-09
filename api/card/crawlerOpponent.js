const puppeteer=require('puppeteer');
const cheerio=require('cheerio');

exports.getDecks=(opponentClass)=>{

    const getContent=()=>{
        return new Promise((resolve,reject)=>{
            const asyncFunc=async ()=>{
                const browser=await puppeteer.launch()
                try{
                    const page=await browser.newPage()
                    await page.setViewport({width:1366,height:768})
                    await page.goto(`https://hsreplay.net/decks/#timeRange=LAST_30_DAYS&playerClasses=${opponentClass}?hl=ko`,{waitUntil: 'networkidle2'})
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

    const getDeckInfo=(content)=>{
        const $=cheerio.load(content)
        let deckNames=$('.deck-name')
        let deckGames=$('.game-count')
        let decks=[]
        for(let i=0;i<3;i++){
            let deckName=$(deckNames[i]).text()
            let deckGame=$(deckGames[i]).text()
            decks.push({deckTitle:deckName,deckGame:deckGame})
        }
        console.log(decks)
        return decks
    }
    getContent()
        .then(getDeckInfo)
}
