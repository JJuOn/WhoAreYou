const mysql=require('../../database/mysql')
const fs=require('fs')

let cardEnUS=[]
let cardKoKR=[]



exports.AddCards=(deckId,cards)=>{

    fs.readFile('cardskoKR.json',(err,data)=>{
        if (err) throw err
        cardKoKR=JSON.parse(data)
    })

    return new Promise((resolve,reject)=>{
        fs.readFile('cardsenUS.json',(err,data)=>{
            if (err) throw err
            cardEnUS=JSON.parse(data)
            mysql.getConnection((err,connection)=>{
                if(err) throw err
                for (let i=0;i<cards.length;i++) {
                    let cardCost = cards[i].cardCost
                    let cardName = cards[i].cardName
                    let cardNum = cards[i].cardNum
                    let cardId = 0
                    for (let i = 0; i < cardEnUS.length; i++) {
                        if (cardEnUS[i].name === cardName) {
                            console.log(cardEnUS[i].dbfId)
                            cardId = cardEnUS[i].dbfId
                            cardName=cardName.replace('\'','\'\'')
                            break
                        }
                    }
                    connection.query(`insert into card (deckId,cardId,cardCost,cardName,cardNum) values (\'${deckId}\',\'${cardId}\',\'${cardCost}\',\'${cardName}\',\'${cardNum}\')`, (err, results, fields) => {
                        //
                        if (err) throw err
                    })
                }
                connection.release()
                resolve()
            })
        })
    })
}