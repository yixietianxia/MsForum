/*
	[EasyJForum] (C)2008 Hongshee Soft.
	$file: member.js $
	$Date: 2008/04/09 $
*/

function refreshVerifyCode(width,height) {
	$('verifycodeimage').innerHTML = '<img width="' + width + '" height="' + height + '" src="vcode" class="absmiddle"/>';
}

function checkverifycode() {
	var verifycode = trim($('verifycode').value);
	if(verifycode == '') return false;
	var cs = $('checkverifycode');
	if(!(/[0-9]{4}/.test(verifycode))) {
		warning(cs, verifycode_invalid);
		return false;
	}else{
		cs.style.display = 'none';
		return true;
	}
}

function checkpwd2() {
	var pwd = trim($('pwd1').value);
	var pwd2 = trim($('pwd2').value);
	var cp2 = $('checkpwd2');
	if(pwd != pwd2) {
		warning(cp2, passwd_dismatch);
		return false;
	} else {
		cp2.style.display = 'none';
		return true;
	}
}

function warning(obj, msg) {
	obj.style.display = '';
	obj.innerHTML = '&nbsp;' + msg;
	obj.className = "warning";
}