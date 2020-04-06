var express = require('express');
var router = express.Router();

//var striptags = require('striptags');
//const got = require('got');

const getprovider = require('./getproviderandpagefrompost');
const getproviderpage = require('./getproviderttpage');
const diacriticals = require('./json/diacriticals.json');
router.use('/',getprovider, getproviderpage);

router.post('/', function(req, res, next) {
  console.log(JSON.stringify(req.headers));
    try {
      let pageJson = req.body.textpageobject;
      pageJson["pagetxt"] = replaceDiacriticals(pageJson.pagetxt);
      res.send(pageJson);
    } catch (error) {
      console.log(error.response.body);
      // replace this error JSON to full json return with error message in page text object
      res.send({"error": "1", "pagetxt" : "pagenotfound"});
    }
});
module.exports = router;

function replaceDiacriticals(str) {
  let re =  /(\&#xF\d\d.;)+/g;
  str = str.replace(re," ");
  
  const diacriticalRemover = (accumulator, currentValue) => {
    return  accumulator.replace(currentValue.diacritical,currentValue.replacement);
  };
  str = diacriticals.reduce(diacriticalRemover, str);
 // str =newstr;
  return str;
}
