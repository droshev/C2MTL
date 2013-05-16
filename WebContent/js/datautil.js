jQuery.sap.declare("js.dataprovider");
jQuery.sap.require("js.appcontext");

var DataProvider = (function(window, jQuery, AppContext) {
	
	var dataProvider = {};
	
	/**
	 * Returns the modified service URL based on the location the app is running from. If the app is running in the
	 * WebServer from eclipse it will use a proxy location. If it is running on device it will use the regular URL.
	 * 
	 * @returns {String} service URL prefix
	 */
	function getServiceUrl() {
		var sUrl = "";
		
		if (AppContext.isTestingLocalHost()) {
			sUrl = "proxy/http/hanasvr-04.sapdevcenter.com:8000/bixi/bixi_stations.xsodata/";
		} else {
			sUrl = "http://hanasvr-04.sapdevcenter.com:8000/bixi/bixi_stations.xsodata/";
		}
		
		return sUrl;
	}
	
	
	/**
	 * Converts "/Date(1342412023830)/" to a useable Date object
	 * @param date string retuned, e.g '"/Date(1342412023830)/'
	 */
	function convertStringTimeStampToDate(sTimeStamp) {
		var indexOfFirstBrace = sTimeStamp.indexOf('(') + 1;
		var indexOfSecondBrace =  sTimeStamp.indexOf(')');
		var sFormattedTimeStamp = sTimeStamp.substring(indexOfFirstBrace,indexOfSecondBrace);
		
		return new Date(parseInt(sFormattedTimeStamp));
	}
	
	
	/**
	 * Builds a URL to retrieve the bike and dock usage between dat1 and dat2 for a single station, sName
	 * 
	 * @param dat1 a javascript date object
	 * @param dat2 a javascript date object
	 * @param sName station name
	 * @returns {String} url for request
	 */
	function buildQueryBikeData(dat1, dat2, sName) {
		var defaults = AppContext.getDefaultSettings();
	    var sStation = (sName ? sName : defaults.station );
	    var sStartDate = (dat1 ? dat1 : defaults.dateFrom);
	    var sEndDate = (dat2 ? dat2 : defaults.dateTo);
	    
	    var serviceUrl = getServiceUrl() + "BikeData?$format=json&";
		    serviceUrl = serviceUrl + "$filter=" + "lastCommWithServer%20gt%20datetime'" + sStartDate.toISOString() + "'%20and%20" 
		    + "lastCommWithServer%20lt%20datetime'" + sEndDate.toISOString();
		    serviceUrl = serviceUrl + "'%20and%20" + "name%20eq%20'" + sStation + "'";
	   
	    return serviceUrl;
	};
	
	
	/**
	 * Builds a URL to retrieve the average bike and dock usage between dat1 and dat2 for a single station, sName
	 * 
	 * @param dat1 a javascript date object
	 * @param dat2 a javascript date object
	 * @param sName station name
	 * @returns {String} url for request
	 */
	function buildQueryBikeDataAverage(dat1, dat2, sName) {
		var defaults = AppContext.getDefaultSettings();
	    var sStation = (sName ? sName : defaults.station );
	    var sStartDate = (dat1 ? dat1 : defaults.dateFrom);
	    var sEndDate = (dat2 ? dat2 : defaults.dateTo);
	    
	    var serviceUrl = getServiceUrl() + "BikeDataSum?$format=json&";
	    serviceUrl = serviceUrl + "$filter=" + "lastCommWithServer%20gt%20datetime'" + sStartDate.toISOString() 
	    + "'%20and%20" + "lastCommWithServer%20lt%20datetime'" + sEndDate.toISOString();
	    serviceUrl = serviceUrl + "'%20and%20" + "name%20eq%20'" + sStation + "'&$select=name,nbBikes,nbEmptyDocks";
	    
	    return serviceUrl;
	};

	
	/**
	 * Synchronous request for data
	 * 
	 * @param serviceUrl url for the Ajax call
	 * @returns {} response object
	 */
	function executeSyncRequest(serviceUrl) {
		var oData = {};
	    var sUser = "Bixi";
	    var sPassword = "Bixi1234";
	    $.ajax({
	        type: 'GET',
	        url: serviceUrl,
	        dataType: 'json',
	        success: function(data) { 
	        	oData = data; 
	        },
	        async: false,
	        username: sUser,
	        password: sPassword
	    });
	    
	    return oData;	    
	};
	
	
	/**
	 * Returns the service url for the application with the user and password 
	 */
	dataProvider.getServiceUrl = function () {
		var sUrl = "";
		
		if (AppContext.isTestingLocalHost()) {
			sUrl = "proxy/http/hanasvr-04.sapdevcenter.com:8000/bixi/bixi_stations.xsodata/";
		} else {
			sUrl = "http://hanasvr-04.sapdevcenter.com:8000/bixi/bixi_stations.xsodata/";
		}
		
		return sUrl;
	};
	
	
	/**
	 * Returns a URL for live bixi data
	 * 
	 * @returns {String} a URL
	 */
	dataProvider.getLiveBixiDataUrl = function() {		
		var sUrl = "";
		
		if (AppContext.isTestingLocalHost()) {
			sUrl = "proxy/http/montreal.bixi.com/data/bikeStations.xml";
		} else {
			sUrl = "http://montreal.bixi.com/data/bikeStations.xml";
		}
		
		return sUrl;
	};
	
	/**
	 * Requests a set of non aggregated bixi data between the given dates for the given station
	 * 
	 * @param oDateFrom date object
	 * @param oDateTo date object 
	 * @param sStationName station name
	 * @returns object containing the data result
	 */
	dataProvider.requestDataForPeriod = function(oDateFrom, oDateTo, sStationName) {
		var sQuery = buildQueryBikeData(oDateFrom, oDateTo, sStationName);
		var oResponse = executeSyncRequest(sQuery);
		
		var oData = {
	         data : []
		};
		
		if (oResponse && oResponse.d && oResponse.d.results) {
			for (var i = 0; i < oResponse.d.results.length; i++) {
				var iBikes = oResponse.d.results[i].nbBikes;
				var iDocks = oResponse.d.results[i].nbEmptyDocks;
				var oDate = convertStringTimeStampToDate(oResponse.d.results[i].lastCommWithServer);
				var oTime = oDate.toLocaleString();
				
				oData.data.push({
					time: oTime,
					type: "Number Bikes Available",
					value: iBikes,
					name: sStationName
				});
				
				oData.data.push({
					time: oTime,
					type: "Number Docks Available",
					value: iDocks,
					name: sStationName
				});
			}
		}
			
		return oData;
	};
	
	
	/**
	 * Requests data within the given dates for the time period supplied
	 * 
	 * @param oDateFrom date from
	 * @param oDateTo date to
	 * @param sStationName station name 
	 * @param sPeriod time period, Hourly, Daily or Monthly
	 * @returns object containing the data result
	 */
	dataProvider.requestSumDataForPeriod = function(oDateFrom, oDateTo, sStationName, sFrequency) {
		// TODO: Move to HANA
		var diffMs = oDateTo - oDateFrom;
		var diffDays = Math.round(diffMs / 86400000);
		var diffHrs = Math.round((diffMs % 86400000) / 3600000);
		var aQueries = [];
		
		// TODO: Should move these :)
	    Date.prototype.addHours = function(h){
	        this.setHours(this.getHours()+h);
	        return this;
	    };
	    
	    Date.prototype.addDays = function(d){
	        this.setDate(this.getDate()+d);
	        return this;
	    };
	    
	    Date.prototype.addMonths = function(m){
	        this.setMonth(this.getMonth()+m);
	        return this;
	    };
	    
// TODO: Improve this, it is too slow! Move functionality to back end and return total aggregated results
	     
		switch (sFrequency) {
		case "Hourly":
			var currentDate = new Date(oDateFrom);
			var nextDate = (new Date(currentDate)).addHours(1);
			for (var i = 0; i < diffHrs; i++) {
				aQueries.push({ 
					sumQuery: buildQueryBikeDataAverage(currentDate, nextDate, sStationName),
					dataQuery: buildQueryBikeData(currentDate, nextDate, sStationName),
					timePeriod: currentDate.toLocaleString() + " - " + nextDate.toLocaleString()
				});
				currentDate = currentDate.addHours(1);
				nextDate = nextDate.addHours(1);
			}
			break;
		case "Daily":
			var currentDate = new Date(oDateFrom);
			var nextDate = (new Date(currentDate)).addDays(1);
			for (var i = 0; i < diffDays; i++) {
				aQueries.push({ 
					sumQuery: buildQueryBikeDataAverage(currentDate, nextDate, sStationName),
					dataQuery: buildQueryBikeData(currentDate, nextDate, sStationName),
					timePeriod: currentDate.toLocaleString() + " - " + nextDate.toLocaleString()
				});
				currentDate = currentDate.addDays(1);
				nextDate = nextDate.addDays(1);
			}
			break;
		case "Monthly":
			var currentDate = new Date(oDateFrom);
			var nextDate = (new Date(currentDate)).addMonths(1);
			for (var i = 0; i < diffHrs; i++) {
				aQueries.push({ 
					sumQuery: buildQueryBikeDataAverage(currentDate, nextDate, sStationName),
					dataQuery: buildQueryBikeData(currentDate, nextDate, sStationName),
					timePeriod: currentDate.toLocaleString() + " - " + nextDate.toLocaleString()
				});
				currentDate = currentDate.addMonths(1);
				nextDate = nextDate.addMonths(1);
			}
			break;
		}
		
		var oData = {
	         data : []
		};
		
		for (var j = 0; j < aQueries.length; j++) {
			var oSumResponse = executeSyncRequest(aQueries[j].sumQuery);
			var oDataResponse = executeSyncRequest(aQueries[j].dataQuery);
			if (oSumResponse.d && (oSumResponse.d.results[0].nbBikes)
				&& oDataResponse.d && (oDataResponse.d.results.length > 0) ) {				
				var iSumBikes = oSumResponse.d.results[0].nbBikes;
				var iSumDocks = oSumResponse.d.results[0].nbEmptyDocks;
				var iCount = oDataResponse.d.results.length;				
				
				oData.data.push({
					time: aQueries[j].timePeriod,
					type: "Avg Bikes",
					value: Math.round(iSumBikes/iCount),
					name: sStationName
				});
				
				oData.data.push({
					time: aQueries[j].timePeriod,
					type: "Avg Docks",
					value: Math.round(iSumDocks/iCount),
					name: sStationName
				});
			} else {
				return oData;
			}
		}
		
		return oData;
	};
	
	return dataProvider;
	
})(window, jQuery, AppContext);