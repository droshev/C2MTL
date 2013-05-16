sap.ui.jsview("bixic2.detail.dockNow", {

      getControllerName : function() {
         return "bixic2.detail.dockNow";
      },

      createContent : function(oController) {
    	  // TODO: fix height
    	  var oMapPlaceholder = new sap.ui.core.HTML("dockNowMap", {
    		  content: "<div style='height:910px; background:gray' id='dockNowMap'></div>",
    		  afterRendering: [ { controller: oController }, oController.mapPlaceholderRendered, oController ],
    	  }); 
    		
          return new sap.m.Page({
              customHeader: new sap.m.Bar({
              	contentMiddle: new sap.m.Label({ text: "I Need a Dock Now!" }),
              	contentRight: new sap.m.Button({
              		icon:"img/refresh_48.png",
            		press: [oController, oController.refreshPressed, oController]
              	})
              }),
              content: [ oMapPlaceholder ]
          });
      }

});