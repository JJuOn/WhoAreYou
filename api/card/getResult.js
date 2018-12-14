const getCardId=require('./getCardId')
const puppeteer=require('puppeteer')
const cheerio=require('cheerio')
const fs=require('fs')
const ejs=require('ejs')
let globalMulligan
let globalDecks

//result.ejs 렌더링 전 수행됨. 현재 덱 ID와 상대 직업을 가지고 상대의 점유율 상위 3개 덱과, 내 덱의 추천 멀리건 출력
//return : 렌더링 된 result.ejs
exports.GetResult=(req,res)=>{
    const deckId=req.session.deckId
    const opponentClass=req.session.opponentClass
    //덱 ID와 상대 직업 정보 체크
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
    //현재 덱ID를 바탕으로 카드정보 가져오기
    const GetCardId=()=>{
        return getCardId.GetCardId(deckId)
    }
    //가져온 카드 정보를 바탕으로, hsreplay.net에서, 덱 검색하기, 검색한 결과의 html을 반환
    const GetMulContent=(cardIds)=>{
        cardIds=JSON.stringify(cardIds)
        cardIds=JSON.parse(cardIds)
        //검색을 위한 쿼리스트링
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
    //검색한 html을 가지고, 검색결과로 부터 덱의 url 파싱
    const GetDeckHref=(content)=>{
        return new Promise((resolve,reject)=>{
            const $=cheerio.load(content)
            let deck=$('#decks-container > div > main > div.deck-list > ul > li:nth-child(2)').find('a')
            const deckHref=$(deck).attr('href')
            console.log(deckHref)
            resolve(deckHref)
        })
    }
    //덱의 url을 이용, 해당 덱의 정보를 나타내는 페이지 불러온 후 html로 반환
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
    //받아온 html에서 카드 이름과 멀리건 부분 추출
    const GetMulligan=(content)=>{
        return new Promise((resolve,reject)=>{
            const $=cheerio.load(content)
            let cardNames=$('.card-name')
            let cardWinRates=$('.table-cell')
            let cards=[]
            for(let i=0;i<cardNames.length;i++){
                let cardName=$(cardNames[i]).text()
                let cardWinRate=$(cardWinRates[6*i]).text()
                //문자 삭제하고, 멀리건의 승률이 숫자로만 나타나도록
                cardWinRate=cardWinRate.replace('▼','')
                cardWinRate=cardWinRate.replace('▲','')
                cardWinRate=cardWinRate.replace('%','')
                cards.push({cardName:cardName,cardWinRate:cardWinRate})
            }
            //카드를 멀리건 승률 순서대로 정렬
            cards.sort((a,b)=>{
                return a.cardWinRate<b.cardWinRate ? 1:-1
            })
            resolve(cards)
        })
    }
    //상대 직업을 가지고 hsreplay.net에서 검색, html로 반환
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
    //받아온 html로부터 덱의 이름, 게임 횟수 추출
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