jQuery.sap.declare("Application");
jQuery.sap.require("sap.ui.app.Application");
jQuery.sap.require("js.datautil");

sap.ui.app.Application.extend("Application", {

	init: function() {
		var sUrl = DataProvider.getServiceUrl() + "stations?$format=json";		
		this.oBusyDialog = new sap.m.BusyDialog("AppBusy", {
			text : "Retrieving a list of Bixi stations",
			title : "Loading",
			showCancelButton : true
		}).open();
		
		var that = this;
		
		var oDataModel = new sap.ui.model.odata.ODataModel( DataProvider.getServiceUrl() , true, "Bixi", "Bixi1234");
		oDataModel.read("stations", null, ["$format=json"], true, function(oData, oResponse) {
			var oModel = new sap.ui.model.json.JSONModel(oData);
			oModel.setSizeLimit(500);
			sap.ui.getCore().setModel(oModel, "stations");
			that.oBusyDialog.close();
		}, function(oError) {
		    console.log("request for stations failed with an " + oError );
			that.oBusyDialog.close();
		});
	},
	
	main: function() {
		// create app view and put to html root element
        var root = this.getRoot();
        sap.ui.jsview("app", "bixic2.App").placeAt(root);
	}

});