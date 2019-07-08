

const fs = require('fs');
const got = require('got');
//const sharp = require('sharp');
var Jimp = require('jimp');
const hashMap = require('./routes/json/hashmap.json');
const listChars = hashMap.list;
function getCharByHash(hash) {
  return listChars.filter(
    function(listChars) {
      return listChars.hash == hash;
    }
  )
}


/* const imgDimensions = sharp().metadata()
  .then(function(metadata) { return { "dimensions":  {"width": metadata.width, "height": metadata.height}}} )
  .then(function(img){ console.log("breedte:", img.dimensions.width, ", hoogte:", img.dimensions.height)});

const getImage = async (page) => {
 return await got('https://storage-gelderland.rgcdn.nl/teletext/' + page + 's00.png');
}
function getDimensions(response) {
  return sharp(response.body).metadata()
  .then(function(metadata) { return { "dimensions":  {"width": metadata.width, "height": metadata.height}}} )
}
//getImage('101').then(response => console.log(image));

//getImage('101').then(response =>  function (response) {
  
}
  )
*/
// (async () => {
//     try { 
// 		const response = await got('https://storage-gelderland.rgcdn.nl/teletext/103s00.png');
    
//  	} catch (error) {
//         console.log(error);
//         //=> 'Internal server error ...'
//     }
// })();
// const image = sharp('102s00.png');
//  const image = sharp('https://storage-gelderland.rgcdn.nl/teletext/103s00.png');
//  image.metadata().then(function(metadata) { return { "dimensions":  {"width": metadata.width, "height": metadata.height}}} )
//  .then(function(img){ console.log("breedte:", img.dimensions.width, ", hoogte:", img.dimensions.height)});
//console.log("Breedte:", width, "Hoogte:", height);
const blackHx = Jimp.cssColorToHex("Black");
const whiteHx = Jimp.cssColorToHex("White");
console.log("Black:", blackHx);
var text = "";
Jimp.read("https://storage-gelderland.rgcdn.nl/teletext/104s00.png", function (err, image) {
  let x =0; let y = 0;
  let nChrs = 40; let nLines = 25;
  //let hashArray = []; let hash2Array = [];
  let charBlock = {"dimension": {"width": image.bitmap.width/nChrs, "height": image.bitmap.height/nLines }}
    console.log("color:", image.getPixelColor(x, y)); // returns the colour of that pixel e.g. 0xFFFFFFFF
    console.log("dimensions:", image.bitmap.width, 'x', image.bitmap.height);
    console.log("Block dimensions:", charBlock.dimension.width, 'x', charBlock.dimension.height);
    let w = parseInt(charBlock.dimension.width); // long statement :-(
    let h = parseInt(charBlock.dimension.height);
    for (j = 0; j< nLines; j++) {
      for (i = 0; i < nChrs; i++) {
        let imgBlock = image.clone();
        let img2Block = image.clone();
        //imgBlock.background(blackHx);
        //console.log ("j:",j,", i:",i);
        
        imgBlock.crop(i*w,  j*h, w , h );
        if (j < nLines - 1) {
          img2Block.crop(i*w,  j*h, w , 2*h );
        }
        //console.log ("imgBlock", i*w,"\t",  j*h )
        //console.log("cropped", imgBlock.bitmap.width);
        let colorBlock = imgBlock.getPixelColor(0,0); // same for both character sizes
        //console.log("got colr",colorBlock);
        // iterarate through the blocks height
        for (y = 0; y < h; y++) {
          // per line, iterate through the character blocks
          for (x = 0; x < w; x++) {
           // console.log ("y:",y,", x:",x);
            let colorPixel = imgBlock.getPixelColor(x, y)
            if (colorPixel == colorBlock) {
              imgBlock.setPixelColor(blackHx, x, y);
            } else {
              imgBlock.setPixelColor(whiteHx, x, y);
            }
          }
        }
        // Double height characters (not necessary if there is only 1 row left)
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
        
        let char = " ";
        let hash = imgBlock.hash();
        let hashMatch = getCharByHash(hash);
        if (!hashMatch.length) {
          imgBlock.write("../../dump/" + j + "-" + i + "_block.png");
          char = '#';
        } else {
          char = hashMatch[0].char;
        }
        text += char;
       console.log("Hash,", j,",", i,",", hash, hashMatch);
       
       
        // double height characters
        // if (j < nLines - 1) {
        //   img2Block.write("../../dump/" + j + "-" + i + "_2block.png");
        // }
      }
      text += "\n";
    }
    console.log(text);
});