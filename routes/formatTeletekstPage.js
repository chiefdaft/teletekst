module.exports = function(req, res)  {
    try {
      let userAgent = req.headers["user-agent"];
      let provider = req.body.provider;
      res.send(formatTTPage(req.body.textpageobject, req.body.page, provider, userAgent));
    } catch (error) {
      console.log("ERROR : ",error.response);
      res.send({"error": "1", "pagetxt" : "pagenotfound"});
    }
};
function changeProviderScript () {
  let src = '<script> function changeProvider() {\
    let p = document.getElementById(\'provider\').value;\
    window.location.href="/tt/100/" + p;\
    return true;\
  } </script>';
  // console.log(src)
  return src;
}
function formatTTPage(ttpage, page, provider, userAgent) {
    let str = ttpage.pagetxt;
    let links = ttpage.fastTextLinks;
    let newstr = "";
    let l = str.length;
    let n = 0;let np = 0; let ns = 0;
    let m = 0;//let found = "none"; // can be none, subpage or page
    let rxp = /([-,\ ])([1-9]\d\d)([ \n,-])/g;
    let rxs= /([,\ ])([1-9]\d\d\/[1-9])([ \n,])/g;
    while (m>-1 && m<=l && l>0 && n>-1) {
      //console.log("n:",n);
      np = str.substring(m,l).search(rxp);
      ns = str.substring(m,l).search(rxs);
      // the search found single page first
      if ((np>=0 && ns>=0 && np<ns) || (np>=0 && ns==-1) ) {
        n=np;
       // found = "page";
        let link = str.substr(n+m+1,3) + '\/' + provider;
        let linktxt = str.substr(n+m+1,3)
        newstr = newstr + str.substr(m+1,n) +  '<a href="/tt/'+ link + '/">' + linktxt + '</a>';
        m = m+n+3;
      } else {
        // the search found page with subpage first
        if ((ns>=0 && np>=0 && ns<np) || (ns>=0 && np==-1)) {
          n=ns;
        //  found = "subpage";
          let plink = str.substr(n+m+1,3);
          let slink = str.substr(n+m+5,1);
          let link = plink + '-' + slink  + '\/' + provider;
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
     //console.log("String: ", str);
    
    // Build a button box with fast references to pages
    const buttonListBuilder = (accumulator, currentValue) => {
      return  accumulator + '<button class="navbutton" onclick="window.location.href=\'/tt/' + currentValue.page + '/' + provider + '\'">' + currentValue.title + '</button>' ;
    };
    let buttonList = links.reduce(buttonListBuilder, "");
       
  
    // Build/replace fast reference bottom line page titles in de page with links to to the pages
    const fastRefLineBuilder = (accumulator, currentValue) => {
      return  accumulator.replace(currentValue.title, '<a href=\"/tt/' + currentValue.page + '/' + provider + '\">' + currentValue.title + '</a>' );
    };
    str = links.reduce(fastRefLineBuilder,str);
    //console.log("hopsa: ", str);
    // repair <pre> indentation of the firstline
    str = str.replace('\n', '</p>\n<div  id="swipezone"><p>');
    //str = '<p class="firstline">' + str;
    // replace newlines with <br>
    let ref = /(\n)+/g;
    str = str.replace(ref,"<br>");
    // replace whitespaces by no-breaking whitespace
    // str = str.replace(/[ ]{2}/g, "&nbsp;&nbsp;");
    str = '<html><header> \
    <meta name="viewport" content="width=device-width, initial-scale=1.0"> \
           ' + style(userAgent) + '\
           <title>Minimalist Teletekst Display</title>\
            </header><body><div class="content"><pre><p class="firstline">&nbsp \
            ' + str + '\
            </p></div></pre>\
            <span class=\"spanboxes\"><div class=\"buttonbox\"> \
                ' + pageForm(page, provider) + '\
                </div>\
                <div class=\"navigationbox\"> \
                  ' + buttonList + '\
                  </div>\
                  <div class=\"navigationbox2\"> \
                  ' + pageNavButtons(ttpage, provider) + '\
                  </div> \
               </span> \
               </div>\
               ' + changeProviderScript() + ' \
               ' + changePageBySlideScript() + '\
               </body></html>';  
        return str;
      }
  //});

  function setSelectedOption (provider, index) {
    let selected = "";
    if (provider == index) {
      //console.log("Selected = ", provider)
      selected = "selected";
    }
    return selected;
  }
  function pageForm(page, provider) {
    //console.log("Pageform function!", page);
    let form = '<form id="select-page-form" action="" method="post" enctype="application/x-www-form-urlencoded">\
    <input class="oldprovider" name="oldprovider" id="oldprovider" type="number" value="' + provider + '"> \
    <label>Pagina</label>\
    <input class="page-input" type="number" name="page" id="pagenumber" maxlength="3" required pattern="([1-8][0-9][0-9])" value="' + page.substr(0,3) + '">\
    <label>SubPag.</label>\
    <input class="page-input" type="number" name="subpage" id="subpagenumber" value="' + getSubPage(page, provider) + '">\
    <input class="page-submit" type="submit" value="Ga">\
   <span> <label>Aanbieder</label>\
    <select class="page-input-select" name="provider" id="provider" onchange="changeProvider()">\
      <option value="0" ' +  setSelectedOption(provider, "0") + '>NOS Teletekst</option> \
      <option value="1" ' +  setSelectedOption(provider, "1") + '>Rijnmond Tekst</option> \
      <option value="2" ' +  setSelectedOption(provider, "2") + '>InfoThuis</option> \
      <option value="3" ' +  setSelectedOption(provider, "3") + '>Omroep West</option> \
      <option value="4" ' +  setSelectedOption(provider, "4") + '>Omroep Gelderland</option> \
      <option value="5" ' +  setSelectedOption(provider, "5") + '>Omroep L1mburg</option> \
      <option value="6" ' +  setSelectedOption(provider, "6") + '>Omroep Brabant</option> \
      <option value="7" ' +  setSelectedOption(provider, "7") + '>RTV Oost</option> \
    </select> </span>\
    </form>'
    //console.log("Form=", form);
    return form;
  }
  function getSubPage (page, provider) { 
    let subpage = (provider < 3) ? 1 : 0;
    if (page.length == 5) {
      subpage = page.substr(4,1);
    }
    return subpage;
  }
  function style(userAgent) {
    // device detection
    //console.log("UserAgent=",userAgent);
    let style = '<link rel="stylesheet" href="/stylesheets/style.css">';
    if(userAgent.search(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i) > -1) {
      style = '<link rel="stylesheet" href="/stylesheets/style.mobile.css">';
    }
    //console.log("Style = ", style);
    return style;  
  }
  function pageNavButtons(ttpage, provider) {
    let pagelinks = [];
    //console.log("pageNavButtons!!", ttpage.nextPage);
    pagelinks.push({"page": ttpage.nextPage, "title": "PgUp"});
    pagelinks.push({"page": ttpage.nextSubPage, "title": "SubPgUp"});
    pagelinks.push({"page": ttpage.prevSubPage, "title": "SubPgDn"});
    pagelinks.push({"page": ttpage.prevPage, "title": "PgDn" });
    //console.log("Link 3:",JSON.stringify(pagelinks[0]));
    const buttonList2Builder = (accumulator, currentValue) => {
      return  accumulator + '<button class="navbutton" onclick="window.location.href=\'/tt/' + currentValue.page + '/' + provider + '\'">' + currentValue.title + '</button>' ;
    };
    //console.log("pageNavButtons XXX!!", ttpage.nextPage);
    return pagelinks.reduce(buttonList2Builder, "") ;
  }
  function changePageBySlideScript() {
    let scr = "<script>\
      function swipedetect(el, callback){\
      var touchsurface = el,\
      swipedir,\
      startX,\
      startY,\
      distX,\
      distY,\
      threshold = 90, \
      restraint = 75, \
      allowedTime = 300, \
      elapsedTime,\
      startTime,\
      handleswipe = callback || function(swipedir){}; \
      touchsurface.addEventListener(\"touchstart\", function(e){\
          var touchobj = e.changedTouches[0] ;\
          swipedir = \"none\" ;\
          dist = 0 ;\
          startX = touchobj.pageX ;\
          startY = touchobj.pageY ;\
          startTime = new Date().getTime() ;\
      }, {passive: true}, {useCapture : false}); \
      touchsurface.addEventListener(\"touchend\", function(e){ \
          var touchobj = e.changedTouches[0] ;\
          distX = touchobj.pageX - startX ;\
          distY = touchobj.pageY - startY ;\
          elapsedTime = new Date().getTime() - startTime ;\
          if (elapsedTime <= allowedTime){ \
              if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint){ \
                  swipedir = (distX < 0)? 'left' : 'right' ;\
              }\
              else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint){ \
                  swipedir = (distY < 0)? 'up' : 'down' ;\
              }\
          }\
          handleswipe(swipedir) ;\
          if (swipedir != 'none') {\
            e.preventDefault() ;\
          }\
      }, {passive: true}, {useCapture : false}); \
  } \
  var el = document.getElementById('swipezone'); \
  swipedetect(el, function(swipedir){ \
      console.log('Detected swipe on ', el, swipedir);\
      if (swipedir != 'none') {\
      let page = parseInt(document.getElementById('pagenumber').value);\
      let subpage = parseInt(document.getElementById('subpagenumber').value);\
      switch (swipedir) {\
        case 'left': document.getElementById('pagenumber').value = (page < 899) ? page + 1 : page;\
                    break;\
        case 'right': document.getElementById('pagenumber').value = (page > 100) ? page - 1 : page ;\
                    break;\
        case 'up': document.getElementById('subpagenumber').value = subpage  + 1;\
                    break;\
        case 'down': document.getElementById('subpagenumber').value = (subpage > 1) ? subpage - 1 : subpage ;\
                    break;\
      }\
      document.getElementById(\"select-page-form\").submit();\
    }\
  });\
  </script>"
  
    return scr;
  }