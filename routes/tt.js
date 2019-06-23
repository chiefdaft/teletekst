var express = require('express');
var router = express.Router();


const getProviderAndPageFromPOST = require('./getproviderandpagefrompost');
const getProviderTTPage = require('./getproviderttpage');
const getProviderAndPageFromGET = require('./getpagenoandproviderfromget');
const formatTeletekstPage = require('../routes/formatTeletekstPage');
const formatTeletekstPageForEReader = require('../routes/formatTeletekstPage-eReader');

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
// e-Reader formatting
router.post('/e/:pageno?/:providercode?'
            , getProviderAndPageFromPOST
            , getProviderTTPage
            , formatTeletekstPageForEReader
        ) ;
router.get('/e/', (req, res, next) => res.redirect('/tt/e/100'));
router.get('/e/:pageno?/:providercode?'
            , getProviderAndPageFromGET
            , getProviderTTPage
            , formatTeletekstPageForEReader
        ) ;
module.exports = router;

