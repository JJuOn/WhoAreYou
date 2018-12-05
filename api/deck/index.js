const express=require('express')
const router=express.Router()

const newDeck=require('./newDeck')
const getDeck=require('./getDeck')

router.post('/newdeck',newDeck.NewDeck)
router.get('/getdeck',getDeck.GetDeck)

module.exports=router