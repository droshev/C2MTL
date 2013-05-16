//This is the top level view of the application. It creates the SplitApp control and initializes the necessary pages.
sap.ui.jsview("bixic2.App", {

	getControllerName: function() {
		return "bixic2.App";
	},
	
	createContent: function(oController) {
		// create app
		this.app = new sap.m.SplitApp({
			//The master area needs to be closed when navigation in detail area is done.
			afterDetailNavigate: function(){
				this.hideMaster();
			},
		});
		
		// create the first page in both master and detail areas
		var oInitialView = sap.ui.jsview("bixic2.detail.bikeNow", "bixic2.detail.bikeNow");
		this.app.addDetailPage(oInitialView);
		this.app.addMasterPage(sap.ui.jsview("bixic2.list.Home", "bixic2.list.Home"));
		
		// navigate to the first page in both master and detail areas.
		// the toMaster must be called after calling the toDetail, because both of them point to the same reference in phone and 
		// the real first page that will be shown in phone is the page in master area. 
		this.app.toDetail("bixic2.detail.bikeNow");
        //this.app.toDetail("bixic2.detail.view4");
		this.app.toMaster("bixic2.list.Home");
		
		// done
		return this.app;
	}
});