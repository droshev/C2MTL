sap.ui.controller("bixic2.list.Home", {

	onListItemTap: function(oEvent){
		var sTitle = oEvent.getSource().getTitle();
		var sViewName= "";
		var sViewId = "";
		
		switch (sTitle) {
			case "I Need A Bike Now!":
				sViewName = "bixic2.detail.bikeNow";
				sViewId = sViewName;
				break;
			case "I Need A Dock Now!":
				sViewName = "bixic2.detail.dockNow";
				sViewId = sViewName;
				break;
	        case "I Need A Bike/Dock Later":
	            sViewName = "bixic2.detail.bikeDockLater";
	            sViewId = sViewName;
	            break;
			case "Bixi Usage":
				sViewName = "bixic2.detail.bixiUsage";
				sViewId = sViewName;
				break;
			default: 
				break;
		}
		
		sap.ui.getCore().getEventBus().publish("nav", "to", {
			viewName: sViewName,
			viewId: sViewId,
			data: {}
		});
	},

	onFooterButtonTap: function(oEvent){
		var sId = oEvent.getSource().getId(), sMode;
		if(sId === "showHideButton"){
			sMode = sap.m.SplitAppMode.ShowHideMode;
			
		}else if(sId === "stretchButton"){
			sMode = sap.m.SplitAppMode.StretchCompressMode;
		}else if(sId === "popoverButton"){
			sMode = sap.m.SplitAppMode.PopoverMode;
		}
		
		if(jQuery.device.is.landscape) {
			jQuery.sap.require("sap.m.MessageToast");
			sap.m.MessageToast.show("Change to portrait orientation to compare the different modes");
		}
		
		sap.ui.getCore().getEventBus().publish("app", "mode", {mode: sMode});
	}

});