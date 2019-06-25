// script to retrieve a raw teletext page and format into a 
// standard formatted JSON with teletekst content and simple navigation
// links. These can be used for buttons to navigate to different
// pages.
const got = require('got');
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
"+"   _           deze pagina          _\n\
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
    //console.log(JSON.stringify(pageJson));
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
function getFastTestLinks(ttpage) {
    let pageLinks = [];
    let p1 = ttpage.indexOf("<FORM") + 5;
    let p2 = ttpage.indexOf("</FORM>");
    str = ttpage.substring(p1,p2);
    p1 = 18+str.indexOf("<A HREF=\"/?pagina=");
    p2 = p1+3;
    pageLinks.push(str.substring(p1,p2));
    p1 = 18+str.lastIndexOf("<A HREF=\"/?pagina=");
    p2 = p1+3;
    pageLinks.push(str.substring(p1,p2));
    //console.log(pageLinks);
    return pageLinks;
}
function pageJsonRijnmondBuilder(ttpage) {
    let pageLinks = getFastTestLinks(ttpage);
    pageJson = { 
        "prevPage": pageLinks[0],
        "nextPage": pageLinks[1],
        "prevSubPage": "1",
        "nextSubPage": "1",
        "fastTextLinks": [{"title":"nieuws","page":"101"},{"title":"weer","page":"170"},{"title":"sport","page":"120"},{"title":"verkeer","page":"180"}],
        "pagetxt": cleanUpRijnmondTTBody(ttpage)
    };
  return pageJson;
  }
  function pageJsonInfoThuisBuilder(ttpage) {
    let pageLinks = getFastTestLinks(ttpage);
    pageJson = { 
        "prevPage": pageLinks[0],
        "nextPage": pageLinks[1],
        "prevSubPage": "1",
        "nextSubPage": "1",
        "fastTextLinks": [{"title":"overzicht","page":"100"},{"title":"nieuws","page":"101"},{"title":"sport","page":"601"},{"title":"scholen","page":"470"}],
        "pagetxt": cleanUpInfoThuisTTBody(ttpage)
    };
  return pageJson;
  }
const makeRequestFromNOS = async (page) => {
	return await got(page, {baseUrl: 'https://teletekst-data.nos.nl/json/'});
}
const makeRequestFromRijnmond = async (page) => {
    let pageno = page.substr(0,3);
    let subpage = pageno + "a";
    if (page.indexOf("-") == 3) {
        let subpageno = page.substring(4,page.length);
        subpage = pageno + alphabet.charAt(subpageno-1);
    }
	return await got('?pagina=' + pageno + '&sub=' + subpage + '&weergave=txt', {baseUrl: 'https://rijnmond-ttw.itnm.nl/'});
}
const makeRequestFromInfoThuis = async (page) => {
    let pageno = page.substr(0,3);
    let subpage = pageno + "a";
    if (page.indexOf("-") == 3) {
        let subpageno = page.substring(4,page.length);
        subpage = pageno + alphabet.charAt(subpageno-1);
    }
	return await got('?pagina=' + pageno + '&sub=' + subpage + '&weergave=txt', {baseUrl: 'https://teletekst.infothuis.tv/'});
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
                        "fastTextLinks": [{"title":"nieuws","page":"101"},{"title":"weer","page":"603"},{"title":"sport","page":"601"},{"title":"voetbal","page":"801"}],
                        "pagetxt": pageNotFound //.replace("xxxxx", page)
                    };
                    return pageJson;
                } else {
                    console.log(error.statusCode);
                    //res.status(500);
                }
         }
        );
    };
    if (provider == 1 || provider == "1") {
        return await makeRequestFromRijnmond(page).then(response => pageJsonRijnmondBuilder(response.body), errorPage);
    };
    if (provider == 2 || provider == "2") {
        return await makeRequestFromInfoThuis(page).then(response => pageJsonInfoThuisBuilder(response.body), errorPage);
    };
};
module.exports = function (req, res, next) {
    makeRequest(req.body.provider, req.body.page).then(response => {
        req.body["textpageobject"] = response;
        return next();
    });
}
