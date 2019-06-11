package com.pcitc.ecs.filter;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.impl.DefaultClaims;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.*;
import org.jasig.cas.client.util.AssertionHolder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.ResourceUtils;

import javax.servlet.*;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.security.PublicKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
//import com.pcitc.ecs.utils.HttpConnection;

/*
 * 权限过滤器
 * 作       者：dongsheng.zhao
 * 创建时间：2017/12/22
 * 修改编号：1
 * 描       述：基础数据实现类
 */
@Component("authFilter")
public final class AuthFilter implements Filter {
//    @Value("${ip.aaa.web.login}")
//    private String loginUrl;
//    Logger logger = LogManager.getLogger(this.getClass());

    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    /**
     * 初始化
     *
     * @param filterConfig 是否启用权限过滤
     * @author dongsheng.zhao 2017-12-22
     */
    @Override
    public void init(final FilterConfig filterConfig) throws ServletException {

    }

    /**
     * 权限过滤
     *
     * @param request  请求
     * @param response 回复
     * @param chain    过滤链
     * @author dongsheng.zhao 2017-12-22
     */
    @Override
    public void doFilter(final ServletRequest request, final ServletResponse response, final FilterChain chain)
            throws IOException, ServletException {
        final HttpServletResponse httpServletResponse = (HttpServletResponse) response;
        final HttpServletRequest req = (HttpServletRequest) request;
        final Cookie[] cookies = req.getCookies();
//        if (cookies == null) {
//            System.out.println("客户端已经禁用Cookie");
//            throw new ServletException("客户端已经禁用Cookie");
//            //httpServletResponse.sendRedirect(httpServletResponse.encodeURL(httpServletRequest.getRequestURL().toString()));
//            //return;
//        }
//        HttpSession curSession = httpServletRequest.getSession();

        String loginName = "<unknown>";
        logger.info("<unknown>");
        System.out.println("<unknown>");

        String username_c="<from_cookie>";
        String tokenString = "<token>";

        if(cookies!=null && cookies.length>0){
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals("username")) {
                    username_c = cookie.getValue();
                }
                if (cookie.getName().equals("SYS_CONTEXT_TOKEN")) {
                    tokenString = cookie.getValue();
                }
            }
            //如果已经设置了token，跳过处理
            if(!tokenString.equals("<token>")) {
                chain.doFilter(request, response);
                return;
            }
        }

        String username_h = req.getHeader("username");
        String username_p = req.getParameter("userCode");

        if(!username_c.equals("<from_cookie>"))
        {
            loginName = username_c;
            logger.info("username_c:" + username_c);
//            System.out.println("username_c:" + username_c);
        }
        else if(username_h!=null && !username_h.isEmpty())
        {
            loginName = username_h;
            logger.info("username_h:" + username_h);
//            System.out.println("username_h:" + username_h);
        }
        else if(username_p!=null && !username_p.isEmpty()){
            loginName = username_p;
            logger.info("username_p:" + username_p);
            System.out.println("username_p:" + username_p);
//            Cookie token1 = new Cookie("username", username_p);
//            token1.setPath("/");
//            token1.setDomain("sinopec.com");
//            httpServletResponse.addCookie(token1);
        }

//         String saml_idp_token = httpServletRequest.getHeader("saml_idp_token");
//         logger.info("saml_idp_token: " + saml_idp_token);
//         System.out.println("saml_idp_token: " + saml_idp_token);
//         HashMap<String, Cookie> cookieMap = new HashMap<String, Cookie>();
//        for (int i = 0; i < cookies.length; i++) {
//            cookieMap.put(cookies[i].getName(), cookies[i]);
//            logger.info("cookies=" + cookies[i].getName() + " value=" + cookies[i].getValue() + " path="+cookies[i].getDomain() + cookies[i].getPath() );
//        }
//        RestHttpClient client = new RestHttpClient("A92B5CC8FAA5A75BEE8EDD22DC6EA656");
//        String respond = client.doGet("http://aaa.portal.shzb.promace.sinopec.com/OrgAndUserService/users/zhangjy3658");
//        String respond = client.doGet("http://portal.shzb.promace.sinopec.com:80/userCode");
//        HttpConnection conn = new HttpConnection();
//        try {
//            String a = conn.getRequest("https://xxx.com/login.action", 3000);
//        } catch (Exception e) {
//            e.printStackTrace();
//        }
//        logger.info("userCode=" + respond);
//        String sid = cookies["JSESSIONID"].getValue();



        //2019-5-9 移动到独立的函数里
        //getIpAddress(httpServletRequest, httpServletResponse);


             //通过CAS的API获得登陆账号
         else if (AssertionHolder.getAssertion() != null && AssertionHolder.getAssertion().getPrincipal() != null) {
             logger.info("通过CAS的API获得登陆账号");
             loginName = AssertionHolder.getAssertion().getPrincipal().getName();
             logger.info("loginName:"+ loginName);
//             Cookie token2 = new Cookie("OK", "OK");
//             token2.setPath("/");
//             httpServletResponse.addCookie(token2);
         } else {
//             重新登录
//                httpServletResponse.sendRedirect("https://promace.pcitc.com:8443/cas/login");
//                return;
//                final Cookie[] cookies = httpServletRequest.getCookies();
//
//                String userName = null;
//                try {
//                    for (int i = 0; i < cookies.length; i++) {
//                        final Cookie cookie = cookies[i];
//                        if (!"UserName".equals(cookie.getName())) {
//                            continue;
//                        }
//                        userName = cookie.getValue();
//                    }
//                    if (userName == null) {
//                        httpServletResponse.sendRedirect("https://promace.pcitc.com:8443/cas/login");
//                        return;
//                    }
//                } catch (final Exception e) { }
         }
        Cookie token1 = new Cookie("username", loginName);
        token1.setPath("/");
//        token1.setDomain("sinopec.com");
        httpServletResponse.addCookie(token1);
        Cookie token2 = new Cookie("LoginName", loginName);
        token2.setPath("/");
        httpServletResponse.addCookie(token2);
         //
         HashMap<String, Object> map = new HashMap<String, Object>();
         map.put("c","36560000");
         //Claims cs = (Claims) map.put("c","36560000");

         //SysContext sc=GetSysContext(loginName,httpServletRequest);
         String result = Jwts.builder()
                 .setClaims(map)
                 .setSubject(loginName)
                 .setIssuedAt(new Date())
                 .signWith(SignatureAlgorithm.HS256, "ecs_secret_key")
                 .compact();

         Cookie token = new Cookie("SYS_CONTEXT_TOKEN", result);
         token.setPath("/");
         token.setHttpOnly(true);
         httpServletResponse.addCookie(token);


 //        System.out.println(httpServletRequest.getRequestedSessionId());
 //        System.out.println(httpServletRequest.getRemoteAddr());
 //        System.out.println(httpServletRequest.getRemoteHost());
 //        System.out.println(httpServletRequest.getRemotePort());

 //        String syscontext=httpServletResponse.getHeader("SYS_CONTEXT");

 //                byte[] base64byte=com.pcitc.ecs.util.Base64Utils.encodeStringToByte(sc.toJsonStr(),"UTF-8");
        // plainText.getBytes("UTF-8");
 ////
 //                String pathPrefix = ResourceUtils.getURL("classpath:ecs.pcitc.com.cer").getPath();
 ////
 //                PublicKey pubkey=com.pcitc.ecs.util.CerUtils.GetPublicKeyformCer(pathPrefix);
 //                byte[] tokenbyte=com.pcitc.ecs.util.RSAUtils.pfxEncryptByPublicKey(base64byte,pubkey);
 //                String tokenstr=com.pcitc.ecs.util.Base64Utils.encodeByteToString(tokenbyte,"UTF-8");
 //                httpServletResponse.setHeader("SYS_CONTEXT",sc.toJsonStr());
 //                httpServletResponse.setHeader("SYS_CONTEXT_TOKEN",tokenstr);
         chain.doFilter(request, response);
    }

    /**
     * 获取ip的过程，移动到独立的函数里
     * @param httpServletRequest 请求
     * @param httpServletResponse 相应
     * @author junyi。zhang 2019-5-9
     */
    private void getIpAddress(HttpServletRequest httpServletRequest,
                              HttpServletResponse httpServletResponse) {
        try{
            String ip = httpServletRequest.getHeader("x-forwarded-for");
            if(ip!=null&&ip.indexOf(",")>-1){
                String[] split = ip.split(",");
                for(String s :split){
                    if(s!=null && !"unknown".equalsIgnoreCase(s)){
                        ip = s;
                        break;
                    }
                }
            }
            String ipType = "x-forwarded-for";
            Cookie ipCookie = new Cookie("x-forwarded-for",ip);
            ip = httpServletRequest.getHeader("Proxy-Client-IP");
            Cookie ipCookie2 = new Cookie("Proxy-Client-IP",ip);
            ip = httpServletRequest.getHeader("WL-Proxy-Client-IP");
            Cookie ipCookie3 = new Cookie("WL-Proxy-Client-IP",ip);
            ip = httpServletRequest.getRemoteAddr();
            Cookie ipCookie4 = new Cookie("ipCookie",ip);
            httpServletResponse.addCookie(ipCookie);
            httpServletResponse.addCookie(ipCookie2);
            httpServletResponse.addCookie(ipCookie3);
            httpServletResponse.addCookie(ipCookie4);
        }catch (Exception e){
            System.err.print(e);
        }
    }

    /**
     * 销毁
     *
     * @author dongsheng.zhao 2017-12-22
     */
    @Override
    public void destroy() {
    }

//    private SysContext GetSysContext(String loginName, HttpServletRequest httpServletRequest) {
//        SysContext sc = new SysContext();
//        sc.setSYS_ID("ECS");
//        sc.setSYS_VERSION("DEV");
//        sc.setSYS_CLIENT_IP(getIPAddress(httpServletRequest));
//        sc.setSYS_ORG_CODE("");
//        sc.setSYS_ORG_NAME("");
//        sc.setSYS_OTHER_INFO("");
//        sc.setSYS_SESSION_ID("");
//        sc.setSYS_USER_CODE(loginName);
//        sc.setSYS_USER_NAME("ecs管理员");
//        sc.setSYS_ENTERPRISE_CODE("");
//        sc.setSYS_ENTERPRISE_NAME("");
//        sc.setSYS_IS_HQ(false);
//        sc.setSYS_ORG_UNIT_CODE("");
//        sc.setSYS_ORG_UNIT_NAME("");
//        sc.setSYS_ORG_UNIT_PATH("");
//
//        //JSONObject jo = (JSONObject) JSONObject.toJSON(sc);
//        return sc;
//    }
//
//    public static String getIPAddress(HttpServletRequest request) {
//        String ip = null;
//
//        //X-Forwarded-For：Squid 服务代理
//        String ipAddresses = request.getHeader("X-Forwarded-For");
//
//        if (ipAddresses == null || ipAddresses.length() == 0 || "unknown".equalsIgnoreCase(ipAddresses)) {
//            //Proxy-Client-IP：apache 服务代理
//            ipAddresses = request.getHeader("Proxy-Client-IP");
//        }
//
//        if (ipAddresses == null || ipAddresses.length() == 0 || "unknown".equalsIgnoreCase(ipAddresses)) {
//            //WL-Proxy-Client-IP：weblogic 服务代理
//            ipAddresses = request.getHeader("WL-Proxy-Client-IP");
//        }
//
//        if (ipAddresses == null || ipAddresses.length() == 0 || "unknown".equalsIgnoreCase(ipAddresses)) {
//            //HTTP_CLIENT_IP：有些代理服务器
//            ipAddresses = request.getHeader("HTTP_CLIENT_IP");
//        }
//
//        if (ipAddresses == null || ipAddresses.length() == 0 || "unknown".equalsIgnoreCase(ipAddresses)) {
//            //X-Real-IP：nginx服务代理
//            ipAddresses = request.getHeader("X-Real-IP");
//        }
//
//        //有些网络通过多层代理，那么获取到的ip就会有多个，一般都是通过逗号（,）分割开来，并且第一个ip为客户端的真实IP
//        if (ipAddresses != null && ipAddresses.length() != 0) {
//            ip = ipAddresses.split(",")[0];
//        }
//
//        //还是不能获取到，最后再通过request.getRemoteAddr();获取
//        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ipAddresses)) {
//            ip = request.getRemoteAddr();
//        }
//        return ip;
//    }

    public String getUserCode(){
        return "zhangjy3658";
    }

    public String getEnterpriseCode(){
        return "E0000724";
    }
}