package com.xyc.auto.mz;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.apache.commons.lang3.StringUtils;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Selector;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.openqa.selenium.NoSuchWindowException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.interactions.Action;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.WebDriverWait;

public class LogicHelper {
	public static final int LEFT_MOVE = 1;
	public static final int RIGHT_MOVE = 2;
	
	public static void wait(WebDriver driver) {
		ExpectedCondition<Boolean> pageLoad = new ExpectedCondition<Boolean>() {
			public Boolean apply(WebDriver driver) {
				return ((JavascriptExecutor) driver).executeScript(
						"return document.readyState").equals("complete");
			}
		};
		WebDriverWait wait = new WebDriverWait(driver, 10);
		wait.until(pageLoad);
	}
	
	public static void init(WebDriver wdr,String url,String username,String pwd){
		try{
			wdr.get(url);
			wait(wdr);
			//前置操作，切换到登陆页
			try{
				wdr.findElement(By.cssSelector("#btn_nav_qq")).click();
				wdr.findElement(By.cssSelector("#switcher_plogin")).click();
			}catch(Exception e){
				System.out.println("【Login】没有找到登录按钮...");
			}
			wdr.switchTo().frame("login_frame");   
			Thread.sleep(2000);
			//需要计算登录按钮的权重
			Document doc =Jsoup.parse(wdr.getPageSource());
			List<Element> userInputList = Selector.select("input[type=\"text\"]",doc);
			for(int i=0;i<userInputList.size();i++){
				Element el = userInputList.get(i);
				try{
					wdr.findElement(By.cssSelector(el.cssSelector())).sendKeys(username);
				}catch(Exception e){
				}
			}
			
			List<Element> pwdInputList = Selector.select("input[type=\"password\"]",doc);
			for(int i=0;i<pwdInputList.size();i++){
				Element el = pwdInputList.get(i);
				try{
					wdr.findElement(By.cssSelector(el.cssSelector())).sendKeys(pwd);
				}catch(Exception e){
				}
			}	
			
			doc =Jsoup.parse(wdr.getPageSource());
			String keys="登录执行登录";
			//执行操作后可能class有变化，需要重新组合树
			doc =Jsoup.parse(wdr.getPageSource());
			doc.getElementsByAttributeValue("display", "none").remove();
			List<Element> sbList = Selector.select("input[type=\"submit\"]",doc);
			List<Element> buttonList = doc.getElementsByTag("button");
			List<Element> aList =doc.getElementsByTag("a");
			List<Element> resultList =new ArrayList<Element>();
			for(int i=0;i<aList.size();i++){
				Element el =aList.get(i);
				String text =el.text().replace(" ", "");
				if(!StringUtils.isBlank(text)&&keys.indexOf(text)>=0){
					resultList.add(el);
				}
			}
			for(int i=0;i<buttonList.size();i++){
				Element el =buttonList.get(i);
				String text =el.text().replace(" ", "");
				if(!StringUtils.isBlank(text)&&keys.indexOf(text)>=0){
					resultList.add(el);
				}
			}
			for(int i=0;i<sbList.size();i++){
				Element el =sbList.get(i);
				String text =el.attr("value").replace(" ", "");
				if(!StringUtils.isBlank(text)&&keys.indexOf(text)>=0){
					resultList.add(el);
				}
			}
			//获取一个执行登录
			for(int i=0;i<resultList.size();i++){
				Element el =resultList.get(i);
				try{
					wdr.findElement(By.cssSelector(el.cssSelector())).click();
				}catch(Exception e){
					
				}
			}
			Thread.sleep(4000);
		}catch(Exception e){
			System.out.println("【Login】登录有问题..."+e.getMessage());
		}
		/*需要验证码
		Thread.sleep(2000);
		String title ="优测网-让测试更简单";
		if(!wdr.findElement(By.tagName("title")).equals(title)){
			while(true){
			}
		}*/
		System.out.println("【Login】登录成功...");
	}
	
	public static void goChoicePage(WebDriver wdr){
		try{
		wdr.findElement(By.cssSelector("#nav-wrapper > li:nth-child(4) > a")).click();
		Thread.sleep(2000);
		wdr.findElement(By.cssSelector("body > div.banner-introduce-rent > a.begin")).click();
		}catch(Exception e){
			System.out.println("【GoChoicePage】跳到搜索手机页出错..."+e.getMessage());
		}
	}
	
	public static void choiceMobile(WebDriver wdr,String mobileName){
		try{
			wdr.findElement(By.cssSelector("#deviceListForm > input[type=\"text\"]:nth-child(5)")).sendKeys(mobileName);
			wdr.findElement(By.cssSelector("#search-btn")).click();
			Thread.sleep(2000);
			String name =wdr.findElement(By.xpath("//*[@id=\"frmApply\"]/div/div[3]/button")).getText().trim();
			if(name.equals("使用中")){
				System.out.println("【ChoiceMobile】手机已经租用...");
				throw new MyException();
			}else{
				wdr.findElement(By.xpath("//*[@id=\"frmApply\"]/div/div[3]/button")).click();
			}
			wdr.findElement(By.cssSelector("#deviceListForm > input[type=\"text\"]:nth-child(5)")).clear();
		}catch(MyException e){
		}catch(Exception e){
			System.out.println("【ChoiceMobile】选择手机有问题..."+e.getMessage());
		}
	}
	
	public static void oprFile(WebDriver wdr,String commandPath,int num){
		try{
			if(num==0){
				Thread.sleep(10000);
				switchToWindow(wdr,"远程租用");
			}
			wdr.findElement(By.cssSelector("#attachdiv > span")).click();
			Thread.sleep(800);
			Runtime.getRuntime().exec(commandPath);
			System.out.println("【oprFile】文件上传中...");
			while(true){
				try{
					String text =wdr.findElement(By.cssSelector("#alert-message")).getText().trim();
					if(text.equals("安装成功!")){
						wdr.findElement(By.cssSelector("#alert-button")).click();
						break;
					}
					Thread.sleep(600);
				}catch(Exception e){
				}
			}
		}catch(Exception e){
			System.out.println("【OprFile】文件上传出错..."+e.getMessage());
		}
	}
	
	public static void loginMiZ(WebDriver wdr,String name,String pwd,int num){
		try{
			if(num==0){
				Thread.sleep(5000);
				WebElement wel =wdr.findElement(By.cssSelector("#ecanvas"));
				//点击老用户登录
				screenClick(wdr,wel,265,590,1);
				screenClick(wdr,wel,260,580,1);
				screenClick(wdr,wel,255,570,1);
				screenClick(wdr,wel,250,565,1);
				screenClick(wdr,wel,245,560,1);
				Thread.sleep(2000);
				//点击用户名框
				screenClick(wdr,wel,280,140,1);
				wel.sendKeys(Keys.chord(name));
				wel.sendKeys(Keys.chord(Keys.DOWN));
				wel.sendKeys(Keys.chord(pwd));
				wel.sendKeys(Keys.chord(Keys.DOWN));
				screenClick(wdr,wel,150,220,1);
				Thread.sleep(5000);
			}else{
				Thread.sleep(5000);
				WebElement wel =wdr.findElement(By.cssSelector("#ecanvas"));
				screenClick(wdr,wel,265,590,1);
				screenClick(wdr,wel,260,580,1);
				screenClick(wdr,wel,255,570,1);
				screenClick(wdr,wel,250,565,1);
				screenClick(wdr,wel,245,560,1);
			}
		}catch(Exception e){
			if(num==0){
				System.out.println("【LoginMiZ】登录米赚出错..."+e.getMessage());
			}else{
				System.out.println("【LoginMiZ】初始化有异常..."+e.getMessage());
			}
		}
	}
	
	public static void addTime(WebDriver wdr , int num){
		try{
			wdr.findElement(By.cssSelector("#too")).click();
		}catch(Exception e){
			System.out.println("【AddTime】添加时间出错..."+e.getMessage());
		}
	}
	
	public static void installApp(WebDriver wdr){
		try{
			Thread.sleep(3000);
			WebElement wel =wdr.findElement(By.cssSelector("#ecanvas"));
			sendMove(wdr,wel,1,LEFT_MOVE);
			//选择下载app
			screenClick(wdr,wel,280,180,1);
			Thread.sleep(5000);
			//下载
			screenClick(wdr,wel,280,570,1);
			screenClick(wdr,wel,280,580,1);
			Thread.sleep(25000);
			//安装
			screenClick(wdr,wel,300,580,7);
			Thread.sleep(20000);
			
			//特殊
			screenClick(wdr,wel,280,570,1);
			screenClick(wdr,wel,280,580,1);
			Thread.sleep(2000);
			sendMove(wdr,wel,5,LEFT_MOVE);
			screenClick(wdr,wel,280,570,1);
			screenClick(wdr,wel,280,580,1);
			Thread.sleep(301000);
			wdr.findElement(By.cssSelector("#back"));
			WebElement back =wdr.findElement(By.cssSelector("#back"));
			back.click();
			Thread.sleep(200);
			back.click();
			Thread.sleep(200);
			back.click();
			Thread.sleep(200);
			back.click();
			Thread.sleep(200);
			back.click();
			Thread.sleep(200);
			back.click();
			Thread.sleep(5000);
			
			wdr.findElement(By.cssSelector("#home")).click();
		}catch(Exception e){
			System.out.println("【InstallApp】下载APP安装出错..."+e.getMessage());
		}
	}
	
	public static WebDriver getDriver(){
		String FIREFOX_KEY ="webdriver.firefox.bin";
		String FIREFOX_VALUE = "C://Program Files/Mozilla Firefox/firefox.exe";
		WebDriver wdr =null;
		System.setProperty(FIREFOX_KEY,FIREFOX_VALUE);
		if(wdr == null){
			wdr = new FirefoxDriver();
		}
		wdr.manage().window().maximize();
		return wdr;
	}
	
	public static void screenClick(WebDriver driver,WebElement wel,int x,int y,int num){
		try{
			Actions actions = new Actions(driver); 
			for(int i=0; i<num;i++){
				Action action = null; 
				actions.moveToElement(wel, x, y).click();  
		        action = actions.build();  
		        action.perform(); 
		        Thread.sleep(800);
			}
		}catch(Exception e){
			System.out.println("点击事件失败...");
		}
	}
	
	public static void sendMove(WebDriver driver, WebElement wel,int num, int dirt){
		try{
			Actions actions = new Actions(driver); 
			for(int i=0; i<num;i++){
				Action action = null; 
				if(dirt ==LEFT_MOVE){
					actions.moveToElement(wel, 300, 330).clickAndHold().moveToElement(wel, 0, 330).release();  
				}else{
					actions.moveToElement(wel, 0, 330).clickAndHold().moveToElement(wel, 300, 330).release();  
				}
		        action = actions.build();  
		        action.perform(); 
		        Thread.sleep(800);
			}
		}catch(Exception e){
			System.out.println("滑动事件失败...");
		}
	}
	
	public static boolean switchToWindow(WebDriver driver,String windowTitle){  
	    boolean flag = false;  
	    try {  
	        String currentHandle = driver.getWindowHandle();  
	        Set<String> handles = driver.getWindowHandles();  
	        for (String s : handles) {  
	            if (s.equals(currentHandle))  
	                continue;  
	            else {  
	                driver.switchTo().window(s);  
	                if (driver.getTitle().contains(windowTitle)) {  
	                    flag = true;  
	                    break;  
	                } else  
	                    continue;  
	            }  
	        }  
	    } catch (NoSuchWindowException e) {  
	        System.out.println("Window: " + windowTitle+ " cound not found!");  
	        flag = false;  
	    }  
	    return flag;  
	} 

}
