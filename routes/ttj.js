var express = require('express');
var router = express.Router();

var striptags = require('striptags');
const got = require('got');

const getprovider = require('./getproviderandpagefrompost');
const getproviderpage = require('./getproviderttpage');

router.use('/',getprovider, getproviderpage);

router.post('/', function(req, res, next) {
    try {
      let pageJson = req.body.textpageobject;
      pageJson["pagetxt"] = replaceDiacriticals(pageJson.pagetxt);
      res.send(pageJson);
    } catch (error) {
      console.log(error.response.body);
      res.send({"error": "1", "pagetxt" : "pagenotfound"});
    }
});
module.exports = router;

function replaceDiacriticals(str) {
  let re =  /(\&#xF\d\d.;)+/g;
  str = str.replace(re," ");
  
  // Remove/replace diacritical marks
  diacriticals = [ 
     {"diacritical": "&cent;", "replacement": "c"}
    ,{"diacritical": "&yen;", "replacement": "Y"}
    ,{"diacritical": "&brvbar;", "replacement": "|"}
    ,{"diacritical": "&sect;", "replacement": "P"}
    ,{"diacritical": "&uml;", "replacement": " "}
    ,{"diacritical": "&copy;", "replacement": "C"}
    ,{"diacritical": "&ordf;", "replacement": "a"}
    ,{"diacritical": "&laquo;", "replacement": "<"}
    ,{"diacritical": "&not;", "replacement": "-"}
    ,{"diacritical": "&reg;", "replacement": "R"}
    ,{"diacritical": "&macr;", "replacement": "-"}
    ,{"diacritical": "&deg;", "replacement": "o"}
    ,{"diacritical": "&plusmn;", "replacement": " "}
    ,{"diacritical": "&sup2;", "replacement": "2"}
    ,{"diacritical": "&sup2;", "replacement": "3"}
    ,{"diacritical": "&middot;", "replacement": "."}
    ,{"diacritical": "&sup1;", "replacement": "1"}
    ,{"diacritical": "&ordm;", "replacement": "o"}
    ,{"diacritical": "&raquo;", "replacement": ">"}
    ,{"diacritical": "&Agrave;", "replacement": "A"}
    ,{"diacritical": "&Aacute;", "replacement": "A"}
    ,{"diacritical": "&Acirc;", "replacement": "A"}
    ,{"diacritical": "&Atilde;", "replacement": "A"}
    ,{"diacritical": "&Auml;", "replacement": "A"}
    ,{"diacritical": "&Aring;", "replacement": "A"}
    ,{"diacritical": "&AElig;", "replacement": "A"}
    ,{"diacritical": "&Ccedil;", "replacement": "C"}
    ,{"diacritical": "&Egrave;", "replacement": "E"}
    ,{"diacritical": "&Eacute;", "replacement": "E"}
    ,{"diacritical": "&Ecirc;", "replacement": "E"}
    ,{"diacritical": "&Euml;", "replacement": "E"}
    ,{"diacritical": "&Igrave;", "replacement": "I"}
    ,{"diacritical": "&Iacute;", "replacement": "I"}
    ,{"diacritical": "&Icirc;", "replacement": "I"}
    ,{"diacritical": "&Iuml;", "replacement": "I"}
    ,{"diacritical": "&ETH;", "replacement": "D"}
    ,{"diacritical": "&Ntilde;", "replacement": "N"}
    ,{"diacritical": "&Ograve;", "replacement": "O"}
    ,{"diacritical": "&Oacute;", "replacement": "O"}
    ,{"diacritical": "&Ocirc;", "replacement": "O"}
    ,{"diacritical": "&Otilde;", "replacement": "O"}
    ,{"diacritical": "&Ouml;", "replacement": "O"}
    ,{"diacritical": "&times;", "replacement": "x"}
    ,{"diacritical": "&Oslash;", "replacement": "O"}
    ,{"diacritical": "&Ugrave;", "replacement": "U"}
    ,{"diacritical": "&Uacute;", "replacement": "U"}
    ,{"diacritical": "&Ucirc;", "replacement": "U"}
    ,{"diacritical": "&Uuml;", "replacement": "U"}
    ,{"diacritical": "&Yacute;", "replacement": "Y"}
    ,{"diacritical": "&THORN;", "replacement": " "}
    ,{"diacritical": "&szlig;", "replacement": "S"}
    ,{"diacritical": "&agrave;", "replacement": "a"}
    ,{"diacritical": "&aacute;", "replacement": "a"}
    ,{"diacritical": "&acirc;", "replacement": "a"}
    ,{"diacritical": "&atilde;", "replacement": "a"}
    ,{"diacritical": "&auml;", "replacement": "a"}
    ,{"diacritical": "&aring;", "replacement": "a"}
    ,{"diacritical": "&aelig;", "replacement": "a"}
    ,{"diacritical": "&ccedil;", "replacement": "c"}
    ,{"diacritical": "&egrave;", "replacement": "e"}
    ,{"diacritical": "&eacute;", "replacement": "e"}
    ,{"diacritical": "&ecirc;", "replacement": "e"}
    ,{"diacritical": "&euml;", "replacement": "e"}
    ,{"diacritical": "&igrave;", "replacement": "i"}
    ,{"diacritical": "&iacute;", "replacement": "i"}
    ,{"diacritical": "&icirc;", "replacement": "i"}
    ,{"diacritical": "&iuml;", "replacement": "i"}
    ,{"diacritical": "&eth;", "replacement": "e"}
    ,{"diacritical": "&ntilde;", "replacement": "n"}
    ,{"diacritical": "&ograve;", "replacement": "o"}
    ,{"diacritical": "&oacute;", "replacement": "o"}
    ,{"diacritical": "&ocirc;", "replacement": "o"}
    ,{"diacritical": "&otilde;", "replacement": "o"}
    ,{"diacritical": "&ouml;", "replacement": "o"}
    ,{"diacritical": "&divide;", "replacement": ":"}
    ,{"diacritical": "&oslash;", "replacement": "o"}
    ,{"diacritical": "&ugrave;", "replacement": "u"}
    ,{"diacritical": "&uacute;", "replacement": "u"}
    ,{"diacritical": "&ucirc;", "replacement": "u"}
    ,{"diacritical": "&uuml;", "replacement": "u"}
    ,{"diacritical": "&yacute;", "replacement": "y"}
    ,{"diacritical": "&thorn;", "replacement": "I"}
    ,{"diacritical": "&yuml;", "replacement": "y"}
  ];
  const diacriticalRemover = (accumulator, currentValue) => {
    return  accumulator.replace(currentValue.diacritical,currentValue.replacement);
  };
  str = diacriticals.reduce(diacriticalRemover, str);
 // str =newstr;
  return str;
}
