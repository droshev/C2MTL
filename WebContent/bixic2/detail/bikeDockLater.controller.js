jQuery.sap.require("js.appcontext");
jQuery.sap.require("js.datautil");

sap.ui.controller("bixic2.detail.bikeDockLater", {

	onInit: function() {
		// Store some settings in a model for the view
		var sDefaultStation = AppContext.getDefaultSettings().station;
		var oSettingsModel = new sap.ui.model.json.JSONModel( { stationName: sDefaultStation });
		this.getView().setModel(oSettingsModel, "settings");
		
		this.oBusyDialog = new sap.m.BusyDialog("bikeDockLaterBusy", {
			text : "Retrieving Bixi Information",
			title : "Loading",
			showCancelButton : true
		});
	},
	
	
	/**
	 * Loads initial data from a file and sets the model on the view
	 * 
	 * returns {sap.ui.model.JSON.JsonModel} the model containing the data
	 */
	loadDemoData: function() {
		var oModel = new sap.ui.model.json.JSONModel();
		oModel.loadData("demoData/avgBikeDockAveMasson.json", null, false, "GET", false, false, {});
		
		return oModel;
	},
	
	
	/**
	 * Called when the dropdown for the time frequency is changed
	 * 
	 * @param oEvent change event
	 * @param oController this controller
	 */
	chartTimeFrequencyChanged: function(oEvent, oController) {
	},
	
	
	/**
	 * Called when the dropdown for the bike station is changed
	 * 
	 * @param oEvent change event
	 * @param oController this controller
	 */
	stationChanged: function(oEvent, oController) {
	},
	
	/**
	 * Called when either of the date inputs are changed
	 * 
	 * @param oEvent change event
	 * @param oController this controller
	 */
	dateInputChanged: function(oEvent, oController) {
	},
	
	
	/**
	 * Callback for the options cancel button inside the popover
	 * 
	 * @param oEvent press event
	 * @param oController this controller
	 */
	cancelPressed: function(oEvent, oController) {
		sap.ui.getCore().byId("BikeDockLaterConfigurePopover").close();
	},
	
	
	/**
	 * Filters the data in the chart based on the input parameters in the popover control
	 * 
	 * @param oEvent press event
	 * @param oController this controller
	 */
	filter: function(oEvent, oController) {
		sap.ui.getCore().byId("BikeDockLaterConfigurePopover").close();
		oController._loadLiveData(oController);
	},
	
	/**
	 * Returns default settings from the app context
	 * 
	 * return {Object}
	 */
	getDefaults: function(){
		return AppContext.getDefaultSettings();
	},
	
	
	/**
	 * Synchronously loads data based on the user input contained in the view. 
	 */
	_loadLiveData: function(oController) {
		sap.ui.getCore().byId("bikeDockLaterBusy").open();
		var sStationName = sap.ui.getCore().byId("BikeDockLaterStationSelect").getSelectedItem().getKey();
		var oDateFrom = new Date(sap.ui.getCore().byId("BikeDockLaterTimeFromInput").getValue());
		var oDateTo = new Date(sap.ui.getCore().byId("BikeDockLaterTimeToInput").getValue());
		
		//temporary due to bug
		if(isNaN(oDateFrom.getDate()) ){
		    oDateFrom = new Date(2012, 06, 16, 15);
		}
		if(isNaN(oDateTo.getDate())){
                    oDateTo = new Date(2012, 06, 16, 19);
                }
		var sFrequency = sap.ui.getCore().byId("BikeDockLaterFrequencySelect").getSelectedItem().getKey();
		var oSettingsModel = oController.getView().getModel("settings");
		
		// TODO: Not sure why we have to do this, but we do :)
		sap.ui.getCore().byId("BikeDockLaterTimeFromInput").setValue(sap.ui.getCore().byId("BikeDockLaterTimeFromInput").getValue());
		sap.ui.getCore().byId("BikeDockLaterTimeToInput").setValue(sap.ui.getCore().byId("BikeDockLaterTimeToInput").getValue());
		
		// Update the model containing the settings
		oSettingsModel.getData().stationName = sStationName;
		oSettingsModel.updateBindings();

		var oData = DataProvider.requestSumDataForPeriod(oDateFrom, oDateTo, sStationName, sFrequency);

		if (oData.data.length > 0) {
			// update the bar chart
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setSizeLimit(5000);
			oModel.setData(oData);
			oController.getView().updateBarChart(oModel, sStationName);
			sap.ui.getCore().byId("bikeDockLaterBusy").close();
		} else {
			sap.ui.getCore().byId("bikeDockLaterBusy").close();
			jQuery.sap.require("sap.m.MessageBox");
			sap.m.MessageBox.show(
			      "Sorry, there is no data available for this period.",
			      sap.m.MessageBox.Icon.WARNING,
			      "Oops!",
			      [sap.m.MessageBox.Action.OK],
			      function() { / * do something * /; }
			);
		}
	}
	
});