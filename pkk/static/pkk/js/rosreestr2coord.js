var input = document.getElementById("area-code-input");
var goBtn = document.getElementById("get-area");
var helpBtn = document.getElementById("get-help");
var coordSelect = document.getElementById("coord-select");
var coordOptions = document.getElementById("coord-options");
var coordsList = document.getElementById("coords-list");
var infoBlock = document.getElementById("info");
var btnDefVal = goBtn.innerHTML;

var code = input.value;

var LIST_WITH_GEODESY = false;

var COORD_DECIMAL = 6;

var POINT_ID = 0;

var OSM = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 22
});

var map = L.map("map", {
    layers: [OSM],
    center: [60, 100],
    zoom: 3,
    maxZoom: 22
});

if (L.TileLayer.EsriRest) {
    new L.TileLayer.EsriRest("http://pkk5.rosreestr.ru/arcgis/rest/services/Cadastre/Cadastre/MapServer", {
        subdomains: "abcd",
        layers: '0,8,17,21',
        transparent: true,
        maxZoom: 22
    }).addTo(map);
}
var featureGroup = new L.FeatureGroup();
featureGroup.addTo(map);

var icon = L.divIcon({
    iconAnchor: [10, 10],
    className: "ico",
    html: "<div class='div-icon div-ico-new'>&#215;</div>"
});


var options = {
    position: 'topright',
    draw: {
        polyline: false,
        polygon: false,
        circle: false, // Turns off this drawing tool
        rectangle: false,
        marker: {
            icon: icon
        }
    },
    edit: {
        featureGroup: featureGroup,
        remove: true
    }

};

var drawControl = new L.Control.Draw(options);

var startLoading = function () {
    stopDraw();
    goBtn.innerHTML = "Загрузка...";
    goBtn.classList.add("disabled");
};
var stopLoading = function () {
    goBtn.innerHTML = btnDefVal;
    goBtn.classList.remove("disabled");
};

var stopDraw = function () {
    if (drawControl._map) {
        map.removeControl(drawControl);
    }
    map.off('draw:created', onDrawCreated);
    map.off('draw:deletestop', onDrawDeleteStop);
    map.off('draw:editstop', onDrawEditStop);
};

var startDraw = function () {
    map.addControl(drawControl);
    map.on('draw:created', onDrawCreated);
    map.on('draw:deletestop', onDrawDeleteStop);
    map.on('draw:editstop', onDrawEditStop);
};

var onDrawCreated = function (e) {
    var type = e.layerType,
        layer = e.layer;

    if (type === 'marker') {
        var latlng = layer.getLatLng();
        var newCoord = [latlng.lng, latlng.lat];
        var num = prompt("Укажите номер новой точки", ""+(POINT_ID+1));
        num = parseInt(num);
        if (num) {
            var cords = getMarkers().map(function(p) { return [p.x, p.y]});
            if (num <= cords.length) {
                cords.splice(parseInt(num), 0, newCoord);
                redrawMarkers(cords);
            } else {
                createMarkerFromCoord(newCoord);
            }
        } else {
            createMarkerFromCoord(newCoord);
        }
        changeCoord();
    }
};

var onDrawDeleteStop = function () {
    redrawMarkers();
    changeCoord();
};
var onDrawEditStop = function () {
    changeCoord();
};

var createMarkerFromCoord = function (coord, type) {
    var num = POINT_ID++;
    var icon = L.divIcon({
        iconSize: [28, 28],
        iconAnchor: [10, 10],
        className: "ico",
        html: "<div class='div-icon " + type + "'>&#215;" +
        "</div><div class='ico-label " + type + "'>"+num+"</div>"
    });
    var marker = L.marker([coord[1], coord[0]], {icon: icon});
    marker.num = coord[2] || num;
    marker.type = type;
    marker.bindPopup(num + ": " + coord[1] + " " + coord[0]);
    featureGroup.addLayer(marker);
    return marker;
};

var redrawMarkers = function (coords) {
    POINT_ID = 0;
    coords = coords || getMarkers().map(function(p) { return [p.x, p.y]});
    featureGroup.clearLayers();
    drawMarkers(coords);
};

var drawMarkers = function (coords) {
    var area = [];
    var holes = [];
    for (var fry = 0; fry < coords.length; fry++) {
        var coord = coords[fry];
        var xy = [coord[0], coord[1]];
        if (coord.type) {
            holes.push(xy);
        } else {
            area.push(xy);
        }
    }
    createMarkers(area);
    createHoleMarkers(holes);
};

var createMarkers = function (coordinates, type) {
   // POINT_ID = 0;
    for (var fry = 0; fry < coordinates.length; fry++) {
        createMarkerFromCoord(coordinates[fry], type);
    }
};

var createHoleMarkers = function (coords) {
    createMarkers(coords,  "hole");
};

var getMarkers = function () {
    return featureGroup.getLayers().map(function(p) {
        return {
            x: p.getLatLng().lng, 
            y: p.getLatLng().lat,
            num: p.num,
            type: p.type
        };
    });
};

var getMarkerByNum = function (num) {
    return featureGroup.getLayers().find(function (x) { return x.num === num; });
};

var showCoordList = function (markers) {
    coordsList.innerHTML = "";
    markers = markers || getMarkers();
    var prevCoord = null;
    for (var fry = 0; fry < markers.length; fry++) {
        var coord = markers[fry];
        var li = createCoordListItem(prevCoord, coord);
        coordsList.appendChild(li);
        prevCoord = coord;
    }
    // Close item = first item
    var closeLi = createCoordListItem(prevCoord, markers[0]);
    coordsList.appendChild(closeLi);
};

var createCoordListItem = function (prevCoord, coord) {
    var li = document.createElement("li");
    li.className = "selection list-group-item coords-list-item";
    if (coord.type) {
        li.className += " " + coord.type;
    }
    li.innerHTML = coord.num + ": " +
        parseFloat(coord.y).toFixed(COORD_DECIMAL) + " " +
        parseFloat(coord.x).toFixed(COORD_DECIMAL);
    li.onclick = function () {
        var marker = getMarkerByNum(coord.num);
        map.setView(marker.getLatLng(),20, {animate: true});

    };
    if (prevCoord && LIST_WITH_GEODESY) {
        var transformed = transformCoord(prevCoord, coord);
        var trans_ex = transformed[0];
        var trans_to = transformed[1];
        var x1 = trans_ex[0],
            y1 = trans_ex[1],
            x2 = trans_to[0],
            y2 = trans_to[1];
        var gdzLi = document.createElement("li");
        gdzLi.className = "list-group-item gdz-list";
        //var distance = calculateDistance(y1,x1, y2, x2);
        var prevLatLng = getLatLngFromMarker(getMarkerByNum(prevCoord.num));
        var distance = prevLatLng.distanceTo(getLatLngFromMarker(getMarkerByNum(coord.num)));
        if (distance) {
            var distElement = document.createElement("span");
            distElement.className = "gzn-list-item";
            distElement.innerHTML = "d: " + distance.toFixed(2) + "м";
            gdzLi.appendChild(distElement);
        }
        var gzn = calculateGzn(y1, x1, y2, x2, coord.num, prevCoord.num);
        //var gzn = calculateGzn(prevCoord.y, prevCoord.x, coord.y, coord.x);
        //var gzn = checkGzn(coord.y - prevCoord.y, coord.x - prevCoord.x);
        if (gzn) {
            var aElement = document.createElement("span");
            aElement.className = "gzn-list-item";
            aElement.innerHTML = "A: " + gzn.toFixed(2) + "&#176;";
            gdzLi.appendChild(aElement);
        }
        if (distance || gzn) {
            coordsList.appendChild(gdzLi);
        }
    }
    return li;
};

var getLatLngFromMarker = function (marker) {
    return new L.LatLng(marker.getLatLng().lat, marker.getLatLng().lng);
};

var calculateDistance = function (x1, y1, x2, y2) {
    var xdiff = x2 - x1,
        ydiff = y2 - y1;
    return Math.pow((xdiff * xdiff + ydiff * ydiff), 0.5);
};

var checkGzn = function (x, y) {
    var a = Math.atan(y/x);
    if (x > 0 && y > 0) { return a; }
    else if (x < 0 && y > 0) { return Math.PI - a; }
    else if (x < 0 && y < 0) { return Math.PI + a; }
    else if (x > 0 && y < 0) { return 2*Math.PI - a;}
    return false;
};

// А =PI-PI*sgn(sgn(X)+1)*sgn(Y)+arctg(Y/(X+C)).
// sgn - (знак числа; 1 если х>0; 0 если х=0; -1 если х<0.)
// C=1*10-7 пренебрегаемо  малая  константа, позволяющая избежать деления на ноль. 
//          Результаты численных экспериментов показали ее состоятельность.
// Х= (Х2-Х1);  У=(У2-У1)  это координаты точек 1 и 2 
var calculateGzn = function (x1, y1, x2, y2, num, prevNum) {
    var x = x2 - x1,
        y = y2 - y1;

    var sgn = function (i) {
        var s = 0;
        if (i > 0) {
            s = 1;
        } else if (i < 0) {
            s = -1
        }
        return s;
    };
    var gzn = Math.PI - Math.PI * sgn(sgn(x)+1) * sgn(y) + Math.atan(y/x);
    var classicGzn = checkGzn(x, y);
    if (gzn !== classicGzn) {
        console.warn("Ошибка вычисление азимута для " + prevNum + "-" + num + ":");
        console.log("x1: " + x1 + "; y1: " + y1 + "; x2: " + x2 + "; y2: " + y2);
        console.log("dx: " + x + "; dy: " + y);
        console.log("По формуле А =PI-PI*sgn(sgn(X)+1)*sgn(Y)+arctg(Y/X) =" + gzn);
        console.log("Классическое вычисление = " + classicGzn);
    }
    return gzn * (180/Math.PI);
};

var transformCoord = function (ex, to) {
    var lonLatSystem = ["WGS84", "EPSG:4326", "EPSG:4269"];
    var crsSource = document.getElementById("crsDest").value;
    var trans_ex,trans_to;
    if (lonLatSystem.indexOf(crsSource) !== -1) {
        var crsDestVal = "EPSG:3875";
        trans_ex = transform([ex.x,ex.y], crsDestVal, crsSource);
        trans_to = transform([to.x,to.y], crsDestVal, crsSource);
    } else {
        trans_ex = [ex.x,ex.y];
        trans_to = [to.x,to.y];
    }
    return [trans_ex, trans_to];
};

var changeCoord = function () {
    var transCoordList = [];
    var crsDest = document.getElementById("crsDest");
    var coords = getMarkers();
    if (crsDest) {
        var crsDestVal = crsDest.value;
        for (var fry = 0; fry < coords.length; fry++) {
            var coord = [coords[fry].x, coords[fry].y];
            var trans = transform(coord, crsDestVal);
            transCoordList.push({x:trans[0].toFixed(6), y:trans[1].toFixed(6), num:coords[fry].num});
        }
    }
    showCoordList(transCoordList);
};

var build = function (data) {
    POINT_ID = 0;
    prepare(data);
    if (data.coordinates) {
        if (data.coordinates.length > 1000) {
            alert('Слишком много узлов в полигоне. Попробуйте уыеличить параметр epsila в запросе: ' +
                '38:36:000021:1106e10');
            return;
        }
        var coords = data.coordinates;
        buildArea(coords);
        // exclude closing point
        if (data.holes) {
            for (var f = 0; f < data.holes.length; f++) {
                buildArea(data.holes[f], "hole");
            }
        }
        map.fitBounds(featureGroup.getBounds());
        startDraw();
        showCoordList();
    }
};

var buildArea = function (coords, type) {
    // exclude closing point
    var first = coords[0];
    var last = coords[coords.length-1];
    if (first[0] === last[0] && first[1] === last[1]) {
        coords = coords.slice(0, coords.length-1);
    }
    createMarkers(coords, type);
};

var prepare = function (data) {
    if (!input.value && data.code) {
        input.value = data.code;
    }
    var address = data.attrs && data.attrs.address;
    var pkk_url;
    if (address) {
            var info = document.createElement("div");
            info.className = "info-item";
            info.innerHTML = address;
            infoBlock.appendChild(info);
    }
    // PKK link with Search
    if (data.center_pkk && data.code) {
        var c = data.center_pkk;
        var link = document.createElement("a");
        var linkText = document.createTextNode("На сайте PKK");
        link.className = "info-item link";
        pkk_url = "http://pkk5.rosreestr.ru/#x=" + c.x + "&y=" + c.y + "&text=" + data.code
            + "&app=search&opened=1";
        link.setAttribute('href', pkk_url);
        link.setAttribute('target', "_blank");
        link.appendChild(linkText);
        infoBlock.appendChild(link);
    }

    var filename, pom;
    var name = data.code.replace(/:/g, "-");
    if (data.kml) {
        var kmldata = '<?xml version="1.0" encoding="utf-8" ?>' +
            '<kml xmlns="http://www.opengis.net/kml/2.2"><Document id="root_doc">' +
            '<Style id="default0"><LineStyle><color>ff0000ff</color></LineStyle><PolyStyle><fill>0</fill></PolyStyle></Style>' +
            '<Placemark>' +
            '<description><![CDATA['+
            ( address? address + '<br>' : "" )+
            '<a href="http://geonote.ru/pkk/' + name +'">Координаты</a>' +
            ( pkk_url ? ', <a href="' + pkk_url +'">PKK</a>' : "") +
            ']]></description>' +
            '<name>' + data.code + '</name>' + '<styleUrl>#default0</styleUrl>' + data.kml +
            '</Placemark></Document></kml>';
        filename = name + ".kml";
        pom = createBlob(filename, kmldata, "Kml", "info-item link kml-link");
        infoBlock.appendChild(pom);
    }

    if (data.geojson && data.code) {
        filename = name + ".geojson";
        pom = createBlob(filename, data.geojson, "Geojson", "info-item link geojson-link");
        infoBlock.appendChild(pom);
    }

    // Change coordinates input
    if (data.coordinates && data.code) {
        if (initProj4js) {
            var crsDest = document.createElement("select");
            crsDest.id = "crsDest";
            crsDest.className = "form-control";
            coordSelect.appendChild(crsDest);
            initProj4js();
            crsDest.onchange = function () {
                changeCoord();
            };
        }

        // Draw geodesy btn
        var geodesyCheckbox = document.createElement("input");
        geodesyCheckbox.setAttribute("type", "checkbox");
        geodesyCheckbox.id = "is-geodesy-checkbox";
        geodesyCheckbox.className = "coord-options";
        geodesyCheckbox.checked = LIST_WITH_GEODESY;
        coordOptions.appendChild(geodesyCheckbox);
        var checkboxlabel = document.createElement("label");
        checkboxlabel.setAttribute("for", geodesyCheckbox.id);
        checkboxlabel.innerHTML = "геодезия";
        coordOptions.appendChild(checkboxlabel);
        geodesyCheckbox.onclick = onGeodesyCheckboxClick;

        // decimal places
        var decimalSelect = document.createElement("select");
        decimalSelect.id = "decimal-places";
        decimalSelect.className = "coord-options";
        coordOptions.appendChild(decimalSelect);
        var decimalSelectLabel = document.createElement("label");
        decimalSelectLabel.setAttribute("for", decimalSelect.id);
        decimalSelectLabel.innerHTML = "округление";
        coordOptions.appendChild(decimalSelectLabel);
        for (var fry = 0; fry < 7; fry++) {
            var option = document.createElement("option");
            option.value = fry;
            option.text = fry;
            decimalSelect.appendChild(option);
            if (fry === COORD_DECIMAL) {
                option.setAttribute('selected', "true");
            }
        }
        coordOptions.onchange = onDecimalSelectChange;

    } else {
        var warning = document.createElement("div");
        warning.className = "alert alert-danger not-coordinates-warning";
        warning.setAttribute("role", "alert");
        warning.innerHTML = "Не удаётся загрузить координаты с сервиса PKK";
        infoBlock.appendChild(warning)
    }

};

var createBlob = function (filename, exportData, html, className, type) {
    type = type || 'text/plain';
    var pom = document.createElement('a');
    var bb = new Blob([exportData], {type: type});
    pom.setAttribute('href', window.URL.createObjectURL(bb));
    pom.setAttribute('download', filename);
    pom.dataset.downloadurl = [type, pom.download, pom.href].join(':');
    pom.className = className;
    pom.innerHTML = html;
    return pom;
};

var onGeodesyCheckboxClick = function (e) {
    toogleGeodesy(e.target.checked);
};

var onDecimalSelectChange = function (e) {
    var val = parseInt(e.target.value);
    if (!isNaN(val) && val !== COORD_DECIMAL) {
        COORD_DECIMAL = val;
        changeCoord();
    }
};

var toogleGeodesy = function (withGeodesy) {
    if (withGeodesy !== LIST_WITH_GEODESY) {
        LIST_WITH_GEODESY = !LIST_WITH_GEODESY;
        changeCoord();
    }
};

var clear = function () {
    stopLoading();
    POINT_ID = 0;
    featureGroup.clearLayers();
    coordSelect.innerHTML = "";
    coordOptions.innerHTML = "";
    infoBlock.innerHTML = "";
    coordsList.innerHTML = "";
};

goBtn.onclick = function () {
    clear();
    startLoading();
    code = input.value;
    if (code) {
        getJSON({
            url: "get/" + code,
            resolve: function (data) {
                build(data);
                if (data.code && history) {
//                    history.pushState(data, document.title, data.code)
                }
                stopLoading();
            },
            reject: function () {
                stopLoading();
                alert("Поиск не дал результатов. Измените кадастровый номер и попробуйте ещё раз.");
                console.log("Error");
            }
        })
    }
};

//window.onpopstate = function(event) {
//    if (event && event.state && event.state.code) {
//        build(event.state);
//    } else {
//        clear();
//        input.value = "";
//    }
//};


var getJSON = function (opt) {
    var url = opt.url;
    var resolve = opt.resolve;
    var reject = opt.reject;
    var data = opt.data || {};
    var req = new XMLHttpRequest();
    var body = JSON.stringify(data);
    req.open("GET", url, true);
    req.setRequestHeader("Content-Type", "application/json");
    req.onload = function () {
        if (req.status === 200) {
            resolve(JSON.parse(req.response));
        } else {
            reject(Error(req.statusText));
        }
    };
    req.onerror = function () {
        var errStr = "Network Error";
        reject(Error(errStr));
    };
    req.send(body);
};


// OTHER

helpBtn.onclick = function () {
    alert("Добавьте к кадастровому номеру e[ЧИСЛО] чтобы изменить количество распознаваемых узлов в полигоне. " +
        "Чем e больше, тем узлов меньше. Примеры: 38:06:144003:4723e0.8; 38:36:000021:1106e10")
};