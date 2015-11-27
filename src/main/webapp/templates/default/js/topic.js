/*
	[EasyJForum] (C)2007 Hongshee Soft.
	$file: topic.js $
	$Date: 2008/1/31 $
*/

function replyTopic() 
{
	if (isClosed)
	{
		alert('此主题已经关闭，不能继续回帖  ');
		return;
	}	
	$('frmpost').action = replyUrl + "&act=reply";
	$('frmpost').subject.value = "";
	$('frmpost').content.value = "";
	$('frmpost').submit();
}

function doReply(seqno, nickname) 
{
	if (isClosed)
	{
		alert('此主题已经关闭，不能继续回帖  ');
		return;
	}	
	$('frmpost').action = replyUrl + "&act=reply";
	$('frmpost').subject.value = "Re: 回复 " + seqno + "# " + nickname + " 的帖子";
	$('frmpost').content.value = "";
	$('frmpost').submit();
}
function doQuote(seqno, nickname, createtime) 
{
	if (isClosed)
	{
		alert('此主题已经关闭，不能继续回帖  ');
		return;
	}	
	var content = $('content_' + seqno).innerHTML;
	if (content.length > 5000)
		content = '<I>引用文字太长，省略...</I>';
	$('frmpost').action = replyUrl + "&act=reply";
	$('frmpost').subject.value = "";
	$('frmpost').content.value = "<BR/><div class='quote'><h5>引用:</h5><blockquote>" + content 
						  	   + "<P class='quotefooter'>--- 原帖序号: " + seqno + "#,&nbsp; 由 <I>" + nickname 
							   + "</I> 于 " + createtime + " &nbsp;发表</P></blockquote></div><BR/>";
	$('frmpost').submit();
}

function doReport(replyId)
{
	$('frmpost').action = reportUrl + "&rid=" + replyId;
	$('frmpost').subject.value = "";
	$('frmpost').content.value = "";
	$('frmpost').submit();
}