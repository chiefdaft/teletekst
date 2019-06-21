var express = require('express');
var router = express.Router();


const getProviderAndPageFromPOST = require('./getproviderandpagefrompost');
const getProviderTTPage = require('./getproviderttpage');
const getProviderAndPageFromGET = require('./getpagenoandproviderfromget');
const formatTeletekstPage = require('../routes/formatTeletekstPage');

//router.use('/',getprovider, getproviderpage);
router.post('/:pageno?/:providercode?'
            , getProviderAndPageFromPOST
            , getProviderTTPage
            , formatTeletekstPage
        ) ;
router.get('/', (req, res, next) => res.redirect('/tt/100'));
router.get('/:pageno?/:providercode?'
            , getProviderAndPageFromGET
            , getProviderTTPage
            , formatTeletekstPage
        ) ;
module.exports = router;

