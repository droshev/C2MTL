sap.ui.jsview("bixic2.detail.bikeDockLater", {

	// framework method
	getControllerName : function() {
		return "bixic2.detail.bikeDockLater";
	},

	// framework method
	createContent : function(oController) {
		var oModel = oController.loadDemoData();
		var oPage = new sap.m.Page("BikeDockLaterPage", {
			customHeader: new sap.m.Bar({
				contentLeft: this.createScenarioGraphBtn(oController),
				contentMiddle: new sap.m.Label({ 
					text: {
						path: "settings>/stationName",
						formatter: function (sValue) {
							return "Average Bikes & Docks For Station " + sValue;
						}
					}
				})
			})
		});
		var oChart = this.createBarChart(oModel);
		oPage.addContent(oChart);
		return oPage;
	},

	
	/**
	 * Destroys the current bar chart and inserts a new one with the new data.
	 * 
	 * @param oModel
	 * @param sStationName
	 */
	updateBarChart: function(oModel, sStationName) {
		var oPage = sap.ui.getCore().byId("BikeDockLaterPage");		
		oPage.destroyContent();
		var oChart = this.createBarChart(oModel);
		oPage.addContent(oChart);
	},
	
	
	/**
	 * Creates and returns the bar chart thats bound to the context /mydata
	 * 
	 * @returns {sap.makit.Chart} a bar chart
	 */
	createBarChart : function(oModel) {
						
	     var oChart = new sap.makit.Chart({
             width : "100%",
             height : "80%",
             type : sap.makit.ChartType.Column,
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
                     format : "rounded0",
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
	     
		// TODO: move to controller
		oChart.attachEvent("doubletap", function(eventObj) {
			jQuery.sap.require("sap.m.MessageBox");
			var chartObj = eventObj.oSource;
			var msg = eventObj.oSource.getSelectedCategory();
			sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.INFORMATION,
					"Chart Double Tap - Selected Category",
					[ sap.m.MessageBox.Action.OK ]);
		});

		return oChart;
	},
	
	
	/**
	 * Creates and returns the chart time & station configuration button
	 * 
	 * @param oController this controller
	 * @returns {sap.m.Button} config button
	 */
	createScenarioGraphBtn: function(oController) {	  
		 var defaults = oController.getDefaults();
		 
	     var oTimeList = new sap.m.List({
	         headerText: "Time Frequency",
	         inset : true
	     });
	     	     
	     oListItem = new sap.m.InputListItem({label:"Frequency"});
	     
	     var timeFreq = ['Hourly', 'Daily' ,'Monthly'];
	     var oChartTypeSelect = new sap.m.Select("BikeDockLaterFrequencySelect", {
             id : 'timeFreqSel',
             selectedKey : defaults.period,
             change: [oController, oController.chartTimeFrequencyChanged, oController]
	     });
	     
	     for(var i = 0; i < timeFreq.length; i++) {
             oChartTypeSelect.addItem(new sap.ui.core.Item({
                 key: timeFreq[i], text: timeFreq[i]
             }));
	     }
	     
	     oListItem.addContent(oChartTypeSelect);
	     oTimeList.addItem(oListItem);
	     
	     var oStationList = new sap.m.List({
	         headerText: "Bixi Station",
	         inset : true
	     });
	     
	     oListItem = new sap.m.InputListItem({ label:"Bixi Stations"} );
	     var oItemTemplate = new sap.ui.core.Item({
	         key: '{stations>name}',
	         text: '{stations>name}'
	     });
	     
	     var oChartTypeSelect = new sap.m.Select("BikeDockLaterStationSelect", {
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
	         headerText: "Time Range",
	         inset : true
	     });
	     
	     oTimeRange.addItem(new sap.m.InputListItem({
	         label: "Between",
	         content: [ new sap.m.DateTimeInput("BikeDockLaterTimeFromInput", {
	                 type: sap.m.DateTimeInputType.DateTime,
	                 displayFormat: new sap.ui.model.type.DateTime({style: "long"}).getOutputPattern(),
	                 change: [oController, oController.dateInputChanged, oController],
		             dateValue: defaults.avgDateFrom
	         }) ]
	     }));
	     
	     Date.prototype.addHours = function(h){
	         this.setHours(this.getHours()+h);
	         return this;
	     };
	     
    	 oTimeRange.addItem(new sap.m.InputListItem({
	         label: "And",
	         content: [ new sap.m.DateTimeInput("BikeDockLaterTimeToInput", {
		                 type: sap.m.DateTimeInputType.DateTime,
		                 displayFormat: new sap.ui.model.type.DateTime({style: "long"}).getOutputPattern(),
		                 change: [oController, oController.dateInputChanged, oController],
  		                 dateValue: defaults.avgDateTo
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
	     
	     var oConfigPopOver = new sap.m.Popover("BikeDockLaterConfigurePopover", {
	         placement: sap.m.PlacementType.Bottom,
	         showHeader: false,
	         content: [ oTimeList, oStationList, oTimeRange, oActionList ]
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