

const fs = require('fs');
const got = require('got');
////const sharp = require('sharp');
var Jimp = require('jimp');
const hashMap = require('./routes/json/hashmap2.json');
// const listChars = hashMap.listBlock14;
// const listDoubleChars = hashMap.listBlock28;

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
//var nLines = 24;


// function initSkipBlocks(nLines,nChrs) {
//   const skipBlock = [ nLines * nChrs];
//   for (l = 0; l < nLines; l++) {
//     for (c = 0; c < nChrs; c++) {
//       skipBlock[l*c + c] = 0;
//     }
//   }
// }

const blackHx = Jimp.cssColorToHex("Black");
const whiteHx = Jimp.cssColorToHex("White");
//console.log("Black:", blackHx);
//var text = "";
//let url = "https://teletekst.rtvdrenthe.nl/Output/gif2/images/103-01.gif";
//let url = "https://storage-brabant.rgcdn.nl/teletext/290_0001.png";
let url = "https://storage-w.rgcdn.nl/teletext/601s00.png";
//let url = "https://storage-gelderland.rgcdn.nl/teletext/899s00.png";
Jimp.read(url, function (err, image) {
  var text = "";
  console.log("processing...")
  let x =0; let y = 0; 
  let imgWidth = image.bitmap.width;
  let imgHeight = image.bitmap.height;
  var nLines = (imgHeight > 300) ? 24 : 25;
  const skipBlock = [ nLines * nChrs];
  for (l = 0; l < nLines; l++) {
    for (c = 0; c < nChrs; c++) {
      skipBlock[l*c + c] = 0;
    }
  }
  if (nLines == 25) {
    listChars = hashMap.listBlock12;
    listDoubleChars = hashMap.listBlock24;
  } else {
    listChars = hashMap.listBlock14;
    listDoubleChars = hashMap.listBlock28;
  }
  
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
  var crc32 = (function()
  {
    var table = new Uint32Array(256);
    // Pre-generate crc32 polynomial lookup table
    // http://wiki.osdev.org/CRC32#Building_the_Lookup_Table
    // ... Actually use Alex's because it generates the correct bit order
    //     so no need for the reversal function
    for(var i=256; i--;)
    {
        var tmp = i;
        for(var k=8; k--;)
        {
            tmp = tmp & 1 ? 3988292384 ^ tmp >>> 1 : tmp >>> 1;
        }
        table[i] = tmp;
    }
    // crc32b
    // Example input        : [97, 98, 99, 100, 101] (Uint8Array)
    // Example output       : 2240272485 (Uint32)
    return function( data )
    {
        var crc = -1; // Begin with all bits set ( 0xffffffff )

        for(var i=0, l=data.length; i<l; i++)
        {
            crc = crc >>> 8 ^ table[ crc & 255 ^ data[i] ];
        }
        return (crc ^ -1) >>> 0; // Apply binary NOT
    };
  })();
  let charBlock = {"dimension": {"width": imgWidth/nChrs, "height": imgHeight/nLines }}
    // console.log("color:", image.getPixelColor(x, y)); // returns the colour of that pixel e.g. 0xFFFFFFFF
    // console.log("dimensions:", image.bitmap.width, 'x', image.bitmap.height);
    // console.log("Block dimensions:", charBlock.dimension.width, 'x', charBlock.dimension.height);
    let w = parseInt(charBlock.dimension.width); // long statement :-(
    let h = parseInt(charBlock.dimension.height);
    // let a = 0;
    for (j = 0; j< nLines; j++) { // j scans the vertical set of lines
      for (i = 0; i < nChrs; i++) { // i scans the horizontal set of characters
        let char = " "; // If block will be skipped a blank will be added anyway
        if (!skipBlock[nChrs*j + i]) {
          let y0 = j*h; let y1 = y0 + h; // vertical range of the character block in the image
          let x0 = i*w; let x1 = x0 + w; // horizontal range of the character block in the image
          let hexBlockPxByte = 0; //empty array for all pixels =bgColor (0) or != bgColor (1)
          let blockByteMap =[];
          // imgBlock.crop(i*w,  j*h, w , h );
          let bgColorBlock = image.getPixelColor(x0,y0); // same for both character sizes
          // // iterarate through the blocks height vertically
          for (y = y0; y < y1; y++) {
          //   // per line, iterate through the character blocks pixels horizontally
            for (x = x0; x < x1; x++) {
              let px = (image.getPixelColor(x, y) == bgColorBlock) ? 0: 1;
              blockByteMap.push(px);
              // hexBlockPxByte <<= 1 
              // hexBlockPxByte += px;
            //  console.log (a++,j, i, x, y, " px=",  px, "Hex=", hexBlockPxByte, "b=", b);
              // b++;
              // if (b == 1){
              //   blockByteMap.push(hexBlockPxByte);
              //   hexBlockPxByte = 0;
              //   b = 0;
              // }
            }
          } // end looping through single character pixel block
          let hash =  crc32( blockByteMap.join(" ") );
          let hashMatch = getCharByHash(hash);
          // let's try a double character block... (no match with single chr block)
          // //----------------------------------
           if (!hashMatch.length) {
          //   // Double height characters (not necessary if there is only 1 row left)
            
            if (j < nLines - 1) {
              let y2 = y1 + h;
              for (y = y1; y < y2; y++) {
                if (j < nLines - 1) {
                  for (x = x0; x < x1; x++) {
                    let px = (image.getPixelColor(x, y) == bgColorBlock) ? 0: 1;
                    blockByteMap.push(px);
                  }
                }
              }
              let hash2 =  crc32( blockByteMap.join(" ") );
              let hashMatch2 = getDoubleCharByHash(hash2);
              if (!hashMatch2.length) {
                // let imgBlock = image.clone();
                // imgBlock.crop(i*w,  j*h, w , h );
                // imgBlock.write("../../dump/" + j + "-" + i + "_Sblock.png");
                let imgBlock2 = image.clone();
                imgBlock2.crop(i*w,  j*h, w , 2*h );
                imgBlock2.write("../../dump/" + j + "-" + i + "_Dblock.png");
               // console.log( j + "-" + i + "_Sblock.png,\t{ \"hash\": \"" + hash + "\", \"char\": \"==\" },");
                console.log( j + "-" + i + "_Dblock.png,\t{ \"hash\": \"" + hash2 + "\", \"char\": \"==\" },");
          //       console.log("hexBlockBytes, " + j + "-" + i + "_Dblock.png, { \"hash\": \"" + hash2 + "\", \"char\": \"==\" }");
                char = '=';
          //-----------------
          //       console.log("Hash," + j + "-" + i + "_1block.png", hash, hashMatch);
          //       console.log("Hash2," + j + "-" + i + "_2block.png", hash2, hashMatch2);
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
      } // next character block
      text += "\n";
    }
    console.log(text);
  // }
});