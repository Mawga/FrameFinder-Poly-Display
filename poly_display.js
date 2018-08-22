require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "dojo/domReady!",
    "esri/tasks/support/Query",
    "esri/geometry",
    "esri/layers/GraphicsLayer",
    "esri/geometry/Polygon",
    "esri/Graphic",
    "esri/symbols/SimpleFillSymbol",
    "esri/geometry/Extent",
    "esri/geometry/SpatialReference",
    "esri/geometry/projection",
    "dojo/on"
], function(Map, MapView, FeatureLayer, on, Query, geometry, GraphicsLayer, Polygon, Graphic, SimpleFillSymbol, Extent, SpatialReference, projection){

	var polyGeometryRings, frameID, flightID;

    var resultsLayer = new GraphicsLayer({
    	visible:true
    });

    var pointLayer = new FeatureLayer({
        portalItem: {
            id: "35eeef9ab1b649d2b0e4edb814f0432a"
        },
        outFields: ["*"],
        visible: true,
        spatialReference: new SpatialReference({wkid: 3857})
    });

    var polyLayer = new FeatureLayer({
      portalItem: {
        id: "33758426614e491a993be866a0166881"
      },
      outFields: ["*"],
      spatialReference: new SpatialReference({wkid: 3857})
    });

    var map = new Map({
        basemap: "topo",
        layers: [resultsLayer, pointLayer],
        spatialReference: new SpatialReference({wkid: 3857})
    });

    var view = new MapView({
        container: "viewDiv",
        map: map,
        zoom: 13.1,  // Sets zoom level based on level of detail (LOD)
        center: [-119.75, 34.45],  // Sets center point of view using longitude,latitude
        spatialReference: new SpatialReference({wkid: 3857})
    });

    // Load projection module
    projection.load();
    // Load poly layer
    polyLayer.load(view);

    // Listen for click event
    view.on("pointer-down", eventHandler);

    function eventHandler(event) {

        // Get coordinates of cursor
        var screenPoint = {
            x: event.x,
            y: event.y
        };

        view.hitTest(screenPoint).then(function (response) {

            //Cursor on graphic
            if (response.results.length) {// && !resultsLayer.graphics.length) { // Code testing to zoom to original on drawn polygon click

                // Clear pre-existing polygon graphic and get point graphic
            	resultsLayer.removeAll();
                var graphic = response.results.filter(function (result) {
                    return result.graphic.layer === pointLayer;
                })[0].graphic;
	            console.log(graphic.attributes.Frame);
              console.log(graphic.attributes.FlightID);

                //Get frameID to match to corresponding polygon
	            frameID = graphic.attributes.Frame;
                flightID = graphic.attributes.FlightID;

	            queryPolys()
	            	.then(addPoly);
		            
		        
            }

            // Cursor not on a graphic, zoom to original set map extent
            else {
            	resultsLayer.removeAll();
                /*
                view.goTo({
                  center: [-119.75, 34.45],
                  zoom: 13.1
                });
                */
            } 
        });
    }

    function queryPolys() {

        // Query polygon layer for corresponding frameID from pointslayer
        var query = polyLayer.createQuery();
        query.where = "Frame = '" + frameID + "' AND FlightID = '" + flightID + "'";
        query.outFields['*'];
        query.returnGeometry = true;

       	return polyLayer.queryFeatures(query)
       		.then(function(response) {

                    // Set polyGeometryRings to found polygon feature
       				polyGeometryRings = response.features.map(function(feature) {
       				return feature;
       			});
       				return polyGeometryRings;
       		});
    }

    function addPoly() {
        /***************************
        * Create a polygon graphic
        ***************************/
       // Creates polygon using rings from polygon layer
       // Assumes data is in NAD83 SR
        var polygon = {
            type: "polygon",
            spatialReference: new SpatialReference({wkid: 3310}),
            rings: polyGeometryRings[0].geometry.rings
        }

        // Out Spatial Reference Web Mercator
        var outSR = new SpatialReference({
            wkid: 3857
        });

        // Project polygon to Web Mercator
        polygon = projection.project(polygon, outSR);

        // Create a symbol for rendering the graphic
        var fillSymbol = {
            type: "simple-fill", // autocasts as new SimpleFillSymbol()
            color: "#5ab4ac",
            style: "diagonal-cross",
            outline: { // autocasts as new SimpleLineSymbol()
                color: "#707070",
                width: .75
            }
        };

        // Add the geometry and symbol to a new graphic
        var polygonGraphic = new Graphic({
            geometry: polygon,
            symbol: fillSymbol
        });

        // Add polygon graphic to graphic layer
        resultsLayer.add(polygonGraphic);
        view.goTo(polygonGraphic.geometry.extent.expand(2))
                .then(function() {      // Get and display attribute info of the polygon
                                        // Currently a little buggy, popup not showing up all the time
                    view.popup.open({
                    features: [polyGeometryRings[0]],
      				location: polygonGraphic.geometry.centroid
      			});
      		});
      		
    }

});