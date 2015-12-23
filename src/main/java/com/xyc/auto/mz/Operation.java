package com.xyc.auto.mz;

import org.openqa.selenium.WebDriver;

public class Operation {
	private String mobileName ="G9009D";
	private String user="hellozzzz00@sina.com";
	private String pwd ="poi123456";
	private String commandPath ="C://Users/Administrator/Desktop/upload.exe";
	private int num =0;
	private WebDriver wdr =null;
	
	public Operation(String mobileName,String user,String pwd,String commandPath){
		this.mobileName = mobileName;
		this.user = user;
		this.pwd = pwd;
		this.commandPath = commandPath;
	}

	public WebDriver getWdr() {
		return wdr;
	}

	public void setWdr(WebDriver wdr) {
		this.wdr = wdr;
	}

	public String getMobileName() {
		return mobileName;
	}

	public void setMobileName(String mobileName) {
		this.mobileName = mobileName;
	}

	public String getUser() {
		return user;
	}

	public void setUser(String user) {
		this.user = user;
	}

	public String getPwd() {
		return pwd;
	}

	public void setPwd(String pwd) {
		this.pwd = pwd;
	}

	public String getCommandPath() {
		return commandPath;
	}

	public void setCommandPath(String commandPath) {
		this.commandPath = commandPath;
	}

	public int getNum() {
		return num;
	}

	public void setNum(int num) {
		this.num = num;
	}
}
