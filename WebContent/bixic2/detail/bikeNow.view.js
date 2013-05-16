sap.ui.jsview("bixic2.detail.bikeNow", {
	
    getControllerName : function() {
        return "bixic2.detail.bikeNow";
     },
     
    createContent : function(oController) {
        var oMapPlaceholder = new sap.ui.core.HTML("bikeNowMap", {
                content: "<div style='height:910px; background:gray' id='bikeNowMap'></div>",
                afterRendering: [ { controller: oController }, oController.mapPlaceholderRendered, oController ],
        });
              
        return new sap.m.Page({
            customHeader: new sap.m.Bar({
            	contentMiddle: new sap.m.Label({ text: "I Need a Bike Now!" }),
            	contentRight: new sap.m.Button({
            		icon:"img/refresh_48.png",
            		press: [oController, oController.refreshPressed, oController]
            	})
            }),
            content: [ oMapPlaceholder ]
        });
    }
});