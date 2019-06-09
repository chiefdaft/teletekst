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
  let page = req.params.page;

  (async () => {
    try {
      const response = await got('https://teletekst-data.nos.nl/json/'+ page);
      
      //=> '<!doctype html> ...'
      let ttpage = response.body;
      var html = formTTBody(ttpage);
      res.send(html)
    } catch (error) {
      console.log(error.response.body);
      //=> 'Internal server error ...'
    }
  })();
//accumulator + currentValue;

function formTTBody(ttpage) {
  let str = striptags(JSON.parse(ttpage).content);
  let links = JSON.parse(ttpage).fastTextLinks;
  const buttonListBuilder = (accumulator, currentValue) => {
    return  accumulator + '<button class="navbutton" onclick="window.location.href=\'/tt/' + currentValue.page + '\'">' + currentValue.title + '</button>' ;
  } ;
  let buttonList = links.reduce(buttonListBuilder, "");
  var re =  /(\&#xF\d\d.;)+/g;
  str = str.replace(re,"");
  var ref = /(\n)+/g
  str = str.replace(ref,"<br>");
  str = '<html><header> \
         ' + style() + '\
          </header><body><div><p> \
          ' + str + '\
          </p></div>\
              <div class=\"buttonbox\"> \
              ' + pageForm() + '\
              </div>\
              <div class=\"navigationbox\"> \
                ' + buttonList + '\
              </div>\
          </body></html>';
      return str;
    }
});
function pageForm() {
  let form = '<form class="select-page-form" action="" method="post" enctype="application/x-www-form-urlencoded">\
  <label>Pagina</label>\
  <input class="page-input" type="number" name="page" id="pagenumber">\
  <label>SubPag.</label>\
  <input class="page-input" type="number" name="subpage" id="subpagenumber">\
  <input class="page-submit" type="submit" value="Ga">\
  </form>'
  return form;
}
function style() {
  let style = '<link rel="stylesheet" href="/stylesheets/style.css">';
  return style;  
}
module.exports = router;
