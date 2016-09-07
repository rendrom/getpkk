var projHash = {};
function initProj4js() {
    var crsDest = document.getElementById('crsDest');
    var optIndex = 0;
    for (var def in Proj4js.defs) {
        if (Proj4js.defs.hasOwnProperty(def)) {
            projHash[def] = new Proj4js.Proj(def);
            var label = def + " - " + (projHash[def].title ? projHash[def].title : '');
            crsDest.options[optIndex] = new Option(label, def);
            ++optIndex;
        }
    }
}

function transform(point, crsDest, crsSource) {
    crsSource = crsSource || "EPSG:4326";
    if (crsSource !== crsDest) {
        var projSource = projHash[crsSource];
        var projDest = projHash[crsDest];
        if (projDest && projSource) {
            var pointSource = new Proj4js.Point(point);
            var pointDest = Proj4js.transform(projSource, projDest, pointSource);
            return [pointDest.x, pointDest.y];
        }
    } else {
        return point;
    }
    return false;
}
