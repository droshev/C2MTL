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
         * Builds a URL to retrieve the average bike and dock usage between dat1 and dat2 for a single station, sName
         * 
         * @param dat1 a javascript date object
         * @param dat2 a javascript date object
         * @param sName station name
         * @returns {String} url for request
         */
        function buildQueryBikeDataAverageV2(dat1, dat2, sName, sFreq) {
                var defaults = AppContext.getDefaultSettings();
            var sStation = (sName ? sName : defaults.station );
            var sStartDate = (dat1 ? dat1 : defaults.dateFrom);
            var sEndDate = (dat2 ? dat2 : defaults.dateTo);
            
            var serviceUrl = getServiceUrl() + "BikeDataSumV2?$format=json&";
            serviceUrl = serviceUrl + "$filter=" + "lastCommWithServer%20gt%20datetime'" + sStartDate.toISOString() 
            + "'%20and%20" + "lastCommWithServer%20lt%20datetime'" + sEndDate.toISOString();
            serviceUrl = serviceUrl + "'%20and%20" + "name%20eq%20'" + sStation + "'&$select=name,nbBikes,nbEmptyDocks,Month";
            if(sFreq == 'Hourly'){
                serviceUrl = serviceUrl + ',Day,Hour';
            } else if (sFreq == 'Daily'){
                serviceUrl = serviceUrl + ',Day';
            }
            
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

                var currentDate = new Date(oDateFrom);
                var nextDate = new Date(oDateTo);
                
                switch (sFrequency) {
                case "Hourly":
                    aQueries.push({ 
                        sumQuery: buildQueryBikeDataAverageV2(currentDate, nextDate, sStationName, sFrequency),
                        timePeriod: currentDate
                    });
                    break;
                case "Daily":
                                aQueries.push({ 
                                        sumQuery: buildQueryBikeDataAverageV2(currentDate, nextDate, sStationName, sFrequency),
                                        timePeriod: currentDate
                                });
                        break;
                case "Monthly":
                                aQueries.push({ 
                                        sumQuery: buildQueryBikeDataAverageV2(currentDate, nextDate, sStationName, sFrequency),
                                        timePeriod: currentDate
                                });
                        break;
                }
                
                var oData = {
                 data : []
                };
                
                var monthNames = [ "January", "February", "March", "April", "May", "June",
                                   "July", "August", "September", "October", "November", "December" ];
                for (var j = 0; j < aQueries.length; j++) {
                        var oSumResponse = executeSyncRequest(aQueries[j].sumQuery);
                        
                        if(oSumResponse.d && (oSumResponse.d.results.length > 0)){
                            var sTimePeriod = aQueries[0].timePeriod;
                            
                            for(var k  = 0; k < oSumResponse.d.results.length; k++){
                                var iSumBikes = oSumResponse.d.results[k].nbBikes;
                                var iSumDocks = oSumResponse.d.results[k].nbEmptyDocks;
                                var sTime = 'day';
                                switch (sFrequency) {
                                case 'Hourly':
                                    sTime = aQueries[j].timePeriod.toLocaleString().substr(0,12) + '-' + (aQueries[j].timePeriod).addHours(1).toLocaleString().substr(10,2) + 'h';
                                    break;
                                case 'Daily':
                                    //TODO implement
                                    sTime += k; 
                                    break;
                                case 'Monthly':
                                    sTime = monthNames[sTimePeriod.getMonth()] + ' - ' + sTimePeriod.getFullYear();
                                    sTimePeriod.addMonths(1);
                                    break;
                                }
                                
                                oData.data.push({
                                    time: sTime,
                                    type: "Avg Bikes",
                                    value: Math.round(iSumBikes),
                                    name: sStationName
                            });
                            
                            oData.data.push({
                                    //time: sTimePeriod,
                                    time: sTime,
                                    type: "Avg Docks",
                                    value: Math.round(iSumDocks),
                                    name: sStationName
                            });
                                
                            }
                        } else {
                                return oData;
                        }
                }
                
                return oData;
        };
        
        return dataProvider;
        
})(window, jQuery, AppContext);