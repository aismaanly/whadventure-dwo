FROM tomcat:8.5-jdk8-openjdk-slim

# Install unzip to extract the war file
RUN apt-get update && apt-get install -y unzip && rm -rf /var/lib/apt/lists/*

# Create directory for mondrian app
RUN mkdir -p /usr/local/tomcat/webapps/mondrian

# Copy mondrian.war and extract it
COPY olap_database/mondrian.war /usr/local/tomcat/webapps/
RUN unzip /usr/local/tomcat/webapps/mondrian.war -d /usr/local/tomcat/webapps/mondrian && \
    rm /usr/local/tomcat/webapps/mondrian.war

# Copy MySQL JDBC Connector
COPY olap_database/mysql-connector-java-5.1.4-bin.jar /usr/local/tomcat/webapps/mondrian/WEB-INF/lib/

# Copy custom Mondrian queries and configuration files
COPY olap_database/mondrian-files/WEB-INF/queries/ /usr/local/tomcat/webapps/mondrian/WEB-INF/queries/
COPY olap_database/mondrian-files/mondrian/ /usr/local/tomcat/webapps/mondrian/

# Configure Tomcat port to 7860 (Hugging Face Spaces requirement)
RUN sed -i 's/port="8080"/port="7860"/g' /usr/local/tomcat/conf/server.xml

# Set read/write/execute permissions for Hugging Face non-root container environment (User UID 1000)
RUN chmod -R 777 /usr/local/tomcat

EXPOSE 7860
CMD ["catalina.sh", "run"]
