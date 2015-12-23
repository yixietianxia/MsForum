package com.xyc.auto.mz;

public class AutoInstallRunnable implements Runnable {
	private Operation oper ;
	
	public AutoInstallRunnable(Operation oper){
		this.oper = oper;
	}

	public void run() {
		if(oper.getNum()==0){
			LogicHelper.choiceMobile(oper.getWdr(), oper.getMobileName());
		}
		//上传文件
		LogicHelper.oprFile(oper.getWdr(),oper.getCommandPath(),oper.getNum());
		//apk实现登录
		LogicHelper.loginMiZ(oper.getWdr(),oper.getUser(),oper.getPwd(),oper.getNum());
		//apk安装应用
		LogicHelper.installApp(oper.getWdr());
		oper.setNum(oper.getNum()+1);
		System.out.println("账号："+oper.getUser()+",安装了"+oper.getNum()+"个app...");
	}

}
