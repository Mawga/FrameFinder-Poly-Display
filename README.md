# Frame Finder Poly Display
## Maga Kim github: mawga

FrameFinder (http://mil.library.ucsb.edu/ap_indexes/FrameFinder/) was built using Web AppBuilder for ArcGIS.
The goal is to implement a poly display which causes the FrameFinder to zoom to the extent and display a polygon representing the area of the aerial photograph corresponding to the points on the WebMap.

I have written the correct behavior in poly_display.js but the code must be worked into FrameFinder-master/jimu.js/MapManager.js.
The points feature layer in poly_display.js cannot be accessed in the same fashion as it is already a part of the basemap used to create the web app.