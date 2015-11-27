/*
	[EasyJForum] (C)2007 Hongshee Soft.
	$file: common.js $
	$Date: 2007/11/30 $
*/

var userAgent = navigator.userAgent.toLowerCase();
var is_firefox = (navigator.product == 'Gecko');
if (is_firefox) {
	if (userAgent.indexOf('firefox') > 0)
		is_firefox = userAgent.substr(userAgent.indexOf('firefox') + 8, 3);
	else
		is_firefox = '3.0';
}
var is_ie = (userAgent.indexOf('msie') != -1 && !is_firefox) && userAgent.substr(userAgent.indexOf('msie') + 5, 3);
var is_chrome = userAgent.indexOf('chrome') != -1;
var ctrlclassName = '';

var jsmenu_active;
var jsmenu_iframe;
var jsmenu_duration = false;
var jsmenu_timer = new Array();
var msgs = new Array();

function addLoadEvent(func){
    var oldonload = window.onload;
    if (typeof(oldonload) != 'function'){
        window.onload = func;
    }   
    else {   
        window.onload = function(){
            oldonload();
            func();
        }
    }   
}   

function $(id) {
	return document.getElementById(id);
}

function trim(str) {
	return (str + '').replace(/(\s+)$/g, '').replace(/^\s+/g, '');
}

function showMedia(url, width, height){
	if (url.toLowerCase().indexOf('.swf') > 0)
		showFlash(url, width, height);
	else	
		showMedias(url, width, height);
}

function showFlash(url, width, height){
	document.write('<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" ');
	document.write('codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,0,0" ');
	document.write('width="'+ width + '" height="'+ height + '">');
	document.write('<param name="movie" value="' + url + '"/>');
	document.write('<param name="quality" value="high"/>');
	document.write('<param name="wmode" value="opaque"/>');
	document.write('<param name="allowFullScreen" value="true"/>');
	document.write('<embed src="' + url + '" wmode="opaque" quality="high" ');
	document.write('width="'+ width + '" height="'+ height + '" ');
	document.write('allowFullScreen="true" ');
	document.write('type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer"/>');
	document.write('</object>');
}

function showMedias(url, width, height){
	document.write('<object classid="clsid:6BF52A52-394A-11d3-B153-00C04F79FAA6" ');
	document.write('width="'+ width + '" height="'+ height + '">');
	document.write('<param name="autostart" value="0"/>');
	document.write('<param name="url" value="' + url + '"/>');
	document.write('<embed src="' + url + '" autostart="0" ');
	document.write('width="'+ width + '" height="'+ height + '" type="application/x-mplayer2"/>');
	document.write('</object>');
}

function checkall(form, prefix) {
	for(var i = 0; i < form.elements.length; i++) {
		var e = form.elements[i];
		if(e.name && e.name != 'chkall' && (!prefix || (e.name.indexOf(prefix)==0))) {
			e.checked = form.elements['chkall'].checked;
		}
	}
}

function cancel(event) {
	e = event ? event : window.event;
	if(is_ie) {
		e.returnValue = false;
		e.cancelBubble = true;
	} else if(e) {
		e.stopPropagation();
		e.preventDefault();
	}
}

function resizeImage(img, maxsize)
{
     if (img.width > maxsize) img.width = maxsize;
     if (img.height > maxsize) img.height = maxsize;
}

function isInArray(value, varray) {
	if(typeof(value) == 'string' || typeof(value) == 'number') {
		for(var i in varray) {
			if(varray[i] == value) {
				return true;
			}
		}
	}
	return false;
}

function uc_strlen(str) {
	var len = 0;
	for(var i = 0; i<str.length; i++) {
		len += (str.charCodeAt(i) < 0 || str.charCodeAt(i) > 255) ? (encoding == 'utf-8' ? 3 : 2) : 1;
	}
	return len;
}

function strlen(str) {
	return (is_ie && str.indexOf('\n') != -1) ? str.replace(/\r?\n/g, '_').length : str.length;
}

function toggle_collapse(objId) {
	var obj = $(objId);
	obj.style.display = obj.style.display == '' ? 'none' : '';

	var img = $(objId + '_img');
	if (img.src.indexOf('_yes.gif') == -1)
		img.src = img.src.replace(/_no\.gif/, '_yes\.gif');
	else
		img.src = img.src.replace(/_yes\.gif/, '_no\.gif');
}

function isLegalEmail(email) {
	if (email == '') return false;
	var islegal = /^[\-\.\w]+@[\.\-\w]+(\.\w+)+$/.test(email);
	return islegal;
}

function isLegalDate(sdate) {
	if (sdate == '') return true;
	var islegal = /^(\d{4})-(1[0-2]|0?[1-9])-(0?[1-9]|[12][0-9]|3[01])$/.test(sdate);  
	return islegal;
}

function initMenu(ctrlid, menuobj, duration) {
	menuobj.initialized = true;
	menuobj.ctrlid = ctrlid;
	menuobj.duration = duration;
	menuobj.onclick = doMenuAction;
	menuobj.style.position = 'absolute';
	menuobj.style.zIndex = 50;
	if(is_ie) {
		menuobj.style.filter += "progid:DXImageTransform.Microsoft.shadow(direction=135,color=#CCCCCC,strength=2)";
	}
}

function showMenu(ctrlid, duration) {
	var ctrlobj = $(ctrlid);
	if(!ctrlobj) return;

	var menuobj = $(ctrlid + '_menu');
	if(!menuobj) return;
	
	if(typeof(duration)=='undefined') duration = false;
	jsmenu_duration = duration;
	
	var timeout = 500;

	hideMenu();

	for(var id in jsmenu_timer) {
		if(jsmenu_timer[id]) clearTimeout(jsmenu_timer[id]);
	}

	if(ctrlobj && !ctrlobj.initialized) {
		ctrlobj.initialized = true;
		ctrlobj.unselectable = true;
		
		ctrlobj.outfunc = typeof ctrlobj.onmouseout == 'function' ? ctrlobj.onmouseout : null;
		ctrlobj.onmouseout = function() {
			if(this.outfunc) this.outfunc();
			if(!duration) jsmenu_timer[ctrlobj.id] = setTimeout('hideMenu()', timeout);
		}

		if(duration) {
			ctrlobj.clickfunc = typeof ctrlobj.onclick == 'function' ? ctrlobj.onclick : null;
			ctrlobj.onclick = function (e) {
				cancel(e);
				if(jsmenu_active == null || jsmenu_active.ctrlid != this.id) {
					if(this.clickfunc) this.clickfunc();
					else showMenu(this.id, true);
				} else {
					hideMenu();
				}
			}
		}

		ctrlobj.overfunc = typeof ctrlobj.onmouseover == 'function' ? ctrlobj.onmouseover : null;
		ctrlobj.onmouseover = function(e) {
			cancel(e);
			if(this.overfunc) this.overfunc();
			for(var id in jsmenu_timer) {
				if(jsmenu_timer[id]) clearTimeout(jsmenu_timer[id]);
			}
		}
	}
	ctrlclassName = ctrlobj.className;
	ctrlobj.className += ' hover';

	if(menuobj && !menuobj.initialized) {
		initMenu(ctrlid, menuobj, duration);
		if(!duration) {
			menuobj.onmouseover = function() {
				clearTimeout(jsmenu_timer[ctrlid]);
			}
			menuobj.onmouseout = function() {
				jsmenu_timer[ctrlid] = setTimeout('hideMenu()', timeout);
			}
		}
	}

	menuobj.style.display = '';
	menuobj.style.clip = 'rect(auto, auto, auto, auto)';
	setMenuPos(ctrlobj, menuobj);

	if(is_ie && is_ie < 7) {
		if(!jsmenu_iframe) {
			var iframe = document.createElement('iframe');
			iframe.style.display = 'none';
			iframe.style.position = 'absolute';
			iframe.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)';
			jsmenu_iframe = iframe;
			menuobj.parentNode.appendChild(jsmenu_iframe);
		}
		jsmenu_iframe.style.top = menuobj.style.top;
		jsmenu_iframe.style.left = menuobj.style.left;
		jsmenu_iframe.style.width = menuobj.w;
		jsmenu_iframe.style.height = menuobj.h;
		jsmenu_iframe.style.display = 'block';
	}

	if(menuobj.scrollHeight > 400) {
		menuobj.style.height = '400px';
		menuobj.style.overflowY = 'auto';
	}
	jsmenu_active = menuobj;
}

function setMenuPos(ctrlobj, menuobj)
{
	if(ctrlobj) 
	{
		ctrlobj.pos = getOffset(ctrlobj);
		ctrlobj.X = ctrlobj.pos['left'];
		ctrlobj.Y = ctrlobj.pos['top'];
		
		ctrlobj.w = ctrlobj.offsetWidth;
		ctrlobj.h = ctrlobj.offsetHeight;
		
		menuobj.w = menuobj.offsetWidth;
		menuobj.h = menuobj.offsetHeight;
		
		if ((ctrlobj.X + menuobj.w > document.body.clientWidth) && (ctrlobj.X + ctrlobj.w - menuobj.w >= 0))
			menuobj.style.left  = ctrlobj.X + ctrlobj.w - menuobj.w + 2 + 'px';
		else if(is_ie && is_ie >= 7)
			menuobj.style.left = ctrlobj.X + 1 + 'px';
		else
			menuobj.style.left = ctrlobj.X + 'px';
			
		if ((ctrlobj.Y + ctrlobj.h + menuobj.h > document.documentElement.scrollTop + document.documentElement.clientHeight) 
			 && (ctrlobj.Y - menuobj.h >= 0))
			menuobj.style.top = (ctrlobj.Y - menuobj.h) + 'px';
		else
			menuobj.style.top = ctrlobj.Y + ctrlobj.h + 'px';
			

		if(menuobj.style.clip) {
			menuobj.style.clip = 'rect(auto, auto, auto, auto)';
		}
	}
}

function hideMenu() {
	if(jsmenu_active) {
		try {
			$(jsmenu_active.ctrlid).className = ctrlclassName;
		} catch(e) {}
		clearTimeout(jsmenu_timer[jsmenu_active.ctrlid]);
		jsmenu_active.style.display = 'none';
		jsmenu_active = null;
		if(is_ie && is_ie < 7 && jsmenu_iframe) {
			jsmenu_iframe.style.display = 'none';
		}
	}
}

function getOffset(obj) {
	var offset_left = obj.offsetLeft;
	var offset_top = obj.offsetTop;
	while((obj = obj.offsetParent) != null) {
		offset_left += obj.offsetLeft;
		offset_top += obj.offsetTop;
	}
	if(is_ie && is_ie < 7 && !jsmenu_duration) {
		offset_left += 1;
		offset_top += 1;
	}
	return {'left':offset_left, 'top':offset_top};
}

function doMenuAction(eventobj) {
	if(!eventobj || is_ie) {
		window.event.cancelBubble = true;
		return window.event;
	} else {
		if(eventobj.target.type == 'submit') {
			eventobj.target.form.submit();
		}
		eventobj.stopPropagation();
		if (!jsmenu_duration)
			hideMenu();
		return eventobj;
	}
}

function changeStyle(styleID)
{
	var url = window.location + '';
	var p = url.indexOf("#");
	if (p > 0)
		url = url.substr(0, p);
	p = url.indexOf("style=");
	if (p > 0)
		window.location = url.substr(0, p) + "style=" + styleID;
	else if (url.indexOf("?") > 0 || url.indexOf(".html") > 0)
		window.location = url + "&style=" + styleID;
	else	
		window.location = url + "?style=" + styleID;
}