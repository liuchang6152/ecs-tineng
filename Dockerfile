FROM 10.238.253.188:20202/pcitc-wm/wm-tomcat:2.0
COPY ./target/*.war /usr/local/tomcat/webapps/
EXPOSE 8080