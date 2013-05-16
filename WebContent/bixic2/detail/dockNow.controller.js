jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("js.datautil");

sap.ui.controller("bixic2.detail.dockNow", {
	
   onInit: function() {
		var that = this;

		this.oBusyDialog = new sap.m.BusyDialog("dockNowBusy", {
			text: "Retrieving Current Bixi Information",
			title: "Loading",
			showCancelButton: true
		});
		
		that.showHideBusyDialog(true);
   },
   
   
   refreshPressed: function(oEvent, oController) {
	   oController.showHideBusyDialog(true);
	   oController._clean(oController);
	   oController._initializeMap(oController);
	},
	
	
   showHideBusyDialog: function(bShow) {
	   if (bShow) {
		   sap.ui.getCore().byId("dockNowBusy").open();
	   } else {
		   sap.ui.getCore().byId("dockNowBusy").close();
	   }
   },
   
   showErrorDialog: function() {
	   sap.m.MessageBox.show(
	      "Sorry, something unexpected happened",
	      sap.m.MessageBox.Icon.INFORMATION,
	      "Error",
	      [sap.m.MessageBox.Action.OK],
	      function() { / * do something * /; }
	   );   
   },
   
   mapPlaceholderRendered: function(oEvent, oData) {
	   var oController = oData.controller;
	   oController._initializeMap(oController);
   },
   
   drawDataCircles: function(oMap) {
	   var oData = sap.ui.getCore().getModel("liveData") == null ? null : sap.ui.getCore().getModel("liveData").getData();
	   var aCircles = [];
	   
	   if (oData && oMap) {
		   var aStations = oData.getElementsByTagName("station");
		   
		   for (var i = 0; i < aStations.length; i++) {
			   var sName = aStations[i].childNodes[1].textContent;
			   var fLat = aStations[i].childNodes[4].textContent;
			   var fLong = aStations[i].childNodes[5].textContent;
			   var iNumFreeDocks = aStations[i].childNodes[13].textContent;
			   var iRadius = iNumFreeDocks * 10;
			   var THRESHOLD = 30;
			   var bCanGetADock = iRadius < THRESHOLD ? false : true;
			  
			   var oPopOptions = {
				   clickable: true,
				   strokeOpacity: 0.8,
				   strokeWeight: 2,
				   fillOpacity: 0.35,
				   map: oMap,
				   center: new google.maps.LatLng(fLat, fLong),
			   };
			   
			   if (bCanGetADock) {
				    oPopOptions.strokeColor = '#36D792';
			   		oPopOptions.fillColor = '#36D792';
			   		oPopOptions.radius = iRadius;
			   } else {
				    oPopOptions.strokeColor = '#FF0000';
			   		oPopOptions.fillColor = '#FF0000';
			   		oPopOptions.radius = 100;
			   }
			   
			   var circle = new google.maps.Circle(oPopOptions);
			   aCircles.push({
				   oCircle: circle,
				   name : sName,
				   nbDocks: iNumFreeDocks
			   });
		   }
		   
		   for (var j = 0; j < aCircles.length; j++) {
			   google.maps.event.addListener(aCircles[j].oCircle, 'click', function(k) {
				   return function() {
					   sap.m.MessageBox.show(
					      "Station " + aCircles[k].name + " has " + aCircles[k].nbDocks + " free docks",
					      sap.m.MessageBox.Icon.INFORMATION,
					      aCircles[k].name,
					      [sap.m.MessageBox.Action.OK],
					      function() { / * do something * /; }
					   );
				   };
			   }(j));
		   }
	   }
   },
   
   
	// framework method
   onExit: function() {
	   this._clean(this);
   },
   
   
   _clean: function(oController) {
	   oController._map = null;
	   delete oController._map;
	   oController._selfMarker = null;
	   delete oController._selfMarker;
   },
   
   
   _initializeMap: function(oController) {
	   navigator.geolocation.getCurrentPosition(function(oPosition) {
			
		    var oGooglePosition = new google.maps.LatLng(oPosition.coords.latitude, oPosition.coords.longitude);
		   
		    var oMapOptions = { 
			   zoom: 14,
			   center: oGooglePosition,
			   mapTypeId: google.maps.MapTypeId.ROADMAP
		    };
			 
		    oController._map = new google.maps.Map(document.getElementById('dockNowMap'),  oMapOptions);
		   
		    oController._selfMarker = new google.maps.Marker({
			   title: "You!",
			   position: oGooglePosition,
			   map: oController._map,
			   animation: google.maps.Animation.DROP,
			});
			
			var oUrl = DataProvider.getLiveBixiDataUrl();

			$.ajax({
				url: oUrl			
			}).done(function(oData) {
				var oModel = new sap.ui.model.xml.XMLModel(oData);
				sap.ui.getCore().setModel(oModel, "liveData");
				oController.drawDataCircles(oController._map);
				oController.showHideBusyDialog(false);
			}).fail(function() {
				oController.showHideBusyDialog(false);
				oController.showErrorDialog();
			});
		   		   
	   }, function() {
		   // failed 
		   oController.showErrorDialog();
	   });
   }

});