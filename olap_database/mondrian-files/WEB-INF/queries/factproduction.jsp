<%@ page session="true" contentType="text/html; charset=ISO-8859-1" %>
<%@ taglib uri="http://www.tonbeller.com/jpivot" prefix="jp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core" %>

<jp:mondrianQuery id="query01" jdbcDriver="com.mysql.jdbc.Driver"
jdbcUrl="jdbc:mysql://localhost/whadventure?user=root&password=" 
catalogUri="/WEB-INF/queries/factproduction.xml">
  select {[Measures].[Total Order Quantity],[Measures].[Total Stocked Quantity],[Measures].[Total Scrapped Quantity],[Measures].[Total Production Cost]} ON COLUMNS,
  {([Location], [Time], [Product])} ON ROWS
  from [Production]
</jp:mondrianQuery>

<c:set var="title01" scope="session">OLAP Analysis - whadventure Production</c:set>