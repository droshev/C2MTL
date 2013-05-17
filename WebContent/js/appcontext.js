jQuery.sap.declare("js.appcontext");

var AppContext = (function (){
	var appContext = {};
	
	/**
	 * Returns default options for dateFrom, dateTo and station
	 * 
	 * @returns {dateFrom, dateTo, statipn}
	 */
	appContext.getDefaultSettings = function() {
		return {
			avgDateFrom: new Date('July 16, 2012 06:00:00'),
			avgDateTo: new Date('July 16, 2012 21:00:00'),
			dateFrom: new Date('July 16, 2012 00:00:00'),
			dateTo: new Date('July 16, 2012 23:59:59'),
			station: '10e Avenue / Masson',
			period: 'Hourly'
		};
	};
	
	
	/**
	 * Returns true if application has a connection to the Internet
	 * 
	 * @returns {Boolean}
	 */
	appContext.isOnline = function() {
		return navigator && navigator.onLine;
	};
	
	
	/**
	 * Returns true if testing on local host.
	 * 
	 * @returns {Boolean}
	 */
	appContext.isTestingLocalHost = function() {
		return window && window.location && window.location.hostname === "localhost" ? true :false;
	};
	
	return appContext;
})();