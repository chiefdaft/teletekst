

const fs = require('fs');
const got = require('got');
//const sharp = require('sharp');
var Jimp = require('jimp');
const hashMap = require('./routes/json/hashmap.json');
const listChars = hashMap.listSingleBlock;
const listDoubleChars = hashMap.listDoubleBlock;

function getCharByHash(hash) {
  return listChars.filter(
    function(listChars) {
      return listChars.hash == hash;
    }
  )
};
function getDoubleCharByHash(hash) {
  return listDoubleChars.filter(
    function(listDoubleChars) {
      return listDoubleChars.hash == hash;
    }
  )
};

const nChrs = 40; 
const nLines = 25;
const skipBlock = [ nLines * nChrs];

function initSkipBlocks() {
  for (l = 0; l < nLines; l++) {
    for (c = 0; c < nChrs; c++) {
      skipBlock[l*c + c] = 0;
    }
  }
}

const blackHx = Jimp.cssColorToHex("Black");
const whiteHx = Jimp.cssColorToHex("White");
//console.log("Black:", blackHx);
var text = "";
let url = "https://storage-w.rgcdn.nl/teletext/605s00.png";
//let url = "https://storage-gelderland.rgcdn.nl/teletext/415s00.png";
Jimp.read(url, function (err, image) {
  let x =0; let y = 0; 
  initSkipBlocks();

  //let hashArray = []; let hash2Array = [];
  let charBlock = {"dimension": {"width": image.bitmap.width/nChrs, "height": image.bitmap.height/nLines }}
    console.log("color:", image.getPixelColor(x, y)); // returns the colour of that pixel e.g. 0xFFFFFFFF
    console.log("dimensions:", image.bitmap.width, 'x', image.bitmap.height);
    console.log("Block dimensions:", charBlock.dimension.width, 'x', charBlock.dimension.height);
    let w = parseInt(charBlock.dimension.width); // long statement :-(
    let h = parseInt(charBlock.dimension.height);
    for (j = 0; j< nLines; j++) {
      for (i = 0; i < nChrs; i++) {
        let char = " "; // If block will be skipped a blank will be added anyway
        if (!skipBlock[nChrs*j + i]) {
          let imgBlock = image.clone();
          
          imgBlock.crop(i*w,  j*h, w , h );
          let colorBlock = imgBlock.getPixelColor(0,0); // same for both character sizes
          // iterarate through the blocks height
          for (y = 0; y < h; y++) {
            // per line, iterate through the character blocks pixels
            for (x = 0; x < w; x++) {
            // console.log ("y:",y,", x:",x);
              let colorPixel = imgBlock.getPixelColor(x, y)
              if (colorPixel == colorBlock) {
                imgBlock.setPixelColor(blackHx, x, y);
              } else {
                imgBlock.setPixelColor(whiteHx, x, y);
              }
            }
          } // end looping through single character pixel block
          let hash = imgBlock.hash();
          let hashMatch = getCharByHash(hash);
          // letś try a double character block... (no match with single chr block)
          if (!hashMatch.length) {
            // Double height characters (not necessary if there is only 1 row left)
            
            if (j < nLines - 1) {
              let img2Block = image.clone();
              img2Block.crop(i*w,  j*h, w , 2*h );
              
              for (y = 0; y < 2*h; y++) {
                if (j < nLines - 1) {
                  for (x = 0; x < w; x++) {
                    // console.log ("y:",y,", x:",x);
                    let color2Pixel = img2Block.getPixelColor(x, y)
                    if (color2Pixel == colorBlock) {
                      img2Block.setPixelColor(blackHx, x, y);
                    } else {
                      img2Block.setPixelColor(whiteHx, x, y);
                    }
                  }
                }
              }
              let hash2 = img2Block.hash();
              let hashMatch2 = getDoubleCharByHash(hash2);
              if (!hashMatch2.length) {
                imgBlock.write("../../dump/" + j + "-" + i + "_block.png");
                img2Block.write("../../dump/" + j + "-" + i + "_2block.png");
                char = '=';
                console.log("Hash," + j + "-" + i + "_1block.png", hash, hashMatch);
                console.log("Hash2," + j + "-" + i + "_2block.png", hash2, hashMatch2);
              } else {
                char = hashMatch2[0].char;
                skipBlock[(j+1)*nChrs +i] = 1;
              }
            }
          } else {
            char = hashMatch[0].char;
          }
        } 
        // If this block was skipped a blank will be returned
        text += char;
      }
      text += "\n";
    }
    console.log(text);
});