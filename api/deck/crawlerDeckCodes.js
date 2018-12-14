const request=require('request')
const iconv=require('iconv-lite')
const charset=require('charset')

//덱 추가시 deck.codes로부터 덱 코드가 의미하는 덱 정보 페이지 크롤링
//return: html
exports.Crawl=(deckCode)=>{
    return new Promise((resolve,reject)=>{
        request({
            url:`https://deck.codes/${deckCode}`,
            encoding:null,
            method:'GET',
            timeout:10000,
            followRedirect:true,
            maxRedirects:10,
        },(err,res,body)=>{
            if(!err && res.statusCode===200){
                const enc=charset(res.headers,body)
                const decodedResult=iconv.decode(body,enc)
                resolve(decodedResult)
            }
            else console.log(`error : ${res.statusCode}`)
        })
    })
}







