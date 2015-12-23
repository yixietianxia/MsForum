package com.xyc.auto.mz;

import org.openqa.selenium.WebDriver;

public class AutoMain {

	public static void main(String[] args) throws InterruptedException {
		String username="2126333249";
		String password="nh123456";
		String url ="https://cas.utest.qq.com/qqlogin?service=http%3A%2F%2Futest.qq.com%2Fuser%2Flogin&from=utest";
		
		String mobileName1 ="G9009D";
		String user1="hellozzzz00@sina.com";
		String pwd1 ="poi123456";
		String commandPath1 ="C://Users/Administrator/Desktop/funUpload.exe guanwang.apk";
		Operation op1 =new Operation(mobileName1,user1,pwd1,commandPath1);
		
		String mobileName2 ="I9200";
		String user2="hellonh123459@sina.com";
		String pwd2 ="nh123459";
		String commandPath2 ="C://Users/Administrator/Desktop/funUpload.exe 154764368911.apk";
		Operation op2 =new Operation(mobileName2,user2,pwd2,commandPath2);
		
		WebDriver wdr =LogicHelper.getDriver();
		LogicHelper.init(wdr,url,username,password);
		LogicHelper.goChoicePage(wdr);
		op1.setWdr(wdr);
		op2.setWdr(wdr);
		
		new Thread(new AutoInstallRunnable(op1)).start();
		Thread.sleep(20000);
		new Thread(new AutoInstallRunnable(op2)).start();  
	}
}
