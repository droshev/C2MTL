sap.ui.jsview("bixic2.detail.bixiUsage", {
	
	  //framework method
      getControllerName : function() {
         return "bixic2.detail.bixiUsage";
      }, 

      // framework method
      createContent : function(oController) {
  		 var oModel = oController.loadDemoData();
		 var oPage = new sap.m.Page("bixiUsagePage", {
		 	customHeader: new sap.m.Bar({
				contentLeft: this.createScenarioGraphBtn(oController),
				contentMiddle: new sap.m.Label({ 
					text: {
						path: "settings>/stationName",
						formatter: function (sValue) {
							return "Usage History For Station " + sValue;
						}
					}
				})
			})
		 });
		 
		 var oChart = this.createLineChart(oModel);
		 oPage.addContent(oChart);
		
		 return oPage;
      },
      

      /**
       * Destroys the current line chart and inserts a new one with the updated data
       * 
       * @param oModel new data
       * @param sStationName station name
       */
	  updateLineChart: function(oModel, sStationName) {
		  var oPage = sap.ui.getCore().byId("bixiUsagePage");		
		  oPage.destroyContent();
		  var oChart = this.createLineChart(oModel);
		  oPage.addContent(oChart);
	  },
  	
	  
  	  /**
  	   * Creates a line chart using the supplied data
  	   * 
  	   * @param oModel data
  	   * @returns {sap.makit.Chart} makit chart object
  	   */
      createLineChart : function(oModel) {  						
	  	  var oChart = new sap.makit.Chart({
		       width : "100%",
		       height : "80%",
		       type : sap.makit.ChartType.Line,
		       showRangeSelector : true,
		       showTableView : false,
		       valueAxis : new sap.makit.ValueAxis({
		       }),
		       categoryAxis : new sap.makit.CategoryAxis({
		               displayLastLabel: true
		       }),
		       categoryRegions : [
		                       new sap.makit.Category({ column : "time", displayName : "Time Period" })
		       ],
		       series : new sap.makit.Series({
		               column : "typeSeries",
		               displayName : "Bikes"
		       }),
		       values : [new sap.makit.Value({
		               expression : "value",
		               displayName : "Availability"
		       })],
		       valueBubble : new sap.makit.ValueBubble({
		               style: sap.makit.ValueBubbleStyle.FloatTop,
		               showCategoryText: true
		       }),
		  });
		 
		  oChart.addColumn(new sap.makit.Column({name:"time", value:"{time}"}));
		  oChart.addColumn(new sap.makit.Column({name:"typeSeries", value:"{type}"}));
		  oChart.addColumn(new sap.makit.Column({name:"value", value:"{value}", type:"number"}));
		  oChart.setModel(oModel);
		  oChart.bindRows("/data");
		 
		  // TODO: Implement Touch Events for oChart in the workshop!
		
		  return oChart;
      },

      
      /**
       * Creates configuration button for the chart. 
       * 
       * @param oController the responsible controller
       * @returns {sap.m.Button} button object
       */
  	  createScenarioGraphBtn: function(oController) {	  
  		 var defaults = oController.getDefaults();
  	     
  	     var oStationList = new sap.m.List({
  	         headerText: "Bixi Station",
  	         inset : true
  	     });
  	     
  	     oListItem = new sap.m.InputListItem({ label:"Bixi Stations"} );
  	     var oItemTemplate = new sap.ui.core.Item({
  	         key: '{stations>name}',
  	         text: '{stations>name}'
  	     });
  	     
  	     var oChartTypeSelect = new sap.m.Select("BixiUsageStationSelect", {
               change: [oController, oController.stationChanged, oController ],
               items: {
                   path: 'stations>/results',
                   template: oItemTemplate
               },
               selectedItem: defaults.station
  	     });
  	     
  	     oListItem.addContent(oChartTypeSelect);
  	     oStationList.addItem(oListItem);	
  	     
  	     var oTimeRange = new sap.m.List({
  	         headerText: "Date",
  	         inset : true
  	     });
  	     
  	     oTimeRange.addItem(new sap.m.InputListItem({
  	         label: "Day",
  	         content: [ new sap.m.DateTimeInput("BixiUsageDateInput", {
  	                 type: sap.m.DateTimeInputType.Date,
  	                 displayFormat: new sap.ui.model.type.DateTime({style: "short"}).getOutputPattern(),
  	                 dateValue: defaults.dateFrom,
  	                 change: [oController, oController.dateInputChanged, oController]
  	         }) ]
  	     }));
      	     	 
  	     var oActionList = new sap.m.List({
  	         headerText: "Action",
  	         inset : true
  	     });
  	     
  	     oActionList.addItem(new sap.m.CustomListItem({
      		 content: [ 
  	            new sap.m.Button( { 
  	            	text: "Filter",
  	            	width: "50%",
  	            	press: [oController, oController.filter, oController ]
  	            }),
  	            new sap.m.Button( { 
  	            	text: "Cancel",
  	            	width: "50%",
	            	press:  [oController, oController.cancelPressed, oController ]
  	            } )
      		 ]
      	 }));
  	     
  	     var oConfigPopOver = new sap.m.Popover("BixiUsageConfigurePopover",{
  	         placement: sap.m.PlacementType.Bottom,
  	         showHeader: false,
  	         content: [ oStationList, oTimeRange, oActionList ]
  	     });
  	     
  	   oConfigPopOver.setModal(true);
  	     
  	     var oScenarioBtn = new sap.m.Button({
  	         text: "Time & Station", 
  	         icon: "img/add_filter_48.png",
  	         tap : function() {
  	             oConfigPopOver.openBy(this);
  	         }
  	     });
  	     
  	     return oScenarioBtn;
  	 }
      

});