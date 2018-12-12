const express=require('express')
const router=express.Router()

const getMulligan=require('./getMulligan')
const getOpponent=require('./getOpponent')
const setOpponentClass=require('./setOpponentClass')

router.get('/getmulligan',getMulligan.GetMulligan)
router.get('/getopponent',getOpponent.GetOpponent)
router.post('/setopponentclass',setOpponentClass.SetOpponentClass)

module.exports=router