const express=require('express')
const router=express.Router()

const getMulligan=require('./getMulligan')

router.post('/getmulligan',getMulligan.GetMulligan)

module.exports=router