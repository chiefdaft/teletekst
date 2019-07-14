
var Jimp = require('jimp');
const hashMap = require('./json/hashmap.json');
const text = "     Oeps, er ging iets verkeerd... \n\
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
"+"  (_.'        Helaas duurde      `._)\n\
"+"   _          deze operatie          _\n\
"+"  ( '.        langer dan          ,' )\n\
"+"   '. '.      verwacht.         ,' ,'\n\
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
// const listChars = hashMap.listBlock12;
// const listDoubleChars = hashMap.listBlock24;

// function getCharByHash(hash) {
//   return listChars.filter(
//     function(listChars) {
//       return listChars.hash == hash;
//     }
//   )
// };
// function getDoubleCharByHash(hash) {
//   return listDoubleChars.filter(
//     function(listDoubleChars) {
//       return listDoubleChars.hash == hash;
//     }
//   )
// };

const nChrs = 40; 

////////////////////////////////////////////////////
// module.exports =  image => new Promise (
//   (resolve, reject)
module.exports = function (image) {
  return new Promise ((resolve, reject) => {
  
  // const blackHx = Jimp.cssColorToHex("Black");
  // const whiteHx = Jimp.cssColorToHex("White");
  // var text = "";
  // console.log("processing...")
  // let x =0; let y = 0; 
  // let imgWidth = image.bitmap.width;
  // let imgHeight = image.bitmap.height;
  // var nLines = (imgHeight > 300) ? 24 : 25;
  // const skipBlock = [ nLines * nChrs];
  // for (l = 0; l < nLines; l++) {
  //   for (c = 0; c < nChrs; c++) {
  //     skipBlock[l*c + c] = 0;
  //   }
  // }
  // if (nLines == 25) {
  //   listChars = hashMap.listBlock12;
  //   listDoubleChars = hashMap.listBlock24;
  // } else {
  //   listChars = hashMap.listBlock14;
  //   listDoubleChars = hashMap.listBlock28;
  // }
  
  // function getCharByHash(hash) {
  //   return listChars.filter(
  //     function(listChars) {
  //       return listChars.hash == hash;
  //     }
  //   )
  // };
  // function getDoubleCharByHash(hash) {
  //   return listDoubleChars.filter(
  //     function(listDoubleChars) {
  //       return listDoubleChars.hash == hash;
  //     }
  //   )
  // };
  // let charBlock = {"dimension": {"width": imgWidth/nChrs, "height": imgHeight/nLines }}
  //    // console.log("color:", image.getPixelColor(x, y)); // returns the colour of that pixel e.g. 0xFFFFFFFF
  //    // console.log("dimensions:", image.bitmap.width, 'x', image.bitmap.height);
  //    // console.log("Block dimensions:", charBlock.dimension.width, 'x', charBlock.dimension.height);
  //     let w = parseInt(charBlock.dimension.width); // long statement :-(
  //     let h = parseInt(charBlock.dimension.height);
  //     for (j = 0; j< nLines; j++) {
  //     for (i = 0; i < nChrs; i++) {
  //         let char = " "; // If block will be skipped a blank will be added anyway
  //         if (!skipBlock[nChrs*j + i]) {
  //         let imgBlock = image.clone();
          
  //         imgBlock.crop(i*w,  j*h, w , h );
  //         let colorBlock = imgBlock.getPixelColor(0,0); // same for both character sizes
  //         // iterarate through the blocks height
  //         for (y = 0; y < h; y++) {
  //             // per line, iterate through the character blocks pixels
  //             for (x = 0; x < w; x++) {
  //             // console.log ("y:",y,", x:",x);
  //             let colorPixel = imgBlock.getPixelColor(x, y)
  //             if (colorPixel == colorBlock) {
  //                 imgBlock.setPixelColor(blackHx, x, y);
  //             } else {
  //                 imgBlock.setPixelColor(whiteHx, x, y);
  //             }
  //             }
  //         } // end looping through single character pixel block
  //         let hash = imgBlock.hash();
  //         let hashMatch = getCharByHash(hash);
  //         // letś try a double character block... (no match with single chr block)
  //         if (!hashMatch.length) {
  //             // Double height characters (not necessary if there is only 1 row left)
              
  //             if (j < nLines - 1) {
  //             let img2Block = image.clone();
  //             img2Block.crop(i*w,  j*h, w , 2*h );
              
  //             for (y = 0; y < 2*h; y++) {
  //                 if (j < nLines - 1) {
  //                 for (x = 0; x < w; x++) {
  //                     // console.log ("y:",y,", x:",x);
  //                     let color2Pixel = img2Block.getPixelColor(x, y)
  //                     if (color2Pixel == colorBlock) {
  //                     img2Block.setPixelColor(blackHx, x, y);
  //                     } else {
  //                     img2Block.setPixelColor(whiteHx, x, y);
  //                     }
  //                 }
  //                 }
  //             }
  //             let hash2 = img2Block.hash();
  //             let hashMatch2 = getDoubleCharByHash(hash2);
  //             if (!hashMatch2.length) {
  //                 imgBlock.write("../../dump/" + j + "-" + i + "_block.png");
  //                 img2Block.write("../../dump/" + j + "-" + i + "_2block.png");
  //                 char = '=';
  //                 // console.log("Hash," + j + "-" + i + "_1block.png", hash, hashMatch);
  //                 // console.log("Hash2," + j + "-" + i + "_2block.png", hash2, hashMatch2);
  //             } else {
  //                 char = hashMatch2[0].char;
  //                 skipBlock[(j+1)*nChrs +i] = 1;
  //             }
  //             }
  //         } else {
  //             char = hashMatch[0].char;
  //         }
  //         } 
  //         // If this block was skipped a blank will be returned
  //         text += char;
  //     }
  //     text += "\n";
  //     }
  //     //console.log(text);
      if (0) {
        reject( "De Teletekst pagina kon niet verwerkt worden.")
      } else {
        resolve(text);
      }
  }
)}
//////////////////////////////////////////////////////////////////////
//let url = "https://storage-gelderland.rgcdn.nl/teletext/415s00.png";
// module.exports = async function (url) {
//        Jimp.read(url)
//   }