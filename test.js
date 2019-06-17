const got = require('got');
const striptags = require('striptags');

function cleanUpNOSTTBody(ttpage) {
  let str = striptags(JSON.parse(ttpage).content);
  let re =  /(\&#xF\d\d.;)+/g;
  str = str.replace(re," ");
  return str;
}
const pageJsonNOSBuilder = ttpage => {
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

const makeRequestFromNOS = async (page) => {
	return await got(page, {baseUrl: 'https://teletekst-data.nos.nl/json/'});
}
const makeRequestFromRijnmond = async (page) => {
	return await got(page, {baseUrl: 'https://teletekst-data.nos.nl/json/'});
}

const makeRequest = async (provider, page) => {
	
		if (provider == "NOS") { 
			return await makeRequestFromNOS(page).then((response) => {
				let ttpage = response.body;
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
			});
		};
		if (provider == "RIJNMOND") {
			return await makeRequestFromRijnmond(page).then((response) => {
				let ttpage = response.body;
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
			}) ;
		};

};
makeRequest("NOS", "102").then(response => console.log(response));

