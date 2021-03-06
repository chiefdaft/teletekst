// script to retrieve a raw teletext page and format into a 
// standard formatted JSON with teletekst content and simple navigation
// links. These can be used for buttons to navigate to different
// pages.
const got = require('got');
var Jimp = require('jimp');
const fetch = require('node-fetch'); // Added for RTV Drenthe
const sharp = require('sharp'); // Added for RTV Drenthe
const parseTTImage = require('../routes/parseTTImage');
const striptags = require('striptags');
const alphabet = "abcdefghijklmnopqrstuvwxyz";
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
const pageNotFoundTimeOut = "     Oeps, er ging iets verkeerd... \n\
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
const debug = 0;
const errorPage = err => {
    { 
        if (err.statusCode == 404) {
            pageJson = { 
                "prevPage": "100",
                "nextPage": "101",
                "prevSubPage": "1",
                "nextSubPage": "1",
                "fastTextLinks": [{"title":"nieuws","page":"101"},{"title":"weer","page":"603"},{"title":"sport","page":"601"},{"title":"voetbal","page":"801"}],
                "pagetxt": pageNotFound //.replace("xxxxx", page)
            };
            return pageJson;
        } else {
            console.log(err.statusCode);
            //res.status(500);
        }
    }
}
const errorPageTimeOut = err => {
    { 
        if (err.statusCode == 404) {
            pageJson = { 
                "prevPage": "100",
                "nextPage": "101",
                "prevSubPage": "1",
                "nextSubPage": "1",
                "fastTextLinks": [{"title":"nieuws","page":"101"},{"title":"weer","page":"603"},{"title":"sport","page":"601"},{"title":"voetbal","page":"801"}],
                "pagetxt": pageNotFoundTimeOut //.replace("xxxxx", page)
            };
            return pageJson;
        } else {
            console.log(err.statusCode);
            //res.status(500);
        }
    }
}
//  \n\
//  \n\
//  \n\
//  \n\
//  \n\
// " + "    +-------------------------+ \n\
// " + "    +-------------------------+ \n\
// " + "           Pagina xxxxx  \n\
// " + "         is niet gevonden! \n\
// " + "    +-------------------------+ \n\
// " + "    +-------------------------+ \n\
//  \n\
//  \n\
//  \n\
//  \n\
//  \n\
//  \n\
//  \n\
//  \n\
//  \n\
//  " + "  nieuws   weer   sport   voetbal ";

function cleanUpNOSTTBody(ttpage) {
  let str = striptags(JSON.parse(ttpage).content);
  let re =  /(\&#xF\d\d.;)+/g;
  str = str.replace(re," ");
  return str;
}

function pageJsonNOSBuilder (ttpage) {
    pageJson = { 
        "prevPage": JSON.parse(ttpage).prevPage,
        "nextPage": JSON.parse(ttpage).nextPage,
        "prevSubPage": JSON.parse(ttpage).prevSubPage,
        "nextSubPage": JSON.parse(ttpage).nextSubPage,
        "fastTextLinks": JSON.parse(ttpage).fastTextLinks,
        "pagetxt": cleanUpNOSTTBody(ttpage)
    };
	return pageJson;
}
function cleanUpRijnmondTTBody(ttpage) {
    let str = striptags(ttpage, ['pre']);
    let p1 = str.indexOf("<PRE>") + 5;
    let p2 = str.indexOf("</PRE>");
    str = str.substring(p1,p2);
    return str;
  }
function cleanUpInfoThuisTTBody(ttpage) {
    let str = striptags(ttpage, ['pre']);
    let p1 = str.indexOf("<PRE>") + 5;
    let p2 = str.indexOf("</PRE>");
    str = str.substring(p1,p2);
    return str;
  }
function getNearbyPageLinks(ttpage) {
    let pageLinks = [];
    // previous page
    let p1 = ttpage.indexOf("<FORM") + 5;
    let p2 = ttpage.indexOf("</FORM>");
    str = ttpage.substring(p1,p2);
    p1 = 18+str.indexOf("<A HREF=\"/?pagina=");
    p2 = p1+3;
    pageLinks.push(str.substring(p1,p2));

    // next page
    p1 = 18+str.lastIndexOf("<A HREF=\"/?pagina=");
    p2 = p1+3;
    pageLinks.push(str.substring(p1,p2));

    // current page
    let p5 = ttpage.indexOf("<PRE") + 4;
    let p6 = ttpage.indexOf("</PRE>");
    str = ttpage.substring(p5,p6);
    p5 = 18+str.indexOf("<A HREF=\"/?pagina=");
    p6 = p5+3;
    let currentPage = str.substring(p5,p6);

    // number of subpages in current page
    let p3 = ttpage.indexOf("<SELECT NAME=\"sub\" onChange=\"document.ttform.submit()\"></FONT>") + 62;
    let p4 = ttpage.indexOf("SELECT>",p3);
    let seltxt = ttpage.substring(p3, p4);
    
    let nsp = 0;
    let iboo = seltxt.indexOf("<OPTION");
    let ieoo = iboo + 34;
    
    let currentSubpage = 1;
    
    while (iboo > -1) {
        nsp++;
        //console.log( iboo, ieoo);
        if (seltxt.substring(iboo, ieoo).indexOf("SELECTED") > -1 ) {
            currentSubpage = nsp;
        }
        iboo = seltxt.indexOf("<OPTION",iboo+10);
        ieoo = iboo + 34;
    }
    // correction for selection of all subpages
    nsp--;
    // check if we don't go into non existing subpages
    let prevSubPage = 1; let nextSubPage = 1;
    if (currentSubpage > 1) { prevSubPage = currentSubpage - 1; }
    if (nsp > 1 && currentSubpage < nsp) { nextSubPage = currentSubpage + 1; } else { nextSubPage = currentSubpage; }
    
    // push the subpage up and down counters into the nearby pageLinks array
    pageLinks.push( currentPage + "-" + prevSubPage );
    pageLinks.push( currentPage + "-" + nextSubPage );
    return pageLinks;
}
function pageJsonRijnmondBuilder(ttpage) {
    //console.log("TTPAGE=",ttpage);
    let pageLinks = getNearbyPageLinks(ttpage);
    pageJson = { 
        "prevPage": pageLinks[0],
        "nextPage": pageLinks[1],
        "prevSubPage": pageLinks[2],
        "nextSubPage": pageLinks[3],
        "fastTextLinks": [{"title":"nieuws","page":"101"},{"title":"weer","page":"170"},{"title":"sport","page":"120"},{"title":"verkeer","page":"180"}],
        "pagetxt": cleanUpRijnmondTTBody(ttpage)
    };
    return pageJson;
  }
  function pageJsonInfoThuisBuilder(ttpage) {
    //console.log("TTPAGE=",ttpage);
    let pageLinks = getNearbyPageLinks(ttpage);
    pageJson = { 
        "prevPage": pageLinks[0],
        "nextPage": pageLinks[1],
        "prevSubPage": pageLinks[2],
        "nextSubPage": pageLinks[3],
        "fastTextLinks": [{"title":"overzicht","page":"100"},{"title":"nieuws","page":"101"},{"title":"sport","page":"601"},{"title":"scholen","page":"470"}],
        "pagetxt": cleanUpInfoThuisTTBody(ttpage)
    };
  return pageJson;
  }
function pageJsonOmroepWestBuilder(ttext, page) {
    console.log("make omroep west json", page)
    let pageLinksArray = createFastTextLinks(page);
    pageJson = { 
        "prevPage": pageLinksArray[0],
        "nextPage": pageLinksArray[1],
        "prevSubPage": pageLinksArray[2],
        "nextSubPage": pageLinksArray[3],
        "fastTextLinks": [{"title":"overzicht","page":"100"},{"title":"nieuws","page":"101"},{"title":"sport","page":"601"},{"title":"weer","page":"151"}],
        "pagetxt": ttext
    };
    return pageJson;
}
function pageJsonOmroepLimburgBuilder(ttext, page) {
    console.log("make omroep limburg json", page)
    let pageLinksArray = createFastTextLinks(page);
    pageJson = { 
        "prevPage": pageLinksArray[0],
        "nextPage": pageLinksArray[1],
        "prevSubPage": pageLinksArray[2],
        "nextSubPage": pageLinksArray[3],
        "fastTextLinks": [{"title":"nieuws","page":"101"},{"title":"weer","page":"190"},{"title":"sport","page":"600"},{"title":"service","page":"400"}],
        "pagetxt": ttext
    };
    return pageJson;
}
function pageJsonOmroepGelderlandBuilder(ttext, page) {
    console.log("make omroep gelderland json", page)
    let pageLinksArray = createFastTextLinks(page);
    pageJson = { 
        "prevPage": pageLinksArray[0],
        "nextPage": pageLinksArray[1],
        "prevSubPage": pageLinksArray[2],
        "nextSubPage": pageLinksArray[3],
        "fastTextLinks": [{"title":"nieuws","page":"101"},{"title":"weer","page":"171"},{"title":"sport","page":"200"},{"title":"verkeer","page":"175"}],
        "pagetxt": ttext
    };
    return pageJson;
}
function pageJsonOmroepBrabantBuilder(ttext, page) {
    console.log("make omroep brabant json", page)
    let pageLinksArray = createFastTextLinks(page);
    pageJson = { 
        "prevPage": pageLinksArray[0],
        "nextPage": pageLinksArray[1],
        "prevSubPage": pageLinksArray[2],
        "nextSubPage": pageLinksArray[3],
        "fastTextLinks": [{"title":"nieuws","page":"101"},{"title":"weer","page":"170"},{"title":"sport","page":"698"},{"title":"verkeer","page":"190"}],
        "pagetxt": ttext
    };
    return pageJson;
}
function pageJsonRTVOostBuilder(ttext, page) {
    console.log("make RTV Oost json", page)
    let pageLinksArray = createFastTextLinks(page);
    pageJson = { 
        "prevPage": pageLinksArray[0],
        "nextPage": pageLinksArray[1],
        "prevSubPage": pageLinksArray[2],
        "nextSubPage": pageLinksArray[3],
        "fastTextLinks": [{"title":"nieuws","page":"101"},{"title":"weer","page":"190"},{"title":"sport","page":"300"},{"title":"voetbal","page":"800"}],
        "pagetxt": ttext
    };
    return pageJson;
}
function pageJsonRTVDrentheBuilder(ttext, page) {
    console.log("make RTV Drenthe    json", page)
    let pageLinksArray = createFastTextLinks(page);
    pageJson = { 
        "prevPage": pageLinksArray[0],
        "nextPage": pageLinksArray[1],
        "prevSubPage": pageLinksArray[2],
        "nextSubPage": pageLinksArray[3],
        "fastTextLinks": [{"title":"nieuws","page":"101"},{"title":"weer","page":"150"},{"title":"sport","page":"601"},{"title":"programma's","page":"200"}],
        "pagetxt": ttext
    };
    return pageJson;
}
function createFastTextLinks(page) {
    let pageno = page.substr(0,3);
    let prevPage = (parseInt(pageno) <= 101) ? "100" : parseInt(pageno) - 1;
    let nextPage = (parseInt(pageno) >= 899) ? "100" : parseInt(pageno) + 1;
        // "prevSubPage": page + "-1",
        // "nextSubPage": page + "-2",
    let subpageno = "1"
    if (page.indexOf("-") == 3) {
        subpageno = page.substring(4,page.length);
    }
    //console.log("subpage:", subpageno);
    let subpageUp = parseInt(subpageno) + 1;
    let subpageDown = (parseInt(subpageno) <= 1) ? 1 : parseInt(subpageno) - 1;
    let prevSubPage = pageno + "-" + subpageDown;
    let nextSubPage = pageno + "-" + subpageUp;
    let pageLinksArray = [prevPage, nextPage, prevSubPage, nextSubPage];
    //console.log(pageLinksArray)
    return pageLinksArray;
}
const makeRequestFromNOS = async (page) => {
    //let url = 'https://teletekst-data.nos.nl/json/' + page;
    return await got(page, {baseUrl: 'https://teletekst-data.nos.nl/json/'});
    //return await p({'url': url});
}
const makeRequestFromRijnmond = async (page) => {
    let pageno = page.substr(0,3);
    let subpage = pageno + "a";
    if (page.indexOf("-") == 3) {
        let subpageno = page.substring(4,page.length);
        subpage = pageno + alphabet.charAt(subpageno-1);
    }
    //let url = 'https://rijnmond-ttw.itnm.nl/' + '?pagina=' + pageno + '&sub=' + subpage + '&weergave=txt';
    //console.log('url:',url);
    return await got('?pagina=' + pageno + '&sub=' + subpage + '&weergave=txt', {baseUrl: 'https://rijnmond-ttw.itnm.nl/'});
    // let url = 'https://rijnmond-ttw.itnm.nl/' + '?pagina=' + pageno + '&sub=' + subpage + '&weergave=txt';
    // return await p({'url': url});
}
const makeRequestFromInfoThuis = async (page) => {
    let pageno = page.substr(0,3);
    let subpage = pageno + "a";
    if (page.indexOf("-") == 3) {
        let subpageno = page.substring(4,page.length);
        subpage = pageno + alphabet.charAt(subpageno-1);
    }
    //let url = 'https://teletekst.infothuis.tv/' + '?pagina=' + pageno + '&sub=' + subpage + '&weergave=txt';
    return await got('?pagina=' + pageno + '&sub=' + subpage + '&weergave=txt', {baseUrl: 'https://teletekst.infothuis.tv/'});
    //return await p({'url': url});
}
// Translate page index to png for West an Gelderland
function translatePageToPng(page) {
    let pageno = page.substr(0,3);
    let subpageOW = pageno + "s";
    if (page.indexOf("-") == 3) {
        let subpageno = page.substring(4,page.length);
        
        if (parseInt(subpageno) < 10) {
            subpageOW += "0" + subpageno
        } else {
            subpageOW += subpageno
        }
    } else {
        subpageOW += "00";
    }
    return subpageOW + ".png"
}
// Translate page index to png for Brabant
function translatePageToPng2(page) {
    let pageno = page.substr(0,3);
    let subpageOB = pageno + "_00";
    if (page.indexOf("-") == 3) {
        let subpageno = page.substring(4,page.length);
        
        if (parseInt(subpageno) < 10) {
            subpageOB += "0" + subpageno
        } else {
            subpageOB += subpageno
        }
    } else {
        subpageOB += "01";
    }
    return subpageOB + ".png"
}
function translatePageToPng3(page) {
    let pageno = page.substr(0,3);
    // console.log("pageno:",pageno);
    let subpageOW = pageno;
    if (page.indexOf("-") == 3) {
        let subpageno = page.substring(4,page.length);
        if (subpageno > 1) {
            subpageno--;
            if (parseInt(subpageno) < 10) {
                subpageOW += "S0" + subpageno
            } else {
                subpageOW += "S" + subpageno
            }
        }
    } 
    // console.log("subpage:",subpageOW);
    return subpageOW + ".png"
}
// Translate page index to gif for Drenthe
function translatePageToGif(page) {
    let pageno = page.substr(0,3);
    let subpageOB = pageno + "-";
    if (page.indexOf("-") == 3) {
        let subpageno = page.substring(4,page.length);
        
        if (parseInt(subpageno) < 10) {
            subpageOB += "0" + subpageno
        } else {
            subpageOB += subpageno
        }
    } else {
        subpageOB += "01";
    }
    console.log("Drenthe, pagina = ", subpageOB);
    return subpageOB + ".gif"
}
const makeRequestFromOmroepWest = async (page) => {
    console.log("start omroep west 1")
    let pageImage = translatePageToPng(page);
    let url = "https://storage-w.rgcdn.nl/teletext/" + pageImage;
    return {"image": await Jimp.read(url).then(image => {return {"data": image, "success": true, "errtext":""}}).catch(err => {
        return {"data": 0, "success": false, "errtext": pageNotFound.replace("xxx",page)}
    }), "page": page, "debug": 0};
}
const makeRequestFromOmroepGelderland = async (page) => {
    console.log("start omroep gelderland 1")
    let pageImage = translatePageToPng(page);
    let url = "https://storage-gelderland.rgcdn.nl/teletext/" + pageImage;
    return {"image": await Jimp.read(url).then(image => {return {"data": image, "success": true, "errtext":""}}).catch(err => {
        return {"data": 0, "success": false, "errtext": pageNotFound.replace("xxx",page)}
    }), "page": page};
}
const makeRequestFromOmroepLimburg = async (page) => {
    console.log("start omroep Limburg 1")
    let pageImage = translatePageToPng(page);
    let url = "http://vps01.l1.nl/teletext/L1/png/" + pageImage;
    return {"image": await Jimp.read(url).then(image => {return {"data": image, "success": true, "errtext":""}}).catch(err => {
        return {"data": 0, "success": false, "errtext": pageNotFound.replace("xxx",page)}
    }), "page": page};
}
const makeRequestFromOmroepBrabant = async (page) => {
    console.log("start omroep brabant 1", page)
    let pageImage = translatePageToPng2(page);
    let url = "https://storage-brabant.rgcdn.nl/teletext/" + pageImage;
    return {"image": await Jimp.read(url).then(image => {return {"data": image, "success": true, "errtext":""}}).catch(err => {
        return {"data": 0, "success": false, "errtext": pageNotFound.replace("xxx",page)}
    }), "page": page};
}
const makeRequestFromRTVOost= async (page) => {
    console.log("start RTV Oost", page)
    let pageImage = translatePageToPng3(page);
    let url = "https://teletekst.rtvoost.nl/teletekst/" + pageImage;
    return {"image": await Jimp.read(url).then(image => {return {"data": image, "success": true, "errtext":""}}).catch(err => {
        return {"data": 0, "success": false, "errtext": pageNotFound.replace("xxx",page)}
    }), "page": page};
}
const makeRequestFromRTVDrenthe = async (page, provider, debug) => {
    var debug = (typeof debug !== 'undefined') ? debug : 0;
    let pageGif = translatePageToGif(page);
    let url = "https://teletekst.rtvdrenthe.nl/Output/gif2/images/" + pageGif;
    return {"image": await fetch(url)
      .then(res => res.buffer())
      .then(buffer =>  sharp(buffer)
      .png()
      .toBuffer()
      .then(buffer => Jimp.read(buffer)
      .then(image => {
        return  {"data": image, "success": true, "errtext":""}
      }))
      .catch(err => {
        return {"data": 0, "success": false, "errtext": pageNotFound.replace("xxx",page)}
      })
     )
    , "page": page, "provider": provider, "debug": debug};
  }
const makeRequest = async (provider, page) => {
    if (provider == 0 || provider == "0") { 
        return await makeRequestFromNOS(page).then(response => pageJsonNOSBuilder(response.body)
        , error => { 
                if (error.statusCode == 404) {
                    pageJson = { 
                        "prevPage": "100",
                        "nextPage": "101",
                        "prevSubPage": "1",
                        "nextSubPage": "1",
                        "fastTextLinks": [{"title":"nieuws","page":"101"},{"title":"weer","page":"700"},{"title":"sport","page":"600"},{"title":"voetbal","page":"800"}],
                        "pagetxt": pageNotFound.replace("xxx", page)
                    };
                    return pageJson;
                } else {
                    console.log(error.statusCode);
                }
         }
        );
    };
    if (provider == 1 || provider == "1") {
        return await makeRequestFromRijnmond(page)
        .then(response => pageJsonRijnmondBuilder(response.body), errorPage);
    };
    if (provider == 2 || provider == "2") {
        return await makeRequestFromInfoThuis(page)
        .then(response => pageJsonInfoThuisBuilder(response.body), errorPage);
    };
    if (provider == 3 || provider == "3") {
        return await makeRequestFromOmroepWest(page)
        .then(response => parseTTImage(response), errorPageTimeOut)
        .then(response => pageJsonOmroepWestBuilder(response.ttext, response.page), errorPageTimeOut);
    };
    if (provider == 4 || provider == "4") {
        return await makeRequestFromOmroepGelderland(page)
        .then(response => parseTTImage(response), errorPageTimeOut)
        .then(response => pageJsonOmroepGelderlandBuilder(response.ttext, response.page), errorPageTimeOut);
    };
    if (provider == 5 || provider == "5") {
        return await makeRequestFromOmroepLimburg(page)
        .then(response => parseTTImage(response), errorPageTimeOut)
        .then(response => pageJsonOmroepLimburgBuilder(response.ttext, response.page), errorPageTimeOut);
    };
    if (provider == 6 || provider == "6") {
        return await makeRequestFromOmroepBrabant(page)
        .then(response => parseTTImage(response), errorPageTimeOut)
        .then(response => pageJsonOmroepBrabantBuilder(response.ttext, response.page), errorPageTimeOut);
    };
    if (provider == 7 || provider == "7") {
        return await makeRequestFromRTVOost(page)
        .then(response => parseTTImage(response), errorPageTimeOut)
        .then(response => pageJsonRTVOostBuilder(response.ttext,response.page), errorPageTimeOut(404));
    };
    if (provider == 8 || provider == "8") {
        return await makeRequestFromRTVDrenthe(page, provider, debug)
        .then(response => parseTTImage(response), errorPageTimeOut)
        .then(response => pageJsonRTVDrentheBuilder(response.ttext,response.page), errorPageTimeOut(404));
    };
};
module.exports = function (req, res, next) {
    makeRequest(req.body.provider, req.body.page).then(response => {
        req.body["textpageobject"] = response;
        return next();
    }, errorPage(404));
}
