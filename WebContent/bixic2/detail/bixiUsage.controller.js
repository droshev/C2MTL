jQuery.sap.require("js.appcontext");
jQuery.sap.require("js.datautil");

sap.ui.controller("bixic2.detail.bixiUsage", {

	// framework method
	onInit: function() {
		// Store some settings in a model for the view
		var sDefaultStation = AppContext.getDefaultSettings().station;
		var oSettingsModel = new sap.ui.model.json.JSONModel( { stationName: sDefaultStation });
		this.getView().setModel(oSettingsModel, "settings");
		
		this.oBusyDialog = new sap.m.BusyDialog("bixiUsageBusy", {
			text : "Retrieving Bixi Information",
			title : "Loading",
			showCancelButton : true
		});
	},
        
        showHideBusyDialog : function(bShow) {
            if (bShow) {
                sap.ui.getCore().byId("bixiUsageBusy").open();
            } else {
                sap.ui.getCore().byId("bixiUsageBusy").close();
            }
        },

        showErrorDialog : function() {
            jQuery.sap.require("sap.m.MessageBox");
            sap.m.MessageBox.show("Sorry, something unexpected happened",
                    sap.m.MessageBox.Icon.INFORMATION, "Error",
                    [ sap.m.MessageBox.Action.OK ], function() {
                    / * do something * /;
            });
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
		sap.ui.getCore().byId("BixiUsageConfigurePopover").close();
	},
	
	
	/**
	 * Filters the data in the chart based on the input parameters in the popover control
	 * 
	 * @param oEvent press event
	 * @param oController this controller
	 */
	filter: function(oEvent, oController) {
		sap.ui.getCore().byId("BixiUsageConfigurePopover").close();
		oController._loadLiveData(oController);
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
            oController.showHideBusyDialog(true);
		sap.ui.getCore().byId("bixiUsageBusy").open();
		var sStationName = sap.ui.getCore().byId("BixiUsageStationSelect").getSelectedItem().getKey();
		var oDateFrom = new Date(sap.ui.getCore().byId("BixiUsageDateInput").getValue());
		var oSettingsModel = oController.getView().getModel("settings");
		
		// Fix the dates to cover a 24 hour period
		var oDateTo = (new Date(oDateFrom));
		oDateTo.setHours(23);
		oDateTo.setMinutes(59);
		
		oDateFrom.setHours(00);
		oDateFrom.setMinutes(00);
		
		// TODO: Not sure why we have to do this, but we do :)
		sap.ui.getCore().byId("BixiUsageDateInput").setValue(sap.ui.getCore().byId("BixiUsageDateInput").getValue());

		// Update the model containing the settings
		oSettingsModel.getData().stationName = sStationName;
		oSettingsModel.updateBindings();
		
		// update the line chart
		var oData = DataProvider.requestDataForPeriod(oDateFrom, oDateTo, sStationName);
		
		if (oData.data.length > 0) {
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setSizeLimit(5000);
			oModel.setData(oData);
			oController.getView().updateLineChart(oModel, sStationName);
			sap.ui.getCore().byId("bixiUsageBusy").close();
		} else {
			sap.ui.getCore().byId("bixiUsageBusy").close();
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