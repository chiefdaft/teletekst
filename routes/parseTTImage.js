
var Jimp = require('jimp');
const hashMap = require('./json/hashmap.json');
const nChrs = 40; 

module.exports = function (img) {
return new Promise ((resolve, reject) => {
  var page = img.page;
  var debug = (typeof img.debug !== 'undefined') ? img.debug : 0;
  var provider = (typeof img.provider !== 'undefined') ? img.provider : 0;
  if (img.image.success) {
      var image = img.image.data; 
      var text = "";
      console.log("processing...")
      let x =0; let y = 0; 
      let imgWidth = image.bitmap.width;
      let imgHeight = image.bitmap.height;
      var nLines = 1;
      switch (imgHeight) {
        case 300: nLines = 25;
                  if (provider == 8) { // RTV Drenthe is generated from GIF image
                    listChars = hashMap.listBlock12G;
                    listDoubleChars = hashMap.listBlock24G;
                    if (debug>0) {
                      console.log("Use listBlock12G/24G");
                    }
                  } else {
                    listChars = hashMap.listBlock12;
                    listDoubleChars = hashMap.listBlock24;
                    if (debug>0) {
                      console.log("Use listBlock12/24");
                    }
                  }
                  break;
        case 336: nLines = 24;
                  listChars = hashMap.listBlock14;
                  listDoubleChars = hashMap.listBlock28;
                  if (debug>0) {
                    console.log("Use listBlock14/28");
                  }
                  break;
        case 345: nLines = 23;
                  listChars = hashMap.listBlock15;
                  listDoubleChars = hashMap.listBlock30;
                  if (debug>0) {
                    console.log("Use listBlock15/30");
                  }
                  break;
      }
      const skipBlock = [ nLines * nChrs];
      for (l = 0; l < nLines; l++) {
        for (c = 0; c < nChrs; c++) {
          skipBlock[l*c + c] = 0;
        }
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
      let w = parseInt(charBlock.dimension.width); // long statement :-(
      let h = parseInt(charBlock.dimension.height);
      for (j = 0; j< nLines; j++) {
        for (i = 0; i < nChrs; i++) {
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
                  if (debug == 0) {
                    char = ' ';
                  } else {
                    if (debug == 1) {
                      let imgBlock = image.clone();
                      imgBlock.crop(i*w,  j*h, w , h );
                      imgBlock.write("../../dump/" + j + "-" + i + "_Sblock.png");
                      console.log( j + "-" + i + "_Sblock.png,\t{ \"hash\": \"" + hash + "\", \"char\": \"==\" },");
                    }
                    if (debug == 2) {
                      let imgBlock2 = image.clone();
                      imgBlock2.crop(i*w,  j*h, w , 2*h );
                      imgBlock2.write("../../dump/" + j + "-" + i + "_Dblock.png");
                      console.log( j + "-" + i + "_Dblock.png,\t{ \"hash\": \"" + hash2 + "\", \"char\": \"==\" },");
                    }
                    char = '=';
                  }
                  //char = ' ';
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
          //console.log(text);
          if (text.length < nChrs*nLines) {
            reject( "De Teletekst pagina kon niet verwerkt worden.")
          } else {
            resolve({"ttext": text, "page": page});
          }
      } else { //  e r r o r 
        console.log("De Teletekst pagina kon niet verwerkt worden.");
        let errtext = img.image.errtext;
        resolve({"ttext": errtext, "page": page});
      }
  }
)}
