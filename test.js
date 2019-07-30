// script to retrieve a raw teletext page and format into a 
// standard formatted JSON with teletekst content and simple navigation
// links. These can be used for buttons to navigate to different
// pages.
const got = require('got');
//const p = require('phin');

const striptags = require('striptags');

function cleanUpNOSTTBody(ttpage) {
  let str = striptags(JSON.parse(ttpage).content);
  let re =  /(\&#xF\d\d.;)+/g;
  str = str.replace(re," ");
  return str;
}
function pageJsonNOSBuilder ( ttpage ) {
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
function pageJsonRijnmondBuilder ( ttpage ) {
  pageJson = { 
      "prevPage": "100",
      "nextPage": "100",
      "prevSubPage": "1",
      "nextSubPage": "1",
      "fastTextLinks": [{"title":"nieuws","page":"101"},{"title":"weer","page":"603"},{"title":"sport","page":"601"},{"title":"voetbal","page":"801"}],
      "pagetxt": cleanUpRijnmondTTBody(ttpage)
  };
return pageJson;
}
const makeRequestFromNOS = async (page) => {
  //let url = 'https://teletekst-data.nos.nl/json/' + page;
  return await got(page, {baseUrl: 'https://teletekst-data.nos.nl/json/'});
  //return await p({'url': url});
}
const makeRequestFromRijnmond = async (page) => {
  //let url = 'https://rijnmond-ttw.itnm.nl/' + '?pagina=' + page + '&weergave=txt';
  return await got('?pagina=129&weergave=txt', {baseUrl: 'https://rijnmond-ttw.itnm.nl/'});
  //return await p(url);
}
// const makeRequest = async (res, req, next) => {
const makeRequest = async (provider, page) => {
	
		if (provider == 0 || provider == "0") { 
			return await makeRequestFromNOS(page).then(response => pageJsonNOSBuilder(response.body));
		};
		if (provider == 1 || provider == "1") {
			return await makeRequestFromRijnmond(page).then(response => pageJsonRijnmondBuilder(response.body));
		};
	}
makeRequest("1", "103").then(response => console.log(JSON.stringify(response)));

