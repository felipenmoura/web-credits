!function(scope){

	var PUBLIC= {};
	var PRIVATE= {};

	var requestAnimFrame = (function(){
	    return  window.requestAnimationFrame       ||
	            window.webkitRequestAnimationFrame ||
	            window.mozRequestAnimationFrame    ||
	            function( callback ){
	                window.setTimeout(callback, 1000 / 60);
	            };
	})();

	PRIVATE.creditsEl= null;
	PRIVATE.curTopPosition= 0;
	PRIVATE.creditsSize= 0;
	PRIVATE.paused= false;
	PRIVATE.externalSource= false;
	PRIVATE.loadedImages= 0;
	PRIVATE.imagesToLoad= 0;

	PRIVATE.getFile= function(src){
		var xmlhttp= new XMLHttpRequest();

		xmlhttp.open("GET", src, true);

		xmlhttp.onreadystatechange=function(){
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
				PUBLIC.init(xmlhttp.responseText, true);
			}
		}
		xmlhttp.send();
	};

	PRIVATE.animate= function(){
		if(PRIVATE.curTopPosition*(-1) > PRIVATE.creditsSize){
			setTimeout(function(){
				PRIVATE.creditsEl.style.opacity= 0;
				PRIVATE.creditsContentEl.style.opacity= 0;
				setTimeout(function(){
					PRIVATE.creditsEl.parentNode.removeChild(PRIVATE.creditsEl);
					PRIVATE.creditsEl= false;
				}, 1000);
			}, 2000);
			return;
		}
		if(PRIVATE.paused){
			return;
		}
		PRIVATE.creditsContentEl.style.top= --PRIVATE.curTopPosition + 'px';
		requestAnimFrame( PRIVATE.animate );
	};

	PRIVATE.adjustFontSize= function(el){
		var len= el.textContent.length,
			w= el.offsetWidth,
			nfs= 100,
			originalFontSize= parseInt(window.getComputedStyle(el,null).getPropertyValue("font-size"), 10);
			letter= w / originalFontSize;

		nfs= (100 / len) * (originalFontSize*10);
		return nfs + '%';
	};

	function toArray(list){
		return Array.prototype.slice.call(list);
	}

	PRIVATE.initAnimation= function(){

		var theEnd= document.querySelector('#webcredits-content section.the-end');
		var clientHeight= document.documentElement.clientHeight;
		theEnd.style.height= clientHeight + 'px';
		theEnd.style.fontSize= PRIVATE.adjustFontSize(theEnd);

		PRIVATE.creditsEl.style.opacity= 1;
		PRIVATE.creditsContentEl.style.opacity= 1;

		var fullScreens= toArray(document.querySelectorAll('#webcredits-content section.full-screen'));
		fullScreens.forEach(function(cur){
			cur.style.height= clientHeight+'px';
		});

		PRIVATE.creditsSize= PRIVATE.creditsContentEl.offsetHeight - clientHeight;

		setTimeout(function(){
			PRIVATE.animate();
		}, 1200);
	};

	PUBLIC.init= function(creditsSource, force){

		if(PRIVATE.creditsEl && !force){
			return false;
		}

		PRIVATE.creditsEl= document.createElement('div');
		PRIVATE.creditsEl.id= 'webcredits-container';

		if(creditsSource[0] == '.' || creditsSource[0] == '/'){
			PRIVATE.externalSource= true;
			return PRIVATE.getFile(creditsSource);
		}
		PRIVATE.curTopPosition= 0; //document.documentElement.clientHeight;
		document.body.appendChild(PRIVATE.creditsEl);
		PRIVATE.creditsEl.innerHTML= "<div id='webcredits-content'>"+creditsSource+"</div>";

		toArray(PRIVATE.creditsEl.getElementsByTagName('img')).forEach(function(cur){
			cur.onload= cur.onerror= function(){
				PRIVATE.loadedImages++;
				if(PRIVATE.imagesToLoad == PRIVATE.loadedImages){
					PRIVATE.initAnimation();
				}
			};
			cur.src= cur.src;
			PRIVATE.imagesToLoad++;
		});

		PRIVATE.creditsContentEl= document.getElementById('webcredits-content');
		PRIVATE.creditsContentEl.style.top= '0px'; //PRIVATE.curTopPosition + 'px';

		if(PRIVATE.imagesToLoad === 0){
			PRIVATE.initAnimation();
		}

	};
	PUBLIC.cancel= function(){};
	PUBLIC.pause= function(){
		PRIVATE.paused= true;
	};
	PUBLIC.release= function(){
		PRIVATE.paused= false;
		PRIVATE.animate();
	};

	scope.webCredits= PUBLIC;
}(this);