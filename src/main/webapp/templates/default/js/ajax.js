/*
	[EasyJForum] (C)2008 Hongshee Soft.
	$file: ajax.js $
	$Date: 2008-04-08 $
*/

var AjaxUrls = new Array();

function Ajax() 
{
	var aj = new Object();
	aj.resultHandle = null;
	aj.targetUrl = '';

	aj.XMLHttpRequest = createXMLHttpRequest();

	aj.processHandle = function() {
		if(aj.XMLHttpRequest.readyState == 4 && aj.XMLHttpRequest.status == 200) {
			for(k in AjaxUrls) {
				if(AjaxUrls[k] == aj.targetUrl) {
					AjaxUrls[k] = null;
				}
			}
			aj.resultHandle(aj.XMLHttpRequest.responseXML.lastChild.firstChild.nodeValue, aj);
		}
	}

	aj.get = function(targetUrl, resultHandle) {
		if(isInArray(targetUrl, AjaxUrls)) {
			return false;
		} else {
			AjaxUrls.push(targetUrl);
		}
		aj.targetUrl = targetUrl;
		aj.XMLHttpRequest.onreadystatechange = aj.processHandle;
		aj.resultHandle = resultHandle;
		var delay = 100; 
		if(window.XMLHttpRequest) {
			setTimeout(function(){
			aj.XMLHttpRequest.open('GET', aj.targetUrl);
			aj.XMLHttpRequest.send(null);}, delay);
		} else {
			setTimeout(function(){
			aj.XMLHttpRequest.open("GET", targetUrl, true);
			aj.XMLHttpRequest.send();}, delay);
		}

	}
	return aj;
}

function createXMLHttpRequest()
{
	var request = false;
	if(window.XMLHttpRequest) {
		request = new XMLHttpRequest();
		if(request.overrideMimeType) {
			request.overrideMimeType('text/xml');
		}
	} else if(window.ActiveXObject) {
		var versions = ['Microsoft.XMLHTTP', 'MSXML.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.7.0', 'Msxml2.XMLHTTP.6.0',
						 'Msxml2.XMLHTTP.5.0', 'Msxml2.XMLHTTP.4.0', 'MSXML2.XMLHTTP.3.0', 'MSXML2.XMLHTTP'];
		for(var i=0; i<versions.length; i++) {
			try {
				request = new ActiveXObject(versions[i]);
				if(request) {
					return request;
				}
			} catch(e) {}
		}
	}
	return request;
}