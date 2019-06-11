package com.pcitc.ecs;

import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.stereotype.Component;

import java.io.File;

/*
 * ApplicationListener事件监听
 * 作       者：xuelei.wang
 * 创建时间：2017/12/29
 * 修改编号：1
 * 描       述：ApplicationListener事件监听
 */
@Component
public class ApplicationConfig implements ApplicationListener {

    @Value("${server_url:yjzh.shzb.promace.sinopec.com:443}")
    private String serverUrl;

    @Value("${server_ap_url:yjzh.shzb.promace.sinopec.com:444}")
    private String server_ap_url;

    @Value("${hq_code:20000000}")
    private String hq_code;

    @Value("${gisserver_url:10.238.120.60:81}")
    private String gisserver_url;

    //    @Value("${web_url}")
//    private String webUrl;
    @Override
    public void onApplicationEvent(ApplicationEvent event) {
        if (event instanceof ContextRefreshedEvent) {
            ApplicationContext applicationContext = ((ContextRefreshedEvent) event).getApplicationContext();
            System.out.println("Spring 容器初始化:" + serverUrl);
            try {
                File file = applicationContext.getResource("js/common/ecs-env.js").getFile();
                String content = FileUtils.readFileToString(file, "UTF-8");
                content = StringUtils.replace(content, "{server_url}", serverUrl);
                content = StringUtils.replace(content, "{server_ap_url}", server_ap_url);
                content = StringUtils.replace(content, "{hq_code}", hq_code);
                content = StringUtils.replace(content, "{gisserver_url}", gisserver_url);
                FileUtils.writeStringToFile(file, content, "UTF-8");
                System.out.println("content:" + content);
                //
//                File file2 = applicationContext.getResource("WEB-INF/web.xml").getFile();
//                String content2 = FileUtils.readFileToString(file2, "UTF-8");
//                content2 = StringUtils.replace(content2, "{web_url}", webUrl);
//                FileUtils.writeStringToFile(file2,content2,"UTF-8");
                //
            } catch (Exception ex) {
                System.out.println(ex.getMessage());
            }
        }
    }
}