var express = require('express');
var router = express.Router();

var striptags = require('striptags');

const got = require('got');

/* GET teletekst page. */
router.get('/', function(req, res, next) {
  
   res.redirect('/tt/100');
}),
router.post('/:page', function(req, res, next) {
  let page = req.body.page;
  let subpage = req.body.subpage;
  if (subpage !== "" && subpage > 0) {
    page = page + "-" + subpage;  
  }
   res.redirect('/tt/'+page);
}),
router.get('/:page', function(req, res, next) {
  const page = req.params.page;
  //console.log("User-agent = ", req.headers['user-agent']);
  let userAgent = req.headers['user-agent'];

  (async () => {
    try {
      const response = await got('https://teletekst-data.nos.nl/json/'+ page);
      
      //=> '<!doctype html> ...'
      let ttpage = response.body;
      let html = formTTBody(ttpage,page,userAgent);
      res.send(html)
    } catch (error) {
      console.log(error.response.body);
      res.render('pagenotfound');
      //=> 'Internal server error ...'
    }
  })();
});
module.exports = router;

function formTTBody(ttpage,page,userAgent) {
  let str = striptags(JSON.parse(ttpage).content);
  let links = JSON.parse(ttpage).fastTextLinks;
  
  let newstr = "";
  let l = str.length;
  let n = 0;let np = 0; let ns = 0;
  let m = 0;//let found = "none"; // can be none, subpage or page
  let rxp = /([-,\ ])([1-9]\d\d)([ \n,-])/g;
  let rxs= /([,\ ])([1-9]\d\d\/[1-9])([ \n,])/g;
  while (m>-1 && m<=l && l>0 && n>-1) {
    np = str.substring(m,l).search(rxp);
    ns = str.substring(m,l).search(rxs);
    // the search found single page first
    if ((np>=0 && ns>=0 && np<ns) || (np>=0 && ns==-1) ) {
      n=np;
     // found = "page";
      let link = str.substr(n+m+1,3);
      newstr = newstr + str.substr(m+1,n) +  '<a href="/tt/'+ link + '/">' + link + '</a>';
      m = m+n+3;
    } else {
      // the search found page with subpage first
      if ((ns>=0 && np>=0 && ns<np) || (ns>=0 && np==-1)) {
        n=ns;
      //  found = "subpage";
        let plink = str.substr(n+m+1,3);
        let slink = str.substr(n+m+5,1);
        let link = plink + '-' + slink;
        newstr = newstr + str.substr(m+1,n) +  '<a href="/tt/'+ link + '/">' + plink + '/' + slink + '</a>';
        m = m+n+5;
      } else {
          // inconclusive? Cannot be subpage and page
          n=-1;
       //   found = "none";
          newstr = newstr + str.substr(m+1,l);
      }
    }
  }
  str = newstr;

  
  // Build a button box with fast references to pages
  const buttonListBuilder = (accumulator, currentValue) => {
    return  accumulator + '<button class="navbutton" onclick="window.location.href=\'/tt/' + currentValue.page + '\'">' + currentValue.title + '</button>' ;
  };
  let buttonList = links.reduce(buttonListBuilder, "");
  // remove some gibberish colored ascii lines
  let re =  /(\&#xF\d\d.;)+/g;
  str = str.replace(re,"");
  // shorten the first line a few spaces
  str = str.slice(11,str.length);

  // Build/replace fast reference bottom line page titles in de page with links to to the pages
  const fastRefLineBuilder = (accumulator, currentValue) => {
    return  accumulator.replace(currentValue.title, '<a href=\"/tt/' + currentValue.page + '\">' + currentValue.title + '</a>' );
  };
  str = links.reduce(fastRefLineBuilder,str);
  
  // replace newlines with <br>
  let ref = /(\n)+/g;
  str = str.replace(ref,"<br>");
  // replace whitespaces by no-breaking whitespace
  // str = str.replace(/[ ]{2}/g, "&nbsp;&nbsp;");
  str = '<html><header> \
  <meta name="viewport" content="width=device-width, initial-scale=1.0"> \
         ' + style(userAgent) + '\
         <title>Minimalist Teletekst Display</title\
          </header><body><pre><p> \
          ' + str + '\
          </p></pre>\
          <span><div class=\"buttonbox\"> \
              ' + pageForm(page) + '\
              </div>\
              <div class=\"navigationbox\"> \
                ' + buttonList + '\
                </div>\
                <div class=\"navigationbox2\"> \
                ' + pageNavButtons(ttpage) + '\
                </div> \
              </span> \
          </body></html>';  
      return str;
    }
//});
function pageForm(page) {
  let form = '<form class="select-page-form" action="" method="post" enctype="application/x-www-form-urlencoded">\
  <label>Pagina</label>\
  <input class="page-input" type="number" name="page" id="pagenumber" value="' + page.substr(0,3) + '">\
  <label>SubPag.</label>\
  <input class="page-input" type="number" name="subpage" id="subpagenumber" value="' + getSubPage(page) + '">\
  <input class="page-submit" type="submit" value="Ga">\
  </form>'
  return form;
}
function getSubPage (page)
{ let subpage = 1;
  if (page.length == 5) {
    subpage = page.substr(4,1);
  }
  return subpage;
}
function style(userAgent) {
  // device detection
  console.log("UserAgent=",userAgent);
  let style = '<link rel="stylesheet" href="/stylesheets/style.css">';
  if(userAgent.search(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i) > -1) {
    style = '<link rel="stylesheet" href="/stylesheets/style.mobile.css">';
  }
  return style;  
}
function pageNavButtons(ttpage) {
  let pagelinks = [];
  
  pagelinks.push({"page": JSON.parse(ttpage).nextPage, "title": "PgUp"});
  pagelinks.push({"page": JSON.parse(ttpage).nextSubPage, "title": "SubPgUp"});
  pagelinks.push({"page": JSON.parse(ttpage).prevSubPage, "title": "SubPgDn"});
  pagelinks.push({"page": JSON.parse(ttpage).prevPage, "title": "PgDn" });
  console.log(JSON.stringify(pagelinks[3]));
  const buttonList2Builder = (accumulator, currentValue) => {
    return  accumulator + '<button class="navbutton" onclick="window.location.href=\'/tt/' + currentValue.page + '\'">' + currentValue.title + '</button>' ;
  };
  return pagelinks.reduce(buttonList2Builder, "") ;
}
//module.exports = router;
