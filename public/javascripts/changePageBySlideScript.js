"function swipedetect(el, callback){\
    var touchsurface = el,\
    swipedir,\
    startX,\
    startY,\
    distX,\
    distY,\
    threshold = 150, \
    restraint = 100, \
    allowedTime = 300, \
    elapsedTime,\
    startTime,\
    handleswipe = callback || function(swipedir){} \
    touchsurface.addEventListener('touchstart', function(e){\
        var touchobj = e.changedTouches[0]\
        swipedir = 'none'\
        dist = 0 \
        startX = touchobj.pageX \
        startY = touchobj.pageY \
        startTime = new Date().getTime() \
        e.preventDefault() \
    }, false) \
    touchsurface.addEventListener('touchmove', function(e){ \
        e.preventDefault() \
    }, false) \
    touchsurface.addEventListener('touchend', function(e){ \
        var touchobj = e.changedTouches[0] \
        distX = touchobj.pageX - startX \
        distY = touchobj.pageY - startY \
        elapsedTime = new Date().getTime() - startTime \
        if (elapsedTime <= allowedTime){ \
            if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint){ \
                swipedir = (distX < 0)? 'left' : 'right' \
            }\
            else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint){ \
                swipedir = (distY < 0)? 'up' : 'down' \
            }\
        }\
        handleswipe(swipedir) \
        e.preventDefault() \
    }, false) \
} \
var el = document.getElementById('swipezone'); \
swipedetect(el, function(swipedir){ \
    if (swipedir == 'left') { \
        document.getElementById('pagenumber').value = 100;\
    } else {\
        if (swipedir == 'right') { \
            document.getElementById('pagenumber').value = 102;\
        }\
    }\
});";


function swipedetect(el, callback){      var touchsurface = el,      swipedir,      startX,      startY,      distX,      distY,      threshold = 150,       restraint = 100,       allowedTime = 300,       elapsedTime,      startTime,      handleswipe = callback || function(swipedir){}       touchsurface.addEventListener('touchstart', function(e){          var touchobj = e.changedTouches[0]          swipedir = 'none'          dist = 0           startX = touchobj.pageX           startY = touchobj.pageY           startTime = new Date().getTime()           e.preventDefault()       }, false)       touchsurface.addEventListener('touchmove', function(e){           e.preventDefault()       }, false)       touchsurface.addEventListener('touchend', function(e){           var touchobj = e.changedTouches[0]           distX = touchobj.pageX - startX           distY = touchobj.pageY - startY           elapsedTime = new Date().getTime() - startTime           if (elapsedTime <= allowedTime){               if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint){                   swipedir = (distX < 0)? 'left' : 'right'               }              else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint){                   swipedir = (distY < 0)? 'up' : 'down'               }          }          handleswipe(swipedir)           e.preventDefault()       }, false)   }   var el = document.getElementById('swipezone');   swipedetect(el, function(swipedir){       console.log('Detected swipe ', swipedir);      if (swipedir == 'left') {           document.getElementById('pagenumber').value = 100;      } else {          if (swipedir == 'right') {               document.getElementById('pagenumber').value = 102;          }      }  });  
