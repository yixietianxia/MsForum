/*
	[EasyJForum] (C)2007 Hongshee Soft.
	$file: editor.js $
	$Date: 2007/11/30 $
*/

var editbox, editwin, editdoc;
var editcss = null;
var initialized = false;

function setContent(text) 
{
	if(wysiwyg) {
		if(trim(text) == '' && !is_ie) {
			text = '<br/>';
		}
		if(!initialized) {
			initEditDoc();
		}
		editdoc.body.innerHTML = text;
	} else {
		textobj.value = text;
	}
	setEditorStyle();
}

function createEditor(mode, initialtext) 
{
	wysiwyg = parseInt(mode);
	$('htmlmode').className = wysiwyg ? 'editor_switcher' : '';
	$('wysiwygmode').className = wysiwyg ? '' : 'editor_switcher';
	if(is_ie && is_ie >= '8.0')
	{
		$('htmlmode').style.marginBottom = "-1px";
		$('wysiwygmode').style.marginBottom = "-1px";
	}

	if(wysiwyg) {
		if($('htmleditor_iframe')) {
			editbox = $('htmleditor_iframe');
		} else {
			var iframe = document.createElement('iframe');
			editbox = textobj.parentNode.appendChild(iframe);
			editbox.id = 'htmleditor_iframe';
		}
		editwin = editbox.contentWindow;
		editdoc = editwin.document;
		if(!is_firefox || is_firefox >= '3.0')
		{
			initialized = false;
			editcss = null;
		}
		setContent(typeof(initialtext)=='undefined' ? textobj.value : initialtext);
	} else {
		editbox = editwin = editdoc = textobj;
		if(typeof(initialtext)!='undefined') {
			setContent(initialtext);
		}
	}
	setEditorEvents();
	initEditor();
}

function initEditor() 
{
	var buttons = $('htmleditor_controls').getElementsByTagName('a');
	for(var i = 0; i < buttons.length; i++) {
		if(buttons[i].id.indexOf('htmleditor_cmd_') != -1) {
			buttons[i].href = '###';
			buttons[i].onclick = function(e) {ejfcode(this.id.substr(this.id.lastIndexOf('_cmd_') + 5))};
		}else if(buttons[i].id.indexOf('htmleditor_popup_') != -1) {
			buttons[i].href = '###';
			buttons[i].onclick = function(e) {
				$((this.id + '_menu')).style.display == "none" ? showMenu(this.id, true) : hideMenu();
			};
		}
	}
	setUnselectable($('htmleditor_controls'));
	textobj.onselect = textobj.onclick = textobj.onkeyup = saveCaret;
	textobj.onkeydown = validateKeys;
	textobj.onbeforepaste = validatePaste;
	$('htmlmode').onclick = function(e) {switchEditor(0)};
	$('wysiwygmode').onclick = function(e) {switchEditor(1)};
}

function setUnselectable(obj)
{
	if(is_ie && typeof(obj.tagName) != 'undefined') {
		if(obj.hasChildNodes()) {
			for(var i = 0; i < obj.childNodes.length; i++) {
				setUnselectable(obj.childNodes[i]);
			}
		}
		obj.unselectable = 'on';
	}
}

function initEditDoc()
{
	editdoc.designMode = 'on';
	editdoc = editwin.document;
	editdoc.open('text/html', 'replace');
	if (is_ie)
		editdoc.write('');
	else
		editdoc.write('<br/>');
	editdoc.close();
	editdoc.body.contentEditable = true;
	initialized = true;
}

function getContent()
{
	return wysiwyg ? editdoc.body.innerHTML : editdoc.value;
}

function setEditorStyle() {
	if(wysiwyg) {
		textobj.style.display = 'none';
		editbox.style.display = '';

		if(editcss == null) {
			var cssarray = [forumcss, editorcss];
			for(var i = 0; i < 2; i++) {
				editcss = editdoc.createElement('link');
				editcss.type = 'text/css';
				editcss.rel = 'stylesheet';
				editcss.href = cssarray[i];
				var headNode = editdoc.getElementsByTagName("head")[0];
				if (typeof(headNode) == "undefined") {
					headNode = editdoc.createElement('head');
					editdoc.documentElement.appendChild(headNode);
				}
				headNode.appendChild(editcss);
			}	
		}

		if (is_chrome) $('editor_panel').style.marginTop = "-1px";

		if(is_ie) {
			editdoc.body.style.border = '1px';
			editdoc.body.addBehavior('#default#userData');
		} else {
			editbox.style.border = '0px';
		}
		editdoc.body.className = "editor_doc";
		editbox.style.width = textobj.style.width;
		editbox.style.height = textobj.style.height;
		editdoc.body.style.textAlign = 'left';
		editdoc.body.id = 'wysiwyg';

	} else {
		var iframe = textobj.parentNode.getElementsByTagName('iframe')[0];
		if(iframe) {
			textobj.style.display = '';
			textobj.style.width = iframe.style.width;
			textobj.style.height = iframe.style.height;
			iframe.style.display = 'none';
		}
	}
}

function setEditorEvents() 
{
	if(wysiwyg) {
		if(is_ie) {
			editdoc.onmouseup = function(e) {renderContext();filtText();};
			editdoc.onkeyup = function(e) {renderContext();};
		} else {
			editdoc.addEventListener('mouseup', function(e) {renderContext();filtText();}, true);
			editdoc.addEventListener('keyup', function(e) {renderContext();}, true);
			editwin.addEventListener('focus', function(e) {this.hasfocus = true;}, true);
			editwin.addEventListener('blur', function(e) {this.hasfocus = false;}, true);
		}
	}
	editwin.onfocus = function(e) {this.hasfocus = true;};
	editwin.onblur = function(e) {this.hasfocus = false;};
}

function filtText()
{
	if (window.clipboardData && window.clipboardData.getData("text") != null)
		window.clipboardData.setData("text", window.clipboardData.getData("text"));
}

function getCaret() 
{
	var obj = editdoc.body;
	var sel = document.selection.createRange();
	sel.setEndPoint("StartToStart", obj.createTextRange());
	return sel.text.replace(/\r?\n/g, ' ').length;
}

function setCaret(pos) 
{
	var obj = wysiwyg ? editdoc.body : editbox;
	var txt = obj.createTextRange();
	txt.moveStart('character', pos);
	txt.collapse(true);
	txt.select();
}

function saveCaret()
{
	if(textobj.createTextRange){
		textobj.caretPos = document.selection.createRange().duplicate();
	}
}

function validateKeys(e)
{
	if (allowhtml)
		return true;
	else
	{
		e = e ? e : event;
    	if((e.keyCode>=65 && e.keyCode<=90) || (e.keyCode>=97 && e.keyCode<=122))
			return false;
	    else 
    	    return true;
	}
}

function validatePaste(e)
{
	if (allowhtml)
		return true;
	else
		return false;
}

function editMenu_keydown(e) 
{
	e = e ? e : event;
	var ctrlid = this.id.substr(0, this.id.lastIndexOf('_param_'));
	if((this.type == 'text' && e.keyCode == 13) 
		|| (this.type == 'textarea' && e.ctrlKey && e.keyCode == 13)) {
		$(ctrlid + '_submit').click();
		cancel(e);
	}else if(e.keyCode == 27) {
		hideMenu();
		document.body.removeChild($(ctrlid + '_menu'));
	}
}

function createEditMenu(ctrlid, text) 
{
	var div = document.createElement('div');
	div.id = ctrlid + '_menu';
	div.className = 'popmenu_popup';
	div.style.display = 'none';
	document.body.appendChild(div);
	div.innerHTML = '<div unselectable="on">' + text 
				  + '<br/><p align=center style="padding-top:6px"><input type="button" id="' + ctrlid 
				  + '_submit" value="' + msgs['submit'] 
				  + '" style="height:24px; line-height:18px"/> &nbsp; <input type="button" onClick="hideMenu();try{document.body.removeChild(' 
				  + div.id + ')}catch(e){}" value="' + msgs['cancel'] + '" style="height:24px; line-height:18px"/></p></div>';
	showMenu(ctrlid, true);
	return div;
}

function ejfcode(cmd, arg) 
{
	if (!wysiwyg) return;
	checkFocus();
	if(isInArray(cmd, ['quote', 'code'])) {
		var sel, pos;
		if(is_ie) {
			sel = editdoc.selection.createRange();
			pos = getCaret();
		}
		var selection = sel ? sel.htmlText : getSel();
		selection = trim(selection);
		var tmpStr = selection.toLowerCase().replace(/&nbsp;|\s/ig,'');
		tmpStr = tmpStr.replace(/<(.+)><\/\1>/ig,'');
		tmpStr = tmpStr.replace(/<p[^>]*><\/p>/ig,'');
		if (tmpStr == '')
			selection = '';
		if(selection) {
			if (cmd == 'quote')
				selection = "<BR/><div class='quote'><h5>"+msgs['quote']+":</h5><blockquote>"+selection
						  +"</blockquote></div><BR/>";
			else if (cmd == "code")
				selection = "<BR/><div class='anycode'><code>"+selection+"</code></div><BR/>";
			insertHTML(selection, 0, 0, true, sel);
		} else {
			var ctrlid = 'htmleditor_cmd_' + cmd;
			var text = 
				msgs['enter_'+cmd+'_title'] + '<br/><textarea id="'+ctrlid+'_param_1" cols="80" rows="10"></textarea>';
			var div = createEditMenu(ctrlid, text);
			$(ctrlid + '_param_1').focus();
			$(ctrlid + '_param_1').onkeydown = editMenu_keydown;
			$(ctrlid + '_submit').onclick = function() {
				checkFocus();
				if(is_ie) setCaret(pos);
				var txt = selection ? selection : $(ctrlid + '_param_1').value;
				txt = txt.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/ /g, '&nbsp;');
				txt = txt.replace(/\r?\n/g, '<br/>');
				if (cmd == 'quote')
					txt = "<BR/><div class='quote'><h5>"+msgs['quote']+":</h5><blockquote>"+txt+"</blockquote></div><BR/>";
				else if (cmd == "code")
					txt = "<BR/><div class='anycode'><code>"+txt+"</code></div><BR/>";
				insertHTML(txt, 0, 0, false, sel);
				hideMenu();
				document.body.removeChild(div);
			}
		}
	}else if(isInArray(cmd, ['url', 'img', 'media'])) {
		insertLink(cmd);
	}else{
		try {
			editdoc.execCommand(cmd, false, (typeof(arg)=='undefined' ? true : arg));
		} catch(e) {
			// Ignored
		}
	}
	renderContext(cmd);
}

function renderContext(cmd) 
{
	var fcolor = editdoc.queryCommandValue('forecolor');
	$('htmleditor_color_bar').style.backgroundColor = RGBToColor(fcolor);

	var ftname = editdoc.queryCommandValue('fontname');
	if(ftname == '' && !is_ie && window.getComputedStyle) {
		ftname = editdoc.body.style.fontFamily;
	} else if(ftname == null) {
		ftname = '';
	}
	ftname = ftname ? ftname : 'Helvetica';
	if(ftname != $('htmleditor_font_out').fontstate) {
		var ft1 = ftname.indexOf(',') > 0 ? ftname.substr(0, ftname.indexOf(',')) : ftname;
		$('htmleditor_font_out').innerHTML = ft1;
		$('htmleditor_font_out').fontstate = ftname;
	}

	var ftsize = editdoc.queryCommandValue('fontsize');
	if(ftsize == null || ftsize == '') {
		ftsize = getFontSize(editdoc.body.style.fontSize);
	}
	if(ftsize != $('htmleditor_size_out').sizestate) {
		if($('htmleditor_size_out').sizestate == null) {
			$('htmleditor_size_out').sizestate = '';
		}
		$('htmleditor_size_out').innerHTML = ftsize;
		$('htmleditor_size_out').sizestate = ftsize;
	}
}

function getFontSize(ftsize) 
{
	switch(ftsize) {
		case '7.5pt':
		case '10px': return 1;
		case '10pt': return 2;
		case '12pt': return 3;
		case '14pt': return 4;
		case '18pt': return 5;
		case '24pt': return 6;
		case '36pt': return 7;
		default: return 3;
	}
}

function chooseColor(obj, state) 
{
	obj.style.cursor = 'pointer';
	var mode = state == 'mouseover' ? 'hover' : 'normal';
	obj.className = 'color_' + mode;
}

function getSel() 
{
	if(is_ie) {
		var range = editdoc.selection.createRange();
		if(range.htmlText && range.text) {
			return range.htmlText;
		} else {
			var htmltext = '';
			for(var i = 0; i < range.length; i++) {
				htmltext += range.item(i).outerHTML;
			}
			return htmltext;
		}
	} else {
		selection = editwin.getSelection();
		checkFocus();
		range = selection ? selection.getRangeAt(0) : editdoc.createRange();
		return getNodeHtml(range.cloneContents(), false);
	}
}

function insertLink(cmd) 
{
	var sel, pos;
	if(is_ie) {
		sel = editdoc.selection.createRange();
		pos = getCaret();
	}
	var selection = sel ? sel.htmlText : getSel();
	selection = trim(selection);
	var tmpStr = selection.toLowerCase().replace(/&nbsp;|\s/ig,'');
	tmpStr = tmpStr.replace(/<(.+)><\/\1>/ig,'');
	tmpStr = tmpStr.replace(/<p[^>]*><\/p>/ig,'');
	if (tmpStr == '')
		selection = '';
		
	var ctrlid = 'htmleditor_cmd_' + cmd;
	var text = msgs['enter_'+cmd+'_link']+'<br/><input type="text" id="'+ctrlid+'_param_1" size=50 maxlength=1000><br/>'
			  + msgs['enter_'+cmd+'_title']+'<br/><input type="text" id="'+ctrlid+'_param_2" size=50 maxlength=100>';
	var div = createEditMenu(ctrlid, text);
	
	$(ctrlid + '_param_1').focus();
	$(ctrlid + '_param_1').onkeydown = editMenu_keydown;
	$(ctrlid + '_param_2').onkeydown = editMenu_keydown;
	$(ctrlid + '_submit').onclick = function() {
		checkFocus();
		if(is_ie) {
			setCaret(pos);
		}
		var href = trim($(ctrlid + '_param_1').value);
		var title = trim($(ctrlid + '_param_2').value);
		if(href != '') {
			if (cmd == 'url')
			{
				title = selection ? selection : title;
				if (title == '')
					title = href;
			}
			href = /^(www\.)/.test(href) ? 'http://'+href : href;
			var txt = getLinkText(cmd, href, title);
			var offset = 0;
			if (cmd == 'url') 
				offset = txt.length - title.length;
			insertHTML(txt, offset, 0, (selection ? true : false), sel);
		}
		hideMenu();
		document.body.removeChild(div);
	}
}

function getLinkText(cmd, href, title)
{
	var result = '';
	if (cmd == 'url')
		result = '<a href="' + href + '" target="_blank">' + title + '</a>';
	else if (cmd == 'img')
		result = '[img="' + href + '"]' + title + '[/img]';
	else if (cmd == 'media')
		result = '[media="' + href + '"]' + title + '[/media]';
	return result;
}

function insertHTML(text, offset, end, selected, sel)
{
	checkFocus();
	if(is_ie) {
		if(typeof(editdoc.selection)!='undefined' 
				  && editdoc.selection.type != 'Text' && editdoc.selection.type != 'None') {
			offset = false;
			editdoc.selection.clear();
		}
		if(typeof(sel)=='undefined') {
			sel = editdoc.selection.createRange();
		}
		sel.pasteHTML(text);
		if(text.indexOf('\n') == -1) {
			if(typeof(offset)!='undefined') {
				sel.moveStart('character', offset-strlen(text));
				sel.moveEnd('character', -end);
			} else if(offset != false) {
				sel.moveStart('character', -strlen(text));
			}
			if(typeof(selected)!='undefined' && selected) {
				sel.select();
			}
		}
	} else {
		editdoc.execCommand('removeformat', false, true);
		var frag = editdoc.createDocumentFragment();
		var tmpNode = editdoc.createElement('span');
		tmpNode.innerHTML = text;
		while (tmpNode.firstChild) {
			frag.appendChild(tmpNode.firstChild);
		}
		insertNodeAtSel(frag);
	}
}

function clearContent() 
{
	if(wysiwyg) {
		editdoc.body.innerHTML = is_ie ? '' : '<br/>';
	} else {
		textobj.value = '';
	}
}

function resizeEditor(y) 
{
	var obj = wysiwyg ? editbox : textobj;
	var height_new = parseInt(obj.style.height, 10) + y;
	if(height_new >= 100) {
		obj.style.height = height_new + 'px';
	}
}

function checkFocus()
{
	var obj = wysiwyg ? editwin : textobj;
	if(!obj.hasfocus) obj.focus();
}

function insertSmile(smileid) 
{
	checkFocus();
	var src = $('smile_' + smileid).src;
	var code = $('smile_' + smileid).alt;
	var title = $('smile_' + smileid).title;
	
	if(typeof wysiwyg != 'undefined' && wysiwyg) {
		if(is_ie) {
			insertHTML('<img src="' + src + '" border="0" align="absbottom" smileid="' + smileid + '" alt="' + code + '" title="' + title + '"/>', 
					   false);
		} else {
			editdoc.execCommand('InsertImage', false, src);
			var smileImgs = editdoc.body.getElementsByTagName('img');
			for(var i = 0; i < smileImgs.length; i++) {
				if(smileImgs[i].src == src && smileImgs[i].getAttribute('smileid') < 1) {
					smileImgs[i].setAttribute('smileid', smileid);
					smileImgs[i].setAttribute('border', "0");
					smileImgs[i].setAttribute('align', "absbottom");
					smileImgs[i].setAttribute('alt', code);
					smileImgs[i].setAttribute('title', title);
				}
			}
		}
	} else {
		var txt = '<img src="' + src + '" border="0" align="absbottom" smileid="' + smileid + '" alt="' + code + '" title="' + title + '"/>';
		var selection = document.selection;
		checkFocus();
		if(typeof(textobj.selectionStart)!='undefined') {
			textobj.value = textobj.value.substr(0, textobj.selectionStart) + txt + textobj.value.substr(textobj.selectionEnd);
		} else if(selection && selection.createRange) {
			var sel = selection.createRange();
			sel.text = txt;
			sel.moveStart('character', -strlen(txt));
		} else {
			textobj.value += txt;
		}
	}
}

function setCaretAtEnd() {
	var obj = (typeof(wysiwyg) == 'undefined' || !wysiwyg) ? textobj : editwin;
	if(typeof(wysiwyg) != 'undefined' && wysiwyg) {
		if(is_ie) {
			var sel = editdoc.selection.createRange();
			sel.moveStart('character', strlen(getContent()));
			sel.select();
		}
	} else {
		if(obj.createTextRange)  {
			var sel = obj.createTextRange();
			sel.moveStart('character', strlen(obj.value));
			sel.collapse();
			sel.select();
		}
	}
}

function switchEditor(mode) 
{
	mode = parseInt(mode);
	if(mode != wysiwyg)
	{
		var parsedtext = getContent();
		wysiwyg = mode;
		createEditor(mode, parsedtext);
		editwin.focus();
		setCaretAtEnd();
	}
}

function RGBToColor(forecolor) 
{
	if(is_ie) {
		return hexRGBToColor((forecolor & 0xFF).toString(16), ((forecolor >> 8) & 0xFF).toString(16), 
							  ((forecolor >> 16) & 0xFF).toString(16));
	}
	if(forecolor == '' || forecolor == null) {
		forecolor = window.getComputedStyle(editdoc.body, null).getPropertyValue('color');
	}
	if(forecolor.toLowerCase().indexOf('rgb') == 0) {
		var matches = forecolor.match(/^rgb\s*\(([0-9]+),\s*([0-9]+),\s*([0-9]+)\)$/);
		if(matches) {
			forecolor = hexRGBToColor((matches[1] & 0xFF).toString(16), 
						 			  (matches[2] & 0xFF).toString(16), 
							 		  (matches[3] & 0xFF).toString(16));
		} else {
			forecolor = RGBToColor(null);
		}
	}
	return forecolor;
}

function hexRGBToColor(r, g, b) 
{
	var coloroptions = {'#000000' : 'Black', '#a0522d' : 'Sienna', '#556b2f' : 'DarkOliveGreen', '#006400' : 'DarkGreen', 
						'#483d8b' : 'DarkSlateBlue', '#000080' : 'Navy', '#4b0082' : 'Indigo', '#2f4f4f' : 'DarkSlateGray', 
						'#8b0000' : 'DarkRed', '#ff8c00' : 'DarkOrange', '#808000' : 'Olive', '#008000' : 'Green', 
						'#008080' : 'Teal', '#0000ff' : 'Blue', '#708090' : 'SlateGray', '#696969' : 'DimGray', 
						'#ff0000' : 'Red', '#f4a460' : 'SandyBrown', '#9acd32' : 'YellowGreen', '#2e8b57' : 'SeaGreen', 
						'#48d1cc' : 'MediumTurquoise', '#4169e1' : 'RoyalBlue', '#800080' : 'Purple', '#808080' : 'Gray', 
						'#ff00ff' : 'Magenta', '#ffa500' : 'Orange', '#ffff00' : 'Yellow', '#00ff00' : 'Lime', 
						'#00ffff' : 'Cyan', '#00bfff' : 'DeepSkyBlue', '#9932cc' : 'DarkOrchid', '#c0c0c0' : 'Silver', 
						'#ffc0cb' : 'Pink', '#f5deb3' : 'Wheat', '#fffacd' : 'LemonChiffon', '#98fb98' : 'PaleGreen', 
						'#afeeee' : 'PaleTurquoise', '#add8e6' : 'LightBlue', '#dda0dd' : 'Plum', '#ffffff' : 'White'};
	return coloroptions['#' + (getHexStr(r) + getHexStr(g) + getHexStr(b))];
}

function getHexStr(str)
{
	str = str + '';
	while(str.length < 2) { str = '0' + str; }
	return str;
}

function addSelRange(node)
{
	checkFocus();
	var sel = editwin.getSelection();
	var range = editdoc.createRange();
	range.selectNodeContents(node);
	sel.removeAllRanges();
	sel.addRange(range);
}

function insertNodeAtSel(text) 
{
	var sel = editwin.getSelection();
	var range = sel ? sel.getRangeAt(0) : editdoc.createRange();

	sel.removeAllRanges();
	range.deleteContents();
	
	var node = range.startContainer;
	var pos = range.startOffset;

	switch(node.nodeType) {
		case Node.ELEMENT_NODE:
			var selNode = text.firstChild;
			node.insertBefore(text, node.childNodes[pos]);
			addSelRange(selNode);
			break;
		case Node.TEXT_NODE:
			node = node.splitText(pos);
			var selNode = text.firstChild;
			node.parentNode.insertBefore(text, node);
			addSelRange(selNode);
			break;
	}
}

function getNodeHtml(root, isTopNode) 
{
	var result = "";
	switch(root.nodeType) {
		case Node.TEXT_NODE:
			result = root.data;
			break;
		case Node.ELEMENT_NODE:
		case Node.DOCUMENT_FRAGMENT_NODE:
			var isOver;
			if(isTopNode) {
				isOver = !root.hasChildNodes();
				result = '<' + root.tagName.toLowerCase();
				var attrs = root.attributes;
				var moz = /_moz/i;
				for(var i = 0; i < attrs.length; ++i) {
					var attr = attrs.item(i);
					if(!attr.specified || attr.name.match(moz) || attr.value.match(moz)) {
						continue;
					}
					result += " " + attr.name.toLowerCase() + '="' + attr.value + '"';
				}
				result += isOver ? "/>" : ">";
			}
			for(var child = root.firstChild; child; child = child.nextSibling) {
				result += getNodeHtml(child, true);
			}
			if(isTopNode && !isOver) {
				result += "</" + root.tagName.toLowerCase() + ">";
			}
			break;
	}
	return result;
}