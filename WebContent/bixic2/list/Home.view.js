sap.ui.jsview("bixic2.list.Home", {

      getControllerName : function() {
         return "bixic2.list.Home";
      },


  	createContent : function(oController) {
  		var oInboxList = new sap.m.List({  
  			items: [
  				new sap.m.StandardListItem({
  					title : "I Need A Bike Now!",
                    icon:"img/map_48.png",
  					type : sap.m.ListType.Navigation,
  					tap : [oController.onListItemTap, oController]
  				}),
  				new sap.m.StandardListItem({
  					title : "I Need A Dock Now!",
                    icon:"img/map_48.png",
  					type : sap.m.ListType.Navigation,
  					tap : [oController.onListItemTap, oController]
  				}),
                new sap.m.StandardListItem({
                    title : "I Need A Bike/Dock Later",                                        
                    type : sap.m.ListType.Navigation,
                    icon:"img/ms_bar_chart_icon.png",
                    tap : [oController.onListItemTap, oController] 
                }),
  				new sap.m.StandardListItem({
  					title : "Bixi Usage",  	
                    icon:"img/ms_bar_chart_icon.png",
  					type : sap.m.ListType.Navigation,
  					tap : [oController.onListItemTap, oController]
  				})
  			]
  		});
  		
  		var oPage = new sap.m.Page({  		
  			customHeader: new sap.m.Bar({
  				contentMiddle: [ new sap.m.Button({
  					icon: "./img/200px-Bixi_logo.svg.png"
  				})]
  			}),
  			content: [ oInboxList ]
  		});
  		
  		return oPage;
  	}

});