const pageNotFound = "     Oeps, er ging iets verkeerd... \n\
"+"      _     _     _  _     _     _\n\
"+"  (_.' )  .' )  .' )( `.  ( `.  ( `._)\n\
"+"     .' .' .' .' .'  `. `. `. `. `.\n\
"+"    (_.' .' .' ,' .'`. `, `. `. `._)\n\
"+"       .' .' ,' .'    `. `, `. `.\n\
"+"     .' .' .' .'        `. `. `. `.\n\
"+"    (_.' .' .'            `. `. `._)\n\
"+"       .' .'                `. `.\n\
"+"     .' .'                    `. `.\n\
"+"   .' .'                        `. `.\n\
"+"  (_.'          Helaas is         `._)\n\
"+"   _           pagina xxx           _\n\
"+"  ( '.        niet gevonden.      ,' )\n\
"+"   '. '.                        ,' ,'\n\
"+"     '. '.                    ,' ,'\n\
"+"     _ '. '.                ,' ,' _\n\
"+"    ( '. '. '.            ,' ,' ,' )\n\
"+"     '. '. '. '.        ,' ,' ,' ,'\n\
"+"     _ '. '. `. '.    ,' ,` ,' ,' _\n\
"+"    ( '. '. '. `. '.,' ,` ,' ,' ,' )\n\
"+"   _ '. '. '. '. '.  ,' ,' ,' ,' ,' _\n\
"+"  ( '._)  '._)  '._)(_,'  (_,'  ( ,' )\n\
"+" \n\
" + "    nieuws   weer   sport   voetbal ";

const fs = require('fs');
const got = require('got');
const sharp = require('sharp');
var Jimp = require('jimp');
const fetch = require('node-fetch');

const hashMap = require('./routes/json/hashmap.json');
const nChrs = 40; 

//let url = "https://teletekst.rtvoost.nl/teletekst/100.png";
// let url = "https://teletekst.rtvdrenthe.nl/Output/gif2/images/105-01.gif";
// let url = "https://storage-brabant.rgcdn.nl/teletext/104_0001.png"; //480 × 336 pixels (12/24)
// let url = "https://storage-w.rgcdn.nl/teletext/104s00.png";
// let url = "http://vps01.l1.nl/teletext/L1/png/192s00.png";
// let url = "https://storage-gelderland.rgcdn.nl/teletext/121s00.png";
//let url = "http://localhost/GIFE0D2.tmp.gif";
// let url = "https://teletekst.rtvoost.nl/teletekst/101.png"; // h = 345
//let url = 'https://teletekst-data.nos.nl/json/100';
const debug = 2;

let filename = "rtvd_105-01.gif";
let newFilename = "rtvd_105-01.png";
//const hashMap = require('./routes/json/hashmap.json');
// var allocation = 300 * 400;


// var readstream = got.stream(url);
// var buf = Buffer.from(readstream)
// //var writestream = fs.WriteStream(filename);

// consol.log(buf);

const fileType = require('file-type');
const parseTTImage = require('./routes/parseTTImage');


  
const shwPng = buffer => {
   Jimp.read(buffer)
  .then(image => {
    console.log("Image width x height =", image.bitmap.width,image.bitmap.height);
  })
  .catch(err => {
    console.error(err);
  })
}

const makeRequestFromRTVDrenthe = async (page, provider, debug) => {
  var debug = (typeof debug !== 'undefined') ? debug : 0;
  let pageGif = page + ".gif";
  let url = "https://teletekst.rtvdrenthe.nl/Output/gif2/images/" + pageGif;
  return {"image": await fetch(url)
    .then(res => res.buffer())
    .then(buffer =>  sharp(buffer)
    .png()
    .toBuffer()
    .then(buffer => Jimp.read(buffer)
    .then(image => {
      console.log("Image width x height =", image.bitmap.width,image.bitmap.height);
      return  {"data": image, "success": true, "errtext":""}
    }))
    .catch(err => {
      return {"data": 0, "success": false, "errtext": pageNotFound.replace("xxx",page)}
    })
   )
  , "page": page, "provider": provider, "debug": debug};
}

//console.log("Test image?");

const makeRequest = async (provider, page, debug) => {
  console.log("Provider", provider, "Page", page);
  return await makeRequestFromRTVDrenthe(page, provider, debug)
    .then(response => {
      console.log("Ging het goed:", response.page);
      return parseTTImage(response)
      }
    )
  .then(response => console.log(response.ttext));
}

makeRequest("8", "115-01", 1);