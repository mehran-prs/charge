Project about physics force of charges on each other.
contain charges in sphere,sphere game, chips affect of two positive and negative charges, also chips game.

How to add new threejs tab(create new threejs app)
---
1. insert your tab in app.html and set
 `data-render="{your new threejs app name}"`
 
2. add tab content of this tab.

3. in app.js file in `renders` object set your threejs 
app name as a number (e.g `game:2`)

4. write the function that initialize your app and call
 this function in `init` method of app (e.g `game` 
 function that call in `init` method).
