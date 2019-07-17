module.exports = function(req, res)  {
    try {
      //let userAgent = req.headers["user-agent"];
      let provider = req.body.provider;
      res.send(formatTTPage(req.body.textpageobject, req.body.page, provider));
    } catch (error) {
      console.log("ERROR : ",error.response);
      res.send({"error": "1", "pagetxt" : "pagenotfound"});
    }
};
function changeProviderScript () {
  let src = '<script> function changeProvider() {\
    let p = document.getElementById(\'provider\').value;\
    window.location.href="/tt/e/100/" + p;\
    return true;\
  } </script>';
  // console.log(src)
  return src;
}
function formatTTPage(ttpage, page, provider) {
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
        newstr = newstr + str.substr(m+1,n) +  '<a href="/tt/e/'+ link + '/">' + linktxt + '</a>';
        m = m+n+3;
      } else {
        // the search found page with subpage first
        if ((ns>=0 && np>=0 && ns<np) || (ns>=0 && np==-1)) {
          n=ns;
        //  found = "subpage";
          let plink = str.substr(n+m+1,3);
          let slink = str.substr(n+m+5,1);
          let link = plink + '-' + slink  + '\/' + provider;
          newstr = newstr + str.substr(m+1,n) +  '<a href="/tt/e/'+ link + '/">' + plink + '/' + slink + '</a>';
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
      return  accumulator + '<button class="navbutton" onclick="window.location.href=\'/tt/e/' + currentValue.page + '/' + provider + '\'">' + currentValue.title + '</button>' ;
    };
    let buttonList = links.reduce(buttonListBuilder, "");
       
  
    // Build/replace fast reference bottom line page titles in de page with links to to the pages
    const fastRefLineBuilder = (accumulator, currentValue) => {
      return  accumulator.replace(currentValue.title, '<a href=\"/tt/e/' + currentValue.page + '/' + provider + '\">' + currentValue.title + '</a>' );
    };
    str = links.reduce(fastRefLineBuilder,str);
    //console.log("hopsa: ", str);
    // repair <pre> indentation of teh firstline
    str = str.replace('\n', '</p>\n<p>');
    //str = '<p class="firstline">' + str;
    // replace newlines with <br>
    let ref = /(\n)+/g;
    str = str.replace(ref,"<br>");
    // replace whitespaces by no-breaking whitespace
    // str = str.replace(/[ ]{2}/g, "&nbsp;&nbsp;");
    str = '<html><header> \
    <meta name="viewport" content="width=device-width, initial-scale=1.0"> \
           ' + style() + '\
           <title>Minimalist Teletekst Display</title\
            </header><body><div class="content"><pre><p class="firstline">&nbsp \
            ' + str + '\
            </p></pre>\
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
            </body></html>';  
            //console.log("HTML str=", str);
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
    let form = '<form class="select-page-form" action="" method="post" enctype="application/x-www-form-urlencoded">\
    <input class="oldprovider" name="oldprovider" id="oldprovider" type="number" value="' + provider + '"> \
    <label>Pagina</label>\
    <input class="page-input" type="number" name="page" id="pagenumber" maxlength="3" required pattern="([1-8][0-9][0-9])" value="' + page.substr(0,3) + '">\
    <label>SubPag.</label>\
    <input class="page-input" type="number" name="subpage" id="subpagenumber" maxlength="1" value="' + getSubPage(page) + '">\
    <input class="page-submit" type="submit" value="Ga">\
   <span> <label>Aanbieder</label>\
    <select class="page-input-select" name="provider" id="provider" onchange="changeProvider()">\
      <option value="0" ' +  setSelectedOption(provider, "0") + '>NOS Teletekst</option> \
      <option value="1" ' +  setSelectedOption(provider, "1") + '>Rijnmond Tekst</option> \
      <option value="2" ' +  setSelectedOption(provider, "2") + '>InfoThuis</option> \
      <option value="3" ' +  setSelectedOption(provider, "3") + '>Omroep West</option> \
      <option value="4" ' +  setSelectedOption(provider, "4") + '>Omroep Gelderland</option> \
      <option value="5" ' +  setSelectedOption(provider, "5") + '>Omroep L1mburg</option> \
    </select> </span>\
    </form>'
    //console.log("Form=", form);
    return form;
  }
  function getSubPage (page) { 
    let subpage = 1;
    if (page.length == 5) {
      subpage = page.substr(4,1);
    }
    return subpage;
  }
  function style() {
    // device detection
    //console.log("UserAgent=",userAgent);
    let style = '<link rel="stylesheet" href="/stylesheets/style.ereader.css">';
    // if(userAgent.search(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i) > -1) {
    //   style = '<link rel="stylesheet" href="/stylesheets/style.mobile.css">';
    // }
    // //console.log("Style = ", style);
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
      return  accumulator + '<button class="navbutton" onclick="window.location.href=\'/tt/e/' + currentValue.page + '/' + provider + '\'">' + currentValue.title + '</button>' ;
    };
    //console.log("pageNavButtons XXX!!", ttpage.nextPage);
    return pagelinks.reduce(buttonList2Builder, "") ;
  }
  