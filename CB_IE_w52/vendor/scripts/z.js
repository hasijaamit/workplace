

/* Function's to set left bottom menu as static for IE Browser version 8 & 9 */
function isIE( version, comparison ){
    var $div = $('<div style="display:none;"/>').appendTo($('body'));
    $div.html('<!--[if '+(comparison||'')+' IE '+(version||'')+']><a>&nbsp;</a><![endif]-->');
    var ieTest = $div.find('a').length;
    $div.remove();
    return ieTest;
}


var checkDevice = false;
    var isMobile = {
    	Android: function() {
    		return navigator.userAgent.match(/Android/i);
    	},
    	BlackBerry: function() {
    		return navigator.userAgent.match(/BlackBerry/i);
    	},
    	iOS: function() {
    		return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    	},
    	Opera: function() {
    		return navigator.userAgent.match(/Opera Mini/i);
    	},
    	Windows: function() {
    		return navigator.userAgent.match(/IEMobile/i);
    	},
    	any: function() {
    		return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || 			isMobile.Opera() || isMobile.Windows());
    	}
    };

	if( isMobile.any() ) {
	 	checkDevice = true;
	 	
	}
         
        
if(checkDevice) {      
         
  function doOnOrientationChange()
  {
    switch(window.orientation) 
    {  
      case -90:
      case 90:
       
        break; 
      default:
        alert('Please use landscape orientation for better experience.');
        break; 
    }
  }

	window.addEventListener('orientationchange', doOnOrientationChange);
  	// Initial execution if needed
  	doOnOrientationChange();
}




$(function() {

if(isIE(8) || isIE(9) ){  

 	$("ul.menuContainer").html('<img src="images/openup.png" alt="" id="mapid" usemap="#map" /><map name="map"><area shape="poly" id="changeDisp" onmouseover="javascript:hoverEffect(this.id);"  onmouseout="javascript:hoverOut();" coords="171, 102, 188, 137, 196, 167, 199, 200, 103, 201, 98, 175, 91, 156, 86, 151" /><area shape="poly" id="sort" onmouseover="javascript:hoverEffect(this.id);" onmouseout="javascript:hoverOut();" coords="99, 33, 122, 45, 147, 70, 169, 99, 87, 148, 73, 131, 58, 118, 50, 115" /><area shape="poly" id="search" onmouseover="javascript:hoverEffect(this.id);" onmouseout="javascript:hoverOut();" coords="3, 6, 48, 9, 79, 20, 96, 29, 48, 113, 22, 102, 1, 102" /></map>');

    if (window.PIE) {
    	
        $('.menuBtn').each(function() {
            PIE.attach(this);
        });
        
        $('.selectBtn').each(function() {
            PIE.attach(this);
        });
        
        $('.allSelectBtn').each(function() {
            PIE.attach(this);
        });
        
        $('.nextBtn').each(function() {
            PIE.attach(this);
        });
        
        $('.prevBtn').each(function() {
            PIE.attach(this);
        });
        
        $('.conditionBox').each(function() {
            PIE.attach(this);
        });
    }
}

});

function hoverEffect(id) {
	if(id == "search") {
		$("#mapid").attr("src", "images/search_openup.png");
	} else if(id == "sort") {
		$("#mapid").attr("src", "images/sort_openup.png");
	} else {
		$("#mapid").attr("src", "images/display_openup.png");
	}
}

function hoverOut() {	
	$("#mapid").attr("src", "images/openup.png");
}

/* End : Function's to set left bottom menu as static for IE Browser version 8 & 9 */