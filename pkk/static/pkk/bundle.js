/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	__webpack_require__(1);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _leaflet = __webpack_require__(2);
	
	var _leaflet2 = _interopRequireDefault(_leaflet);
	
	__webpack_require__(3);
	
	var _msk2wgs = __webpack_require__(4);
	
	var _Request = __webpack_require__(9);
	
	var _Mapster = __webpack_require__(14);
	
	var _Mapster2 = _interopRequireDefault(_Mapster);
	
	var _pageBuilder = __webpack_require__(15);
	
	var _utils = __webpack_require__(18);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var mapster = new _Mapster2.default('map');
	var map = mapster.getMap();
	
	var input = document.getElementById("area-code-input");
	var goBtn = document.getElementById("get-area");
	var coordSelect = document.getElementById("coord-select");
	var coordOptions = document.getElementById("coord-options");
	var coordsList = document.getElementById("coords-list");
	var infoBlock = document.getElementById("info");
	var btnDefVal = goBtn.innerHTML;
	var getLink = document.getElementById("get-link");
	var mapClickModeBtn = document.getElementById("map-click-mode");
	
	var mapClickModeOn = false;
	
	var types = new _pageBuilder.AreaTypes();
	
	var code = input.value;
	
	var LIST_WITH_GEODESY = false;
	
	var COORD_DECIMAL = 6;
	
	var POINT_ID = 0;
	
	var featureGroup = new _leaflet2.default.FeatureGroup();
	featureGroup.addTo(map);
	
	var icon = _leaflet2.default.divIcon({
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
	
	var drawControl = new _leaflet2.default.Control.Draw(options);
	
	var startLoading = function startLoading() {
	    clear();
	    stopDraw();
	    goBtn.innerHTML = "Загрузка...";
	    goBtn.classList.add("disabled");
	    map._container.style.cursor = "wait";
	};
	var stopLoading = function stopLoading() {
	    goBtn.innerHTML = btnDefVal;
	    goBtn.classList.remove("disabled");
	    setMapCursor();
	};
	
	var stopDraw = function stopDraw() {
	    if (drawControl._map) {
	        map.removeControl(drawControl);
	    }
	    map.off('draw:created', onDrawCreated);
	    map.off('draw:deletestop', onDrawDeleteStop);
	    map.off('draw:editstop', onDrawEditStop);
	};
	
	var startDraw = function startDraw() {
	    map.addControl(drawControl);
	    map.on('draw:created', onDrawCreated);
	    map.on('draw:deletestop', onDrawDeleteStop);
	    map.on('draw:editstop', onDrawEditStop);
	};
	
	var onDrawCreated = function onDrawCreated(e) {
	    var type = e.layerType,
	        layer = e.layer;
	
	    if (type === 'marker') {
	        var latlng = layer.getLatLng();
	        var newCoord = [latlng.lng, latlng.lat];
	        var num = prompt("Укажите номер новой точки", "" + (POINT_ID + 1));
	        num = parseInt(num);
	        if (num) {
	            var cords = getMarkers().map(function (p) {
	                return [p.x, p.y];
	            });
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
	
	var onDrawDeleteStop = function onDrawDeleteStop() {
	    redrawMarkers();
	    changeCoord();
	};
	var onDrawEditStop = function onDrawEditStop() {
	    changeCoord();
	};
	
	var createMarkerFromCoord = function createMarkerFromCoord(coord, type) {
	    var num = POINT_ID++;
	    var icon = _leaflet2.default.divIcon({
	        iconSize: [28, 28],
	        iconAnchor: [10, 10],
	        className: "ico",
	        html: "<div class='div-icon " + type + "'>&#215;" + "</div><div class='ico-label " + type + "'>" + num + "</div>"
	    });
	    var marker = _leaflet2.default.marker([coord[1], coord[0]], { icon: icon });
	    marker.num = coord[2] || num;
	    marker.type = type;
	    marker.bindPopup(num + ": " + coord[1] + " " + coord[0]);
	    featureGroup.addLayer(marker);
	    return marker;
	};
	
	var redrawMarkers = function redrawMarkers(coords) {
	    POINT_ID = 0;
	    coords = coords || getMarkers().map(function (p) {
	        return [p.x, p.y];
	    });
	    featureGroup.clearLayers();
	    drawMarkers(coords);
	};
	
	var drawMarkers = function drawMarkers(coords) {
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
	
	var createMarkers = function createMarkers(coordinates, type) {
	    // POINT_ID = 0;
	    for (var fry = 0; fry < coordinates.length; fry++) {
	        createMarkerFromCoord(coordinates[fry], type);
	    }
	};
	
	var createHoleMarkers = function createHoleMarkers(coords) {
	    createMarkers(coords, "hole");
	};
	
	var getMarkers = function getMarkers() {
	    return featureGroup.getLayers().filter(function (p) {
	        return p.getLatLng;
	    }).map(function (p) {
	        return {
	            x: p.getLatLng().lng,
	            y: p.getLatLng().lat,
	            num: p.num,
	            type: p.type
	        };
	    });
	};
	
	var getMarkerByNum = function getMarkerByNum(num) {
	    return featureGroup.getLayers().find(function (x) {
	        return x.num === num;
	    });
	};
	
	var showCoordList = function showCoordList(markers) {
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
	
	var createCoordListItem = function createCoordListItem(prevCoord, coord) {
	    var li = document.createElement("li");
	    li.className = "selection list-group-item coords-list-item";
	    if (coord.type) {
	        li.className += " " + coord.type;
	    }
	    li.innerHTML = coord.num + ": " + parseFloat(coord.y).toFixed(COORD_DECIMAL) + " " + parseFloat(coord.x).toFixed(COORD_DECIMAL);
	    li.onclick = function () {
	        var marker = getMarkerByNum(coord.num);
	        map.setView(marker.getLatLng(), 20, { animate: true });
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
	        //let distance = calculateDistance(y1,x1, y2, x2);
	        var prevLatLng = getLatLngFromMarker(getMarkerByNum(prevCoord.num));
	        var distance = prevLatLng.distanceTo(getLatLngFromMarker(getMarkerByNum(coord.num)));
	        if (distance) {
	            var distElement = document.createElement("span");
	            distElement.className = "gzn-list-item";
	            distElement.innerHTML = "d: " + distance.toFixed(2) + "м";
	            gdzLi.appendChild(distElement);
	        }
	        var gzn = calculateGzn(y1, x1, y2, x2, coord.num, prevCoord.num);
	        //let gzn = calculateGzn(prevCoord.y, prevCoord.x, coord.y, coord.x);
	        //let gzn = checkGzn(coord.y - prevCoord.y, coord.x - prevCoord.x);
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
	
	var getLatLngFromMarker = function getLatLngFromMarker(marker) {
	    return new _leaflet2.default.LatLng(marker.getLatLng().lat, marker.getLatLng().lng);
	};
	
	var calculateDistance = function calculateDistance(x1, y1, x2, y2) {
	    var xdiff = x2 - x1,
	        ydiff = y2 - y1;
	    return Math.pow(xdiff * xdiff + ydiff * ydiff, 0.5);
	};
	
	var checkGzn = function checkGzn(x, y) {
	    var a = Math.atan(y / x);
	    if (x > 0 && y > 0) {
	        return a;
	    } else if (x < 0 && y > 0) {
	        return Math.PI - a;
	    } else if (x < 0 && y < 0) {
	        return Math.PI + a;
	    } else if (x > 0 && y < 0) {
	        return 2 * Math.PI - a;
	    }
	    return false;
	};
	
	// А =PI-PI*sgn(sgn(X)+1)*sgn(Y)+arctg(Y/(X+C)).
	// sgn - (знак числа; 1 если х>0; 0 если х=0; -1 если х<0.)
	// C=1*10-7 пренебрегаемо  малая  константа, позволяющая избежать деления на ноль.
	//          Результаты численных экспериментов показали ее состоятельность.
	// Х= (Х2-Х1);  У=(У2-У1)  это координаты точек 1 и 2
	var calculateGzn = function calculateGzn(x1, y1, x2, y2, num, prevNum) {
	    var x = x2 - x1,
	        y = y2 - y1;
	
	    var sgn = function sgn(i) {
	        var s = 0;
	        if (i > 0) {
	            s = 1;
	        } else if (i < 0) {
	            s = -1;
	        }
	        return s;
	    };
	    var gzn = Math.PI - Math.PI * sgn(sgn(x) + 1) * sgn(y) + Math.atan(y / x);
	    var classicGzn = checkGzn(x, y);
	    // if (gzn !== classicGzn) {
	    //     console.warn("Ошибка вычисление азимута для " + prevNum + "-" + num + ":");
	    //     console.log("x1: " + x1 + "; y1: " + y1 + "; x2: " + x2 + "; y2: " + y2);
	    //     console.log("dx: " + x + "; dy: " + y);
	    //     console.log("По формуле А =PI-PI*sgn(sgn(X)+1)*sgn(Y)+arctg(Y/X) =" + gzn);
	    //     console.log("Классическое вычисление = " + classicGzn);
	    // }
	    return gzn * (180 / Math.PI);
	};
	
	var transformCoord = function transformCoord(ex, to) {
	    var lonLatSystem = ["WGS84", "EPSG:4326", "EPSG:4269"];
	    var crsSource = document.getElementById("crsDest").value;
	    var trans_ex = void 0,
	        trans_to = void 0;
	    if (lonLatSystem.indexOf(crsSource) !== -1) {
	        var crsDestVal = "EPSG:3875";
	        trans_ex = (0, _msk2wgs.transform)([ex.x, ex.y], crsDestVal, crsSource);
	        trans_to = (0, _msk2wgs.transform)([to.x, to.y], crsDestVal, crsSource);
	    } else {
	        trans_ex = [ex.x, ex.y];
	        trans_to = [to.x, to.y];
	    }
	    return [trans_ex, trans_to];
	};
	
	var changeCoord = function changeCoord() {
	    var transCoordList = [];
	    var crsDest = document.getElementById("crsDest");
	    var coords = getMarkers();
	    if (crsDest) {
	        var crsDestVal = crsDest.value;
	        for (var fry = 0; fry < coords.length; fry++) {
	            var coord = [coords[fry].x, coords[fry].y];
	            var trans = (0, _msk2wgs.transform)(coord, crsDestVal);
	            transCoordList.push({ x: trans[0].toFixed(6), y: trans[1].toFixed(6), num: coords[fry].num });
	        }
	    }
	    showCoordList(transCoordList);
	};
	
	var build = function build(data) {
	    POINT_ID = 0;
	    prepare(data);
	    if (data.area_type) {
	        types.setTypeById(data.area_type);
	    }
	    if (data.coordinates) {
	        // if (data.coordinates.length > 1000) {
	        //     alert('Слишком много узлов в полигоне. Попробуйте уеличить параметр epsila в запросе: ' +
	        //         '38:36:000021:1106e10');
	        //     return;
	        // }
	        if (data.geojson) {
	            var feature = JSON.parse(data.geojson);
	            _leaflet2.default.geoJSON(feature.features, {
	                style: {
	                    fillColor: "#2f4f50",
	                    color: "#2f4f50",
	                    weight: 1,
	                    opacity: 1,
	                    fillOpacity: 0.3
	                }
	            }).addTo(featureGroup);
	        }
	        var coords = data.coordinates;
	        coords.forEach(function (c) {
	            buildArea(c[0]);
	            // exclude closing point
	            var holes = c.slice(1, c.length);
	            holes.forEach(function (h) {
	                buildArea(h, "hole");
	            });
	        });
	        // map.fitBounds(featureGroup.getBounds());
	        map.flyToBounds(featureGroup.getBounds());
	        showCoordList();
	        startDraw();
	    }
	};
	
	var buildArea = function buildArea(coords, type) {
	    // exclude closing point
	    var first = coords[0];
	    var last = coords[coords.length - 1];
	    if (first[0] === last[0] && first[1] === last[1]) {
	        coords = coords.slice(0, coords.length - 1);
	    }
	    createMarkers(coords, type);
	};
	
	var prepare = function prepare(data) {
	    if (!input.value && data.code) {
	        input.value = data.code;
	    }
	    var address = data.attrs && data.attrs.address;
	    var pkk_url = void 0;
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
	        pkk_url = 'http://pkk5.rosreestr.ru/#x=' + c.x + '&y=' + c.y + '&text=' + data.code + '&app=search&opened=1';
	        link.setAttribute('href', pkk_url);
	        link.setAttribute('target', "_blank");
	        link.appendChild(linkText);
	        infoBlock.appendChild(link);
	    }
	
	    var filename = void 0,
	        pom = void 0;
	    var name = data.code.replace(/:/g, "-");
	    if (data.kml) {
	        var kmldata = '<?xml version="1.0" encoding="utf-8" ?>\n            <kml xmlns="http://www.opengis.net/kml/2.2"><Document id="root_doc">\n            <Style id="default0">\n                <LineStyle><color>ff0000ff</color></LineStyle><PolyStyle><fill>0</fill></PolyStyle></Style>\n            <Placemark>\n            <description><![CDATA[\n                ' + (address ? address + '<br>' : "") + '\n                <a href="http://getpkk.ru/' + name + '">\u041A\u043E\u043E\u0440\u0434\u0438\u043D\u0430\u0442\u044B</a>\n                ' + (pkk_url ? ', <a href="' + pkk_url + '">PKK</a>' : '') + '\n            ]]></description>\n            <name>' + data.code + '</name><styleUrl>#default0</styleUrl>' + data.kml + '</Placemark></Document></kml>';
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
	        if (_msk2wgs.initProj4) {
	            var crsDest = document.createElement("select");
	            crsDest.id = "crsDest";
	            crsDest.className = "form-control";
	            coordSelect.appendChild(crsDest);
	            (0, _msk2wgs.initProj4)();
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
	        infoBlock.appendChild(warning);
	    }
	};
	
	var createBlob = function createBlob(filename, exportData, html, className, type) {
	    type = type || 'text/plain';
	    var pom = document.createElement('a');
	    var bb = new Blob([exportData], { type: type });
	    pom.setAttribute('href', window.URL.createObjectURL(bb));
	    pom.setAttribute('download', filename);
	    pom.dataset.downloadurl = [type, pom.download, pom.href].join(':');
	    pom.className = className;
	    pom.innerHTML = html;
	    return pom;
	};
	
	var onGeodesyCheckboxClick = function onGeodesyCheckboxClick(e) {
	    toogleGeodesy(e.target.checked);
	};
	
	var onDecimalSelectChange = function onDecimalSelectChange(e) {
	    var val = parseInt(e.target.value);
	    if (!isNaN(val) && val !== COORD_DECIMAL) {
	        COORD_DECIMAL = val;
	        changeCoord();
	    }
	};
	
	var toogleGeodesy = function toogleGeodesy(withGeodesy) {
	    if (withGeodesy !== LIST_WITH_GEODESY) {
	        LIST_WITH_GEODESY = !LIST_WITH_GEODESY;
	        changeCoord();
	    }
	};
	
	var clear = function clear() {
	    stopLoading();
	    POINT_ID = 0;
	    featureGroup.clearLayers();
	    coordSelect.innerHTML = "";
	    coordOptions.innerHTML = "";
	    infoBlock.innerHTML = "";
	    coordsList.innerHTML = "";
	};
	
	goBtn.onclick = function () {
	    code = input.value;
	    if (!code) {
	        alert("Введите кадастровый номер");
	        return;
	    }
	    getAreaByCode(code);
	};
	
	var getAreaByCode = function getAreaByCode(code) {
	
	    startLoading();
	
	    if (code) {
	        (0, _Request.getJSON)('/get/' + code + '/' + types.type, { method: "POST" }).then(function (data) {
	            input.value = code;
	            build(data);
	            stopLoading();
	        }).catch(function () {
	            stopLoading();
	            alert("Поиск не дал результатов. Измените кадастровый номер и попробуйте ещё раз.");
	            console.log("Error");
	        });
	    }
	};
	
	getLink.onclick = function () {
	    getLink.blur();
	    if (code) {
	        alert('http://getpkk.ru/' + (types.type || 1) + '/' + code);
	    } else {
	        alert("Введите кадастровый номер");
	    }
	};
	
	mapClickModeBtn.onclick = function () {
	    mapClickModeOn = !mapClickModeOn;
	    mapClickModeBtn.blur();
	    if (mapClickModeOn) {
	        mapClickModeBtn.classList.add("active");
	        map.on("click", onMapClickModeBtnClick, this);
	        setMapCursor();
	    } else {
	        mapClickModeBtn.classList.remove("active");
	        map.off("click", onMapClickModeBtnClick, this);
	        setMapCursor();
	    }
	};
	
	var setMapCursor = function setMapCursor() {
	    map._container.style.cursor = mapClickModeOn ? "crosshair" : "";
	};
	
	var onMapClickModeBtnClick = function onMapClickModeBtnClick(e) {
	    getAreaFromLatLng(e.latlng);
	};
	
	var getAreaFromLatLng = function getAreaFromLatLng(latlng) {
	    var urlStr = (0, _utils.serializeUrlParam)({
	        text: [latlng.lat, latlng.lng].join(","),
	        tolerance: 1
	    });
	    startLoading();
	    return (0, _Request.getJSON)('http://pkk5.rosreestr.ru/api/features?' + urlStr).then(function (data) {
	        stopLoading();
	        if (data && data.features) {
	            var pkkFeature = data.features.find(function (obj) {
	                return obj.attrs && obj.attrs.cn && obj.attrs.cn.split(":").length === 4;
	            });
	            if (pkkFeature && pkkFeature.center) {
	                getAreaByCode(pkkFeature.attrs.cn);
	            }
	        }
	    }).catch(function () {
	        startLoading();
	    });
	};
	
	// OTHER
	
	
	if (window && !window.build) {
	    window.build = build;
	}

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
	 Leaflet 1.0.1, a JS library for interactive maps. http://leafletjs.com
	 (c) 2010-2016 Vladimir Agafonkin, (c) 2010-2011 CloudMade
	*/
	(function (window, document, undefined) {
	var L = {
		version: "1.0.1"
	};
	
	function expose() {
		var oldL = window.L;
	
		L.noConflict = function () {
			window.L = oldL;
			return this;
		};
	
		window.L = L;
	}
	
	// define Leaflet for Node module pattern loaders, including Browserify
	if (typeof module === 'object' && typeof module.exports === 'object') {
		module.exports = L;
	
	// define Leaflet as an AMD module
	} else if (true) {
		!(__WEBPACK_AMD_DEFINE_FACTORY__ = (L), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}
	
	// define Leaflet as a global L variable, saving the original L to restore later if needed
	if (typeof window !== 'undefined') {
		expose();
	}
	
	
	
	/*
	 * @namespace Util
	 *
	 * Various utility functions, used by Leaflet internally.
	 */
	
	L.Util = {
	
		// @function extend(dest: Object, src?: Object): Object
		// Merges the properties of the `src` object (or multiple objects) into `dest` object and returns the latter. Has an `L.extend` shortcut.
		extend: function (dest) {
			var i, j, len, src;
	
			for (j = 1, len = arguments.length; j < len; j++) {
				src = arguments[j];
				for (i in src) {
					dest[i] = src[i];
				}
			}
			return dest;
		},
	
		// @function create(proto: Object, properties?: Object): Object
		// Compatibility polyfill for [Object.create](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/create)
		create: Object.create || (function () {
			function F() {}
			return function (proto) {
				F.prototype = proto;
				return new F();
			};
		})(),
	
		// @function bind(fn: Function, …): Function
		// Returns a new function bound to the arguments passed, like [Function.prototype.bind](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).
		// Has a `L.bind()` shortcut.
		bind: function (fn, obj) {
			var slice = Array.prototype.slice;
	
			if (fn.bind) {
				return fn.bind.apply(fn, slice.call(arguments, 1));
			}
	
			var args = slice.call(arguments, 2);
	
			return function () {
				return fn.apply(obj, args.length ? args.concat(slice.call(arguments)) : arguments);
			};
		},
	
		// @function stamp(obj: Object): Number
		// Returns the unique ID of an object, assiging it one if it doesn't have it.
		stamp: function (obj) {
			/*eslint-disable */
			obj._leaflet_id = obj._leaflet_id || ++L.Util.lastId;
			return obj._leaflet_id;
			/*eslint-enable */
		},
	
		// @property lastId: Number
		// Last unique ID used by [`stamp()`](#util-stamp)
		lastId: 0,
	
		// @function throttle(fn: Function, time: Number, context: Object): Function
		// Returns a function which executes function `fn` with the given scope `context`
		// (so that the `this` keyword refers to `context` inside `fn`'s code). The function
		// `fn` will be called no more than one time per given amount of `time`. The arguments
		// received by the bound function will be any arguments passed when binding the
		// function, followed by any arguments passed when invoking the bound function.
		// Has an `L.bind` shortcut.
		throttle: function (fn, time, context) {
			var lock, args, wrapperFn, later;
	
			later = function () {
				// reset lock and call if queued
				lock = false;
				if (args) {
					wrapperFn.apply(context, args);
					args = false;
				}
			};
	
			wrapperFn = function () {
				if (lock) {
					// called too soon, queue to call later
					args = arguments;
	
				} else {
					// call and lock until later
					fn.apply(context, arguments);
					setTimeout(later, time);
					lock = true;
				}
			};
	
			return wrapperFn;
		},
	
		// @function wrapNum(num: Number, range: Number[], includeMax?: Boolean): Number
		// Returns the number `num` modulo `range` in such a way so it lies within
		// `range[0]` and `range[1]`. The returned value will be always smaller than
		// `range[1]` unless `includeMax` is set to `true`.
		wrapNum: function (x, range, includeMax) {
			var max = range[1],
			    min = range[0],
			    d = max - min;
			return x === max && includeMax ? x : ((x - min) % d + d) % d + min;
		},
	
		// @function falseFn(): Function
		// Returns a function which always returns `false`.
		falseFn: function () { return false; },
	
		// @function formatNum(num: Number, digits?: Number): Number
		// Returns the number `num` rounded to `digits` decimals, or to 5 decimals by default.
		formatNum: function (num, digits) {
			var pow = Math.pow(10, digits || 5);
			return Math.round(num * pow) / pow;
		},
	
		// @function trim(str: String): String
		// Compatibility polyfill for [String.prototype.trim](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String/Trim)
		trim: function (str) {
			return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
		},
	
		// @function splitWords(str: String): String[]
		// Trims and splits the string on whitespace and returns the array of parts.
		splitWords: function (str) {
			return L.Util.trim(str).split(/\s+/);
		},
	
		// @function setOptions(obj: Object, options: Object): Object
		// Merges the given properties to the `options` of the `obj` object, returning the resulting options. See `Class options`. Has an `L.setOptions` shortcut.
		setOptions: function (obj, options) {
			if (!obj.hasOwnProperty('options')) {
				obj.options = obj.options ? L.Util.create(obj.options) : {};
			}
			for (var i in options) {
				obj.options[i] = options[i];
			}
			return obj.options;
		},
	
		// @function getParamString(obj: Object, existingUrl?: String, uppercase?: Boolean): String
		// Converts an object into a parameter URL string, e.g. `{a: "foo", b: "bar"}`
		// translates to `'?a=foo&b=bar'`. If `existingUrl` is set, the parameters will
		// be appended at the end. If `uppercase` is `true`, the parameter names will
		// be uppercased (e.g. `'?A=foo&B=bar'`)
		getParamString: function (obj, existingUrl, uppercase) {
			var params = [];
			for (var i in obj) {
				params.push(encodeURIComponent(uppercase ? i.toUpperCase() : i) + '=' + encodeURIComponent(obj[i]));
			}
			return ((!existingUrl || existingUrl.indexOf('?') === -1) ? '?' : '&') + params.join('&');
		},
	
		// @function template(str: String, data: Object): String
		// Simple templating facility, accepts a template string of the form `'Hello {a}, {b}'`
		// and a data object like `{a: 'foo', b: 'bar'}`, returns evaluated string
		// `('Hello foo, bar')`. You can also specify functions instead of strings for
		// data values — they will be evaluated passing `data` as an argument.
		template: function (str, data) {
			return str.replace(L.Util.templateRe, function (str, key) {
				var value = data[key];
	
				if (value === undefined) {
					throw new Error('No value provided for variable ' + str);
	
				} else if (typeof value === 'function') {
					value = value(data);
				}
				return value;
			});
		},
	
		templateRe: /\{ *([\w_\-]+) *\}/g,
	
		// @function isArray(obj): Boolean
		// Compatibility polyfill for [Array.isArray](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray)
		isArray: Array.isArray || function (obj) {
			return (Object.prototype.toString.call(obj) === '[object Array]');
		},
	
		// @function indexOf(array: Array, el: Object): Number
		// Compatibility polyfill for [Array.prototype.indexOf](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf)
		indexOf: function (array, el) {
			for (var i = 0; i < array.length; i++) {
				if (array[i] === el) { return i; }
			}
			return -1;
		},
	
		// @property emptyImageUrl: String
		// Data URI string containing a base64-encoded empty GIF image.
		// Used as a hack to free memory from unused images on WebKit-powered
		// mobile devices (by setting image `src` to this string).
		emptyImageUrl: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
	};
	
	(function () {
		// inspired by http://paulirish.com/2011/requestanimationframe-for-smart-animating/
	
		function getPrefixed(name) {
			return window['webkit' + name] || window['moz' + name] || window['ms' + name];
		}
	
		var lastTime = 0;
	
		// fallback for IE 7-8
		function timeoutDefer(fn) {
			var time = +new Date(),
			    timeToCall = Math.max(0, 16 - (time - lastTime));
	
			lastTime = time + timeToCall;
			return window.setTimeout(fn, timeToCall);
		}
	
		var requestFn = window.requestAnimationFrame || getPrefixed('RequestAnimationFrame') || timeoutDefer,
		    cancelFn = window.cancelAnimationFrame || getPrefixed('CancelAnimationFrame') ||
		               getPrefixed('CancelRequestAnimationFrame') || function (id) { window.clearTimeout(id); };
	
	
		// @function requestAnimFrame(fn: Function, context?: Object, immediate?: Boolean): Number
		// Schedules `fn` to be executed when the browser repaints. `fn` is bound to
		// `context` if given. When `immediate` is set, `fn` is called immediately if
		// the browser doesn't have native support for
		// [`window.requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/window/requestAnimationFrame),
		// otherwise it's delayed. Returns a request ID that can be used to cancel the request.
		L.Util.requestAnimFrame = function (fn, context, immediate) {
			if (immediate && requestFn === timeoutDefer) {
				fn.call(context);
			} else {
				return requestFn.call(window, L.bind(fn, context));
			}
		};
	
		// @function cancelAnimFrame(id: Number): undefined
		// Cancels a previous `requestAnimFrame`. See also [window.cancelAnimationFrame](https://developer.mozilla.org/docs/Web/API/window/cancelAnimationFrame).
		L.Util.cancelAnimFrame = function (id) {
			if (id) {
				cancelFn.call(window, id);
			}
		};
	})();
	
	// shortcuts for most used utility functions
	L.extend = L.Util.extend;
	L.bind = L.Util.bind;
	L.stamp = L.Util.stamp;
	L.setOptions = L.Util.setOptions;
	
	
	
	
	// @class Class
	// @aka L.Class
	
	// @section
	// @uninheritable
	
	// Thanks to John Resig and Dean Edwards for inspiration!
	
	L.Class = function () {};
	
	L.Class.extend = function (props) {
	
		// @function extend(props: Object): Function
		// [Extends the current class](#class-inheritance) given the properties to be included.
		// Returns a Javascript function that is a class constructor (to be called with `new`).
		var NewClass = function () {
	
			// call the constructor
			if (this.initialize) {
				this.initialize.apply(this, arguments);
			}
	
			// call all constructor hooks
			this.callInitHooks();
		};
	
		var parentProto = NewClass.__super__ = this.prototype;
	
		var proto = L.Util.create(parentProto);
		proto.constructor = NewClass;
	
		NewClass.prototype = proto;
	
		// inherit parent's statics
		for (var i in this) {
			if (this.hasOwnProperty(i) && i !== 'prototype') {
				NewClass[i] = this[i];
			}
		}
	
		// mix static properties into the class
		if (props.statics) {
			L.extend(NewClass, props.statics);
			delete props.statics;
		}
	
		// mix includes into the prototype
		if (props.includes) {
			L.Util.extend.apply(null, [proto].concat(props.includes));
			delete props.includes;
		}
	
		// merge options
		if (proto.options) {
			props.options = L.Util.extend(L.Util.create(proto.options), props.options);
		}
	
		// mix given properties into the prototype
		L.extend(proto, props);
	
		proto._initHooks = [];
	
		// add method for calling all hooks
		proto.callInitHooks = function () {
	
			if (this._initHooksCalled) { return; }
	
			if (parentProto.callInitHooks) {
				parentProto.callInitHooks.call(this);
			}
	
			this._initHooksCalled = true;
	
			for (var i = 0, len = proto._initHooks.length; i < len; i++) {
				proto._initHooks[i].call(this);
			}
		};
	
		return NewClass;
	};
	
	
	// @function include(properties: Object): this
	// [Includes a mixin](#class-includes) into the current class.
	L.Class.include = function (props) {
		L.extend(this.prototype, props);
		return this;
	};
	
	// @function mergeOptions(options: Object): this
	// [Merges `options`](#class-options) into the defaults of the class.
	L.Class.mergeOptions = function (options) {
		L.extend(this.prototype.options, options);
		return this;
	};
	
	// @function addInitHook(fn: Function): this
	// Adds a [constructor hook](#class-constructor-hooks) to the class.
	L.Class.addInitHook = function (fn) { // (Function) || (String, args...)
		var args = Array.prototype.slice.call(arguments, 1);
	
		var init = typeof fn === 'function' ? fn : function () {
			this[fn].apply(this, args);
		};
	
		this.prototype._initHooks = this.prototype._initHooks || [];
		this.prototype._initHooks.push(init);
		return this;
	};
	
	
	
	/*
	 * @class Evented
	 * @aka L.Evented
	 * @inherits Class
	 *
	 * A set of methods shared between event-powered classes (like `Map` and `Marker`). Generally, events allow you to execute some function when something happens with an object (e.g. the user clicks on the map, causing the map to fire `'click'` event).
	 *
	 * @example
	 *
	 * ```js
	 * map.on('click', function(e) {
	 * 	alert(e.latlng);
	 * } );
	 * ```
	 *
	 * Leaflet deals with event listeners by reference, so if you want to add a listener and then remove it, define it as a function:
	 *
	 * ```js
	 * function onClick(e) { ... }
	 *
	 * map.on('click', onClick);
	 * map.off('click', onClick);
	 * ```
	 */
	
	
	L.Evented = L.Class.extend({
	
		/* @method on(type: String, fn: Function, context?: Object): this
		 * Adds a listener function (`fn`) to a particular event type of the object. You can optionally specify the context of the listener (object the this keyword will point to). You can also pass several space-separated types (e.g. `'click dblclick'`).
		 *
		 * @alternative
		 * @method on(eventMap: Object): this
		 * Adds a set of type/listener pairs, e.g. `{click: onClick, mousemove: onMouseMove}`
		 */
		on: function (types, fn, context) {
	
			// types can be a map of types/handlers
			if (typeof types === 'object') {
				for (var type in types) {
					// we don't process space-separated events here for performance;
					// it's a hot path since Layer uses the on(obj) syntax
					this._on(type, types[type], fn);
				}
	
			} else {
				// types can be a string of space-separated words
				types = L.Util.splitWords(types);
	
				for (var i = 0, len = types.length; i < len; i++) {
					this._on(types[i], fn, context);
				}
			}
	
			return this;
		},
	
		/* @method off(type: String, fn?: Function, context?: Object): this
		 * Removes a previously added listener function. If no function is specified, it will remove all the listeners of that particular event from the object. Note that if you passed a custom context to `on`, you must pass the same context to `off` in order to remove the listener.
		 *
		 * @alternative
		 * @method off(eventMap: Object): this
		 * Removes a set of type/listener pairs.
		 *
		 * @alternative
		 * @method off: this
		 * Removes all listeners to all events on the object.
		 */
		off: function (types, fn, context) {
	
			if (!types) {
				// clear all listeners if called without arguments
				delete this._events;
	
			} else if (typeof types === 'object') {
				for (var type in types) {
					this._off(type, types[type], fn);
				}
	
			} else {
				types = L.Util.splitWords(types);
	
				for (var i = 0, len = types.length; i < len; i++) {
					this._off(types[i], fn, context);
				}
			}
	
			return this;
		},
	
		// attach listener (without syntactic sugar now)
		_on: function (type, fn, context) {
			this._events = this._events || {};
	
			/* get/init listeners for type */
			var typeListeners = this._events[type];
			if (!typeListeners) {
				typeListeners = [];
				this._events[type] = typeListeners;
			}
	
			if (context === this) {
				// Less memory footprint.
				context = undefined;
			}
			var newListener = {fn: fn, ctx: context},
			    listeners = typeListeners;
	
			// check if fn already there
			for (var i = 0, len = listeners.length; i < len; i++) {
				if (listeners[i].fn === fn && listeners[i].ctx === context) {
					return;
				}
			}
	
			listeners.push(newListener);
			typeListeners.count++;
		},
	
		_off: function (type, fn, context) {
			var listeners,
			    i,
			    len;
	
			if (!this._events) { return; }
	
			listeners = this._events[type];
	
			if (!listeners) {
				return;
			}
	
			if (!fn) {
				// Set all removed listeners to noop so they are not called if remove happens in fire
				for (i = 0, len = listeners.length; i < len; i++) {
					listeners[i].fn = L.Util.falseFn;
				}
				// clear all listeners for a type if function isn't specified
				delete this._events[type];
				return;
			}
	
			if (context === this) {
				context = undefined;
			}
	
			if (listeners) {
	
				// find fn and remove it
				for (i = 0, len = listeners.length; i < len; i++) {
					var l = listeners[i];
					if (l.ctx !== context) { continue; }
					if (l.fn === fn) {
	
						// set the removed listener to noop so that's not called if remove happens in fire
						l.fn = L.Util.falseFn;
	
						if (this._firingCount) {
							/* copy array in case events are being fired */
							this._events[type] = listeners = listeners.slice();
						}
						listeners.splice(i, 1);
	
						return;
					}
				}
			}
		},
	
		// @method fire(type: String, data?: Object, propagate?: Boolean): this
		// Fires an event of the specified type. You can optionally provide an data
		// object — the first argument of the listener function will contain its
		// properties. The event might can optionally be propagated to event parents.
		fire: function (type, data, propagate) {
			if (!this.listens(type, propagate)) { return this; }
	
			var event = L.Util.extend({}, data, {type: type, target: this});
	
			if (this._events) {
				var listeners = this._events[type];
	
				if (listeners) {
					this._firingCount = (this._firingCount + 1) || 1;
					for (var i = 0, len = listeners.length; i < len; i++) {
						var l = listeners[i];
						l.fn.call(l.ctx || this, event);
					}
	
					this._firingCount--;
				}
			}
	
			if (propagate) {
				// propagate the event to parents (set with addEventParent)
				this._propagateEvent(event);
			}
	
			return this;
		},
	
		// @method listens(type: String): Boolean
		// Returns `true` if a particular event type has any listeners attached to it.
		listens: function (type, propagate) {
			var listeners = this._events && this._events[type];
			if (listeners && listeners.length) { return true; }
	
			if (propagate) {
				// also check parents for listeners if event propagates
				for (var id in this._eventParents) {
					if (this._eventParents[id].listens(type, propagate)) { return true; }
				}
			}
			return false;
		},
	
		// @method once(…): this
		// Behaves as [`on(…)`](#evented-on), except the listener will only get fired once and then removed.
		once: function (types, fn, context) {
	
			if (typeof types === 'object') {
				for (var type in types) {
					this.once(type, types[type], fn);
				}
				return this;
			}
	
			var handler = L.bind(function () {
				this
				    .off(types, fn, context)
				    .off(types, handler, context);
			}, this);
	
			// add a listener that's executed once and removed after that
			return this
			    .on(types, fn, context)
			    .on(types, handler, context);
		},
	
		// @method addEventParent(obj: Evented): this
		// Adds an event parent - an `Evented` that will receive propagated events
		addEventParent: function (obj) {
			this._eventParents = this._eventParents || {};
			this._eventParents[L.stamp(obj)] = obj;
			return this;
		},
	
		// @method removeEventParent(obj: Evented): this
		// Removes an event parent, so it will stop receiving propagated events
		removeEventParent: function (obj) {
			if (this._eventParents) {
				delete this._eventParents[L.stamp(obj)];
			}
			return this;
		},
	
		_propagateEvent: function (e) {
			for (var id in this._eventParents) {
				this._eventParents[id].fire(e.type, L.extend({layer: e.target}, e), true);
			}
		}
	});
	
	var proto = L.Evented.prototype;
	
	// aliases; we should ditch those eventually
	
	// @method addEventListener(…): this
	// Alias to [`on(…)`](#evented-on)
	proto.addEventListener = proto.on;
	
	// @method removeEventListener(…): this
	// Alias to [`off(…)`](#evented-off)
	
	// @method clearAllEventListeners(…): this
	// Alias to [`off()`](#evented-off)
	proto.removeEventListener = proto.clearAllEventListeners = proto.off;
	
	// @method addOneTimeEventListener(…): this
	// Alias to [`once(…)`](#evented-once)
	proto.addOneTimeEventListener = proto.once;
	
	// @method fireEvent(…): this
	// Alias to [`fire(…)`](#evented-fire)
	proto.fireEvent = proto.fire;
	
	// @method hasEventListeners(…): Boolean
	// Alias to [`listens(…)`](#evented-listens)
	proto.hasEventListeners = proto.listens;
	
	L.Mixin = {Events: proto};
	
	
	
	/*
	 * @namespace Browser
	 * @aka L.Browser
	 *
	 * A namespace with static properties for browser/feature detection used by Leaflet internally.
	 *
	 * @example
	 *
	 * ```js
	 * if (L.Browser.ielt9) {
	 *   alert('Upgrade your browser, dude!');
	 * }
	 * ```
	 */
	
	(function () {
	
		var ua = navigator.userAgent.toLowerCase(),
		    doc = document.documentElement,
	
		    ie = 'ActiveXObject' in window,
	
		    webkit    = ua.indexOf('webkit') !== -1,
		    phantomjs = ua.indexOf('phantom') !== -1,
		    android23 = ua.search('android [23]') !== -1,
		    chrome    = ua.indexOf('chrome') !== -1,
		    gecko     = ua.indexOf('gecko') !== -1  && !webkit && !window.opera && !ie,
	
		    win = navigator.platform.indexOf('Win') === 0,
	
		    mobile = typeof orientation !== 'undefined' || ua.indexOf('mobile') !== -1,
		    msPointer = !window.PointerEvent && window.MSPointerEvent,
		    pointer = window.PointerEvent || msPointer,
	
		    ie3d = ie && ('transition' in doc.style),
		    webkit3d = ('WebKitCSSMatrix' in window) && ('m11' in new window.WebKitCSSMatrix()) && !android23,
		    gecko3d = 'MozPerspective' in doc.style,
		    opera12 = 'OTransition' in doc.style;
	
	
		var touch = !window.L_NO_TOUCH && (pointer || 'ontouchstart' in window ||
				(window.DocumentTouch && document instanceof window.DocumentTouch));
	
		L.Browser = {
	
			// @property ie: Boolean
			// `true` for all Internet Explorer versions (not Edge).
			ie: ie,
	
			// @property ielt9: Boolean
			// `true` for Internet Explorer versions less than 9.
			ielt9: ie && !document.addEventListener,
	
			// @property edge: Boolean
			// `true` for the Edge web browser.
			edge: 'msLaunchUri' in navigator && !('documentMode' in document),
	
			// @property webkit: Boolean
			// `true` for webkit-based browsers like Chrome and Safari (including mobile versions).
			webkit: webkit,
	
			// @property gecko: Boolean
			// `true` for gecko-based browsers like Firefox.
			gecko: gecko,
	
			// @property android: Boolean
			// `true` for any browser running on an Android platform.
			android: ua.indexOf('android') !== -1,
	
			// @property android23: Boolean
			// `true` for browsers running on Android 2 or Android 3.
			android23: android23,
	
			// @property chrome: Boolean
			// `true` for the Chrome browser.
			chrome: chrome,
	
			// @property safari: Boolean
			// `true` for the Safari browser.
			safari: !chrome && ua.indexOf('safari') !== -1,
	
	
			// @property win: Boolean
			// `true` when the browser is running in a Windows platform
			win: win,
	
	
			// @property ie3d: Boolean
			// `true` for all Internet Explorer versions supporting CSS transforms.
			ie3d: ie3d,
	
			// @property webkit3d: Boolean
			// `true` for webkit-based browsers supporting CSS transforms.
			webkit3d: webkit3d,
	
			// @property gecko3d: Boolean
			// `true` for gecko-based browsers supporting CSS transforms.
			gecko3d: gecko3d,
	
			// @property opera12: Boolean
			// `true` for the Opera browser supporting CSS transforms (version 12 or later).
			opera12: opera12,
	
			// @property any3d: Boolean
			// `true` for all browsers supporting CSS transforms.
			any3d: !window.L_DISABLE_3D && (ie3d || webkit3d || gecko3d) && !opera12 && !phantomjs,
	
	
			// @property mobile: Boolean
			// `true` for all browsers running in a mobile device.
			mobile: mobile,
	
			// @property mobileWebkit: Boolean
			// `true` for all webkit-based browsers in a mobile device.
			mobileWebkit: mobile && webkit,
	
			// @property mobileWebkit3d: Boolean
			// `true` for all webkit-based browsers in a mobile device supporting CSS transforms.
			mobileWebkit3d: mobile && webkit3d,
	
			// @property mobileOpera: Boolean
			// `true` for the Opera browser in a mobile device.
			mobileOpera: mobile && window.opera,
	
			// @property mobileGecko: Boolean
			// `true` for gecko-based browsers running in a mobile device.
			mobileGecko: mobile && gecko,
	
	
			// @property touch: Boolean
			// `true` for all browsers supporting [touch events](https://developer.mozilla.org/docs/Web/API/Touch_events).
			touch: !!touch,
	
			// @property msPointer: Boolean
			// `true` for browsers implementing the Microsoft touch events model (notably IE10).
			msPointer: !!msPointer,
	
			// @property pointer: Boolean
			// `true` for all browsers supporting [pointer events](https://msdn.microsoft.com/en-us/library/dn433244%28v=vs.85%29.aspx).
			pointer: !!pointer,
	
	
			// @property retina: Boolean
			// `true` for browsers on a high-resolution "retina" screen.
			retina: (window.devicePixelRatio || (window.screen.deviceXDPI / window.screen.logicalXDPI)) > 1
		};
	
	}());
	
	
	
	/*
	 * @class Point
	 * @aka L.Point
	 *
	 * Represents a point with `x` and `y` coordinates in pixels.
	 *
	 * @example
	 *
	 * ```js
	 * var point = L.point(200, 300);
	 * ```
	 *
	 * All Leaflet methods and options that accept `Point` objects also accept them in a simple Array form (unless noted otherwise), so these lines are equivalent:
	 *
	 * ```js
	 * map.panBy([200, 300]);
	 * map.panBy(L.point(200, 300));
	 * ```
	 */
	
	L.Point = function (x, y, round) {
		this.x = (round ? Math.round(x) : x);
		this.y = (round ? Math.round(y) : y);
	};
	
	L.Point.prototype = {
	
		// @method clone(): Point
		// Returns a copy of the current point.
		clone: function () {
			return new L.Point(this.x, this.y);
		},
	
		// @method add(otherPoint: Point): Point
		// Returns the result of addition of the current and the given points.
		add: function (point) {
			// non-destructive, returns a new point
			return this.clone()._add(L.point(point));
		},
	
		_add: function (point) {
			// destructive, used directly for performance in situations where it's safe to modify existing point
			this.x += point.x;
			this.y += point.y;
			return this;
		},
	
		// @method subtract(otherPoint: Point): Point
		// Returns the result of subtraction of the given point from the current.
		subtract: function (point) {
			return this.clone()._subtract(L.point(point));
		},
	
		_subtract: function (point) {
			this.x -= point.x;
			this.y -= point.y;
			return this;
		},
	
		// @method divideBy(num: Number): Point
		// Returns the result of division of the current point by the given number.
		divideBy: function (num) {
			return this.clone()._divideBy(num);
		},
	
		_divideBy: function (num) {
			this.x /= num;
			this.y /= num;
			return this;
		},
	
		// @method multiplyBy(num: Number): Point
		// Returns the result of multiplication of the current point by the given number.
		multiplyBy: function (num) {
			return this.clone()._multiplyBy(num);
		},
	
		_multiplyBy: function (num) {
			this.x *= num;
			this.y *= num;
			return this;
		},
	
		// @method scaleBy(scale: Point): Point
		// Multiply each coordinate of the current point by each coordinate of
		// `scale`. In linear algebra terms, multiply the point by the
		// [scaling matrix](https://en.wikipedia.org/wiki/Scaling_%28geometry%29#Matrix_representation)
		// defined by `scale`.
		scaleBy: function (point) {
			return new L.Point(this.x * point.x, this.y * point.y);
		},
	
		// @method unscaleBy(scale: Point): Point
		// Inverse of `scaleBy`. Divide each coordinate of the current point by
		// each coordinate of `scale`.
		unscaleBy: function (point) {
			return new L.Point(this.x / point.x, this.y / point.y);
		},
	
		// @method round(): Point
		// Returns a copy of the current point with rounded coordinates.
		round: function () {
			return this.clone()._round();
		},
	
		_round: function () {
			this.x = Math.round(this.x);
			this.y = Math.round(this.y);
			return this;
		},
	
		// @method floor(): Point
		// Returns a copy of the current point with floored coordinates (rounded down).
		floor: function () {
			return this.clone()._floor();
		},
	
		_floor: function () {
			this.x = Math.floor(this.x);
			this.y = Math.floor(this.y);
			return this;
		},
	
		// @method ceil(): Point
		// Returns a copy of the current point with ceiled coordinates (rounded up).
		ceil: function () {
			return this.clone()._ceil();
		},
	
		_ceil: function () {
			this.x = Math.ceil(this.x);
			this.y = Math.ceil(this.y);
			return this;
		},
	
		// @method distanceTo(otherPoint: Point): Number
		// Returns the cartesian distance between the current and the given points.
		distanceTo: function (point) {
			point = L.point(point);
	
			var x = point.x - this.x,
			    y = point.y - this.y;
	
			return Math.sqrt(x * x + y * y);
		},
	
		// @method equals(otherPoint: Point): Boolean
		// Returns `true` if the given point has the same coordinates.
		equals: function (point) {
			point = L.point(point);
	
			return point.x === this.x &&
			       point.y === this.y;
		},
	
		// @method contains(otherPoint: Point): Boolean
		// Returns `true` if both coordinates of the given point are less than the corresponding current point coordinates (in absolute values).
		contains: function (point) {
			point = L.point(point);
	
			return Math.abs(point.x) <= Math.abs(this.x) &&
			       Math.abs(point.y) <= Math.abs(this.y);
		},
	
		// @method toString(): String
		// Returns a string representation of the point for debugging purposes.
		toString: function () {
			return 'Point(' +
			        L.Util.formatNum(this.x) + ', ' +
			        L.Util.formatNum(this.y) + ')';
		}
	};
	
	// @factory L.point(x: Number, y: Number, round?: Boolean)
	// Creates a Point object with the given `x` and `y` coordinates. If optional `round` is set to true, rounds the `x` and `y` values.
	
	// @alternative
	// @factory L.point(coords: Number[])
	// Expects an array of the form `[x, y]` instead.
	
	// @alternative
	// @factory L.point(coords: Object)
	// Expects a plain object of the form `{x: Number, y: Number}` instead.
	L.point = function (x, y, round) {
		if (x instanceof L.Point) {
			return x;
		}
		if (L.Util.isArray(x)) {
			return new L.Point(x[0], x[1]);
		}
		if (x === undefined || x === null) {
			return x;
		}
		if (typeof x === 'object' && 'x' in x && 'y' in x) {
			return new L.Point(x.x, x.y);
		}
		return new L.Point(x, y, round);
	};
	
	
	
	/*
	 * @class Bounds
	 * @aka L.Bounds
	 *
	 * Represents a rectangular area in pixel coordinates.
	 *
	 * @example
	 *
	 * ```js
	 * var p1 = L.point(10, 10),
	 * p2 = L.point(40, 60),
	 * bounds = L.bounds(p1, p2);
	 * ```
	 *
	 * All Leaflet methods that accept `Bounds` objects also accept them in a simple Array form (unless noted otherwise), so the bounds example above can be passed like this:
	 *
	 * ```js
	 * otherBounds.intersects([[10, 10], [40, 60]]);
	 * ```
	 */
	
	L.Bounds = function (a, b) {
		if (!a) { return; }
	
		var points = b ? [a, b] : a;
	
		for (var i = 0, len = points.length; i < len; i++) {
			this.extend(points[i]);
		}
	};
	
	L.Bounds.prototype = {
		// @method extend(point: Point): this
		// Extends the bounds to contain the given point.
		extend: function (point) { // (Point)
			point = L.point(point);
	
			// @property min: Point
			// The top left corner of the rectangle.
			// @property max: Point
			// The bottom right corner of the rectangle.
			if (!this.min && !this.max) {
				this.min = point.clone();
				this.max = point.clone();
			} else {
				this.min.x = Math.min(point.x, this.min.x);
				this.max.x = Math.max(point.x, this.max.x);
				this.min.y = Math.min(point.y, this.min.y);
				this.max.y = Math.max(point.y, this.max.y);
			}
			return this;
		},
	
		// @method getCenter(round?: Boolean): Point
		// Returns the center point of the bounds.
		getCenter: function (round) {
			return new L.Point(
			        (this.min.x + this.max.x) / 2,
			        (this.min.y + this.max.y) / 2, round);
		},
	
		// @method getBottomLeft(): Point
		// Returns the bottom-left point of the bounds.
		getBottomLeft: function () {
			return new L.Point(this.min.x, this.max.y);
		},
	
		// @method getTopRight(): Point
		// Returns the top-right point of the bounds.
		getTopRight: function () { // -> Point
			return new L.Point(this.max.x, this.min.y);
		},
	
		// @method getSize(): Point
		// Returns the size of the given bounds
		getSize: function () {
			return this.max.subtract(this.min);
		},
	
		// @method contains(otherBounds: Bounds): Boolean
		// Returns `true` if the rectangle contains the given one.
		// @alternative
		// @method contains(point: Point): Boolean
		// Returns `true` if the rectangle contains the given point.
		contains: function (obj) {
			var min, max;
	
			if (typeof obj[0] === 'number' || obj instanceof L.Point) {
				obj = L.point(obj);
			} else {
				obj = L.bounds(obj);
			}
	
			if (obj instanceof L.Bounds) {
				min = obj.min;
				max = obj.max;
			} else {
				min = max = obj;
			}
	
			return (min.x >= this.min.x) &&
			       (max.x <= this.max.x) &&
			       (min.y >= this.min.y) &&
			       (max.y <= this.max.y);
		},
	
		// @method intersects(otherBounds: Bounds): Boolean
		// Returns `true` if the rectangle intersects the given bounds. Two bounds
		// intersect if they have at least one point in common.
		intersects: function (bounds) { // (Bounds) -> Boolean
			bounds = L.bounds(bounds);
	
			var min = this.min,
			    max = this.max,
			    min2 = bounds.min,
			    max2 = bounds.max,
			    xIntersects = (max2.x >= min.x) && (min2.x <= max.x),
			    yIntersects = (max2.y >= min.y) && (min2.y <= max.y);
	
			return xIntersects && yIntersects;
		},
	
		// @method overlaps(otherBounds: Bounds): Boolean
		// Returns `true` if the rectangle overlaps the given bounds. Two bounds
		// overlap if their intersection is an area.
		overlaps: function (bounds) { // (Bounds) -> Boolean
			bounds = L.bounds(bounds);
	
			var min = this.min,
			    max = this.max,
			    min2 = bounds.min,
			    max2 = bounds.max,
			    xOverlaps = (max2.x > min.x) && (min2.x < max.x),
			    yOverlaps = (max2.y > min.y) && (min2.y < max.y);
	
			return xOverlaps && yOverlaps;
		},
	
		isValid: function () {
			return !!(this.min && this.max);
		}
	};
	
	
	// @factory L.bounds(topLeft: Point, bottomRight: Point)
	// Creates a Bounds object from two coordinates (usually top-left and bottom-right corners).
	// @alternative
	// @factory L.bounds(points: Point[])
	// Creates a Bounds object from the points it contains
	L.bounds = function (a, b) {
		if (!a || a instanceof L.Bounds) {
			return a;
		}
		return new L.Bounds(a, b);
	};
	
	
	
	/*
	 * @class Transformation
	 * @aka L.Transformation
	 *
	 * Represents an affine transformation: a set of coefficients `a`, `b`, `c`, `d`
	 * for transforming a point of a form `(x, y)` into `(a*x + b, c*y + d)` and doing
	 * the reverse. Used by Leaflet in its projections code.
	 *
	 * @example
	 *
	 * ```js
	 * var transformation = new L.Transformation(2, 5, -1, 10),
	 * 	p = L.point(1, 2),
	 * 	p2 = transformation.transform(p), //  L.point(7, 8)
	 * 	p3 = transformation.untransform(p2); //  L.point(1, 2)
	 * ```
	 */
	
	
	// factory new L.Transformation(a: Number, b: Number, c: Number, d: Number)
	// Creates a `Transformation` object with the given coefficients.
	L.Transformation = function (a, b, c, d) {
		this._a = a;
		this._b = b;
		this._c = c;
		this._d = d;
	};
	
	L.Transformation.prototype = {
		// @method transform(point: Point, scale?: Number): Point
		// Returns a transformed point, optionally multiplied by the given scale.
		// Only accepts real `L.Point` instances, not arrays.
		transform: function (point, scale) { // (Point, Number) -> Point
			return this._transform(point.clone(), scale);
		},
	
		// destructive transform (faster)
		_transform: function (point, scale) {
			scale = scale || 1;
			point.x = scale * (this._a * point.x + this._b);
			point.y = scale * (this._c * point.y + this._d);
			return point;
		},
	
		// @method untransform(point: Point, scale?: Number): Point
		// Returns the reverse transformation of the given point, optionally divided
		// by the given scale. Only accepts real `L.Point` instances, not arrays.
		untransform: function (point, scale) {
			scale = scale || 1;
			return new L.Point(
			        (point.x / scale - this._b) / this._a,
			        (point.y / scale - this._d) / this._c);
		}
	};
	
	
	
	/*
	 * @namespace DomUtil
	 *
	 * Utility functions to work with the [DOM](https://developer.mozilla.org/docs/Web/API/Document_Object_Model)
	 * tree, used by Leaflet internally.
	 *
	 * Most functions expecting or returning a `HTMLElement` also work for
	 * SVG elements. The only difference is that classes refer to CSS classes
	 * in HTML and SVG classes in SVG.
	 */
	
	L.DomUtil = {
	
		// @function get(id: String|HTMLElement): HTMLElement
		// Returns an element given its DOM id, or returns the element itself
		// if it was passed directly.
		get: function (id) {
			return typeof id === 'string' ? document.getElementById(id) : id;
		},
	
		// @function getStyle(el: HTMLElement, styleAttrib: String): String
		// Returns the value for a certain style attribute on an element,
		// including computed values or values set through CSS.
		getStyle: function (el, style) {
	
			var value = el.style[style] || (el.currentStyle && el.currentStyle[style]);
	
			if ((!value || value === 'auto') && document.defaultView) {
				var css = document.defaultView.getComputedStyle(el, null);
				value = css ? css[style] : null;
			}
	
			return value === 'auto' ? null : value;
		},
	
		// @function create(tagName: String, className?: String, container?: HTMLElement): HTMLElement
		// Creates an HTML element with `tagName`, sets its class to `className`, and optionally appends it to `container` element.
		create: function (tagName, className, container) {
	
			var el = document.createElement(tagName);
			el.className = className || '';
	
			if (container) {
				container.appendChild(el);
			}
	
			return el;
		},
	
		// @function remove(el: HTMLElement)
		// Removes `el` from its parent element
		remove: function (el) {
			var parent = el.parentNode;
			if (parent) {
				parent.removeChild(el);
			}
		},
	
		// @function empty(el: HTMLElement)
		// Removes all of `el`'s children elements from `el`
		empty: function (el) {
			while (el.firstChild) {
				el.removeChild(el.firstChild);
			}
		},
	
		// @function toFront(el: HTMLElement)
		// Makes `el` the last children of its parent, so it renders in front of the other children.
		toFront: function (el) {
			el.parentNode.appendChild(el);
		},
	
		// @function toBack(el: HTMLElement)
		// Makes `el` the first children of its parent, so it renders back from the other children.
		toBack: function (el) {
			var parent = el.parentNode;
			parent.insertBefore(el, parent.firstChild);
		},
	
		// @function hasClass(el: HTMLElement, name: String): Boolean
		// Returns `true` if the element's class attribute contains `name`.
		hasClass: function (el, name) {
			if (el.classList !== undefined) {
				return el.classList.contains(name);
			}
			var className = L.DomUtil.getClass(el);
			return className.length > 0 && new RegExp('(^|\\s)' + name + '(\\s|$)').test(className);
		},
	
		// @function addClass(el: HTMLElement, name: String)
		// Adds `name` to the element's class attribute.
		addClass: function (el, name) {
			if (el.classList !== undefined) {
				var classes = L.Util.splitWords(name);
				for (var i = 0, len = classes.length; i < len; i++) {
					el.classList.add(classes[i]);
				}
			} else if (!L.DomUtil.hasClass(el, name)) {
				var className = L.DomUtil.getClass(el);
				L.DomUtil.setClass(el, (className ? className + ' ' : '') + name);
			}
		},
	
		// @function removeClass(el: HTMLElement, name: String)
		// Removes `name` from the element's class attribute.
		removeClass: function (el, name) {
			if (el.classList !== undefined) {
				el.classList.remove(name);
			} else {
				L.DomUtil.setClass(el, L.Util.trim((' ' + L.DomUtil.getClass(el) + ' ').replace(' ' + name + ' ', ' ')));
			}
		},
	
		// @function setClass(el: HTMLElement, name: String)
		// Sets the element's class.
		setClass: function (el, name) {
			if (el.className.baseVal === undefined) {
				el.className = name;
			} else {
				// in case of SVG element
				el.className.baseVal = name;
			}
		},
	
		// @function getClass(el: HTMLElement): String
		// Returns the element's class.
		getClass: function (el) {
			return el.className.baseVal === undefined ? el.className : el.className.baseVal;
		},
	
		// @function setOpacity(el: HTMLElement, opacity: Number)
		// Set the opacity of an element (including old IE support).
		// `opacity` must be a number from `0` to `1`.
		setOpacity: function (el, value) {
	
			if ('opacity' in el.style) {
				el.style.opacity = value;
	
			} else if ('filter' in el.style) {
				L.DomUtil._setOpacityIE(el, value);
			}
		},
	
		_setOpacityIE: function (el, value) {
			var filter = false,
			    filterName = 'DXImageTransform.Microsoft.Alpha';
	
			// filters collection throws an error if we try to retrieve a filter that doesn't exist
			try {
				filter = el.filters.item(filterName);
			} catch (e) {
				// don't set opacity to 1 if we haven't already set an opacity,
				// it isn't needed and breaks transparent pngs.
				if (value === 1) { return; }
			}
	
			value = Math.round(value * 100);
	
			if (filter) {
				filter.Enabled = (value !== 100);
				filter.Opacity = value;
			} else {
				el.style.filter += ' progid:' + filterName + '(opacity=' + value + ')';
			}
		},
	
		// @function testProp(props: String[]): String|false
		// Goes through the array of style names and returns the first name
		// that is a valid style name for an element. If no such name is found,
		// it returns false. Useful for vendor-prefixed styles like `transform`.
		testProp: function (props) {
	
			var style = document.documentElement.style;
	
			for (var i = 0; i < props.length; i++) {
				if (props[i] in style) {
					return props[i];
				}
			}
			return false;
		},
	
		// @function setTransform(el: HTMLElement, offset: Point, scale?: Number)
		// Resets the 3D CSS transform of `el` so it is translated by `offset` pixels
		// and optionally scaled by `scale`. Does not have an effect if the
		// browser doesn't support 3D CSS transforms.
		setTransform: function (el, offset, scale) {
			var pos = offset || new L.Point(0, 0);
	
			el.style[L.DomUtil.TRANSFORM] =
				(L.Browser.ie3d ?
					'translate(' + pos.x + 'px,' + pos.y + 'px)' :
					'translate3d(' + pos.x + 'px,' + pos.y + 'px,0)') +
				(scale ? ' scale(' + scale + ')' : '');
		},
	
		// @function setPosition(el: HTMLElement, position: Point)
		// Sets the position of `el` to coordinates specified by `position`,
		// using CSS translate or top/left positioning depending on the browser
		// (used by Leaflet internally to position its layers).
		setPosition: function (el, point) { // (HTMLElement, Point[, Boolean])
	
			/*eslint-disable */
			el._leaflet_pos = point;
			/*eslint-enable */
	
			if (L.Browser.any3d) {
				L.DomUtil.setTransform(el, point);
			} else {
				el.style.left = point.x + 'px';
				el.style.top = point.y + 'px';
			}
		},
	
		// @function getPosition(el: HTMLElement): Point
		// Returns the coordinates of an element previously positioned with setPosition.
		getPosition: function (el) {
			// this method is only used for elements previously positioned using setPosition,
			// so it's safe to cache the position for performance
	
			return el._leaflet_pos || new L.Point(0, 0);
		}
	};
	
	
	(function () {
		// prefix style property names
	
		// @property TRANSFORM: String
		// Vendor-prefixed fransform style name (e.g. `'webkitTransform'` for WebKit).
		L.DomUtil.TRANSFORM = L.DomUtil.testProp(
				['transform', 'WebkitTransform', 'OTransform', 'MozTransform', 'msTransform']);
	
	
		// webkitTransition comes first because some browser versions that drop vendor prefix don't do
		// the same for the transitionend event, in particular the Android 4.1 stock browser
	
		// @property TRANSITION: String
		// Vendor-prefixed transform style name.
		var transition = L.DomUtil.TRANSITION = L.DomUtil.testProp(
				['webkitTransition', 'transition', 'OTransition', 'MozTransition', 'msTransition']);
	
		L.DomUtil.TRANSITION_END =
				transition === 'webkitTransition' || transition === 'OTransition' ? transition + 'End' : 'transitionend';
	
		// @function disableTextSelection()
		// Prevents the user from generating `selectstart` DOM events, usually generated
		// when the user drags the mouse through a page with text. Used internally
		// by Leaflet to override the behaviour of any click-and-drag interaction on
		// the map. Affects drag interactions on the whole document.
	
		// @function enableTextSelection()
		// Cancels the effects of a previous [`L.DomUtil.disableTextSelection`](#domutil-disabletextselection).
		if ('onselectstart' in document) {
			L.DomUtil.disableTextSelection = function () {
				L.DomEvent.on(window, 'selectstart', L.DomEvent.preventDefault);
			};
			L.DomUtil.enableTextSelection = function () {
				L.DomEvent.off(window, 'selectstart', L.DomEvent.preventDefault);
			};
	
		} else {
			var userSelectProperty = L.DomUtil.testProp(
				['userSelect', 'WebkitUserSelect', 'OUserSelect', 'MozUserSelect', 'msUserSelect']);
	
			L.DomUtil.disableTextSelection = function () {
				if (userSelectProperty) {
					var style = document.documentElement.style;
					this._userSelect = style[userSelectProperty];
					style[userSelectProperty] = 'none';
				}
			};
			L.DomUtil.enableTextSelection = function () {
				if (userSelectProperty) {
					document.documentElement.style[userSelectProperty] = this._userSelect;
					delete this._userSelect;
				}
			};
		}
	
		// @function disableImageDrag()
		// As [`L.DomUtil.disableTextSelection`](#domutil-disabletextselection), but
		// for `dragstart` DOM events, usually generated when the user drags an image.
		L.DomUtil.disableImageDrag = function () {
			L.DomEvent.on(window, 'dragstart', L.DomEvent.preventDefault);
		};
	
		// @function enableImageDrag()
		// Cancels the effects of a previous [`L.DomUtil.disableImageDrag`](#domutil-disabletextselection).
		L.DomUtil.enableImageDrag = function () {
			L.DomEvent.off(window, 'dragstart', L.DomEvent.preventDefault);
		};
	
		// @function preventOutline(el: HTMLElement)
		// Makes the [outline](https://developer.mozilla.org/docs/Web/CSS/outline)
		// of the element `el` invisible. Used internally by Leaflet to prevent
		// focusable elements from displaying an outline when the user performs a
		// drag interaction on them.
		L.DomUtil.preventOutline = function (element) {
			while (element.tabIndex === -1) {
				element = element.parentNode;
			}
			if (!element || !element.style) { return; }
			L.DomUtil.restoreOutline();
			this._outlineElement = element;
			this._outlineStyle = element.style.outline;
			element.style.outline = 'none';
			L.DomEvent.on(window, 'keydown', L.DomUtil.restoreOutline, this);
		};
	
		// @function restoreOutline()
		// Cancels the effects of a previous [`L.DomUtil.preventOutline`]().
		L.DomUtil.restoreOutline = function () {
			if (!this._outlineElement) { return; }
			this._outlineElement.style.outline = this._outlineStyle;
			delete this._outlineElement;
			delete this._outlineStyle;
			L.DomEvent.off(window, 'keydown', L.DomUtil.restoreOutline, this);
		};
	})();
	
	
	
	/* @class LatLng
	 * @aka L.LatLng
	 *
	 * Represents a geographical point with a certain latitude and longitude.
	 *
	 * @example
	 *
	 * ```
	 * var latlng = L.latLng(50.5, 30.5);
	 * ```
	 *
	 * All Leaflet methods that accept LatLng objects also accept them in a simple Array form and simple object form (unless noted otherwise), so these lines are equivalent:
	 *
	 * ```
	 * map.panTo([50, 30]);
	 * map.panTo({lon: 30, lat: 50});
	 * map.panTo({lat: 50, lng: 30});
	 * map.panTo(L.latLng(50, 30));
	 * ```
	 */
	
	L.LatLng = function (lat, lng, alt) {
		if (isNaN(lat) || isNaN(lng)) {
			throw new Error('Invalid LatLng object: (' + lat + ', ' + lng + ')');
		}
	
		// @property lat: Number
		// Latitude in degrees
		this.lat = +lat;
	
		// @property lng: Number
		// Longitude in degrees
		this.lng = +lng;
	
		// @property alt: Number
		// Altitude in meters (optional)
		if (alt !== undefined) {
			this.alt = +alt;
		}
	};
	
	L.LatLng.prototype = {
		// @method equals(otherLatLng: LatLng, maxMargin?: Number): Boolean
		// Returns `true` if the given `LatLng` point is at the same position (within a small margin of error). The margin of error can be overriden by setting `maxMargin` to a small number.
		equals: function (obj, maxMargin) {
			if (!obj) { return false; }
	
			obj = L.latLng(obj);
	
			var margin = Math.max(
			        Math.abs(this.lat - obj.lat),
			        Math.abs(this.lng - obj.lng));
	
			return margin <= (maxMargin === undefined ? 1.0E-9 : maxMargin);
		},
	
		// @method toString(): String
		// Returns a string representation of the point (for debugging purposes).
		toString: function (precision) {
			return 'LatLng(' +
			        L.Util.formatNum(this.lat, precision) + ', ' +
			        L.Util.formatNum(this.lng, precision) + ')';
		},
	
		// @method distanceTo(otherLatLng: LatLng): Number
		// Returns the distance (in meters) to the given `LatLng` calculated using the [Haversine formula](http://en.wikipedia.org/wiki/Haversine_formula).
		distanceTo: function (other) {
			return L.CRS.Earth.distance(this, L.latLng(other));
		},
	
		// @method wrap(): LatLng
		// Returns a new `LatLng` object with the longitude wrapped so it's always between -180 and +180 degrees.
		wrap: function () {
			return L.CRS.Earth.wrapLatLng(this);
		},
	
		// @method toBounds(sizeInMeters: Number): LatLngBounds
		// Returns a new `LatLngBounds` object in which each boundary is `sizeInMeters` meters apart from the `LatLng`.
		toBounds: function (sizeInMeters) {
			var latAccuracy = 180 * sizeInMeters / 40075017,
			    lngAccuracy = latAccuracy / Math.cos((Math.PI / 180) * this.lat);
	
			return L.latLngBounds(
			        [this.lat - latAccuracy, this.lng - lngAccuracy],
			        [this.lat + latAccuracy, this.lng + lngAccuracy]);
		},
	
		clone: function () {
			return new L.LatLng(this.lat, this.lng, this.alt);
		}
	};
	
	
	
	// @factory L.latLng(latitude: Number, longitude: Number, altitude?: Number): LatLng
	// Creates an object representing a geographical point with the given latitude and longitude (and optionally altitude).
	
	// @alternative
	// @factory L.latLng(coords: Array): LatLng
	// Expects an array of the form `[Number, Number]` or `[Number, Number, Number]` instead.
	
	// @alternative
	// @factory L.latLng(coords: Object): LatLng
	// Expects an plain object of the form `{lat: Number, lng: Number}` or `{lat: Number, lng: Number, alt: Number}` instead.
	
	L.latLng = function (a, b, c) {
		if (a instanceof L.LatLng) {
			return a;
		}
		if (L.Util.isArray(a) && typeof a[0] !== 'object') {
			if (a.length === 3) {
				return new L.LatLng(a[0], a[1], a[2]);
			}
			if (a.length === 2) {
				return new L.LatLng(a[0], a[1]);
			}
			return null;
		}
		if (a === undefined || a === null) {
			return a;
		}
		if (typeof a === 'object' && 'lat' in a) {
			return new L.LatLng(a.lat, 'lng' in a ? a.lng : a.lon, a.alt);
		}
		if (b === undefined) {
			return null;
		}
		return new L.LatLng(a, b, c);
	};
	
	
	
	/*
	 * @class LatLngBounds
	 * @aka L.LatLngBounds
	 *
	 * Represents a rectangular geographical area on a map.
	 *
	 * @example
	 *
	 * ```js
	 * var southWest = L.latLng(40.712, -74.227),
	 * northEast = L.latLng(40.774, -74.125),
	 * bounds = L.latLngBounds(southWest, northEast);
	 * ```
	 *
	 * All Leaflet methods that accept LatLngBounds objects also accept them in a simple Array form (unless noted otherwise), so the bounds example above can be passed like this:
	 *
	 * ```js
	 * map.fitBounds([
	 * 	[40.712, -74.227],
	 * 	[40.774, -74.125]
	 * ]);
	 * ```
	 */
	
	L.LatLngBounds = function (southWest, northEast) { // (LatLng, LatLng) or (LatLng[])
		if (!southWest) { return; }
	
		var latlngs = northEast ? [southWest, northEast] : southWest;
	
		for (var i = 0, len = latlngs.length; i < len; i++) {
			this.extend(latlngs[i]);
		}
	};
	
	L.LatLngBounds.prototype = {
	
		// @method extend(latlng: LatLng): this
		// Extend the bounds to contain the given point
	
		// @alternative
		// @method extend(otherBounds: LatLngBounds): this
		// Extend the bounds to contain the given bounds
		extend: function (obj) {
			var sw = this._southWest,
			    ne = this._northEast,
			    sw2, ne2;
	
			if (obj instanceof L.LatLng) {
				sw2 = obj;
				ne2 = obj;
	
			} else if (obj instanceof L.LatLngBounds) {
				sw2 = obj._southWest;
				ne2 = obj._northEast;
	
				if (!sw2 || !ne2) { return this; }
	
			} else {
				return obj ? this.extend(L.latLng(obj) || L.latLngBounds(obj)) : this;
			}
	
			if (!sw && !ne) {
				this._southWest = new L.LatLng(sw2.lat, sw2.lng);
				this._northEast = new L.LatLng(ne2.lat, ne2.lng);
			} else {
				sw.lat = Math.min(sw2.lat, sw.lat);
				sw.lng = Math.min(sw2.lng, sw.lng);
				ne.lat = Math.max(ne2.lat, ne.lat);
				ne.lng = Math.max(ne2.lng, ne.lng);
			}
	
			return this;
		},
	
		// @method pad(bufferRatio: Number): LatLngBounds
		// Returns bigger bounds created by extending the current bounds by a given percentage in each direction.
		pad: function (bufferRatio) {
			var sw = this._southWest,
			    ne = this._northEast,
			    heightBuffer = Math.abs(sw.lat - ne.lat) * bufferRatio,
			    widthBuffer = Math.abs(sw.lng - ne.lng) * bufferRatio;
	
			return new L.LatLngBounds(
			        new L.LatLng(sw.lat - heightBuffer, sw.lng - widthBuffer),
			        new L.LatLng(ne.lat + heightBuffer, ne.lng + widthBuffer));
		},
	
		// @method getCenter(): LatLng
		// Returns the center point of the bounds.
		getCenter: function () {
			return new L.LatLng(
			        (this._southWest.lat + this._northEast.lat) / 2,
			        (this._southWest.lng + this._northEast.lng) / 2);
		},
	
		// @method getSouthWest(): LatLng
		// Returns the south-west point of the bounds.
		getSouthWest: function () {
			return this._southWest;
		},
	
		// @method getNorthEast(): LatLng
		// Returns the north-east point of the bounds.
		getNorthEast: function () {
			return this._northEast;
		},
	
		// @method getNorthWest(): LatLng
		// Returns the north-west point of the bounds.
		getNorthWest: function () {
			return new L.LatLng(this.getNorth(), this.getWest());
		},
	
		// @method getSouthEast(): LatLng
		// Returns the south-east point of the bounds.
		getSouthEast: function () {
			return new L.LatLng(this.getSouth(), this.getEast());
		},
	
		// @method getWest(): Number
		// Returns the west longitude of the bounds
		getWest: function () {
			return this._southWest.lng;
		},
	
		// @method getSouth(): Number
		// Returns the south latitude of the bounds
		getSouth: function () {
			return this._southWest.lat;
		},
	
		// @method getEast(): Number
		// Returns the east longitude of the bounds
		getEast: function () {
			return this._northEast.lng;
		},
	
		// @method getNorth(): Number
		// Returns the north latitude of the bounds
		getNorth: function () {
			return this._northEast.lat;
		},
	
		// @method contains(otherBounds: LatLngBounds): Boolean
		// Returns `true` if the rectangle contains the given one.
	
		// @alternative
		// @method contains (latlng: LatLng): Boolean
		// Returns `true` if the rectangle contains the given point.
		contains: function (obj) { // (LatLngBounds) or (LatLng) -> Boolean
			if (typeof obj[0] === 'number' || obj instanceof L.LatLng) {
				obj = L.latLng(obj);
			} else {
				obj = L.latLngBounds(obj);
			}
	
			var sw = this._southWest,
			    ne = this._northEast,
			    sw2, ne2;
	
			if (obj instanceof L.LatLngBounds) {
				sw2 = obj.getSouthWest();
				ne2 = obj.getNorthEast();
			} else {
				sw2 = ne2 = obj;
			}
	
			return (sw2.lat >= sw.lat) && (ne2.lat <= ne.lat) &&
			       (sw2.lng >= sw.lng) && (ne2.lng <= ne.lng);
		},
	
		// @method intersects(otherBounds: LatLngBounds): Boolean
		// Returns `true` if the rectangle intersects the given bounds. Two bounds intersect if they have at least one point in common.
		intersects: function (bounds) {
			bounds = L.latLngBounds(bounds);
	
			var sw = this._southWest,
			    ne = this._northEast,
			    sw2 = bounds.getSouthWest(),
			    ne2 = bounds.getNorthEast(),
	
			    latIntersects = (ne2.lat >= sw.lat) && (sw2.lat <= ne.lat),
			    lngIntersects = (ne2.lng >= sw.lng) && (sw2.lng <= ne.lng);
	
			return latIntersects && lngIntersects;
		},
	
		// @method overlaps(otherBounds: Bounds): Boolean
		// Returns `true` if the rectangle overlaps the given bounds. Two bounds overlap if their intersection is an area.
		overlaps: function (bounds) {
			bounds = L.latLngBounds(bounds);
	
			var sw = this._southWest,
			    ne = this._northEast,
			    sw2 = bounds.getSouthWest(),
			    ne2 = bounds.getNorthEast(),
	
			    latOverlaps = (ne2.lat > sw.lat) && (sw2.lat < ne.lat),
			    lngOverlaps = (ne2.lng > sw.lng) && (sw2.lng < ne.lng);
	
			return latOverlaps && lngOverlaps;
		},
	
		// @method toBBoxString(): String
		// Returns a string with bounding box coordinates in a 'southwest_lng,southwest_lat,northeast_lng,northeast_lat' format. Useful for sending requests to web services that return geo data.
		toBBoxString: function () {
			return [this.getWest(), this.getSouth(), this.getEast(), this.getNorth()].join(',');
		},
	
		// @method equals(otherBounds: LatLngBounds): Boolean
		// Returns `true` if the rectangle is equivalent (within a small margin of error) to the given bounds.
		equals: function (bounds) {
			if (!bounds) { return false; }
	
			bounds = L.latLngBounds(bounds);
	
			return this._southWest.equals(bounds.getSouthWest()) &&
			       this._northEast.equals(bounds.getNorthEast());
		},
	
		// @method isValid(): Boolean
		// Returns `true` if the bounds are properly initialized.
		isValid: function () {
			return !!(this._southWest && this._northEast);
		}
	};
	
	// TODO International date line?
	
	// @factory L.latLngBounds(southWest: LatLng, northEast: LatLng)
	// Creates a `LatLngBounds` object by defining south-west and north-east corners of the rectangle.
	
	// @alternative
	// @factory L.latLngBounds(latlngs: LatLng[])
	// Creates a `LatLngBounds` object defined by the geographical points it contains. Very useful for zooming the map to fit a particular set of locations with [`fitBounds`](#map-fitbounds).
	L.latLngBounds = function (a, b) {
		if (a instanceof L.LatLngBounds) {
			return a;
		}
		return new L.LatLngBounds(a, b);
	};
	
	
	
	/*
	 * @namespace Projection
	 * @section
	 * Leaflet comes with a set of already defined Projections out of the box:
	 *
	 * @projection L.Projection.LonLat
	 *
	 * Equirectangular, or Plate Carree projection — the most simple projection,
	 * mostly used by GIS enthusiasts. Directly maps `x` as longitude, and `y` as
	 * latitude. Also suitable for flat worlds, e.g. game maps. Used by the
	 * `EPSG:3395` and `Simple` CRS.
	 */
	
	L.Projection = {};
	
	L.Projection.LonLat = {
		project: function (latlng) {
			return new L.Point(latlng.lng, latlng.lat);
		},
	
		unproject: function (point) {
			return new L.LatLng(point.y, point.x);
		},
	
		bounds: L.bounds([-180, -90], [180, 90])
	};
	
	
	
	/*
	 * @namespace Projection
	 * @projection L.Projection.SphericalMercator
	 *
	 * Spherical Mercator projection — the most common projection for online maps,
	 * used by almost all free and commercial tile providers. Assumes that Earth is
	 * a sphere. Used by the `EPSG:3857` CRS.
	 */
	
	L.Projection.SphericalMercator = {
	
		R: 6378137,
		MAX_LATITUDE: 85.0511287798,
	
		project: function (latlng) {
			var d = Math.PI / 180,
			    max = this.MAX_LATITUDE,
			    lat = Math.max(Math.min(max, latlng.lat), -max),
			    sin = Math.sin(lat * d);
	
			return new L.Point(
					this.R * latlng.lng * d,
					this.R * Math.log((1 + sin) / (1 - sin)) / 2);
		},
	
		unproject: function (point) {
			var d = 180 / Math.PI;
	
			return new L.LatLng(
				(2 * Math.atan(Math.exp(point.y / this.R)) - (Math.PI / 2)) * d,
				point.x * d / this.R);
		},
	
		bounds: (function () {
			var d = 6378137 * Math.PI;
			return L.bounds([-d, -d], [d, d]);
		})()
	};
	
	
	
	/*
	 * @class CRS
	 * @aka L.CRS
	 * Abstract class that defines coordinate reference systems for projecting
	 * geographical points into pixel (screen) coordinates and back (and to
	 * coordinates in other units for [WMS](https://en.wikipedia.org/wiki/Web_Map_Service) services). See
	 * [spatial reference system](http://en.wikipedia.org/wiki/Coordinate_reference_system).
	 *
	 * Leaflet defines the most usual CRSs by default. If you want to use a
	 * CRS not defined by default, take a look at the
	 * [Proj4Leaflet](https://github.com/kartena/Proj4Leaflet) plugin.
	 */
	
	L.CRS = {
		// @method latLngToPoint(latlng: LatLng, zoom: Number): Point
		// Projects geographical coordinates into pixel coordinates for a given zoom.
		latLngToPoint: function (latlng, zoom) {
			var projectedPoint = this.projection.project(latlng),
			    scale = this.scale(zoom);
	
			return this.transformation._transform(projectedPoint, scale);
		},
	
		// @method pointToLatLng(point: Point, zoom: Number): LatLng
		// The inverse of `latLngToPoint`. Projects pixel coordinates on a given
		// zoom into geographical coordinates.
		pointToLatLng: function (point, zoom) {
			var scale = this.scale(zoom),
			    untransformedPoint = this.transformation.untransform(point, scale);
	
			return this.projection.unproject(untransformedPoint);
		},
	
		// @method project(latlng: LatLng): Point
		// Projects geographical coordinates into coordinates in units accepted for
		// this CRS (e.g. meters for EPSG:3857, for passing it to WMS services).
		project: function (latlng) {
			return this.projection.project(latlng);
		},
	
		// @method unproject(point: Point): LatLng
		// Given a projected coordinate returns the corresponding LatLng.
		// The inverse of `project`.
		unproject: function (point) {
			return this.projection.unproject(point);
		},
	
		// @method scale(zoom: Number): Number
		// Returns the scale used when transforming projected coordinates into
		// pixel coordinates for a particular zoom. For example, it returns
		// `256 * 2^zoom` for Mercator-based CRS.
		scale: function (zoom) {
			return 256 * Math.pow(2, zoom);
		},
	
		// @method zoom(scale: Number): Number
		// Inverse of `scale()`, returns the zoom level corresponding to a scale
		// factor of `scale`.
		zoom: function (scale) {
			return Math.log(scale / 256) / Math.LN2;
		},
	
		// @method getProjectedBounds(zoom: Number): Bounds
		// Returns the projection's bounds scaled and transformed for the provided `zoom`.
		getProjectedBounds: function (zoom) {
			if (this.infinite) { return null; }
	
			var b = this.projection.bounds,
			    s = this.scale(zoom),
			    min = this.transformation.transform(b.min, s),
			    max = this.transformation.transform(b.max, s);
	
			return L.bounds(min, max);
		},
	
		// @method distance(latlng1: LatLng, latlng2: LatLng): Number
		// Returns the distance between two geographical coordinates.
	
		// @property code: String
		// Standard code name of the CRS passed into WMS services (e.g. `'EPSG:3857'`)
		//
		// @property wrapLng: Number[]
		// An array of two numbers defining whether the longitude (horizontal) coordinate
		// axis wraps around a given range and how. Defaults to `[-180, 180]` in most
		// geographical CRSs. If `undefined`, the longitude axis does not wrap around.
		//
		// @property wrapLat: Number[]
		// Like `wrapLng`, but for the latitude (vertical) axis.
	
		// wrapLng: [min, max],
		// wrapLat: [min, max],
	
		// @property infinite: Boolean
		// If true, the coordinate space will be unbounded (infinite in both axes)
		infinite: false,
	
		// @method wrapLatLng(latlng: LatLng): LatLng
		// Returns a `LatLng` where lat and lng has been wrapped according to the
		// CRS's `wrapLat` and `wrapLng` properties, if they are outside the CRS's bounds.
		wrapLatLng: function (latlng) {
			var lng = this.wrapLng ? L.Util.wrapNum(latlng.lng, this.wrapLng, true) : latlng.lng,
			    lat = this.wrapLat ? L.Util.wrapNum(latlng.lat, this.wrapLat, true) : latlng.lat,
			    alt = latlng.alt;
	
			return L.latLng(lat, lng, alt);
		}
	};
	
	
	
	/*
	 * @namespace CRS
	 * @crs L.CRS.Simple
	 *
	 * A simple CRS that maps longitude and latitude into `x` and `y` directly.
	 * May be used for maps of flat surfaces (e.g. game maps). Note that the `y`
	 * axis should still be inverted (going from bottom to top). `distance()` returns
	 * simple euclidean distance.
	 */
	
	L.CRS.Simple = L.extend({}, L.CRS, {
		projection: L.Projection.LonLat,
		transformation: new L.Transformation(1, 0, -1, 0),
	
		scale: function (zoom) {
			return Math.pow(2, zoom);
		},
	
		zoom: function (scale) {
			return Math.log(scale) / Math.LN2;
		},
	
		distance: function (latlng1, latlng2) {
			var dx = latlng2.lng - latlng1.lng,
			    dy = latlng2.lat - latlng1.lat;
	
			return Math.sqrt(dx * dx + dy * dy);
		},
	
		infinite: true
	});
	
	
	
	/*
	 * @namespace CRS
	 * @crs L.CRS.Earth
	 *
	 * Serves as the base for CRS that are global such that they cover the earth.
	 * Can only be used as the base for other CRS and cannot be used directly,
	 * since it does not have a `code`, `projection` or `transformation`. `distance()` returns
	 * meters.
	 */
	
	L.CRS.Earth = L.extend({}, L.CRS, {
		wrapLng: [-180, 180],
	
		// Mean Earth Radius, as recommended for use by
		// the International Union of Geodesy and Geophysics,
		// see http://rosettacode.org/wiki/Haversine_formula
		R: 6371000,
	
		// distance between two geographical points using spherical law of cosines approximation
		distance: function (latlng1, latlng2) {
			var rad = Math.PI / 180,
			    lat1 = latlng1.lat * rad,
			    lat2 = latlng2.lat * rad,
			    a = Math.sin(lat1) * Math.sin(lat2) +
			        Math.cos(lat1) * Math.cos(lat2) * Math.cos((latlng2.lng - latlng1.lng) * rad);
	
			return this.R * Math.acos(Math.min(a, 1));
		}
	});
	
	
	
	/*
	 * @namespace CRS
	 * @crs L.CRS.EPSG3857
	 *
	 * The most common CRS for online maps, used by almost all free and commercial
	 * tile providers. Uses Spherical Mercator projection. Set in by default in
	 * Map's `crs` option.
	 */
	
	L.CRS.EPSG3857 = L.extend({}, L.CRS.Earth, {
		code: 'EPSG:3857',
		projection: L.Projection.SphericalMercator,
	
		transformation: (function () {
			var scale = 0.5 / (Math.PI * L.Projection.SphericalMercator.R);
			return new L.Transformation(scale, 0.5, -scale, 0.5);
		}())
	});
	
	L.CRS.EPSG900913 = L.extend({}, L.CRS.EPSG3857, {
		code: 'EPSG:900913'
	});
	
	
	
	/*
	 * @namespace CRS
	 * @crs L.CRS.EPSG4326
	 *
	 * A common CRS among GIS enthusiasts. Uses simple Equirectangular projection.
	 */
	
	L.CRS.EPSG4326 = L.extend({}, L.CRS.Earth, {
		code: 'EPSG:4326',
		projection: L.Projection.LonLat,
		transformation: new L.Transformation(1 / 180, 1, -1 / 180, 0.5)
	});
	
	
	
	/*
	 * @class Map
	 * @aka L.Map
	 * @inherits Evented
	 *
	 * The central class of the API — it is used to create a map on a page and manipulate it.
	 *
	 * @example
	 *
	 * ```js
	 * // initialize the map on the "map" div with a given center and zoom
	 * var map = L.map('map', {
	 * 	center: [51.505, -0.09],
	 * 	zoom: 13
	 * });
	 * ```
	 *
	 */
	
	L.Map = L.Evented.extend({
	
		options: {
			// @section Map State Options
			// @option crs: CRS = L.CRS.EPSG3857
			// The [Coordinate Reference System](#crs) to use. Don't change this if you're not
			// sure what it means.
			crs: L.CRS.EPSG3857,
	
			// @option center: LatLng = undefined
			// Initial geographic center of the map
			center: undefined,
	
			// @option zoom: Number = undefined
			// Initial map zoom level
			zoom: undefined,
	
			// @option minZoom: Number = undefined
			// Minimum zoom level of the map. Overrides any `minZoom` option set on map layers.
			minZoom: undefined,
	
			// @option maxZoom: Number = undefined
			// Maximum zoom level of the map. Overrides any `maxZoom` option set on map layers.
			maxZoom: undefined,
	
			// @option layers: Layer[] = []
			// Array of layers that will be added to the map initially
			layers: [],
	
			// @option maxBounds: LatLngBounds = null
			// When this option is set, the map restricts the view to the given
			// geographical bounds, bouncing the user back when he tries to pan
			// outside the view. To set the restriction dynamically, use
			// [`setMaxBounds`](#map-setmaxbounds) method.
			maxBounds: undefined,
	
			// @option renderer: Renderer = *
			// The default method for drawing vector layers on the map. `L.SVG`
			// or `L.Canvas` by default depending on browser support.
			renderer: undefined,
	
	
			// @section Animation Options
			// @option fadeAnimation: Boolean = true
			// Whether the tile fade animation is enabled. By default it's enabled
			// in all browsers that support CSS3 Transitions except Android.
			fadeAnimation: true,
	
			// @option markerZoomAnimation: Boolean = true
			// Whether markers animate their zoom with the zoom animation, if disabled
			// they will disappear for the length of the animation. By default it's
			// enabled in all browsers that support CSS3 Transitions except Android.
			markerZoomAnimation: true,
	
			// @option transform3DLimit: Number = 2^23
			// Defines the maximum size of a CSS translation transform. The default
			// value should not be changed unless a web browser positions layers in
			// the wrong place after doing a large `panBy`.
			transform3DLimit: 8388608, // Precision limit of a 32-bit float
	
			// @section Interaction Options
			// @option zoomSnap: Number = 1
			// Forces the map's zoom level to always be a multiple of this, particularly
			// right after a [`fitBounds()`](#map-fitbounds) or a pinch-zoom.
			// By default, the zoom level snaps to the nearest integer; lower values
			// (e.g. `0.5` or `0.1`) allow for greater granularity. A value of `0`
			// means the zoom level will not be snapped after `fitBounds` or a pinch-zoom.
			zoomSnap: 1,
	
			// @option zoomDelta: Number = 1
			// Controls how much the map's zoom level will change after a
			// [`zoomIn()`](#map-zoomin), [`zoomOut()`](#map-zoomout), pressing `+`
			// or `-` on the keyboard, or using the [zoom controls](#control-zoom).
			// Values smaller than `1` (e.g. `0.5`) allow for greater granularity.
			zoomDelta: 1,
	
			// @option trackResize: Boolean = true
			// Whether the map automatically handles browser window resize to update itself.
			trackResize: true
		},
	
		initialize: function (id, options) { // (HTMLElement or String, Object)
			options = L.setOptions(this, options);
	
			this._initContainer(id);
			this._initLayout();
	
			// hack for https://github.com/Leaflet/Leaflet/issues/1980
			this._onResize = L.bind(this._onResize, this);
	
			this._initEvents();
	
			if (options.maxBounds) {
				this.setMaxBounds(options.maxBounds);
			}
	
			if (options.zoom !== undefined) {
				this._zoom = this._limitZoom(options.zoom);
			}
	
			if (options.center && options.zoom !== undefined) {
				this.setView(L.latLng(options.center), options.zoom, {reset: true});
			}
	
			this._handlers = [];
			this._layers = {};
			this._zoomBoundLayers = {};
			this._sizeChanged = true;
	
			this.callInitHooks();
	
			this._addLayers(this.options.layers);
		},
	
	
		// @section Methods for modifying map state
	
		// @method setView(center: LatLng, zoom: Number, options?: Zoom/pan options): this
		// Sets the view of the map (geographical center and zoom) with the given
		// animation options.
		setView: function (center, zoom) {
			// replaced by animation-powered implementation in Map.PanAnimation.js
			zoom = zoom === undefined ? this.getZoom() : zoom;
			this._resetView(L.latLng(center), zoom);
			return this;
		},
	
		// @method setZoom(zoom: Number, options: Zoom/pan options): this
		// Sets the zoom of the map.
		setZoom: function (zoom, options) {
			if (!this._loaded) {
				this._zoom = zoom;
				return this;
			}
			return this.setView(this.getCenter(), zoom, {zoom: options});
		},
	
		// @method zoomIn(delta?: Number, options?: Zoom options): this
		// Increases the zoom of the map by `delta` ([`zoomDelta`](#map-zoomdelta) by default).
		zoomIn: function (delta, options) {
			delta = delta || (L.Browser.any3d ? this.options.zoomDelta : 1);
			return this.setZoom(this._zoom + delta, options);
		},
	
		// @method zoomOut(delta?: Number, options?: Zoom options): this
		// Decreases the zoom of the map by `delta` ([`zoomDelta`](#map-zoomdelta) by default).
		zoomOut: function (delta, options) {
			delta = delta || (L.Browser.any3d ? this.options.zoomDelta : 1);
			return this.setZoom(this._zoom - delta, options);
		},
	
		// @method setZoomAround(latlng: LatLng, zoom: Number, options: Zoom options): this
		// Zooms the map while keeping a specified geographical point on the map
		// stationary (e.g. used internally for scroll zoom and double-click zoom).
		// @alternative
		// @method setZoomAround(offset: Point, zoom: Number, options: Zoom options): this
		// Zooms the map while keeping a specified pixel on the map (relative to the top-left corner) stationary.
		setZoomAround: function (latlng, zoom, options) {
			var scale = this.getZoomScale(zoom),
			    viewHalf = this.getSize().divideBy(2),
			    containerPoint = latlng instanceof L.Point ? latlng : this.latLngToContainerPoint(latlng),
	
			    centerOffset = containerPoint.subtract(viewHalf).multiplyBy(1 - 1 / scale),
			    newCenter = this.containerPointToLatLng(viewHalf.add(centerOffset));
	
			return this.setView(newCenter, zoom, {zoom: options});
		},
	
		_getBoundsCenterZoom: function (bounds, options) {
	
			options = options || {};
			bounds = bounds.getBounds ? bounds.getBounds() : L.latLngBounds(bounds);
	
			var paddingTL = L.point(options.paddingTopLeft || options.padding || [0, 0]),
			    paddingBR = L.point(options.paddingBottomRight || options.padding || [0, 0]),
	
			    zoom = this.getBoundsZoom(bounds, false, paddingTL.add(paddingBR));
	
			zoom = (typeof options.maxZoom === 'number') ? Math.min(options.maxZoom, zoom) : zoom;
	
			var paddingOffset = paddingBR.subtract(paddingTL).divideBy(2),
	
			    swPoint = this.project(bounds.getSouthWest(), zoom),
			    nePoint = this.project(bounds.getNorthEast(), zoom),
			    center = this.unproject(swPoint.add(nePoint).divideBy(2).add(paddingOffset), zoom);
	
			return {
				center: center,
				zoom: zoom
			};
		},
	
		// @method fitBounds(bounds: LatLngBounds, options: fitBounds options): this
		// Sets a map view that contains the given geographical bounds with the
		// maximum zoom level possible.
		fitBounds: function (bounds, options) {
	
			bounds = L.latLngBounds(bounds);
	
			if (!bounds.isValid()) {
				throw new Error('Bounds are not valid.');
			}
	
			var target = this._getBoundsCenterZoom(bounds, options);
			return this.setView(target.center, target.zoom, options);
		},
	
		// @method fitWorld(options?: fitBounds options): this
		// Sets a map view that mostly contains the whole world with the maximum
		// zoom level possible.
		fitWorld: function (options) {
			return this.fitBounds([[-90, -180], [90, 180]], options);
		},
	
		// @method panTo(latlng: LatLng, options?: Pan options): this
		// Pans the map to a given center.
		panTo: function (center, options) { // (LatLng)
			return this.setView(center, this._zoom, {pan: options});
		},
	
		// @method panBy(offset: Point): this
		// Pans the map by a given number of pixels (animated).
		panBy: function (offset) { // (Point)
			// replaced with animated panBy in Map.PanAnimation.js
			this.fire('movestart');
	
			this._rawPanBy(L.point(offset));
	
			this.fire('move');
			return this.fire('moveend');
		},
	
		// @method setMaxBounds(bounds: Bounds): this
		// Restricts the map view to the given bounds (see the [maxBounds](#map-maxbounds) option).
		setMaxBounds: function (bounds) {
			bounds = L.latLngBounds(bounds);
	
			if (!bounds.isValid()) {
				this.options.maxBounds = null;
				return this.off('moveend', this._panInsideMaxBounds);
			} else if (this.options.maxBounds) {
				this.off('moveend', this._panInsideMaxBounds);
			}
	
			this.options.maxBounds = bounds;
	
			if (this._loaded) {
				this._panInsideMaxBounds();
			}
	
			return this.on('moveend', this._panInsideMaxBounds);
		},
	
		// @method setMinZoom(zoom: Number): this
		// Sets the lower limit for the available zoom levels (see the [minZoom](#map-minzoom) option).
		setMinZoom: function (zoom) {
			this.options.minZoom = zoom;
	
			if (this._loaded && this.getZoom() < this.options.minZoom) {
				return this.setZoom(zoom);
			}
	
			return this;
		},
	
		// @method setMaxZoom(zoom: Number): this
		// Sets the upper limit for the available zoom levels (see the [maxZoom](#map-maxzoom) option).
		setMaxZoom: function (zoom) {
			this.options.maxZoom = zoom;
	
			if (this._loaded && (this.getZoom() > this.options.maxZoom)) {
				return this.setZoom(zoom);
			}
	
			return this;
		},
	
		// @method panInsideBounds(bounds: LatLngBounds, options?: Pan options): this
		// Pans the map to the closest view that would lie inside the given bounds (if it's not already), controlling the animation using the options specific, if any.
		panInsideBounds: function (bounds, options) {
			this._enforcingBounds = true;
			var center = this.getCenter(),
			    newCenter = this._limitCenter(center, this._zoom, L.latLngBounds(bounds));
	
			if (!center.equals(newCenter)) {
				this.panTo(newCenter, options);
			}
	
			this._enforcingBounds = false;
			return this;
		},
	
		// @method invalidateSize(options: Zoom/Pan options): this
		// Checks if the map container size changed and updates the map if so —
		// call it after you've changed the map size dynamically, also animating
		// pan by default. If `options.pan` is `false`, panning will not occur.
		// If `options.debounceMoveend` is `true`, it will delay `moveend` event so
		// that it doesn't happen often even if the method is called many
		// times in a row.
	
		// @alternative
		// @method invalidateSize(animate: Boolean): this
		// Checks if the map container size changed and updates the map if so —
		// call it after you've changed the map size dynamically, also animating
		// pan by default.
		invalidateSize: function (options) {
			if (!this._loaded) { return this; }
	
			options = L.extend({
				animate: false,
				pan: true
			}, options === true ? {animate: true} : options);
	
			var oldSize = this.getSize();
			this._sizeChanged = true;
			this._lastCenter = null;
	
			var newSize = this.getSize(),
			    oldCenter = oldSize.divideBy(2).round(),
			    newCenter = newSize.divideBy(2).round(),
			    offset = oldCenter.subtract(newCenter);
	
			if (!offset.x && !offset.y) { return this; }
	
			if (options.animate && options.pan) {
				this.panBy(offset);
	
			} else {
				if (options.pan) {
					this._rawPanBy(offset);
				}
	
				this.fire('move');
	
				if (options.debounceMoveend) {
					clearTimeout(this._sizeTimer);
					this._sizeTimer = setTimeout(L.bind(this.fire, this, 'moveend'), 200);
				} else {
					this.fire('moveend');
				}
			}
	
			// @section Map state change events
			// @event resize: ResizeEvent
			// Fired when the map is resized.
			return this.fire('resize', {
				oldSize: oldSize,
				newSize: newSize
			});
		},
	
		// @section Methods for modifying map state
		// @method stop(): this
		// Stops the currently running `panTo` or `flyTo` animation, if any.
		stop: function () {
			this.setZoom(this._limitZoom(this._zoom));
			if (!this.options.zoomSnap) {
				this.fire('viewreset');
			}
			return this._stop();
		},
	
	
		// TODO handler.addTo
		// TODO Appropiate docs section?
		// @section Other Methods
		// @method addHandler(name: String, HandlerClass: Function): this
		// Adds a new `Handler` to the map, given its name and constructor function.
		addHandler: function (name, HandlerClass) {
			if (!HandlerClass) { return this; }
	
			var handler = this[name] = new HandlerClass(this);
	
			this._handlers.push(handler);
	
			if (this.options[name]) {
				handler.enable();
			}
	
			return this;
		},
	
		// @method remove(): this
		// Destroys the map and clears all related event listeners.
		remove: function () {
	
			this._initEvents(true);
	
			if (this._containerId !== this._container._leaflet_id) {
				throw new Error('Map container is being reused by another instance');
			}
	
			try {
				// throws error in IE6-8
				delete this._container._leaflet_id;
				delete this._containerId;
			} catch (e) {
				/*eslint-disable */
				this._container._leaflet_id = undefined;
				/*eslint-enable */
				this._containerId = undefined;
			}
	
			L.DomUtil.remove(this._mapPane);
	
			if (this._clearControlPos) {
				this._clearControlPos();
			}
	
			this._clearHandlers();
	
			if (this._loaded) {
				// @section Map state change events
				// @event unload: Event
				// Fired when the map is destroyed with [remove](#map-remove) method.
				this.fire('unload');
			}
	
			for (var i in this._layers) {
				this._layers[i].remove();
			}
	
			return this;
		},
	
		// @section Other Methods
		// @method createPane(name: String, container?: HTMLElement): HTMLElement
		// Creates a new [map pane](#map-pane) with the given name if it doesn't exist already,
		// then returns it. The pane is created as a children of `container`, or
		// as a children of the main map pane if not set.
		createPane: function (name, container) {
			var className = 'leaflet-pane' + (name ? ' leaflet-' + name.replace('Pane', '') + '-pane' : ''),
			    pane = L.DomUtil.create('div', className, container || this._mapPane);
	
			if (name) {
				this._panes[name] = pane;
			}
			return pane;
		},
	
		// @section Methods for Getting Map State
	
		// @method getCenter(): LatLng
		// Returns the geographical center of the map view
		getCenter: function () {
			this._checkIfLoaded();
	
			if (this._lastCenter && !this._moved()) {
				return this._lastCenter;
			}
			return this.layerPointToLatLng(this._getCenterLayerPoint());
		},
	
		// @method getZoom(): Number
		// Returns the current zoom level of the map view
		getZoom: function () {
			return this._zoom;
		},
	
		// @method getBounds(): LatLngBounds
		// Returns the geographical bounds visible in the current map view
		getBounds: function () {
			var bounds = this.getPixelBounds(),
			    sw = this.unproject(bounds.getBottomLeft()),
			    ne = this.unproject(bounds.getTopRight());
	
			return new L.LatLngBounds(sw, ne);
		},
	
		// @method getMinZoom(): Number
		// Returns the minimum zoom level of the map (if set in the `minZoom` option of the map or of any layers), or `0` by default.
		getMinZoom: function () {
			return this.options.minZoom === undefined ? this._layersMinZoom || 0 : this.options.minZoom;
		},
	
		// @method getMaxZoom(): Number
		// Returns the maximum zoom level of the map (if set in the `maxZoom` option of the map or of any layers).
		getMaxZoom: function () {
			return this.options.maxZoom === undefined ?
				(this._layersMaxZoom === undefined ? Infinity : this._layersMaxZoom) :
				this.options.maxZoom;
		},
	
		// @method getBoundsZoom(bounds: LatLngBounds, inside?: Boolean): Number
		// Returns the maximum zoom level on which the given bounds fit to the map
		// view in its entirety. If `inside` (optional) is set to `true`, the method
		// instead returns the minimum zoom level on which the map view fits into
		// the given bounds in its entirety.
		getBoundsZoom: function (bounds, inside, padding) { // (LatLngBounds[, Boolean, Point]) -> Number
			bounds = L.latLngBounds(bounds);
			padding = L.point(padding || [0, 0]);
	
			var zoom = this.getZoom() || 0,
			    min = this.getMinZoom(),
			    max = this.getMaxZoom(),
			    nw = bounds.getNorthWest(),
			    se = bounds.getSouthEast(),
			    size = this.getSize().subtract(padding),
			    boundsSize = this.project(se, zoom).subtract(this.project(nw, zoom)),
			    snap = L.Browser.any3d ? this.options.zoomSnap : 1;
	
			var scale = Math.min(size.x / boundsSize.x, size.y / boundsSize.y);
			zoom = this.getScaleZoom(scale, zoom);
	
			if (snap) {
				zoom = Math.round(zoom / (snap / 100)) * (snap / 100); // don't jump if within 1% of a snap level
				zoom = inside ? Math.ceil(zoom / snap) * snap : Math.floor(zoom / snap) * snap;
			}
	
			return Math.max(min, Math.min(max, zoom));
		},
	
		// @method getSize(): Point
		// Returns the current size of the map container (in pixels).
		getSize: function () {
			if (!this._size || this._sizeChanged) {
				this._size = new L.Point(
					this._container.clientWidth,
					this._container.clientHeight);
	
				this._sizeChanged = false;
			}
			return this._size.clone();
		},
	
		// @method getPixelBounds(): Bounds
		// Returns the bounds of the current map view in projected pixel
		// coordinates (sometimes useful in layer and overlay implementations).
		getPixelBounds: function (center, zoom) {
			var topLeftPoint = this._getTopLeftPoint(center, zoom);
			return new L.Bounds(topLeftPoint, topLeftPoint.add(this.getSize()));
		},
	
		// TODO: Check semantics - isn't the pixel origin the 0,0 coord relative to
		// the map pane? "left point of the map layer" can be confusing, specially
		// since there can be negative offsets.
		// @method getPixelOrigin(): Point
		// Returns the projected pixel coordinates of the top left point of
		// the map layer (useful in custom layer and overlay implementations).
		getPixelOrigin: function () {
			this._checkIfLoaded();
			return this._pixelOrigin;
		},
	
		// @method getPixelWorldBounds(zoom?: Number): Bounds
		// Returns the world's bounds in pixel coordinates for zoom level `zoom`.
		// If `zoom` is omitted, the map's current zoom level is used.
		getPixelWorldBounds: function (zoom) {
			return this.options.crs.getProjectedBounds(zoom === undefined ? this.getZoom() : zoom);
		},
	
		// @section Other Methods
	
		// @method getPane(pane: String|HTMLElement): HTMLElement
		// Returns a [map pane](#map-pane), given its name or its HTML element (its identity).
		getPane: function (pane) {
			return typeof pane === 'string' ? this._panes[pane] : pane;
		},
	
		// @method getPanes(): Object
		// Returns a plain object containing the names of all [panes](#map-pane) as keys and
		// the panes as values.
		getPanes: function () {
			return this._panes;
		},
	
		// @method getContainer: HTMLElement
		// Returns the HTML element that contains the map.
		getContainer: function () {
			return this._container;
		},
	
	
		// @section Conversion Methods
	
		// @method getZoomScale(toZoom: Number, fromZoom: Number): Number
		// Returns the scale factor to be applied to a map transition from zoom level
		// `fromZoom` to `toZoom`. Used internally to help with zoom animations.
		getZoomScale: function (toZoom, fromZoom) {
			// TODO replace with universal implementation after refactoring projections
			var crs = this.options.crs;
			fromZoom = fromZoom === undefined ? this._zoom : fromZoom;
			return crs.scale(toZoom) / crs.scale(fromZoom);
		},
	
		// @method getScaleZoom(scale: Number, fromZoom: Number): Number
		// Returns the zoom level that the map would end up at, if it is at `fromZoom`
		// level and everything is scaled by a factor of `scale`. Inverse of
		// [`getZoomScale`](#map-getZoomScale).
		getScaleZoom: function (scale, fromZoom) {
			var crs = this.options.crs;
			fromZoom = fromZoom === undefined ? this._zoom : fromZoom;
			var zoom = crs.zoom(scale * crs.scale(fromZoom));
			return isNaN(zoom) ? Infinity : zoom;
		},
	
		// @method project(latlng: LatLng, zoom: Number): Point
		// Projects a geographical coordinate `LatLng` according to the projection
		// of the map's CRS, then scales it according to `zoom` and the CRS's
		// `Transformation`. The result is pixel coordinate relative to
		// the CRS origin.
		project: function (latlng, zoom) {
			zoom = zoom === undefined ? this._zoom : zoom;
			return this.options.crs.latLngToPoint(L.latLng(latlng), zoom);
		},
	
		// @method unproject(point: Point, zoom: Number): LatLng
		// Inverse of [`project`](#map-project).
		unproject: function (point, zoom) {
			zoom = zoom === undefined ? this._zoom : zoom;
			return this.options.crs.pointToLatLng(L.point(point), zoom);
		},
	
		// @method layerPointToLatLng(point: Point): LatLng
		// Given a pixel coordinate relative to the [origin pixel](#map-getpixelorigin),
		// returns the corresponding geographical coordinate (for the current zoom level).
		layerPointToLatLng: function (point) {
			var projectedPoint = L.point(point).add(this.getPixelOrigin());
			return this.unproject(projectedPoint);
		},
	
		// @method latLngToLayerPoint(latlng: LatLng): Point
		// Given a geographical coordinate, returns the corresponding pixel coordinate
		// relative to the [origin pixel](#map-getpixelorigin).
		latLngToLayerPoint: function (latlng) {
			var projectedPoint = this.project(L.latLng(latlng))._round();
			return projectedPoint._subtract(this.getPixelOrigin());
		},
	
		// @method wrapLatLng(latlng: LatLng): LatLng
		// Returns a `LatLng` where `lat` and `lng` has been wrapped according to the
		// map's CRS's `wrapLat` and `wrapLng` properties, if they are outside the
		// CRS's bounds.
		// By default this means longitude is wrapped around the dateline so its
		// value is between -180 and +180 degrees.
		wrapLatLng: function (latlng) {
			return this.options.crs.wrapLatLng(L.latLng(latlng));
		},
	
		// @method distance(latlng1: LatLng, latlng2: LatLng): Number
		// Returns the distance between two geographical coordinates according to
		// the map's CRS. By default this measures distance in meters.
		distance: function (latlng1, latlng2) {
			return this.options.crs.distance(L.latLng(latlng1), L.latLng(latlng2));
		},
	
		// @method containerPointToLayerPoint(point: Point): Point
		// Given a pixel coordinate relative to the map container, returns the corresponding
		// pixel coordinate relative to the [origin pixel](#map-getpixelorigin).
		containerPointToLayerPoint: function (point) { // (Point)
			return L.point(point).subtract(this._getMapPanePos());
		},
	
		// @method layerPointToContainerPoint(point: Point): Point
		// Given a pixel coordinate relative to the [origin pixel](#map-getpixelorigin),
		// returns the corresponding pixel coordinate relative to the map container.
		layerPointToContainerPoint: function (point) { // (Point)
			return L.point(point).add(this._getMapPanePos());
		},
	
		// @method containerPointToLatLng(point: Point): Point
		// Given a pixel coordinate relative to the map container, returns
		// the corresponding geographical coordinate (for the current zoom level).
		containerPointToLatLng: function (point) {
			var layerPoint = this.containerPointToLayerPoint(L.point(point));
			return this.layerPointToLatLng(layerPoint);
		},
	
		// @method latLngToContainerPoint(latlng: LatLng): Point
		// Given a geographical coordinate, returns the corresponding pixel coordinate
		// relative to the map container.
		latLngToContainerPoint: function (latlng) {
			return this.layerPointToContainerPoint(this.latLngToLayerPoint(L.latLng(latlng)));
		},
	
		// @method mouseEventToContainerPoint(ev: MouseEvent): Point
		// Given a MouseEvent object, returns the pixel coordinate relative to the
		// map container where the event took place.
		mouseEventToContainerPoint: function (e) {
			return L.DomEvent.getMousePosition(e, this._container);
		},
	
		// @method mouseEventToLayerPoint(ev: MouseEvent): Point
		// Given a MouseEvent object, returns the pixel coordinate relative to
		// the [origin pixel](#map-getpixelorigin) where the event took place.
		mouseEventToLayerPoint: function (e) {
			return this.containerPointToLayerPoint(this.mouseEventToContainerPoint(e));
		},
	
		// @method mouseEventToLatLng(ev: MouseEvent): LatLng
		// Given a MouseEvent object, returns geographical coordinate where the
		// event took place.
		mouseEventToLatLng: function (e) { // (MouseEvent)
			return this.layerPointToLatLng(this.mouseEventToLayerPoint(e));
		},
	
	
		// map initialization methods
	
		_initContainer: function (id) {
			var container = this._container = L.DomUtil.get(id);
	
			if (!container) {
				throw new Error('Map container not found.');
			} else if (container._leaflet_id) {
				throw new Error('Map container is already initialized.');
			}
	
			L.DomEvent.addListener(container, 'scroll', this._onScroll, this);
			this._containerId = L.Util.stamp(container);
		},
	
		_initLayout: function () {
			var container = this._container;
	
			this._fadeAnimated = this.options.fadeAnimation && L.Browser.any3d;
	
			L.DomUtil.addClass(container, 'leaflet-container' +
				(L.Browser.touch ? ' leaflet-touch' : '') +
				(L.Browser.retina ? ' leaflet-retina' : '') +
				(L.Browser.ielt9 ? ' leaflet-oldie' : '') +
				(L.Browser.safari ? ' leaflet-safari' : '') +
				(this._fadeAnimated ? ' leaflet-fade-anim' : ''));
	
			var position = L.DomUtil.getStyle(container, 'position');
	
			if (position !== 'absolute' && position !== 'relative' && position !== 'fixed') {
				container.style.position = 'relative';
			}
	
			this._initPanes();
	
			if (this._initControlPos) {
				this._initControlPos();
			}
		},
	
		_initPanes: function () {
			var panes = this._panes = {};
			this._paneRenderers = {};
	
			// @section
			//
			// Panes are DOM elements used to control the ordering of layers on the map. You
			// can access panes with [`map.getPane`](#map-getpane) or
			// [`map.getPanes`](#map-getpanes) methods. New panes can be created with the
			// [`map.createPane`](#map-createpane) method.
			//
			// Every map has the following default panes that differ only in zIndex.
			//
			// @pane mapPane: HTMLElement = 'auto'
			// Pane that contains all other map panes
	
			this._mapPane = this.createPane('mapPane', this._container);
			L.DomUtil.setPosition(this._mapPane, new L.Point(0, 0));
	
			// @pane tilePane: HTMLElement = 200
			// Pane for `GridLayer`s and `TileLayer`s
			this.createPane('tilePane');
			// @pane overlayPane: HTMLElement = 400
			// Pane for vector overlays (`Path`s), like `Polyline`s and `Polygon`s
			this.createPane('shadowPane');
			// @pane shadowPane: HTMLElement = 500
			// Pane for overlay shadows (e.g. `Marker` shadows)
			this.createPane('overlayPane');
			// @pane markerPane: HTMLElement = 600
			// Pane for `Icon`s of `Marker`s
			this.createPane('markerPane');
			// @pane tooltipPane: HTMLElement = 650
			// Pane for tooltip.
			this.createPane('tooltipPane');
			// @pane popupPane: HTMLElement = 700
			// Pane for `Popup`s.
			this.createPane('popupPane');
	
			if (!this.options.markerZoomAnimation) {
				L.DomUtil.addClass(panes.markerPane, 'leaflet-zoom-hide');
				L.DomUtil.addClass(panes.shadowPane, 'leaflet-zoom-hide');
			}
		},
	
	
		// private methods that modify map state
	
		// @section Map state change events
		_resetView: function (center, zoom) {
			L.DomUtil.setPosition(this._mapPane, new L.Point(0, 0));
	
			var loading = !this._loaded;
			this._loaded = true;
			zoom = this._limitZoom(zoom);
	
			this.fire('viewprereset');
	
			var zoomChanged = this._zoom !== zoom;
			this
				._moveStart(zoomChanged)
				._move(center, zoom)
				._moveEnd(zoomChanged);
	
			// @event viewreset: Event
			// Fired when the map needs to redraw its content (this usually happens
			// on map zoom or load). Very useful for creating custom overlays.
			this.fire('viewreset');
	
			// @event load: Event
			// Fired when the map is initialized (when its center and zoom are set
			// for the first time).
			if (loading) {
				this.fire('load');
			}
		},
	
		_moveStart: function (zoomChanged) {
			// @event zoomstart: Event
			// Fired when the map zoom is about to change (e.g. before zoom animation).
			// @event movestart: Event
			// Fired when the view of the map starts changing (e.g. user starts dragging the map).
			if (zoomChanged) {
				this.fire('zoomstart');
			}
			return this.fire('movestart');
		},
	
		_move: function (center, zoom, data) {
			if (zoom === undefined) {
				zoom = this._zoom;
			}
			var zoomChanged = this._zoom !== zoom;
	
			this._zoom = zoom;
			this._lastCenter = center;
			this._pixelOrigin = this._getNewPixelOrigin(center);
	
			// @event zoom: Event
			// Fired repeatedly during any change in zoom level, including zoom
			// and fly animations.
			if (zoomChanged || (data && data.pinch)) {	// Always fire 'zoom' if pinching because #3530
				this.fire('zoom', data);
			}
	
			// @event move: Event
			// Fired repeatedly during any movement of the map, including pan and
			// fly animations.
			return this.fire('move', data);
		},
	
		_moveEnd: function (zoomChanged) {
			// @event zoomend: Event
			// Fired when the map has changed, after any animations.
			if (zoomChanged) {
				this.fire('zoomend');
			}
	
			// @event moveend: Event
			// Fired when the center of the map stops changing (e.g. user stopped
			// dragging the map).
			return this.fire('moveend');
		},
	
		_stop: function () {
			L.Util.cancelAnimFrame(this._flyToFrame);
			if (this._panAnim) {
				this._panAnim.stop();
			}
			return this;
		},
	
		_rawPanBy: function (offset) {
			L.DomUtil.setPosition(this._mapPane, this._getMapPanePos().subtract(offset));
		},
	
		_getZoomSpan: function () {
			return this.getMaxZoom() - this.getMinZoom();
		},
	
		_panInsideMaxBounds: function () {
			if (!this._enforcingBounds) {
				this.panInsideBounds(this.options.maxBounds);
			}
		},
	
		_checkIfLoaded: function () {
			if (!this._loaded) {
				throw new Error('Set map center and zoom first.');
			}
		},
	
		// DOM event handling
	
		// @section Interaction events
		_initEvents: function (remove) {
			if (!L.DomEvent) { return; }
	
			this._targets = {};
			this._targets[L.stamp(this._container)] = this;
	
			var onOff = remove ? 'off' : 'on';
	
			// @event click: MouseEvent
			// Fired when the user clicks (or taps) the map.
			// @event dblclick: MouseEvent
			// Fired when the user double-clicks (or double-taps) the map.
			// @event mousedown: MouseEvent
			// Fired when the user pushes the mouse button on the map.
			// @event mouseup: MouseEvent
			// Fired when the user releases the mouse button on the map.
			// @event mouseover: MouseEvent
			// Fired when the mouse enters the map.
			// @event mouseout: MouseEvent
			// Fired when the mouse leaves the map.
			// @event mousemove: MouseEvent
			// Fired while the mouse moves over the map.
			// @event contextmenu: MouseEvent
			// Fired when the user pushes the right mouse button on the map, prevents
			// default browser context menu from showing if there are listeners on
			// this event. Also fired on mobile when the user holds a single touch
			// for a second (also called long press).
			// @event keypress: KeyboardEvent
			// Fired when the user presses a key from the keyboard while the map is focused.
			L.DomEvent[onOff](this._container, 'click dblclick mousedown mouseup ' +
				'mouseover mouseout mousemove contextmenu keypress', this._handleDOMEvent, this);
	
			if (this.options.trackResize) {
				L.DomEvent[onOff](window, 'resize', this._onResize, this);
			}
	
			if (L.Browser.any3d && this.options.transform3DLimit) {
				this[onOff]('moveend', this._onMoveEnd);
			}
		},
	
		_onResize: function () {
			L.Util.cancelAnimFrame(this._resizeRequest);
			this._resizeRequest = L.Util.requestAnimFrame(
			        function () { this.invalidateSize({debounceMoveend: true}); }, this);
		},
	
		_onScroll: function () {
			this._container.scrollTop  = 0;
			this._container.scrollLeft = 0;
		},
	
		_onMoveEnd: function () {
			var pos = this._getMapPanePos();
			if (Math.max(Math.abs(pos.x), Math.abs(pos.y)) >= this.options.transform3DLimit) {
				// https://bugzilla.mozilla.org/show_bug.cgi?id=1203873 but Webkit also have
				// a pixel offset on very high values, see: http://jsfiddle.net/dg6r5hhb/
				this._resetView(this.getCenter(), this.getZoom());
			}
		},
	
		_findEventTargets: function (e, type) {
			var targets = [],
			    target,
			    isHover = type === 'mouseout' || type === 'mouseover',
			    src = e.target || e.srcElement,
			    dragging = false;
	
			while (src) {
				target = this._targets[L.stamp(src)];
				if (target && (type === 'click' || type === 'preclick') && !e._simulated && this._draggableMoved(target)) {
					// Prevent firing click after you just dragged an object.
					dragging = true;
					break;
				}
				if (target && target.listens(type, true)) {
					if (isHover && !L.DomEvent._isExternalTarget(src, e)) { break; }
					targets.push(target);
					if (isHover) { break; }
				}
				if (src === this._container) { break; }
				src = src.parentNode;
			}
			if (!targets.length && !dragging && !isHover && L.DomEvent._isExternalTarget(src, e)) {
				targets = [this];
			}
			return targets;
		},
	
		_handleDOMEvent: function (e) {
			if (!this._loaded || L.DomEvent._skipped(e)) { return; }
	
			var type = e.type === 'keypress' && e.keyCode === 13 ? 'click' : e.type;
	
			if (type === 'mousedown') {
				// prevents outline when clicking on keyboard-focusable element
				L.DomUtil.preventOutline(e.target || e.srcElement);
			}
	
			this._fireDOMEvent(e, type);
		},
	
		_fireDOMEvent: function (e, type, targets) {
	
			if (e.type === 'click') {
				// Fire a synthetic 'preclick' event which propagates up (mainly for closing popups).
				// @event preclick: MouseEvent
				// Fired before mouse click on the map (sometimes useful when you
				// want something to happen on click before any existing click
				// handlers start running).
				var synth = L.Util.extend({}, e);
				synth.type = 'preclick';
				this._fireDOMEvent(synth, synth.type, targets);
			}
	
			if (e._stopped) { return; }
	
			// Find the layer the event is propagating from and its parents.
			targets = (targets || []).concat(this._findEventTargets(e, type));
	
			if (!targets.length) { return; }
	
			var target = targets[0];
			if (type === 'contextmenu' && target.listens(type, true)) {
				L.DomEvent.preventDefault(e);
			}
	
			var data = {
				originalEvent: e
			};
	
			if (e.type !== 'keypress') {
				var isMarker = target instanceof L.Marker;
				data.containerPoint = isMarker ?
						this.latLngToContainerPoint(target.getLatLng()) : this.mouseEventToContainerPoint(e);
				data.layerPoint = this.containerPointToLayerPoint(data.containerPoint);
				data.latlng = isMarker ? target.getLatLng() : this.layerPointToLatLng(data.layerPoint);
			}
	
			for (var i = 0; i < targets.length; i++) {
				targets[i].fire(type, data, true);
				if (data.originalEvent._stopped ||
					(targets[i].options.nonBubblingEvents && L.Util.indexOf(targets[i].options.nonBubblingEvents, type) !== -1)) { return; }
			}
		},
	
		_draggableMoved: function (obj) {
			obj = obj.dragging && obj.dragging.enabled() ? obj : this;
			return (obj.dragging && obj.dragging.moved()) || (this.boxZoom && this.boxZoom.moved());
		},
	
		_clearHandlers: function () {
			for (var i = 0, len = this._handlers.length; i < len; i++) {
				this._handlers[i].disable();
			}
		},
	
		// @section Other Methods
	
		// @method whenReady(fn: Function, context?: Object): this
		// Runs the given function `fn` when the map gets initialized with
		// a view (center and zoom) and at least one layer, or immediately
		// if it's already initialized, optionally passing a function context.
		whenReady: function (callback, context) {
			if (this._loaded) {
				callback.call(context || this, {target: this});
			} else {
				this.on('load', callback, context);
			}
			return this;
		},
	
	
		// private methods for getting map state
	
		_getMapPanePos: function () {
			return L.DomUtil.getPosition(this._mapPane) || new L.Point(0, 0);
		},
	
		_moved: function () {
			var pos = this._getMapPanePos();
			return pos && !pos.equals([0, 0]);
		},
	
		_getTopLeftPoint: function (center, zoom) {
			var pixelOrigin = center && zoom !== undefined ?
				this._getNewPixelOrigin(center, zoom) :
				this.getPixelOrigin();
			return pixelOrigin.subtract(this._getMapPanePos());
		},
	
		_getNewPixelOrigin: function (center, zoom) {
			var viewHalf = this.getSize()._divideBy(2);
			return this.project(center, zoom)._subtract(viewHalf)._add(this._getMapPanePos())._round();
		},
	
		_latLngToNewLayerPoint: function (latlng, zoom, center) {
			var topLeft = this._getNewPixelOrigin(center, zoom);
			return this.project(latlng, zoom)._subtract(topLeft);
		},
	
		// layer point of the current center
		_getCenterLayerPoint: function () {
			return this.containerPointToLayerPoint(this.getSize()._divideBy(2));
		},
	
		// offset of the specified place to the current center in pixels
		_getCenterOffset: function (latlng) {
			return this.latLngToLayerPoint(latlng).subtract(this._getCenterLayerPoint());
		},
	
		// adjust center for view to get inside bounds
		_limitCenter: function (center, zoom, bounds) {
	
			if (!bounds) { return center; }
	
			var centerPoint = this.project(center, zoom),
			    viewHalf = this.getSize().divideBy(2),
			    viewBounds = new L.Bounds(centerPoint.subtract(viewHalf), centerPoint.add(viewHalf)),
			    offset = this._getBoundsOffset(viewBounds, bounds, zoom);
	
			// If offset is less than a pixel, ignore.
			// This prevents unstable projections from getting into
			// an infinite loop of tiny offsets.
			if (offset.round().equals([0, 0])) {
				return center;
			}
	
			return this.unproject(centerPoint.add(offset), zoom);
		},
	
		// adjust offset for view to get inside bounds
		_limitOffset: function (offset, bounds) {
			if (!bounds) { return offset; }
	
			var viewBounds = this.getPixelBounds(),
			    newBounds = new L.Bounds(viewBounds.min.add(offset), viewBounds.max.add(offset));
	
			return offset.add(this._getBoundsOffset(newBounds, bounds));
		},
	
		// returns offset needed for pxBounds to get inside maxBounds at a specified zoom
		_getBoundsOffset: function (pxBounds, maxBounds, zoom) {
			var projectedMaxBounds = L.bounds(
			        this.project(maxBounds.getNorthEast(), zoom),
			        this.project(maxBounds.getSouthWest(), zoom)
			    ),
			    minOffset = projectedMaxBounds.min.subtract(pxBounds.min),
			    maxOffset = projectedMaxBounds.max.subtract(pxBounds.max),
	
			    dx = this._rebound(minOffset.x, -maxOffset.x),
			    dy = this._rebound(minOffset.y, -maxOffset.y);
	
			return new L.Point(dx, dy);
		},
	
		_rebound: function (left, right) {
			return left + right > 0 ?
				Math.round(left - right) / 2 :
				Math.max(0, Math.ceil(left)) - Math.max(0, Math.floor(right));
		},
	
		_limitZoom: function (zoom) {
			var min = this.getMinZoom(),
			    max = this.getMaxZoom(),
			    snap = L.Browser.any3d ? this.options.zoomSnap : 1;
			if (snap) {
				zoom = Math.round(zoom / snap) * snap;
			}
			return Math.max(min, Math.min(max, zoom));
		}
	});
	
	// @section
	
	// @factory L.map(id: String, options?: Map options)
	// Instantiates a map object given the DOM ID of a `<div>` element
	// and optionally an object literal with `Map options`.
	//
	// @alternative
	// @factory L.map(el: HTMLElement, options?: Map options)
	// Instantiates a map object given an instance of a `<div>` HTML element
	// and optionally an object literal with `Map options`.
	L.map = function (id, options) {
		return new L.Map(id, options);
	};
	
	
	
	
	/*
	 * @class Layer
	 * @inherits Evented
	 * @aka L.Layer
	 * @aka ILayer
	 *
	 * A set of methods from the Layer base class that all Leaflet layers use.
	 * Inherits all methods, options and events from `L.Evented`.
	 *
	 * @example
	 *
	 * ```js
	 * var layer = L.Marker(latlng).addTo(map);
	 * layer.addTo(map);
	 * layer.remove();
	 * ```
	 *
	 * @event add: Event
	 * Fired after the layer is added to a map
	 *
	 * @event remove: Event
	 * Fired after the layer is removed from a map
	 */
	
	
	L.Layer = L.Evented.extend({
	
		// Classes extending `L.Layer` will inherit the following options:
		options: {
			// @option pane: String = 'overlayPane'
			// By default the layer will be added to the map's [overlay pane](#map-overlaypane). Overriding this option will cause the layer to be placed on another pane by default.
			pane: 'overlayPane',
			nonBubblingEvents: []  // Array of events that should not be bubbled to DOM parents (like the map)
		},
	
		/* @section
		 * Classes extending `L.Layer` will inherit the following methods:
		 *
		 * @method addTo(map: Map): this
		 * Adds the layer to the given map
		 */
		addTo: function (map) {
			map.addLayer(this);
			return this;
		},
	
		// @method remove: this
		// Removes the layer from the map it is currently active on.
		remove: function () {
			return this.removeFrom(this._map || this._mapToAdd);
		},
	
		// @method removeFrom(map: Map): this
		// Removes the layer from the given map
		removeFrom: function (obj) {
			if (obj) {
				obj.removeLayer(this);
			}
			return this;
		},
	
		// @method getPane(name? : String): HTMLElement
		// Returns the `HTMLElement` representing the named pane on the map. If `name` is omitted, returns the pane for this layer.
		getPane: function (name) {
			return this._map.getPane(name ? (this.options[name] || name) : this.options.pane);
		},
	
		addInteractiveTarget: function (targetEl) {
			this._map._targets[L.stamp(targetEl)] = this;
			return this;
		},
	
		removeInteractiveTarget: function (targetEl) {
			delete this._map._targets[L.stamp(targetEl)];
			return this;
		},
	
		_layerAdd: function (e) {
			var map = e.target;
	
			// check in case layer gets added and then removed before the map is ready
			if (!map.hasLayer(this)) { return; }
	
			this._map = map;
			this._zoomAnimated = map._zoomAnimated;
	
			if (this.getEvents) {
				var events = this.getEvents();
				map.on(events, this);
				this.once('remove', function () {
					map.off(events, this);
				}, this);
			}
	
			this.onAdd(map);
	
			if (this.getAttribution && this._map.attributionControl) {
				this._map.attributionControl.addAttribution(this.getAttribution());
			}
	
			this.fire('add');
			map.fire('layeradd', {layer: this});
		}
	});
	
	/* @section Extension methods
	 * @uninheritable
	 *
	 * Every layer should extend from `L.Layer` and (re-)implement the following methods.
	 *
	 * @method onAdd(map: Map): this
	 * Should contain code that creates DOM elements for the layer, adds them to `map panes` where they should belong and puts listeners on relevant map events. Called on [`map.addLayer(layer)`](#map-addlayer).
	 *
	 * @method onRemove(map: Map): this
	 * Should contain all clean up code that removes the layer's elements from the DOM and removes listeners previously added in [`onAdd`](#layer-onadd). Called on [`map.removeLayer(layer)`](#map-removelayer).
	 *
	 * @method getEvents(): Object
	 * This optional method should return an object like `{ viewreset: this._reset }` for [`addEventListener`](#evented-addeventlistener). The event handlers in this object will be automatically added and removed from the map with your layer.
	 *
	 * @method getAttribution(): String
	 * This optional method should return a string containing HTML to be shown on the `Attribution control` whenever the layer is visible.
	 *
	 * @method beforeAdd(map: Map): this
	 * Optional method. Called on [`map.addLayer(layer)`](#map-addlayer), before the layer is added to the map, before events are initialized, without waiting until the map is in a usable state. Use for early initialization only.
	 */
	
	
	/* @namespace Map
	 * @section Layer events
	 *
	 * @event layeradd: LayerEvent
	 * Fired when a new layer is added to the map.
	 *
	 * @event layerremove: LayerEvent
	 * Fired when some layer is removed from the map
	 *
	 * @section Methods for Layers and Controls
	 */
	L.Map.include({
		// @method addLayer(layer: Layer): this
		// Adds the given layer to the map
		addLayer: function (layer) {
			var id = L.stamp(layer);
			if (this._layers[id]) { return this; }
			this._layers[id] = layer;
	
			layer._mapToAdd = this;
	
			if (layer.beforeAdd) {
				layer.beforeAdd(this);
			}
	
			this.whenReady(layer._layerAdd, layer);
	
			return this;
		},
	
		// @method removeLayer(layer: Layer): this
		// Removes the given layer from the map.
		removeLayer: function (layer) {
			var id = L.stamp(layer);
	
			if (!this._layers[id]) { return this; }
	
			if (this._loaded) {
				layer.onRemove(this);
			}
	
			if (layer.getAttribution && this.attributionControl) {
				this.attributionControl.removeAttribution(layer.getAttribution());
			}
	
			delete this._layers[id];
	
			if (this._loaded) {
				this.fire('layerremove', {layer: layer});
				layer.fire('remove');
			}
	
			layer._map = layer._mapToAdd = null;
	
			return this;
		},
	
		// @method hasLayer(layer: Layer): Boolean
		// Returns `true` if the given layer is currently added to the map
		hasLayer: function (layer) {
			return !!layer && (L.stamp(layer) in this._layers);
		},
	
		/* @method eachLayer(fn: Function, context?: Object): this
		 * Iterates over the layers of the map, optionally specifying context of the iterator function.
		 * ```
		 * map.eachLayer(function(layer){
		 *     layer.bindPopup('Hello');
		 * });
		 * ```
		 */
		eachLayer: function (method, context) {
			for (var i in this._layers) {
				method.call(context, this._layers[i]);
			}
			return this;
		},
	
		_addLayers: function (layers) {
			layers = layers ? (L.Util.isArray(layers) ? layers : [layers]) : [];
	
			for (var i = 0, len = layers.length; i < len; i++) {
				this.addLayer(layers[i]);
			}
		},
	
		_addZoomLimit: function (layer) {
			if (isNaN(layer.options.maxZoom) || !isNaN(layer.options.minZoom)) {
				this._zoomBoundLayers[L.stamp(layer)] = layer;
				this._updateZoomLevels();
			}
		},
	
		_removeZoomLimit: function (layer) {
			var id = L.stamp(layer);
	
			if (this._zoomBoundLayers[id]) {
				delete this._zoomBoundLayers[id];
				this._updateZoomLevels();
			}
		},
	
		_updateZoomLevels: function () {
			var minZoom = Infinity,
			    maxZoom = -Infinity,
			    oldZoomSpan = this._getZoomSpan();
	
			for (var i in this._zoomBoundLayers) {
				var options = this._zoomBoundLayers[i].options;
	
				minZoom = options.minZoom === undefined ? minZoom : Math.min(minZoom, options.minZoom);
				maxZoom = options.maxZoom === undefined ? maxZoom : Math.max(maxZoom, options.maxZoom);
			}
	
			this._layersMaxZoom = maxZoom === -Infinity ? undefined : maxZoom;
			this._layersMinZoom = minZoom === Infinity ? undefined : minZoom;
	
			// @section Map state change events
			// @event zoomlevelschange: Event
			// Fired when the number of zoomlevels on the map is changed due
			// to adding or removing a layer.
			if (oldZoomSpan !== this._getZoomSpan()) {
				this.fire('zoomlevelschange');
			}
		}
	});
	
	
	
	/*
	 * @namespace Projection
	 * @projection L.Projection.Mercator
	 *
	 * Elliptical Mercator projection — more complex than Spherical Mercator. Takes into account that Earth is a geoid, not a perfect sphere. Used by the EPSG:3395 CRS.
	 */
	
	L.Projection.Mercator = {
		R: 6378137,
		R_MINOR: 6356752.314245179,
	
		bounds: L.bounds([-20037508.34279, -15496570.73972], [20037508.34279, 18764656.23138]),
	
		project: function (latlng) {
			var d = Math.PI / 180,
			    r = this.R,
			    y = latlng.lat * d,
			    tmp = this.R_MINOR / r,
			    e = Math.sqrt(1 - tmp * tmp),
			    con = e * Math.sin(y);
	
			var ts = Math.tan(Math.PI / 4 - y / 2) / Math.pow((1 - con) / (1 + con), e / 2);
			y = -r * Math.log(Math.max(ts, 1E-10));
	
			return new L.Point(latlng.lng * d * r, y);
		},
	
		unproject: function (point) {
			var d = 180 / Math.PI,
			    r = this.R,
			    tmp = this.R_MINOR / r,
			    e = Math.sqrt(1 - tmp * tmp),
			    ts = Math.exp(-point.y / r),
			    phi = Math.PI / 2 - 2 * Math.atan(ts);
	
			for (var i = 0, dphi = 0.1, con; i < 15 && Math.abs(dphi) > 1e-7; i++) {
				con = e * Math.sin(phi);
				con = Math.pow((1 - con) / (1 + con), e / 2);
				dphi = Math.PI / 2 - 2 * Math.atan(ts * con) - phi;
				phi += dphi;
			}
	
			return new L.LatLng(phi * d, point.x * d / r);
		}
	};
	
	
	
	/*
	 * @namespace CRS
	 * @crs L.CRS.EPSG3395
	 *
	 * Rarely used by some commercial tile providers. Uses Elliptical Mercator projection.
	 */
	
	L.CRS.EPSG3395 = L.extend({}, L.CRS.Earth, {
		code: 'EPSG:3395',
		projection: L.Projection.Mercator,
	
		transformation: (function () {
			var scale = 0.5 / (Math.PI * L.Projection.Mercator.R);
			return new L.Transformation(scale, 0.5, -scale, 0.5);
		}())
	});
	
	
	
	/*
	 * @class GridLayer
	 * @inherits Layer
	 * @aka L.GridLayer
	 *
	 * Generic class for handling a tiled grid of HTML elements. This is the base class for all tile layers and replaces `TileLayer.Canvas`.
	 * GridLayer can be extended to create a tiled grid of HTML elements like `<canvas>`, `<img>` or `<div>`. GridLayer will handle creating and animating these DOM elements for you.
	 *
	 *
	 * @section Synchronous usage
	 * @example
	 *
	 * To create a custom layer, extend GridLayer and implement the `createTile()` method, which will be passed a `Point` object with the `x`, `y`, and `z` (zoom level) coordinates to draw your tile.
	 *
	 * ```js
	 * var CanvasLayer = L.GridLayer.extend({
	 *     createTile: function(coords){
	 *         // create a <canvas> element for drawing
	 *         var tile = L.DomUtil.create('canvas', 'leaflet-tile');
	 *
	 *         // setup tile width and height according to the options
	 *         var size = this.getTileSize();
	 *         tile.width = size.x;
	 *         tile.height = size.y;
	 *
	 *         // get a canvas context and draw something on it using coords.x, coords.y and coords.z
	 *         var ctx = tile.getContext('2d');
	 *
	 *         // return the tile so it can be rendered on screen
	 *         return tile;
	 *     }
	 * });
	 * ```
	 *
	 * @section Asynchronous usage
	 * @example
	 *
	 * Tile creation can also be asynchronous, this is useful when using a third-party drawing library. Once the tile is finished drawing it can be passed to the `done()` callback.
	 *
	 * ```js
	 * var CanvasLayer = L.GridLayer.extend({
	 *     createTile: function(coords, done){
	 *         var error;
	 *
	 *         // create a <canvas> element for drawing
	 *         var tile = L.DomUtil.create('canvas', 'leaflet-tile');
	 *
	 *         // setup tile width and height according to the options
	 *         var size = this.getTileSize();
	 *         tile.width = size.x;
	 *         tile.height = size.y;
	 *
	 *         // draw something asynchronously and pass the tile to the done() callback
	 *         setTimeout(function() {
	 *             done(error, tile);
	 *         }, 1000);
	 *
	 *         return tile;
	 *     }
	 * });
	 * ```
	 *
	 * @section
	 */
	
	
	L.GridLayer = L.Layer.extend({
	
		// @section
		// @aka GridLayer options
		options: {
			// @option tileSize: Number|Point = 256
			// Width and height of tiles in the grid. Use a number if width and height are equal, or `L.point(width, height)` otherwise.
			tileSize: 256,
	
			// @option opacity: Number = 1.0
			// Opacity of the tiles. Can be used in the `createTile()` function.
			opacity: 1,
	
			// @option updateWhenIdle: Boolean = depends
			// If `false`, new tiles are loaded during panning, otherwise only after it (for better performance). `true` by default on mobile browsers, otherwise `false`.
			updateWhenIdle: L.Browser.mobile,
	
			// @option updateWhenZooming: Boolean = true
			// By default, a smooth zoom animation (during a [touch zoom](#map-touchzoom) or a [`flyTo()`](#map-flyto)) will update grid layers every integer zoom level. Setting this option to `false` will update the grid layer only when the smooth animation ends.
			updateWhenZooming: true,
	
			// @option updateInterval: Number = 200
			// Tiles will not update more than once every `updateInterval` milliseconds when panning.
			updateInterval: 200,
	
			// @option attribution: String = null
			// String to be shown in the attribution control, describes the layer data, e.g. "© Mapbox".
			attribution: null,
	
			// @option zIndex: Number = 1
			// The explicit zIndex of the tile layer.
			zIndex: 1,
	
			// @option bounds: LatLngBounds = undefined
			// If set, tiles will only be loaded inside the set `LatLngBounds`.
			bounds: null,
	
			// @option minZoom: Number = 0
			// The minimum zoom level that tiles will be loaded at. By default the entire map.
			minZoom: 0,
	
			// @option maxZoom: Number = undefined
			// The maximum zoom level that tiles will be loaded at.
			maxZoom: undefined,
	
			// @option noWrap: Boolean = false
			// Whether the layer is wrapped around the antimeridian. If `true`, the
			// GridLayer will only be displayed once at low zoom levels. Has no
			// effect when the [map CRS](#map-crs) doesn't wrap around.
			noWrap: false,
	
			// @option pane: String = 'tilePane'
			// `Map pane` where the grid layer will be added.
			pane: 'tilePane',
	
			// @option className: String = ''
			// A custom class name to assign to the tile layer. Empty by default.
			className: '',
	
			// @option keepBuffer: Number = 2
			// When panning the map, keep this many rows and columns of tiles before unloading them.
			keepBuffer: 2
		},
	
		initialize: function (options) {
			L.setOptions(this, options);
		},
	
		onAdd: function () {
			this._initContainer();
	
			this._levels = {};
			this._tiles = {};
	
			this._resetView();
			this._update();
		},
	
		beforeAdd: function (map) {
			map._addZoomLimit(this);
		},
	
		onRemove: function (map) {
			this._removeAllTiles();
			L.DomUtil.remove(this._container);
			map._removeZoomLimit(this);
			this._container = null;
			this._tileZoom = null;
		},
	
		// @method bringToFront: this
		// Brings the tile layer to the top of all tile layers.
		bringToFront: function () {
			if (this._map) {
				L.DomUtil.toFront(this._container);
				this._setAutoZIndex(Math.max);
			}
			return this;
		},
	
		// @method bringToBack: this
		// Brings the tile layer to the bottom of all tile layers.
		bringToBack: function () {
			if (this._map) {
				L.DomUtil.toBack(this._container);
				this._setAutoZIndex(Math.min);
			}
			return this;
		},
	
		// @method getAttribution: String
		// Used by the `attribution control`, returns the [attribution option](#gridlayer-attribution).
		getAttribution: function () {
			return this.options.attribution;
		},
	
		// @method getContainer: HTMLElement
		// Returns the HTML element that contains the tiles for this layer.
		getContainer: function () {
			return this._container;
		},
	
		// @method setOpacity(opacity: Number): this
		// Changes the [opacity](#gridlayer-opacity) of the grid layer.
		setOpacity: function (opacity) {
			this.options.opacity = opacity;
			this._updateOpacity();
			return this;
		},
	
		// @method setZIndex(zIndex: Number): this
		// Changes the [zIndex](#gridlayer-zindex) of the grid layer.
		setZIndex: function (zIndex) {
			this.options.zIndex = zIndex;
			this._updateZIndex();
	
			return this;
		},
	
		// @method isLoading: Boolean
		// Returns `true` if any tile in the grid layer has not finished loading.
		isLoading: function () {
			return this._loading;
		},
	
		// @method redraw: this
		// Causes the layer to clear all the tiles and request them again.
		redraw: function () {
			if (this._map) {
				this._removeAllTiles();
				this._update();
			}
			return this;
		},
	
		getEvents: function () {
			var events = {
				viewprereset: this._invalidateAll,
				viewreset: this._resetView,
				zoom: this._resetView,
				moveend: this._onMoveEnd
			};
	
			if (!this.options.updateWhenIdle) {
				// update tiles on move, but not more often than once per given interval
				if (!this._onMove) {
					this._onMove = L.Util.throttle(this._onMoveEnd, this.options.updateInterval, this);
				}
	
				events.move = this._onMove;
			}
	
			if (this._zoomAnimated) {
				events.zoomanim = this._animateZoom;
			}
	
			return events;
		},
	
		// @section Extension methods
		// Layers extending `GridLayer` shall reimplement the following method.
		// @method createTile(coords: Object, done?: Function): HTMLElement
		// Called only internally, must be overriden by classes extending `GridLayer`.
		// Returns the `HTMLElement` corresponding to the given `coords`. If the `done` callback
		// is specified, it must be called when the tile has finished loading and drawing.
		createTile: function () {
			return document.createElement('div');
		},
	
		// @section
		// @method getTileSize: Point
		// Normalizes the [tileSize option](#gridlayer-tilesize) into a point. Used by the `createTile()` method.
		getTileSize: function () {
			var s = this.options.tileSize;
			return s instanceof L.Point ? s : new L.Point(s, s);
		},
	
		_updateZIndex: function () {
			if (this._container && this.options.zIndex !== undefined && this.options.zIndex !== null) {
				this._container.style.zIndex = this.options.zIndex;
			}
		},
	
		_setAutoZIndex: function (compare) {
			// go through all other layers of the same pane, set zIndex to max + 1 (front) or min - 1 (back)
	
			var layers = this.getPane().children,
			    edgeZIndex = -compare(-Infinity, Infinity); // -Infinity for max, Infinity for min
	
			for (var i = 0, len = layers.length, zIndex; i < len; i++) {
	
				zIndex = layers[i].style.zIndex;
	
				if (layers[i] !== this._container && zIndex) {
					edgeZIndex = compare(edgeZIndex, +zIndex);
				}
			}
	
			if (isFinite(edgeZIndex)) {
				this.options.zIndex = edgeZIndex + compare(-1, 1);
				this._updateZIndex();
			}
		},
	
		_updateOpacity: function () {
			if (!this._map) { return; }
	
			// IE doesn't inherit filter opacity properly, so we're forced to set it on tiles
			if (L.Browser.ielt9) { return; }
	
			L.DomUtil.setOpacity(this._container, this.options.opacity);
	
			var now = +new Date(),
			    nextFrame = false,
			    willPrune = false;
	
			for (var key in this._tiles) {
				var tile = this._tiles[key];
				if (!tile.current || !tile.loaded) { continue; }
	
				var fade = Math.min(1, (now - tile.loaded) / 200);
	
				L.DomUtil.setOpacity(tile.el, fade);
				if (fade < 1) {
					nextFrame = true;
				} else {
					if (tile.active) { willPrune = true; }
					tile.active = true;
				}
			}
	
			if (willPrune && !this._noPrune) { this._pruneTiles(); }
	
			if (nextFrame) {
				L.Util.cancelAnimFrame(this._fadeFrame);
				this._fadeFrame = L.Util.requestAnimFrame(this._updateOpacity, this);
			}
		},
	
		_initContainer: function () {
			if (this._container) { return; }
	
			this._container = L.DomUtil.create('div', 'leaflet-layer ' + (this.options.className || ''));
			this._updateZIndex();
	
			if (this.options.opacity < 1) {
				this._updateOpacity();
			}
	
			this.getPane().appendChild(this._container);
		},
	
		_updateLevels: function () {
	
			var zoom = this._tileZoom,
			    maxZoom = this.options.maxZoom;
	
			if (zoom === undefined) { return undefined; }
	
			for (var z in this._levels) {
				if (this._levels[z].el.children.length || z === zoom) {
					this._levels[z].el.style.zIndex = maxZoom - Math.abs(zoom - z);
				} else {
					L.DomUtil.remove(this._levels[z].el);
					this._removeTilesAtZoom(z);
					delete this._levels[z];
				}
			}
	
			var level = this._levels[zoom],
			    map = this._map;
	
			if (!level) {
				level = this._levels[zoom] = {};
	
				level.el = L.DomUtil.create('div', 'leaflet-tile-container leaflet-zoom-animated', this._container);
				level.el.style.zIndex = maxZoom;
	
				level.origin = map.project(map.unproject(map.getPixelOrigin()), zoom).round();
				level.zoom = zoom;
	
				this._setZoomTransform(level, map.getCenter(), map.getZoom());
	
				// force the browser to consider the newly added element for transition
				L.Util.falseFn(level.el.offsetWidth);
			}
	
			this._level = level;
	
			return level;
		},
	
		_pruneTiles: function () {
			if (!this._map) {
				return;
			}
	
			var key, tile;
	
			var zoom = this._map.getZoom();
			if (zoom > this.options.maxZoom ||
				zoom < this.options.minZoom) {
				this._removeAllTiles();
				return;
			}
	
			for (key in this._tiles) {
				tile = this._tiles[key];
				tile.retain = tile.current;
			}
	
			for (key in this._tiles) {
				tile = this._tiles[key];
				if (tile.current && !tile.active) {
					var coords = tile.coords;
					if (!this._retainParent(coords.x, coords.y, coords.z, coords.z - 5)) {
						this._retainChildren(coords.x, coords.y, coords.z, coords.z + 2);
					}
				}
			}
	
			for (key in this._tiles) {
				if (!this._tiles[key].retain) {
					this._removeTile(key);
				}
			}
		},
	
		_removeTilesAtZoom: function (zoom) {
			for (var key in this._tiles) {
				if (this._tiles[key].coords.z !== zoom) {
					continue;
				}
				this._removeTile(key);
			}
		},
	
		_removeAllTiles: function () {
			for (var key in this._tiles) {
				this._removeTile(key);
			}
		},
	
		_invalidateAll: function () {
			for (var z in this._levels) {
				L.DomUtil.remove(this._levels[z].el);
				delete this._levels[z];
			}
			this._removeAllTiles();
	
			this._tileZoom = null;
		},
	
		_retainParent: function (x, y, z, minZoom) {
			var x2 = Math.floor(x / 2),
			    y2 = Math.floor(y / 2),
			    z2 = z - 1,
			    coords2 = new L.Point(+x2, +y2);
			coords2.z = +z2;
	
			var key = this._tileCoordsToKey(coords2),
			    tile = this._tiles[key];
	
			if (tile && tile.active) {
				tile.retain = true;
				return true;
	
			} else if (tile && tile.loaded) {
				tile.retain = true;
			}
	
			if (z2 > minZoom) {
				return this._retainParent(x2, y2, z2, minZoom);
			}
	
			return false;
		},
	
		_retainChildren: function (x, y, z, maxZoom) {
	
			for (var i = 2 * x; i < 2 * x + 2; i++) {
				for (var j = 2 * y; j < 2 * y + 2; j++) {
	
					var coords = new L.Point(i, j);
					coords.z = z + 1;
	
					var key = this._tileCoordsToKey(coords),
					    tile = this._tiles[key];
	
					if (tile && tile.active) {
						tile.retain = true;
						continue;
	
					} else if (tile && tile.loaded) {
						tile.retain = true;
					}
	
					if (z + 1 < maxZoom) {
						this._retainChildren(i, j, z + 1, maxZoom);
					}
				}
			}
		},
	
		_resetView: function (e) {
			var animating = e && (e.pinch || e.flyTo);
			this._setView(this._map.getCenter(), this._map.getZoom(), animating, animating);
		},
	
		_animateZoom: function (e) {
			this._setView(e.center, e.zoom, true, e.noUpdate);
		},
	
		_setView: function (center, zoom, noPrune, noUpdate) {
			var tileZoom = Math.round(zoom);
			if ((this.options.maxZoom !== undefined && tileZoom > this.options.maxZoom) ||
			    (this.options.minZoom !== undefined && tileZoom < this.options.minZoom)) {
				tileZoom = undefined;
			}
	
			var tileZoomChanged = this.options.updateWhenZooming && (tileZoom !== this._tileZoom);
	
			if (!noUpdate || tileZoomChanged) {
	
				this._tileZoom = tileZoom;
	
				if (this._abortLoading) {
					this._abortLoading();
				}
	
				this._updateLevels();
				this._resetGrid();
	
				if (tileZoom !== undefined) {
					this._update(center);
				}
	
				if (!noPrune) {
					this._pruneTiles();
				}
	
				// Flag to prevent _updateOpacity from pruning tiles during
				// a zoom anim or a pinch gesture
				this._noPrune = !!noPrune;
			}
	
			this._setZoomTransforms(center, zoom);
		},
	
		_setZoomTransforms: function (center, zoom) {
			for (var i in this._levels) {
				this._setZoomTransform(this._levels[i], center, zoom);
			}
		},
	
		_setZoomTransform: function (level, center, zoom) {
			var scale = this._map.getZoomScale(zoom, level.zoom),
			    translate = level.origin.multiplyBy(scale)
			        .subtract(this._map._getNewPixelOrigin(center, zoom)).round();
	
			if (L.Browser.any3d) {
				L.DomUtil.setTransform(level.el, translate, scale);
			} else {
				L.DomUtil.setPosition(level.el, translate);
			}
		},
	
		_resetGrid: function () {
			var map = this._map,
			    crs = map.options.crs,
			    tileSize = this._tileSize = this.getTileSize(),
			    tileZoom = this._tileZoom;
	
			var bounds = this._map.getPixelWorldBounds(this._tileZoom);
			if (bounds) {
				this._globalTileRange = this._pxBoundsToTileRange(bounds);
			}
	
			this._wrapX = crs.wrapLng && !this.options.noWrap && [
				Math.floor(map.project([0, crs.wrapLng[0]], tileZoom).x / tileSize.x),
				Math.ceil(map.project([0, crs.wrapLng[1]], tileZoom).x / tileSize.y)
			];
			this._wrapY = crs.wrapLat && !this.options.noWrap && [
				Math.floor(map.project([crs.wrapLat[0], 0], tileZoom).y / tileSize.x),
				Math.ceil(map.project([crs.wrapLat[1], 0], tileZoom).y / tileSize.y)
			];
		},
	
		_onMoveEnd: function () {
			if (!this._map || this._map._animatingZoom) { return; }
	
			this._update();
		},
	
		_getTiledPixelBounds: function (center) {
			var map = this._map,
			    mapZoom = map._animatingZoom ? Math.max(map._animateToZoom, map.getZoom()) : map.getZoom(),
			    scale = map.getZoomScale(mapZoom, this._tileZoom),
			    pixelCenter = map.project(center, this._tileZoom).floor(),
			    halfSize = map.getSize().divideBy(scale * 2);
	
			return new L.Bounds(pixelCenter.subtract(halfSize), pixelCenter.add(halfSize));
		},
	
		// Private method to load tiles in the grid's active zoom level according to map bounds
		_update: function (center) {
			var map = this._map;
			if (!map) { return; }
			var zoom = map.getZoom();
	
			if (center === undefined) { center = map.getCenter(); }
			if (this._tileZoom === undefined) { return; }	// if out of minzoom/maxzoom
	
			var pixelBounds = this._getTiledPixelBounds(center),
			    tileRange = this._pxBoundsToTileRange(pixelBounds),
			    tileCenter = tileRange.getCenter(),
			    queue = [],
			    margin = this.options.keepBuffer,
			    noPruneRange = new L.Bounds(tileRange.getBottomLeft().subtract([margin, -margin]),
			                              tileRange.getTopRight().add([margin, -margin]));
	
			for (var key in this._tiles) {
				var c = this._tiles[key].coords;
				if (c.z !== this._tileZoom || !noPruneRange.contains(L.point(c.x, c.y))) {
					this._tiles[key].current = false;
				}
			}
	
			// _update just loads more tiles. If the tile zoom level differs too much
			// from the map's, let _setView reset levels and prune old tiles.
			if (Math.abs(zoom - this._tileZoom) > 1) { this._setView(center, zoom); return; }
	
			// create a queue of coordinates to load tiles from
			for (var j = tileRange.min.y; j <= tileRange.max.y; j++) {
				for (var i = tileRange.min.x; i <= tileRange.max.x; i++) {
					var coords = new L.Point(i, j);
					coords.z = this._tileZoom;
	
					if (!this._isValidTile(coords)) { continue; }
	
					var tile = this._tiles[this._tileCoordsToKey(coords)];
					if (tile) {
						tile.current = true;
					} else {
						queue.push(coords);
					}
				}
			}
	
			// sort tile queue to load tiles in order of their distance to center
			queue.sort(function (a, b) {
				return a.distanceTo(tileCenter) - b.distanceTo(tileCenter);
			});
	
			if (queue.length !== 0) {
				// if it's the first batch of tiles to load
				if (!this._loading) {
					this._loading = true;
					// @event loading: Event
					// Fired when the grid layer starts loading tiles.
					this.fire('loading');
				}
	
				// create DOM fragment to append tiles in one batch
				var fragment = document.createDocumentFragment();
	
				for (i = 0; i < queue.length; i++) {
					this._addTile(queue[i], fragment);
				}
	
				this._level.el.appendChild(fragment);
			}
		},
	
		_isValidTile: function (coords) {
			var crs = this._map.options.crs;
	
			if (!crs.infinite) {
				// don't load tile if it's out of bounds and not wrapped
				var bounds = this._globalTileRange;
				if ((!crs.wrapLng && (coords.x < bounds.min.x || coords.x > bounds.max.x)) ||
				    (!crs.wrapLat && (coords.y < bounds.min.y || coords.y > bounds.max.y))) { return false; }
			}
	
			if (!this.options.bounds) { return true; }
	
			// don't load tile if it doesn't intersect the bounds in options
			var tileBounds = this._tileCoordsToBounds(coords);
			return L.latLngBounds(this.options.bounds).overlaps(tileBounds);
		},
	
		_keyToBounds: function (key) {
			return this._tileCoordsToBounds(this._keyToTileCoords(key));
		},
	
		// converts tile coordinates to its geographical bounds
		_tileCoordsToBounds: function (coords) {
	
			var map = this._map,
			    tileSize = this.getTileSize(),
	
			    nwPoint = coords.scaleBy(tileSize),
			    sePoint = nwPoint.add(tileSize),
	
			    nw = map.unproject(nwPoint, coords.z),
			    se = map.unproject(sePoint, coords.z);
	
			if (!this.options.noWrap) {
				nw = map.wrapLatLng(nw);
				se = map.wrapLatLng(se);
			}
	
			return new L.LatLngBounds(nw, se);
		},
	
		// converts tile coordinates to key for the tile cache
		_tileCoordsToKey: function (coords) {
			return coords.x + ':' + coords.y + ':' + coords.z;
		},
	
		// converts tile cache key to coordinates
		_keyToTileCoords: function (key) {
			var k = key.split(':'),
			    coords = new L.Point(+k[0], +k[1]);
			coords.z = +k[2];
			return coords;
		},
	
		_removeTile: function (key) {
			var tile = this._tiles[key];
			if (!tile) { return; }
	
			L.DomUtil.remove(tile.el);
	
			delete this._tiles[key];
	
			// @event tileunload: TileEvent
			// Fired when a tile is removed (e.g. when a tile goes off the screen).
			this.fire('tileunload', {
				tile: tile.el,
				coords: this._keyToTileCoords(key)
			});
		},
	
		_initTile: function (tile) {
			L.DomUtil.addClass(tile, 'leaflet-tile');
	
			var tileSize = this.getTileSize();
			tile.style.width = tileSize.x + 'px';
			tile.style.height = tileSize.y + 'px';
	
			tile.onselectstart = L.Util.falseFn;
			tile.onmousemove = L.Util.falseFn;
	
			// update opacity on tiles in IE7-8 because of filter inheritance problems
			if (L.Browser.ielt9 && this.options.opacity < 1) {
				L.DomUtil.setOpacity(tile, this.options.opacity);
			}
	
			// without this hack, tiles disappear after zoom on Chrome for Android
			// https://github.com/Leaflet/Leaflet/issues/2078
			if (L.Browser.android && !L.Browser.android23) {
				tile.style.WebkitBackfaceVisibility = 'hidden';
			}
		},
	
		_addTile: function (coords, container) {
			var tilePos = this._getTilePos(coords),
			    key = this._tileCoordsToKey(coords);
	
			var tile = this.createTile(this._wrapCoords(coords), L.bind(this._tileReady, this, coords));
	
			this._initTile(tile);
	
			// if createTile is defined with a second argument ("done" callback),
			// we know that tile is async and will be ready later; otherwise
			if (this.createTile.length < 2) {
				// mark tile as ready, but delay one frame for opacity animation to happen
				L.Util.requestAnimFrame(L.bind(this._tileReady, this, coords, null, tile));
			}
	
			L.DomUtil.setPosition(tile, tilePos);
	
			// save tile in cache
			this._tiles[key] = {
				el: tile,
				coords: coords,
				current: true
			};
	
			container.appendChild(tile);
			// @event tileloadstart: TileEvent
			// Fired when a tile is requested and starts loading.
			this.fire('tileloadstart', {
				tile: tile,
				coords: coords
			});
		},
	
		_tileReady: function (coords, err, tile) {
			if (!this._map) { return; }
	
			if (err) {
				// @event tileerror: TileErrorEvent
				// Fired when there is an error loading a tile.
				this.fire('tileerror', {
					error: err,
					tile: tile,
					coords: coords
				});
			}
	
			var key = this._tileCoordsToKey(coords);
	
			tile = this._tiles[key];
			if (!tile) { return; }
	
			tile.loaded = +new Date();
			if (this._map._fadeAnimated) {
				L.DomUtil.setOpacity(tile.el, 0);
				L.Util.cancelAnimFrame(this._fadeFrame);
				this._fadeFrame = L.Util.requestAnimFrame(this._updateOpacity, this);
			} else {
				tile.active = true;
				this._pruneTiles();
			}
	
			if (!err) {
				L.DomUtil.addClass(tile.el, 'leaflet-tile-loaded');
	
				// @event tileload: TileEvent
				// Fired when a tile loads.
				this.fire('tileload', {
					tile: tile.el,
					coords: coords
				});
			}
	
			if (this._noTilesToLoad()) {
				this._loading = false;
				// @event load: Event
				// Fired when the grid layer loaded all visible tiles.
				this.fire('load');
	
				if (L.Browser.ielt9 || !this._map._fadeAnimated) {
					L.Util.requestAnimFrame(this._pruneTiles, this);
				} else {
					// Wait a bit more than 0.2 secs (the duration of the tile fade-in)
					// to trigger a pruning.
					setTimeout(L.bind(this._pruneTiles, this), 250);
				}
			}
		},
	
		_getTilePos: function (coords) {
			return coords.scaleBy(this.getTileSize()).subtract(this._level.origin);
		},
	
		_wrapCoords: function (coords) {
			var newCoords = new L.Point(
				this._wrapX ? L.Util.wrapNum(coords.x, this._wrapX) : coords.x,
				this._wrapY ? L.Util.wrapNum(coords.y, this._wrapY) : coords.y);
			newCoords.z = coords.z;
			return newCoords;
		},
	
		_pxBoundsToTileRange: function (bounds) {
			var tileSize = this.getTileSize();
			return new L.Bounds(
				bounds.min.unscaleBy(tileSize).floor(),
				bounds.max.unscaleBy(tileSize).ceil().subtract([1, 1]));
		},
	
		_noTilesToLoad: function () {
			for (var key in this._tiles) {
				if (!this._tiles[key].loaded) { return false; }
			}
			return true;
		}
	});
	
	// @factory L.gridLayer(options?: GridLayer options)
	// Creates a new instance of GridLayer with the supplied options.
	L.gridLayer = function (options) {
		return new L.GridLayer(options);
	};
	
	
	
	/*
	 * @class TileLayer
	 * @inherits GridLayer
	 * @aka L.TileLayer
	 * Used to load and display tile layers on the map. Extends `GridLayer`.
	 *
	 * @example
	 *
	 * ```js
	 * L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png?{foo}', {foo: 'bar'}).addTo(map);
	 * ```
	 *
	 * @section URL template
	 * @example
	 *
	 * A string of the following form:
	 *
	 * ```
	 * 'http://{s}.somedomain.com/blabla/{z}/{x}/{y}{r}.png'
	 * ```
	 *
	 * `{s}` means one of the available subdomains (used sequentially to help with browser parallel requests per domain limitation; subdomain values are specified in options; `a`, `b` or `c` by default, can be omitted), `{z}` — zoom level, `{x}` and `{y}` — tile coordinates. `{r}` can be used to add @2x to the URL to load retina tiles.
	 *
	 * You can use custom keys in the template, which will be [evaluated](#util-template) from TileLayer options, like this:
	 *
	 * ```
	 * L.tileLayer('http://{s}.somedomain.com/{foo}/{z}/{x}/{y}.png', {foo: 'bar'});
	 * ```
	 */
	
	
	L.TileLayer = L.GridLayer.extend({
	
		// @section
		// @aka TileLayer options
		options: {
			// @option minZoom: Number = 0
			// Minimum zoom number.
			minZoom: 0,
	
			// @option maxZoom: Number = 18
			// Maximum zoom number.
			maxZoom: 18,
	
			// @option maxNativeZoom: Number = null
			// Maximum zoom number the tile source has available. If it is specified,
			// the tiles on all zoom levels higher than `maxNativeZoom` will be loaded
			// from `maxNativeZoom` level and auto-scaled.
			maxNativeZoom: null,
	
			// @option subdomains: String|String[] = 'abc'
			// Subdomains of the tile service. Can be passed in the form of one string (where each letter is a subdomain name) or an array of strings.
			subdomains: 'abc',
	
			// @option errorTileUrl: String = ''
			// URL to the tile image to show in place of the tile that failed to load.
			errorTileUrl: '',
	
			// @option zoomOffset: Number = 0
			// The zoom number used in tile URLs will be offset with this value.
			zoomOffset: 0,
	
			// @option tms: Boolean = false
			// If `true`, inverses Y axis numbering for tiles (turn this on for [TMS](https://en.wikipedia.org/wiki/Tile_Map_Service) services).
			tms: false,
	
			// @option zoomReverse: Boolean = false
			// If set to true, the zoom number used in tile URLs will be reversed (`maxZoom - zoom` instead of `zoom`)
			zoomReverse: false,
	
			// @option detectRetina: Boolean = false
			// If `true` and user is on a retina display, it will request four tiles of half the specified size and a bigger zoom level in place of one to utilize the high resolution.
			detectRetina: false,
	
			// @option crossOrigin: Boolean = false
			// If true, all tiles will have their crossOrigin attribute set to ''. This is needed if you want to access tile pixel data.
			crossOrigin: false
		},
	
		initialize: function (url, options) {
	
			this._url = url;
	
			options = L.setOptions(this, options);
	
			// detecting retina displays, adjusting tileSize and zoom levels
			if (options.detectRetina && L.Browser.retina && options.maxZoom > 0) {
	
				options.tileSize = Math.floor(options.tileSize / 2);
	
				if (!options.zoomReverse) {
					options.zoomOffset++;
					options.maxZoom--;
				} else {
					options.zoomOffset--;
					options.minZoom++;
				}
	
				options.minZoom = Math.max(0, options.minZoom);
			}
	
			if (typeof options.subdomains === 'string') {
				options.subdomains = options.subdomains.split('');
			}
	
			// for https://github.com/Leaflet/Leaflet/issues/137
			if (!L.Browser.android) {
				this.on('tileunload', this._onTileRemove);
			}
		},
	
		// @method setUrl(url: String, noRedraw?: Boolean): this
		// Updates the layer's URL template and redraws it (unless `noRedraw` is set to `true`).
		setUrl: function (url, noRedraw) {
			this._url = url;
	
			if (!noRedraw) {
				this.redraw();
			}
			return this;
		},
	
		// @method createTile(coords: Object, done?: Function): HTMLElement
		// Called only internally, overrides GridLayer's [`createTile()`](#gridlayer-createtile)
		// to return an `<img>` HTML element with the appropiate image URL given `coords`. The `done`
		// callback is called when the tile has been loaded.
		createTile: function (coords, done) {
			var tile = document.createElement('img');
	
			L.DomEvent.on(tile, 'load', L.bind(this._tileOnLoad, this, done, tile));
			L.DomEvent.on(tile, 'error', L.bind(this._tileOnError, this, done, tile));
	
			if (this.options.crossOrigin) {
				tile.crossOrigin = '';
			}
	
			/*
			 Alt tag is set to empty string to keep screen readers from reading URL and for compliance reasons
			 http://www.w3.org/TR/WCAG20-TECHS/H67
			*/
			tile.alt = '';
	
			tile.src = this.getTileUrl(coords);
	
			return tile;
		},
	
		// @section Extension methods
		// @uninheritable
		// Layers extending `TileLayer` might reimplement the following method.
		// @method getTileUrl(coords: Object): String
		// Called only internally, returns the URL for a tile given its coordinates.
		// Classes extending `TileLayer` can override this function to provide custom tile URL naming schemes.
		getTileUrl: function (coords) {
			var data = {
				r: L.Browser.retina ? '@2x' : '',
				s: this._getSubdomain(coords),
				x: coords.x,
				y: coords.y,
				z: this._getZoomForUrl()
			};
			if (this._map && !this._map.options.crs.infinite) {
				var invertedY = this._globalTileRange.max.y - coords.y;
				if (this.options.tms) {
					data['y'] = invertedY;
				}
				data['-y'] = invertedY;
			}
	
			return L.Util.template(this._url, L.extend(data, this.options));
		},
	
		_tileOnLoad: function (done, tile) {
			// For https://github.com/Leaflet/Leaflet/issues/3332
			if (L.Browser.ielt9) {
				setTimeout(L.bind(done, this, null, tile), 0);
			} else {
				done(null, tile);
			}
		},
	
		_tileOnError: function (done, tile, e) {
			var errorUrl = this.options.errorTileUrl;
			if (errorUrl) {
				tile.src = errorUrl;
			}
			done(e, tile);
		},
	
		getTileSize: function () {
			var map = this._map,
			    tileSize = L.GridLayer.prototype.getTileSize.call(this),
			    zoom = this._tileZoom + this.options.zoomOffset,
			    zoomN = this.options.maxNativeZoom;
	
			// increase tile size when overscaling
			return zoomN !== null && zoom > zoomN ?
					tileSize.divideBy(map.getZoomScale(zoomN, zoom)).round() :
					tileSize;
		},
	
		_onTileRemove: function (e) {
			e.tile.onload = null;
		},
	
		_getZoomForUrl: function () {
	
			var options = this.options,
			    zoom = this._tileZoom;
	
			if (options.zoomReverse) {
				zoom = options.maxZoom - zoom;
			}
	
			zoom += options.zoomOffset;
	
			return options.maxNativeZoom !== null ? Math.min(zoom, options.maxNativeZoom) : zoom;
		},
	
		_getSubdomain: function (tilePoint) {
			var index = Math.abs(tilePoint.x + tilePoint.y) % this.options.subdomains.length;
			return this.options.subdomains[index];
		},
	
		// stops loading all tiles in the background layer
		_abortLoading: function () {
			var i, tile;
			for (i in this._tiles) {
				if (this._tiles[i].coords.z !== this._tileZoom) {
					tile = this._tiles[i].el;
	
					tile.onload = L.Util.falseFn;
					tile.onerror = L.Util.falseFn;
	
					if (!tile.complete) {
						tile.src = L.Util.emptyImageUrl;
						L.DomUtil.remove(tile);
					}
				}
			}
		}
	});
	
	
	// @factory L.tilelayer(urlTemplate: String, options?: TileLayer options)
	// Instantiates a tile layer object given a `URL template` and optionally an options object.
	
	L.tileLayer = function (url, options) {
		return new L.TileLayer(url, options);
	};
	
	
	
	/*
	 * @class TileLayer.WMS
	 * @inherits TileLayer
	 * @aka L.TileLayer.WMS
	 * Used to display [WMS](https://en.wikipedia.org/wiki/Web_Map_Service) services as tile layers on the map. Extends `TileLayer`.
	 *
	 * @example
	 *
	 * ```js
	 * var nexrad = L.tileLayer.wms("http://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi", {
	 * 	layers: 'nexrad-n0r-900913',
	 * 	format: 'image/png',
	 * 	transparent: true,
	 * 	attribution: "Weather data © 2012 IEM Nexrad"
	 * });
	 * ```
	 */
	
	L.TileLayer.WMS = L.TileLayer.extend({
	
		// @section
		// @aka TileLayer.WMS options
		// If any custom options not documented here are used, they will be sent to the
		// WMS server as extra parameters in each request URL. This can be useful for
		// [non-standard vendor WMS parameters](http://docs.geoserver.org/stable/en/user/services/wms/vendor.html).
		defaultWmsParams: {
			service: 'WMS',
			request: 'GetMap',
	
			// @option layers: String = ''
			// **(required)** Comma-separated list of WMS layers to show.
			layers: '',
	
			// @option styles: String = ''
			// Comma-separated list of WMS styles.
			styles: '',
	
			// @option format: String = 'image/jpeg'
			// WMS image format (use `'image/png'` for layers with transparency).
			format: 'image/jpeg',
	
			// @option transparent: Boolean = false
			// If `true`, the WMS service will return images with transparency.
			transparent: false,
	
			// @option version: String = '1.1.1'
			// Version of the WMS service to use
			version: '1.1.1'
		},
	
		options: {
			// @option crs: CRS = null
			// Coordinate Reference System to use for the WMS requests, defaults to
			// map CRS. Don't change this if you're not sure what it means.
			crs: null,
	
			// @option uppercase: Boolean = false
			// If `true`, WMS request parameter keys will be uppercase.
			uppercase: false
		},
	
		initialize: function (url, options) {
	
			this._url = url;
	
			var wmsParams = L.extend({}, this.defaultWmsParams);
	
			// all keys that are not TileLayer options go to WMS params
			for (var i in options) {
				if (!(i in this.options)) {
					wmsParams[i] = options[i];
				}
			}
	
			options = L.setOptions(this, options);
	
			wmsParams.width = wmsParams.height = options.tileSize * (options.detectRetina && L.Browser.retina ? 2 : 1);
	
			this.wmsParams = wmsParams;
		},
	
		onAdd: function (map) {
	
			this._crs = this.options.crs || map.options.crs;
			this._wmsVersion = parseFloat(this.wmsParams.version);
	
			var projectionKey = this._wmsVersion >= 1.3 ? 'crs' : 'srs';
			this.wmsParams[projectionKey] = this._crs.code;
	
			L.TileLayer.prototype.onAdd.call(this, map);
		},
	
		getTileUrl: function (coords) {
	
			var tileBounds = this._tileCoordsToBounds(coords),
			    nw = this._crs.project(tileBounds.getNorthWest()),
			    se = this._crs.project(tileBounds.getSouthEast()),
	
			    bbox = (this._wmsVersion >= 1.3 && this._crs === L.CRS.EPSG4326 ?
				    [se.y, nw.x, nw.y, se.x] :
				    [nw.x, se.y, se.x, nw.y]).join(','),
	
			    url = L.TileLayer.prototype.getTileUrl.call(this, coords);
	
			return url +
				L.Util.getParamString(this.wmsParams, url, this.options.uppercase) +
				(this.options.uppercase ? '&BBOX=' : '&bbox=') + bbox;
		},
	
		// @method setParams(params: Object, noRedraw?: Boolean): this
		// Merges an object with the new parameters and re-requests tiles on the current screen (unless `noRedraw` was set to true).
		setParams: function (params, noRedraw) {
	
			L.extend(this.wmsParams, params);
	
			if (!noRedraw) {
				this.redraw();
			}
	
			return this;
		}
	});
	
	
	// @factory L.tileLayer.wms(baseUrl: String, options: TileLayer.WMS options)
	// Instantiates a WMS tile layer object given a base URL of the WMS service and a WMS parameters/options object.
	L.tileLayer.wms = function (url, options) {
		return new L.TileLayer.WMS(url, options);
	};
	
	
	
	/*
	 * @class ImageOverlay
	 * @aka L.ImageOverlay
	 * @inherits Interactive layer
	 *
	 * Used to load and display a single image over specific bounds of the map. Extends `Layer`.
	 *
	 * @example
	 *
	 * ```js
	 * var imageUrl = 'http://www.lib.utexas.edu/maps/historical/newark_nj_1922.jpg',
	 * 	imageBounds = [[40.712216, -74.22655], [40.773941, -74.12544]];
	 * L.imageOverlay(imageUrl, imageBounds).addTo(map);
	 * ```
	 */
	
	L.ImageOverlay = L.Layer.extend({
	
		// @section
		// @aka ImageOverlay options
		options: {
			// @option opacity: Number = 1.0
			// The opacity of the image overlay.
			opacity: 1,
	
			// @option alt: String = ''
			// Text for the `alt` attribute of the image (useful for accessibility).
			alt: '',
	
			// @option interactive: Boolean = false
			// If `true`, the image overlay will emit [mouse events](#interactive-layer) when clicked or hovered.
			interactive: false,
	
			// @option attribution: String = null
			// An optional string containing HTML to be shown on the `Attribution control`
			attribution: null,
	
			// @option crossOrigin: Boolean = false
			// If true, the image will have its crossOrigin attribute set to ''. This is needed if you want to access image pixel data.
			crossOrigin: false
		},
	
		initialize: function (url, bounds, options) { // (String, LatLngBounds, Object)
			this._url = url;
			this._bounds = L.latLngBounds(bounds);
	
			L.setOptions(this, options);
		},
	
		onAdd: function () {
			if (!this._image) {
				this._initImage();
	
				if (this.options.opacity < 1) {
					this._updateOpacity();
				}
			}
	
			if (this.options.interactive) {
				L.DomUtil.addClass(this._image, 'leaflet-interactive');
				this.addInteractiveTarget(this._image);
			}
	
			this.getPane().appendChild(this._image);
			this._reset();
		},
	
		onRemove: function () {
			L.DomUtil.remove(this._image);
			if (this.options.interactive) {
				this.removeInteractiveTarget(this._image);
			}
		},
	
		// @method setOpacity(opacity: Number): this
		// Sets the opacity of the overlay.
		setOpacity: function (opacity) {
			this.options.opacity = opacity;
	
			if (this._image) {
				this._updateOpacity();
			}
			return this;
		},
	
		setStyle: function (styleOpts) {
			if (styleOpts.opacity) {
				this.setOpacity(styleOpts.opacity);
			}
			return this;
		},
	
		// @method bringToFront(): this
		// Brings the layer to the top of all overlays.
		bringToFront: function () {
			if (this._map) {
				L.DomUtil.toFront(this._image);
			}
			return this;
		},
	
		// @method bringToBack(): this
		// Brings the layer to the bottom of all overlays.
		bringToBack: function () {
			if (this._map) {
				L.DomUtil.toBack(this._image);
			}
			return this;
		},
	
		// @method setUrl(url: String): this
		// Changes the URL of the image.
		setUrl: function (url) {
			this._url = url;
	
			if (this._image) {
				this._image.src = url;
			}
			return this;
		},
	
		setBounds: function (bounds) {
			this._bounds = bounds;
	
			if (this._map) {
				this._reset();
			}
			return this;
		},
	
		getAttribution: function () {
			return this.options.attribution;
		},
	
		getEvents: function () {
			var events = {
				zoom: this._reset,
				viewreset: this._reset
			};
	
			if (this._zoomAnimated) {
				events.zoomanim = this._animateZoom;
			}
	
			return events;
		},
	
		getBounds: function () {
			return this._bounds;
		},
	
		getElement: function () {
			return this._image;
		},
	
		_initImage: function () {
			var img = this._image = L.DomUtil.create('img',
					'leaflet-image-layer ' + (this._zoomAnimated ? 'leaflet-zoom-animated' : ''));
	
			img.onselectstart = L.Util.falseFn;
			img.onmousemove = L.Util.falseFn;
	
			img.onload = L.bind(this.fire, this, 'load');
	
			if (this.options.crossOrigin) {
				img.crossOrigin = '';
			}
	
			img.src = this._url;
			img.alt = this.options.alt;
		},
	
		_animateZoom: function (e) {
			var scale = this._map.getZoomScale(e.zoom),
			    offset = this._map._latLngToNewLayerPoint(this._bounds.getNorthWest(), e.zoom, e.center);
	
			L.DomUtil.setTransform(this._image, offset, scale);
		},
	
		_reset: function () {
			var image = this._image,
			    bounds = new L.Bounds(
			        this._map.latLngToLayerPoint(this._bounds.getNorthWest()),
			        this._map.latLngToLayerPoint(this._bounds.getSouthEast())),
			    size = bounds.getSize();
	
			L.DomUtil.setPosition(image, bounds.min);
	
			image.style.width  = size.x + 'px';
			image.style.height = size.y + 'px';
		},
	
		_updateOpacity: function () {
			L.DomUtil.setOpacity(this._image, this.options.opacity);
		}
	});
	
	// @factory L.imageOverlay(imageUrl: String, bounds: LatLngBounds, options?: ImageOverlay options)
	// Instantiates an image overlay object given the URL of the image and the
	// geographical bounds it is tied to.
	L.imageOverlay = function (url, bounds, options) {
		return new L.ImageOverlay(url, bounds, options);
	};
	
	
	
	/*
	 * @class Icon
	 * @aka L.Icon
	 * @inherits Layer
	 *
	 * Represents an icon to provide when creating a marker.
	 *
	 * @example
	 *
	 * ```js
	 * var myIcon = L.icon({
	 *     iconUrl: 'my-icon.png',
	 *     iconRetinaUrl: 'my-icon@2x.png',
	 *     iconSize: [38, 95],
	 *     iconAnchor: [22, 94],
	 *     popupAnchor: [-3, -76],
	 *     shadowUrl: 'my-icon-shadow.png',
	 *     shadowRetinaUrl: 'my-icon-shadow@2x.png',
	 *     shadowSize: [68, 95],
	 *     shadowAnchor: [22, 94]
	 * });
	 *
	 * L.marker([50.505, 30.57], {icon: myIcon}).addTo(map);
	 * ```
	 *
	 * `L.Icon.Default` extends `L.Icon` and is the blue icon Leaflet uses for markers by default.
	 *
	 */
	
	L.Icon = L.Class.extend({
	
		/* @section
		 * @aka Icon options
		 *
		 * @option iconUrl: String = null
		 * **(required)** The URL to the icon image (absolute or relative to your script path).
		 *
		 * @option iconRetinaUrl: String = null
		 * The URL to a retina sized version of the icon image (absolute or relative to your
		 * script path). Used for Retina screen devices.
		 *
		 * @option iconSize: Point = null
		 * Size of the icon image in pixels.
		 *
		 * @option iconAnchor: Point = null
		 * The coordinates of the "tip" of the icon (relative to its top left corner). The icon
		 * will be aligned so that this point is at the marker's geographical location. Centered
		 * by default if size is specified, also can be set in CSS with negative margins.
		 *
		 * @option popupAnchor: Point = null
		 * The coordinates of the point from which popups will "open", relative to the icon anchor.
		 *
		 * @option shadowUrl: String = null
		 * The URL to the icon shadow image. If not specified, no shadow image will be created.
		 *
		 * @option shadowRetinaUrl: String = null
		 *
		 * @option shadowSize: Point = null
		 * Size of the shadow image in pixels.
		 *
		 * @option shadowAnchor: Point = null
		 * The coordinates of the "tip" of the shadow (relative to its top left corner) (the same
		 * as iconAnchor if not specified).
		 *
		 * @option className: String = ''
		 * A custom class name to assign to both icon and shadow images. Empty by default.
		 */
	
		initialize: function (options) {
			L.setOptions(this, options);
		},
	
		// @method createIcon(oldIcon?: HTMLElement): HTMLElement
		// Called internally when the icon has to be shown, returns a `<img>` HTML element
		// styled according to the options.
		createIcon: function (oldIcon) {
			return this._createIcon('icon', oldIcon);
		},
	
		// @method createShadow(oldIcon?: HTMLElement): HTMLElement
		// As `createIcon`, but for the shadow beneath it.
		createShadow: function (oldIcon) {
			return this._createIcon('shadow', oldIcon);
		},
	
		_createIcon: function (name, oldIcon) {
			var src = this._getIconUrl(name);
	
			if (!src) {
				if (name === 'icon') {
					throw new Error('iconUrl not set in Icon options (see the docs).');
				}
				return null;
			}
	
			var img = this._createImg(src, oldIcon && oldIcon.tagName === 'IMG' ? oldIcon : null);
			this._setIconStyles(img, name);
	
			return img;
		},
	
		_setIconStyles: function (img, name) {
			var options = this.options;
			var sizeOption = options[name + 'Size'];
	
			if (typeof sizeOption === 'number') {
				sizeOption = [sizeOption, sizeOption];
			}
	
			var size = L.point(sizeOption),
			    anchor = L.point(name === 'shadow' && options.shadowAnchor || options.iconAnchor ||
			            size && size.divideBy(2, true));
	
			img.className = 'leaflet-marker-' + name + ' ' + (options.className || '');
	
			if (anchor) {
				img.style.marginLeft = (-anchor.x) + 'px';
				img.style.marginTop  = (-anchor.y) + 'px';
			}
	
			if (size) {
				img.style.width  = size.x + 'px';
				img.style.height = size.y + 'px';
			}
		},
	
		_createImg: function (src, el) {
			el = el || document.createElement('img');
			el.src = src;
			return el;
		},
	
		_getIconUrl: function (name) {
			return L.Browser.retina && this.options[name + 'RetinaUrl'] || this.options[name + 'Url'];
		}
	});
	
	
	// @factory L.icon(options: Icon options)
	// Creates an icon instance with the given options.
	L.icon = function (options) {
		return new L.Icon(options);
	};
	
	
	
	/*
	 * @miniclass Icon.Default (Icon)
	 * @aka L.Icon.Default
	 * @section
	 *
	 * A trivial subclass of `Icon`, represents the icon to use in `Marker`s when
	 * no icon is specified. Points to the blue marker image distributed with Leaflet
	 * releases.
	 *
	 * In order to change the default icon, just change the properties of `L.Icon.Default.prototype.options`
	 * (which is a set of `Icon options`).
	 */
	
	L.Icon.Default = L.Icon.extend({
	
		options: {
			iconUrl:       'marker-icon.png',
			iconRetinaUrl: 'marker-icon-2x.png',
			shadowUrl:     'marker-shadow.png',
			iconSize:    [25, 41],
			iconAnchor:  [12, 41],
			popupAnchor: [1, -34],
			tooltipAnchor: [16, -28],
			shadowSize:  [41, 41]
		},
	
		_getIconUrl: function (name) {
			if (!L.Icon.Default.imagePath) {	// Deprecated, backwards-compatibility only
				L.Icon.Default.imagePath = this._detectIconPath();
			}
	
			// @option imagePath: String
			// `L.Icon.Default` will try to auto-detect the absolute location of the
			// blue icon images. If you are placing these images in a non-standard
			// way, set this option to point to the right absolute path.
			return (this.options.imagePath || L.Icon.Default.imagePath) + L.Icon.prototype._getIconUrl.call(this, name);
		},
	
		_detectIconPath: function () {
			var el = L.DomUtil.create('div',  'leaflet-default-icon-path', document.body);
			var path = L.DomUtil.getStyle(el, 'background-image') ||
			           L.DomUtil.getStyle(el, 'backgroundImage');	// IE8
	
			document.body.removeChild(el);
	
			return path.indexOf('url') === 0 ?
				path.replace(/^url\([\"\']?/, '').replace(/marker-icon\.png[\"\']?\)$/, '') : '';
		}
	});
	
	
	
	/*
	 * @class Marker
	 * @inherits Interactive layer
	 * @aka L.Marker
	 * L.Marker is used to display clickable/draggable icons on the map. Extends `Layer`.
	 *
	 * @example
	 *
	 * ```js
	 * L.marker([50.5, 30.5]).addTo(map);
	 * ```
	 */
	
	L.Marker = L.Layer.extend({
	
		// @section
		// @aka Marker options
		options: {
			// @option icon: Icon = *
			// Icon class to use for rendering the marker. See [Icon documentation](#L.Icon) for details on how to customize the marker icon. If not specified, a new `L.Icon.Default` is used.
			icon: new L.Icon.Default(),
	
			// Option inherited from "Interactive layer" abstract class
			interactive: true,
	
			// @option draggable: Boolean = false
			// Whether the marker is draggable with mouse/touch or not.
			draggable: false,
	
			// @option keyboard: Boolean = true
			// Whether the marker can be tabbed to with a keyboard and clicked by pressing enter.
			keyboard: true,
	
			// @option title: String = ''
			// Text for the browser tooltip that appear on marker hover (no tooltip by default).
			title: '',
	
			// @option alt: String = ''
			// Text for the `alt` attribute of the icon image (useful for accessibility).
			alt: '',
	
			// @option zIndexOffset: Number = 0
			// By default, marker images zIndex is set automatically based on its latitude. Use this option if you want to put the marker on top of all others (or below), specifying a high value like `1000` (or high negative value, respectively).
			zIndexOffset: 0,
	
			// @option opacity: Number = 1.0
			// The opacity of the marker.
			opacity: 1,
	
			// @option riseOnHover: Boolean = false
			// If `true`, the marker will get on top of others when you hover the mouse over it.
			riseOnHover: false,
	
			// @option riseOffset: Number = 250
			// The z-index offset used for the `riseOnHover` feature.
			riseOffset: 250,
	
			// @option pane: String = 'markerPane'
			// `Map pane` where the markers icon will be added.
			pane: 'markerPane',
	
			// FIXME: shadowPane is no longer a valid option
			nonBubblingEvents: ['click', 'dblclick', 'mouseover', 'mouseout', 'contextmenu']
		},
	
		/* @section
		 *
		 * In addition to [shared layer methods](#Layer) like `addTo()` and `remove()` and [popup methods](#Popup) like bindPopup() you can also use the following methods:
		 */
	
		initialize: function (latlng, options) {
			L.setOptions(this, options);
			this._latlng = L.latLng(latlng);
		},
	
		onAdd: function (map) {
			this._zoomAnimated = this._zoomAnimated && map.options.markerZoomAnimation;
	
			if (this._zoomAnimated) {
				map.on('zoomanim', this._animateZoom, this);
			}
	
			this._initIcon();
			this.update();
		},
	
		onRemove: function (map) {
			if (this.dragging && this.dragging.enabled()) {
				this.options.draggable = true;
				this.dragging.removeHooks();
			}
	
			if (this._zoomAnimated) {
				map.off('zoomanim', this._animateZoom, this);
			}
	
			this._removeIcon();
			this._removeShadow();
		},
	
		getEvents: function () {
			return {
				zoom: this.update,
				viewreset: this.update
			};
		},
	
		// @method getLatLng: LatLng
		// Returns the current geographical position of the marker.
		getLatLng: function () {
			return this._latlng;
		},
	
		// @method setLatLng(latlng: LatLng): this
		// Changes the marker position to the given point.
		setLatLng: function (latlng) {
			var oldLatLng = this._latlng;
			this._latlng = L.latLng(latlng);
			this.update();
	
			// @event move: Event
			// Fired when the marker is moved via [`setLatLng`](#marker-setlatlng) or by [dragging](#marker-dragging). Old and new coordinates are included in event arguments as `oldLatLng`, `latlng`.
			return this.fire('move', {oldLatLng: oldLatLng, latlng: this._latlng});
		},
	
		// @method setZIndexOffset(offset: Number): this
		// Changes the [zIndex offset](#marker-zindexoffset) of the marker.
		setZIndexOffset: function (offset) {
			this.options.zIndexOffset = offset;
			return this.update();
		},
	
		// @method setIcon(icon: Icon): this
		// Changes the marker icon.
		setIcon: function (icon) {
	
			this.options.icon = icon;
	
			if (this._map) {
				this._initIcon();
				this.update();
			}
	
			if (this._popup) {
				this.bindPopup(this._popup, this._popup.options);
			}
	
			return this;
		},
	
		getElement: function () {
			return this._icon;
		},
	
		update: function () {
	
			if (this._icon) {
				var pos = this._map.latLngToLayerPoint(this._latlng).round();
				this._setPos(pos);
			}
	
			return this;
		},
	
		_initIcon: function () {
			var options = this.options,
			    classToAdd = 'leaflet-zoom-' + (this._zoomAnimated ? 'animated' : 'hide');
	
			var icon = options.icon.createIcon(this._icon),
			    addIcon = false;
	
			// if we're not reusing the icon, remove the old one and init new one
			if (icon !== this._icon) {
				if (this._icon) {
					this._removeIcon();
				}
				addIcon = true;
	
				if (options.title) {
					icon.title = options.title;
				}
				if (options.alt) {
					icon.alt = options.alt;
				}
			}
	
			L.DomUtil.addClass(icon, classToAdd);
	
			if (options.keyboard) {
				icon.tabIndex = '0';
			}
	
			this._icon = icon;
	
			if (options.riseOnHover) {
				this.on({
					mouseover: this._bringToFront,
					mouseout: this._resetZIndex
				});
			}
	
			var newShadow = options.icon.createShadow(this._shadow),
			    addShadow = false;
	
			if (newShadow !== this._shadow) {
				this._removeShadow();
				addShadow = true;
			}
	
			if (newShadow) {
				L.DomUtil.addClass(newShadow, classToAdd);
			}
			this._shadow = newShadow;
	
	
			if (options.opacity < 1) {
				this._updateOpacity();
			}
	
	
			if (addIcon) {
				this.getPane().appendChild(this._icon);
			}
			this._initInteraction();
			if (newShadow && addShadow) {
				this.getPane('shadowPane').appendChild(this._shadow);
			}
		},
	
		_removeIcon: function () {
			if (this.options.riseOnHover) {
				this.off({
					mouseover: this._bringToFront,
					mouseout: this._resetZIndex
				});
			}
	
			L.DomUtil.remove(this._icon);
			this.removeInteractiveTarget(this._icon);
	
			this._icon = null;
		},
	
		_removeShadow: function () {
			if (this._shadow) {
				L.DomUtil.remove(this._shadow);
			}
			this._shadow = null;
		},
	
		_setPos: function (pos) {
			L.DomUtil.setPosition(this._icon, pos);
	
			if (this._shadow) {
				L.DomUtil.setPosition(this._shadow, pos);
			}
	
			this._zIndex = pos.y + this.options.zIndexOffset;
	
			this._resetZIndex();
		},
	
		_updateZIndex: function (offset) {
			this._icon.style.zIndex = this._zIndex + offset;
		},
	
		_animateZoom: function (opt) {
			var pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center).round();
	
			this._setPos(pos);
		},
	
		_initInteraction: function () {
	
			if (!this.options.interactive) { return; }
	
			L.DomUtil.addClass(this._icon, 'leaflet-interactive');
	
			this.addInteractiveTarget(this._icon);
	
			if (L.Handler.MarkerDrag) {
				var draggable = this.options.draggable;
				if (this.dragging) {
					draggable = this.dragging.enabled();
					this.dragging.disable();
				}
	
				this.dragging = new L.Handler.MarkerDrag(this);
	
				if (draggable) {
					this.dragging.enable();
				}
			}
		},
	
		// @method setOpacity(opacity: Number): this
		// Changes the opacity of the marker.
		setOpacity: function (opacity) {
			this.options.opacity = opacity;
			if (this._map) {
				this._updateOpacity();
			}
	
			return this;
		},
	
		_updateOpacity: function () {
			var opacity = this.options.opacity;
	
			L.DomUtil.setOpacity(this._icon, opacity);
	
			if (this._shadow) {
				L.DomUtil.setOpacity(this._shadow, opacity);
			}
		},
	
		_bringToFront: function () {
			this._updateZIndex(this.options.riseOffset);
		},
	
		_resetZIndex: function () {
			this._updateZIndex(0);
		}
	});
	
	
	// factory L.marker(latlng: LatLng, options? : Marker options)
	
	// @factory L.marker(latlng: LatLng, options? : Marker options)
	// Instantiates a Marker object given a geographical point and optionally an options object.
	L.marker = function (latlng, options) {
		return new L.Marker(latlng, options);
	};
	
	
	
	/*
	 * @class DivIcon
	 * @aka L.DivIcon
	 * @inherits Icon
	 *
	 * Represents a lightweight icon for markers that uses a simple `<div>`
	 * element instead of an image. Inherits from `Icon` but ignores the `iconUrl` and shadow options.
	 *
	 * @example
	 * ```js
	 * var myIcon = L.divIcon({className: 'my-div-icon'});
	 * // you can set .my-div-icon styles in CSS
	 *
	 * L.marker([50.505, 30.57], {icon: myIcon}).addTo(map);
	 * ```
	 *
	 * By default, it has a 'leaflet-div-icon' CSS class and is styled as a little white square with a shadow.
	 */
	
	L.DivIcon = L.Icon.extend({
		options: {
			// @section
			// @aka DivIcon options
			iconSize: [12, 12], // also can be set through CSS
	
			// iconAnchor: (Point),
			// popupAnchor: (Point),
	
			// @option html: String = ''
			// Custom HTML code to put inside the div element, empty by default.
			html: false,
	
			// @option bgPos: Point = [0, 0]
			// Optional relative position of the background, in pixels
			bgPos: null,
	
			className: 'leaflet-div-icon'
		},
	
		createIcon: function (oldIcon) {
			var div = (oldIcon && oldIcon.tagName === 'DIV') ? oldIcon : document.createElement('div'),
			    options = this.options;
	
			div.innerHTML = options.html !== false ? options.html : '';
	
			if (options.bgPos) {
				var bgPos = L.point(options.bgPos);
				div.style.backgroundPosition = (-bgPos.x) + 'px ' + (-bgPos.y) + 'px';
			}
			this._setIconStyles(div, 'icon');
	
			return div;
		},
	
		createShadow: function () {
			return null;
		}
	});
	
	// @factory L.divIcon(options: DivIcon options)
	// Creates a `DivIcon` instance with the given options.
	L.divIcon = function (options) {
		return new L.DivIcon(options);
	};
	
	
	
	/*
	 * @class DivOverlay
	 * @inherits Layer
	 * @aka L.DivOverlay
	 * Base model for L.Popup and L.Tooltip. Inherit from it for custom popup like plugins.
	 */
	
	// @namespace DivOverlay
	L.DivOverlay = L.Layer.extend({
	
		// @section
		// @aka DivOverlay options
		options: {
			// @option offset: Point = Point(0, 7)
			// The offset of the popup position. Useful to control the anchor
			// of the popup when opening it on some overlays.
			offset: [0, 7],
	
			// @option className: String = ''
			// A custom CSS class name to assign to the popup.
			className: '',
	
			// @option pane: String = 'popupPane'
			// `Map pane` where the popup will be added.
			pane: 'popupPane'
		},
	
		initialize: function (options, source) {
			L.setOptions(this, options);
	
			this._source = source;
		},
	
		onAdd: function (map) {
			this._zoomAnimated = map._zoomAnimated;
	
			if (!this._container) {
				this._initLayout();
			}
	
			if (map._fadeAnimated) {
				L.DomUtil.setOpacity(this._container, 0);
			}
	
			clearTimeout(this._removeTimeout);
			this.getPane().appendChild(this._container);
			this.update();
	
			if (map._fadeAnimated) {
				L.DomUtil.setOpacity(this._container, 1);
			}
	
			this.bringToFront();
		},
	
		onRemove: function (map) {
			if (map._fadeAnimated) {
				L.DomUtil.setOpacity(this._container, 0);
				this._removeTimeout = setTimeout(L.bind(L.DomUtil.remove, L.DomUtil, this._container), 200);
			} else {
				L.DomUtil.remove(this._container);
			}
		},
	
		// @namespace Popup
		// @method getLatLng: LatLng
		// Returns the geographical point of popup.
		getLatLng: function () {
			return this._latlng;
		},
	
		// @method setLatLng(latlng: LatLng): this
		// Sets the geographical point where the popup will open.
		setLatLng: function (latlng) {
			this._latlng = L.latLng(latlng);
			if (this._map) {
				this._updatePosition();
				this._adjustPan();
			}
			return this;
		},
	
		// @method getContent: String|HTMLElement
		// Returns the content of the popup.
		getContent: function () {
			return this._content;
		},
	
		// @method setContent(htmlContent: String|HTMLElement|Function): this
		// Sets the HTML content of the popup. If a function is passed the source layer will be passed to the function. The function should return a `String` or `HTMLElement` to be used in the popup.
		setContent: function (content) {
			this._content = content;
			this.update();
			return this;
		},
	
		// @method getElement: String|HTMLElement
		// Alias for [getContent()](#popup-getcontent)
		getElement: function () {
			return this._container;
		},
	
		// @method update: null
		// Updates the popup content, layout and position. Useful for updating the popup after something inside changed, e.g. image loaded.
		update: function () {
			if (!this._map) { return; }
	
			this._container.style.visibility = 'hidden';
	
			this._updateContent();
			this._updateLayout();
			this._updatePosition();
	
			this._container.style.visibility = '';
	
			this._adjustPan();
		},
	
		getEvents: function () {
			var events = {
				zoom: this._updatePosition,
				viewreset: this._updatePosition
			};
	
			if (this._zoomAnimated) {
				events.zoomanim = this._animateZoom;
			}
			return events;
		},
	
		// @method isOpen: Boolean
		// Returns `true` when the popup is visible on the map.
		isOpen: function () {
			return !!this._map && this._map.hasLayer(this);
		},
	
		// @method bringToFront: this
		// Brings this popup in front of other popups (in the same map pane).
		bringToFront: function () {
			if (this._map) {
				L.DomUtil.toFront(this._container);
			}
			return this;
		},
	
		// @method bringToBack: this
		// Brings this popup to the back of other popups (in the same map pane).
		bringToBack: function () {
			if (this._map) {
				L.DomUtil.toBack(this._container);
			}
			return this;
		},
	
		_updateContent: function () {
			if (!this._content) { return; }
	
			var node = this._contentNode;
			var content = (typeof this._content === 'function') ? this._content(this._source || this) : this._content;
	
			if (typeof content === 'string') {
				node.innerHTML = content;
			} else {
				while (node.hasChildNodes()) {
					node.removeChild(node.firstChild);
				}
				node.appendChild(content);
			}
			this.fire('contentupdate');
		},
	
		_updatePosition: function () {
			if (!this._map) { return; }
	
			var pos = this._map.latLngToLayerPoint(this._latlng),
			    offset = L.point(this.options.offset),
			    anchor = this._getAnchor();
	
			if (this._zoomAnimated) {
				L.DomUtil.setPosition(this._container, pos.add(anchor));
			} else {
				offset = offset.add(pos).add(anchor);
			}
	
			var bottom = this._containerBottom = -offset.y,
			    left = this._containerLeft = -Math.round(this._containerWidth / 2) + offset.x;
	
			// bottom position the popup in case the height of the popup changes (images loading etc)
			this._container.style.bottom = bottom + 'px';
			this._container.style.left = left + 'px';
		},
	
		_getAnchor: function () {
			return [0, 0];
		}
	
	});
	
	
	
	/*
	 * @class Popup
	 * @inherits DivOverlay
	 * @aka L.Popup
	 * Used to open popups in certain places of the map. Use [Map.openPopup](#map-openpopup) to
	 * open popups while making sure that only one popup is open at one time
	 * (recommended for usability), or use [Map.addLayer](#map-addlayer) to open as many as you want.
	 *
	 * @example
	 *
	 * If you want to just bind a popup to marker click and then open it, it's really easy:
	 *
	 * ```js
	 * marker.bindPopup(popupContent).openPopup();
	 * ```
	 * Path overlays like polylines also have a `bindPopup` method.
	 * Here's a more complicated way to open a popup on a map:
	 *
	 * ```js
	 * var popup = L.popup()
	 * 	.setLatLng(latlng)
	 * 	.setContent('<p>Hello world!<br />This is a nice popup.</p>')
	 * 	.openOn(map);
	 * ```
	 */
	
	
	// @namespace Popup
	L.Popup = L.DivOverlay.extend({
	
		// @section
		// @aka Popup options
		options: {
			// @option maxWidth: Number = 300
			// Max width of the popup, in pixels.
			maxWidth: 300,
	
			// @option minWidth: Number = 50
			// Min width of the popup, in pixels.
			minWidth: 50,
	
			// @option maxHeight: Number = null
			// If set, creates a scrollable container of the given height
			// inside a popup if its content exceeds it.
			maxHeight: null,
	
			// @option autoPan: Boolean = true
			// Set it to `false` if you don't want the map to do panning animation
			// to fit the opened popup.
			autoPan: true,
	
			// @option autoPanPaddingTopLeft: Point = null
			// The margin between the popup and the top left corner of the map
			// view after autopanning was performed.
			autoPanPaddingTopLeft: null,
	
			// @option autoPanPaddingBottomRight: Point = null
			// The margin between the popup and the bottom right corner of the map
			// view after autopanning was performed.
			autoPanPaddingBottomRight: null,
	
			// @option autoPanPadding: Point = Point(5, 5)
			// Equivalent of setting both top left and bottom right autopan padding to the same value.
			autoPanPadding: [5, 5],
	
			// @option keepInView: Boolean = false
			// Set it to `true` if you want to prevent users from panning the popup
			// off of the screen while it is open.
			keepInView: false,
	
			// @option closeButton: Boolean = true
			// Controls the presence of a close button in the popup.
			closeButton: true,
	
			// @option autoClose: Boolean = true
			// Set it to `false` if you want to override the default behavior of
			// the popup closing when user clicks the map (set globally by
			// the Map's [closePopupOnClick](#map-closepopuponclick) option).
			autoClose: true,
	
			// @option className: String = ''
			// A custom CSS class name to assign to the popup.
			className: ''
		},
	
		// @namespace Popup
		// @method openOn(map: Map): this
		// Adds the popup to the map and closes the previous one. The same as `map.openPopup(popup)`.
		openOn: function (map) {
			map.openPopup(this);
			return this;
		},
	
		onAdd: function (map) {
			L.DivOverlay.prototype.onAdd.call(this, map);
	
			// @namespace Map
			// @section Popup events
			// @event popupopen: PopupEvent
			// Fired when a popup is opened in the map
			map.fire('popupopen', {popup: this});
	
			if (this._source) {
				// @namespace Layer
				// @section Popup events
				// @event popupopen: PopupEvent
				// Fired when a popup bound to this layer is opened
				this._source.fire('popupopen', {popup: this}, true);
				// For non-path layers, we toggle the popup when clicking
				// again the layer, so prevent the map to reopen it.
				if (!(this._source instanceof L.Path)) {
					this._source.on('preclick', L.DomEvent.stopPropagation);
				}
			}
		},
	
		onRemove: function (map) {
			L.DivOverlay.prototype.onRemove.call(this, map);
	
			// @namespace Map
			// @section Popup events
			// @event popupclose: PopupEvent
			// Fired when a popup in the map is closed
			map.fire('popupclose', {popup: this});
	
			if (this._source) {
				// @namespace Layer
				// @section Popup events
				// @event popupclose: PopupEvent
				// Fired when a popup bound to this layer is closed
				this._source.fire('popupclose', {popup: this}, true);
				if (!(this._source instanceof L.Path)) {
					this._source.off('preclick', L.DomEvent.stopPropagation);
				}
			}
		},
	
		getEvents: function () {
			var events = L.DivOverlay.prototype.getEvents.call(this);
	
			if ('closeOnClick' in this.options ? this.options.closeOnClick : this._map.options.closePopupOnClick) {
				events.preclick = this._close;
			}
	
			if (this.options.keepInView) {
				events.moveend = this._adjustPan;
			}
	
			return events;
		},
	
		_close: function () {
			if (this._map) {
				this._map.closePopup(this);
			}
		},
	
		_initLayout: function () {
			var prefix = 'leaflet-popup',
			    container = this._container = L.DomUtil.create('div',
				prefix + ' ' + (this.options.className || '') +
				' leaflet-zoom-animated');
	
			if (this.options.closeButton) {
				var closeButton = this._closeButton = L.DomUtil.create('a', prefix + '-close-button', container);
				closeButton.href = '#close';
				closeButton.innerHTML = '&#215;';
	
				L.DomEvent.on(closeButton, 'click', this._onCloseButtonClick, this);
			}
	
			var wrapper = this._wrapper = L.DomUtil.create('div', prefix + '-content-wrapper', container);
			this._contentNode = L.DomUtil.create('div', prefix + '-content', wrapper);
	
			L.DomEvent
				.disableClickPropagation(wrapper)
				.disableScrollPropagation(this._contentNode)
				.on(wrapper, 'contextmenu', L.DomEvent.stopPropagation);
	
			this._tipContainer = L.DomUtil.create('div', prefix + '-tip-container', container);
			this._tip = L.DomUtil.create('div', prefix + '-tip', this._tipContainer);
		},
	
		_updateLayout: function () {
			var container = this._contentNode,
			    style = container.style;
	
			style.width = '';
			style.whiteSpace = 'nowrap';
	
			var width = container.offsetWidth;
			width = Math.min(width, this.options.maxWidth);
			width = Math.max(width, this.options.minWidth);
	
			style.width = (width + 1) + 'px';
			style.whiteSpace = '';
	
			style.height = '';
	
			var height = container.offsetHeight,
			    maxHeight = this.options.maxHeight,
			    scrolledClass = 'leaflet-popup-scrolled';
	
			if (maxHeight && height > maxHeight) {
				style.height = maxHeight + 'px';
				L.DomUtil.addClass(container, scrolledClass);
			} else {
				L.DomUtil.removeClass(container, scrolledClass);
			}
	
			this._containerWidth = this._container.offsetWidth;
		},
	
		_animateZoom: function (e) {
			var pos = this._map._latLngToNewLayerPoint(this._latlng, e.zoom, e.center),
			    anchor = this._getAnchor();
			L.DomUtil.setPosition(this._container, pos.add(anchor));
		},
	
		_adjustPan: function () {
			if (!this.options.autoPan || (this._map._panAnim && this._map._panAnim._inProgress)) { return; }
	
			var map = this._map,
			    marginBottom = parseInt(L.DomUtil.getStyle(this._container, 'marginBottom'), 10) || 0,
			    containerHeight = this._container.offsetHeight + marginBottom,
			    containerWidth = this._containerWidth,
			    layerPos = new L.Point(this._containerLeft, -containerHeight - this._containerBottom);
	
			layerPos._add(L.DomUtil.getPosition(this._container));
	
			var containerPos = map.layerPointToContainerPoint(layerPos),
			    padding = L.point(this.options.autoPanPadding),
			    paddingTL = L.point(this.options.autoPanPaddingTopLeft || padding),
			    paddingBR = L.point(this.options.autoPanPaddingBottomRight || padding),
			    size = map.getSize(),
			    dx = 0,
			    dy = 0;
	
			if (containerPos.x + containerWidth + paddingBR.x > size.x) { // right
				dx = containerPos.x + containerWidth - size.x + paddingBR.x;
			}
			if (containerPos.x - dx - paddingTL.x < 0) { // left
				dx = containerPos.x - paddingTL.x;
			}
			if (containerPos.y + containerHeight + paddingBR.y > size.y) { // bottom
				dy = containerPos.y + containerHeight - size.y + paddingBR.y;
			}
			if (containerPos.y - dy - paddingTL.y < 0) { // top
				dy = containerPos.y - paddingTL.y;
			}
	
			// @namespace Map
			// @section Popup events
			// @event autopanstart: Event
			// Fired when the map starts autopanning when opening a popup.
			if (dx || dy) {
				map
				    .fire('autopanstart')
				    .panBy([dx, dy]);
			}
		},
	
		_onCloseButtonClick: function (e) {
			this._close();
			L.DomEvent.stop(e);
		},
	
		_getAnchor: function () {
			// Where should we anchor the popup on the source layer?
			return L.point(this._source && this._source._getPopupAnchor ? this._source._getPopupAnchor() : [0, 0]);
		}
	
	});
	
	// @namespace Popup
	// @factory L.popup(options?: Popup options, source?: Layer)
	// Instantiates a `Popup` object given an optional `options` object that describes its appearance and location and an optional `source` object that is used to tag the popup with a reference to the Layer to which it refers.
	L.popup = function (options, source) {
		return new L.Popup(options, source);
	};
	
	
	/* @namespace Map
	 * @section Interaction Options
	 * @option closePopupOnClick: Boolean = true
	 * Set it to `false` if you don't want popups to close when user clicks the map.
	 */
	L.Map.mergeOptions({
		closePopupOnClick: true
	});
	
	
	// @namespace Map
	// @section Methods for Layers and Controls
	L.Map.include({
		// @method openPopup(popup: Popup): this
		// Opens the specified popup while closing the previously opened (to make sure only one is opened at one time for usability).
		// @alternative
		// @method openPopup(content: String|HTMLElement, latlng: LatLng, options?: Popup options): this
		// Creates a popup with the specified content and options and opens it in the given point on a map.
		openPopup: function (popup, latlng, options) {
			if (!(popup instanceof L.Popup)) {
				popup = new L.Popup(options).setContent(popup);
			}
	
			if (latlng) {
				popup.setLatLng(latlng);
			}
	
			if (this.hasLayer(popup)) {
				return this;
			}
	
			if (this._popup && this._popup.options.autoClose) {
				this.closePopup();
			}
	
			this._popup = popup;
			return this.addLayer(popup);
		},
	
		// @method closePopup(popup?: Popup): this
		// Closes the popup previously opened with [openPopup](#map-openpopup) (or the given one).
		closePopup: function (popup) {
			if (!popup || popup === this._popup) {
				popup = this._popup;
				this._popup = null;
			}
			if (popup) {
				this.removeLayer(popup);
			}
			return this;
		}
	});
	
	
	
	/*
	 * @namespace Layer
	 * @section Popup methods example
	 *
	 * All layers share a set of methods convenient for binding popups to it.
	 *
	 * ```js
	 * var layer = L.Polygon(latlngs).bindPopup('Hi There!').addTo(map);
	 * layer.openPopup();
	 * layer.closePopup();
	 * ```
	 *
	 * Popups will also be automatically opened when the layer is clicked on and closed when the layer is removed from the map or another popup is opened.
	 */
	
	// @section Popup methods
	L.Layer.include({
	
		// @method bindPopup(content: String|HTMLElement|Function|Popup, options?: Popup options): this
		// Binds a popup to the layer with the passed `content` and sets up the
		// neccessary event listeners. If a `Function` is passed it will receive
		// the layer as the first argument and should return a `String` or `HTMLElement`.
		bindPopup: function (content, options) {
	
			if (content instanceof L.Popup) {
				L.setOptions(content, options);
				this._popup = content;
				content._source = this;
			} else {
				if (!this._popup || options) {
					this._popup = new L.Popup(options, this);
				}
				this._popup.setContent(content);
			}
	
			if (!this._popupHandlersAdded) {
				this.on({
					click: this._openPopup,
					remove: this.closePopup,
					move: this._movePopup
				});
				this._popupHandlersAdded = true;
			}
	
			return this;
		},
	
		// @method unbindPopup(): this
		// Removes the popup previously bound with `bindPopup`.
		unbindPopup: function () {
			if (this._popup) {
				this.off({
					click: this._openPopup,
					remove: this.closePopup,
					move: this._movePopup
				});
				this._popupHandlersAdded = false;
				this._popup = null;
			}
			return this;
		},
	
		// @method openPopup(latlng?: LatLng): this
		// Opens the bound popup at the specificed `latlng` or at the default popup anchor if no `latlng` is passed.
		openPopup: function (layer, latlng) {
			if (!(layer instanceof L.Layer)) {
				latlng = layer;
				layer = this;
			}
	
			if (layer instanceof L.FeatureGroup) {
				for (var id in this._layers) {
					layer = this._layers[id];
					break;
				}
			}
	
			if (!latlng) {
				latlng = layer.getCenter ? layer.getCenter() : layer.getLatLng();
			}
	
			if (this._popup && this._map) {
				// set popup source to this layer
				this._popup._source = layer;
	
				// update the popup (content, layout, ect...)
				this._popup.update();
	
				// open the popup on the map
				this._map.openPopup(this._popup, latlng);
			}
	
			return this;
		},
	
		// @method closePopup(): this
		// Closes the popup bound to this layer if it is open.
		closePopup: function () {
			if (this._popup) {
				this._popup._close();
			}
			return this;
		},
	
		// @method togglePopup(): this
		// Opens or closes the popup bound to this layer depending on its current state.
		togglePopup: function (target) {
			if (this._popup) {
				if (this._popup._map) {
					this.closePopup();
				} else {
					this.openPopup(target);
				}
			}
			return this;
		},
	
		// @method isPopupOpen(): boolean
		// Returns `true` if the popup bound to this layer is currently open.
		isPopupOpen: function () {
			return this._popup.isOpen();
		},
	
		// @method setPopupContent(content: String|HTMLElement|Popup): this
		// Sets the content of the popup bound to this layer.
		setPopupContent: function (content) {
			if (this._popup) {
				this._popup.setContent(content);
			}
			return this;
		},
	
		// @method getPopup(): Popup
		// Returns the popup bound to this layer.
		getPopup: function () {
			return this._popup;
		},
	
		_openPopup: function (e) {
			var layer = e.layer || e.target;
	
			if (!this._popup) {
				return;
			}
	
			if (!this._map) {
				return;
			}
	
			// prevent map click
			L.DomEvent.stop(e);
	
			// if this inherits from Path its a vector and we can just
			// open the popup at the new location
			if (layer instanceof L.Path) {
				this.openPopup(e.layer || e.target, e.latlng);
				return;
			}
	
			// otherwise treat it like a marker and figure out
			// if we should toggle it open/closed
			if (this._map.hasLayer(this._popup) && this._popup._source === layer) {
				this.closePopup();
			} else {
				this.openPopup(layer, e.latlng);
			}
		},
	
		_movePopup: function (e) {
			this._popup.setLatLng(e.latlng);
		}
	});
	
	
	
	/*
	 * Popup extension to L.Marker, adding popup-related methods.
	 */
	
	L.Marker.include({
		_getPopupAnchor: function () {
			return this.options.icon.options.popupAnchor || [0, 0];
		}
	});
	
	
	
	/*
	 * @class Tooltip
	 * @inherits DivOverlay
	 * @aka L.Tooltip
	 * Used to display small texts on top of map layers.
	 *
	 * @example
	 *
	 * ```js
	 * marker.bindTooltip("my tooltip text").openTooltip();
	 * ```
	 * Note about tooltip offset. Leaflet takes two options in consideration
	 * for computing tooltip offseting:
	 * - the `offset` Tooltip option: it defaults to [0, 0], and it's specific to one tooltip.
	 *   Add a positive x offset to move the tooltip to the right, and a positive y offset to
	 *   move it to the bottom. Negatives will move to the left and top.
	 * - the `tooltipAnchor` Icon option: this will only be considered for Marker. You
	 *   should adapt this value if you use a custom icon.
	 */
	
	
	// @namespace Tooltip
	L.Tooltip = L.DivOverlay.extend({
	
		// @section
		// @aka Tooltip options
		options: {
			// @option pane: String = 'tooltipPane'
			// `Map pane` where the tooltip will be added.
			pane: 'tooltipPane',
	
			// @option offset: Point = Point(0, 0)
			// Optional offset of the tooltip position.
			offset: [0, 0],
	
			// @option direction: String = 'auto'
			// Direction where to open the tooltip. Possible values are: `right`, `left`,
			// `top`, `bottom`, `center`, `auto`.
			// `auto` will dynamicaly switch between `right` and `left` according to the tooltip
			// position on the map.
			direction: 'auto',
	
			// @option permanent: Boolean = false
			// Whether to open the tooltip permanently or only on mouseover.
			permanent: false,
	
			// @option sticky: Boolean = false
			// If true, the tooltip will follow the mouse instead of being fixed at the feature center.
			sticky: false,
	
			// @option interactive: Boolean = false
			// If true, the tooltip will listen to the feature events.
			interactive: false,
	
			// @option opacity: Number = 0.9
			// Tooltip container opacity.
			opacity: 0.9
		},
	
		onAdd: function (map) {
			L.DivOverlay.prototype.onAdd.call(this, map);
			this.setOpacity(this.options.opacity);
	
			// @namespace Map
			// @section Tooltip events
			// @event tooltipopen: TooltipEvent
			// Fired when a tooltip is opened in the map.
			map.fire('tooltipopen', {tooltip: this});
	
			if (this._source) {
				// @namespace Layer
				// @section Tooltip events
				// @event tooltipopen: TooltipEvent
				// Fired when a tooltip bound to this layer is opened.
				this._source.fire('tooltipopen', {tooltip: this}, true);
			}
		},
	
		onRemove: function (map) {
			L.DivOverlay.prototype.onRemove.call(this, map);
	
			// @namespace Map
			// @section Tooltip events
			// @event tooltipclose: TooltipEvent
			// Fired when a tooltip in the map is closed.
			map.fire('tooltipclose', {tooltip: this});
	
			if (this._source) {
				// @namespace Layer
				// @section Tooltip events
				// @event tooltipclose: TooltipEvent
				// Fired when a tooltip bound to this layer is closed.
				this._source.fire('tooltipclose', {tooltip: this}, true);
			}
		},
	
		getEvents: function () {
			var events = L.DivOverlay.prototype.getEvents.call(this);
	
			if (L.Browser.touch && !this.options.permanent) {
				events.preclick = this._close;
			}
	
			return events;
		},
	
		_close: function () {
			if (this._map) {
				this._map.closeTooltip(this);
			}
		},
	
		_initLayout: function () {
			var prefix = 'leaflet-tooltip',
			    className = prefix + ' ' + (this.options.className || '') + ' leaflet-zoom-' + (this._zoomAnimated ? 'animated' : 'hide');
	
			this._contentNode = this._container = L.DomUtil.create('div', className);
		},
	
		_updateLayout: function () {},
	
		_adjustPan: function () {},
	
		_setPosition: function (pos) {
			var map = this._map,
			    container = this._container,
			    centerPoint = map.latLngToContainerPoint(map.getCenter()),
			    tooltipPoint = map.layerPointToContainerPoint(pos),
			    direction = this.options.direction,
			    tooltipWidth = container.offsetWidth,
			    tooltipHeight = container.offsetHeight,
			    offset = L.point(this.options.offset),
			    anchor = this._getAnchor();
	
			if (direction === 'top') {
				pos = pos.add(L.point(-tooltipWidth / 2 + offset.x, -tooltipHeight + offset.y + anchor.y));
			} else if (direction === 'bottom') {
				pos = pos.subtract(L.point(tooltipWidth / 2 - offset.x, -offset.y));
			} else if (direction === 'center') {
				pos = pos.subtract(L.point(tooltipWidth / 2 + offset.x, tooltipHeight / 2 - anchor.y + offset.y));
			} else if (direction === 'right' || direction === 'auto' && tooltipPoint.x < centerPoint.x) {
				direction = 'right';
				pos = pos.add([offset.x + anchor.x, anchor.y - tooltipHeight / 2 + offset.y]);
			} else {
				direction = 'left';
				pos = pos.subtract(L.point(tooltipWidth + anchor.x - offset.x, tooltipHeight / 2 - anchor.y - offset.y));
			}
	
			L.DomUtil.removeClass(container, 'leaflet-tooltip-right');
			L.DomUtil.removeClass(container, 'leaflet-tooltip-left');
			L.DomUtil.removeClass(container, 'leaflet-tooltip-top');
			L.DomUtil.removeClass(container, 'leaflet-tooltip-bottom');
			L.DomUtil.addClass(container, 'leaflet-tooltip-' + direction);
			L.DomUtil.setPosition(container, pos);
		},
	
		_updatePosition: function () {
			var pos = this._map.latLngToLayerPoint(this._latlng);
			this._setPosition(pos);
		},
	
		setOpacity: function (opacity) {
			this.options.opacity = opacity;
	
			if (this._container) {
				L.DomUtil.setOpacity(this._container, opacity);
			}
		},
	
		_animateZoom: function (e) {
			var pos = this._map._latLngToNewLayerPoint(this._latlng, e.zoom, e.center);
			this._setPosition(pos);
		},
	
		_getAnchor: function () {
			// Where should we anchor the tooltip on the source layer?
			return L.point(this._source && this._source._getTooltipAnchor && !this.options.sticky ? this._source._getTooltipAnchor() : [0, 0]);
		}
	
	});
	
	// @namespace Tooltip
	// @factory L.tooltip(options?: Tooltip options, source?: Layer)
	// Instantiates a Tooltip object given an optional `options` object that describes its appearance and location and an optional `source` object that is used to tag the tooltip with a reference to the Layer to which it refers.
	L.tooltip = function (options, source) {
		return new L.Tooltip(options, source);
	};
	
	// @namespace Map
	// @section Methods for Layers and Controls
	L.Map.include({
	
		// @method openTooltip(tooltip: Tooltip): this
		// Opens the specified tooltip.
		// @alternative
		// @method openTooltip(content: String|HTMLElement, latlng: LatLng, options?: Tooltip options): this
		// Creates a tooltip with the specified content and options and open it.
		openTooltip: function (tooltip, latlng, options) {
			if (!(tooltip instanceof L.Tooltip)) {
				tooltip = new L.Tooltip(options).setContent(tooltip);
			}
	
			if (latlng) {
				tooltip.setLatLng(latlng);
			}
	
			if (this.hasLayer(tooltip)) {
				return this;
			}
	
			return this.addLayer(tooltip);
		},
	
		// @method closeTooltip(tooltip?: Tooltip): this
		// Closes the tooltip given as parameter.
		closeTooltip: function (tooltip) {
			if (tooltip) {
				this.removeLayer(tooltip);
			}
			return this;
		}
	
	});
	
	
	
	/*
	 * @namespace Layer
	 * @section Tooltip methods example
	 *
	 * All layers share a set of methods convenient for binding tooltips to it.
	 *
	 * ```js
	 * var layer = L.Polygon(latlngs).bindTooltip('Hi There!').addTo(map);
	 * layer.openTooltip();
	 * layer.closeTooltip();
	 * ```
	 */
	
	// @section Tooltip methods
	L.Layer.include({
	
		// @method bindTooltip(content: String|HTMLElement|Function|Tooltip, options?: Tooltip options): this
		// Binds a tooltip to the layer with the passed `content` and sets up the
		// neccessary event listeners. If a `Function` is passed it will receive
		// the layer as the first argument and should return a `String` or `HTMLElement`.
		bindTooltip: function (content, options) {
	
			if (content instanceof L.Tooltip) {
				L.setOptions(content, options);
				this._tooltip = content;
				content._source = this;
			} else {
				if (!this._tooltip || options) {
					this._tooltip = L.tooltip(options, this);
				}
				this._tooltip.setContent(content);
	
			}
	
			this._initTooltipInteractions();
	
			if (this._tooltip.options.permanent && this._map && this._map.hasLayer(this)) {
				this.openTooltip();
			}
	
			return this;
		},
	
		// @method unbindTooltip(): this
		// Removes the tooltip previously bound with `bindTooltip`.
		unbindTooltip: function () {
			if (this._tooltip) {
				this._initTooltipInteractions(true);
				this.closeTooltip();
				this._tooltip = null;
			}
			return this;
		},
	
		_initTooltipInteractions: function (remove) {
			if (!remove && this._tooltipHandlersAdded) { return; }
			var onOff = remove ? 'off' : 'on',
			    events = {
				remove: this.closeTooltip,
				move: this._moveTooltip
			    };
			if (!this._tooltip.options.permanent) {
				events.mouseover = this._openTooltip;
				events.mouseout = this.closeTooltip;
				if (this._tooltip.options.sticky) {
					events.mousemove = this._moveTooltip;
				}
				if (L.Browser.touch) {
					events.click = this._openTooltip;
				}
			} else {
				events.add = this._openTooltip;
			}
			this[onOff](events);
			this._tooltipHandlersAdded = !remove;
		},
	
		// @method openTooltip(latlng?: LatLng): this
		// Opens the bound tooltip at the specificed `latlng` or at the default tooltip anchor if no `latlng` is passed.
		openTooltip: function (layer, latlng) {
			if (!(layer instanceof L.Layer)) {
				latlng = layer;
				layer = this;
			}
	
			if (layer instanceof L.FeatureGroup) {
				for (var id in this._layers) {
					layer = this._layers[id];
					break;
				}
			}
	
			if (!latlng) {
				latlng = layer.getCenter ? layer.getCenter() : layer.getLatLng();
			}
	
			if (this._tooltip && this._map) {
	
				// set tooltip source to this layer
				this._tooltip._source = layer;
	
				// update the tooltip (content, layout, ect...)
				this._tooltip.update();
	
				// open the tooltip on the map
				this._map.openTooltip(this._tooltip, latlng);
	
				// Tooltip container may not be defined if not permanent and never
				// opened.
				if (this._tooltip.options.interactive && this._tooltip._container) {
					L.DomUtil.addClass(this._tooltip._container, 'leaflet-clickable');
					this.addInteractiveTarget(this._tooltip._container);
				}
			}
	
			return this;
		},
	
		// @method closeTooltip(): this
		// Closes the tooltip bound to this layer if it is open.
		closeTooltip: function () {
			if (this._tooltip) {
				this._tooltip._close();
				if (this._tooltip.options.interactive && this._tooltip._container) {
					L.DomUtil.removeClass(this._tooltip._container, 'leaflet-clickable');
					this.removeInteractiveTarget(this._tooltip._container);
				}
			}
			return this;
		},
	
		// @method toggleTooltip(): this
		// Opens or closes the tooltip bound to this layer depending on its current state.
		toggleTooltip: function (target) {
			if (this._tooltip) {
				if (this._tooltip._map) {
					this.closeTooltip();
				} else {
					this.openTooltip(target);
				}
			}
			return this;
		},
	
		// @method isTooltipOpen(): boolean
		// Returns `true` if the tooltip bound to this layer is currently open.
		isTooltipOpen: function () {
			return this._tooltip.isOpen();
		},
	
		// @method setTooltipContent(content: String|HTMLElement|Tooltip): this
		// Sets the content of the tooltip bound to this layer.
		setTooltipContent: function (content) {
			if (this._tooltip) {
				this._tooltip.setContent(content);
			}
			return this;
		},
	
		// @method getTooltip(): Tooltip
		// Returns the tooltip bound to this layer.
		getTooltip: function () {
			return this._tooltip;
		},
	
		_openTooltip: function (e) {
			var layer = e.layer || e.target;
	
			if (!this._tooltip || !this._map) {
				return;
			}
			this.openTooltip(layer, this._tooltip.options.sticky ? e.latlng : undefined);
		},
	
		_moveTooltip: function (e) {
			var latlng = e.latlng, containerPoint, layerPoint;
			if (this._tooltip.options.sticky && e.originalEvent) {
				containerPoint = this._map.mouseEventToContainerPoint(e.originalEvent);
				layerPoint = this._map.containerPointToLayerPoint(containerPoint);
				latlng = this._map.layerPointToLatLng(layerPoint);
			}
			this._tooltip.setLatLng(latlng);
		}
	});
	
	
	
	/*
	 * Tooltip extension to L.Marker, adding tooltip-related methods.
	 */
	
	L.Marker.include({
		_getTooltipAnchor: function () {
			return this.options.icon.options.tooltipAnchor || [0, 0];
		}
	});
	
	
	
	/*
	 * @class LayerGroup
	 * @aka L.LayerGroup
	 * @inherits Layer
	 *
	 * Used to group several layers and handle them as one. If you add it to the map,
	 * any layers added or removed from the group will be added/removed on the map as
	 * well. Extends `Layer`.
	 *
	 * @example
	 *
	 * ```js
	 * L.layerGroup([marker1, marker2])
	 * 	.addLayer(polyline)
	 * 	.addTo(map);
	 * ```
	 */
	
	L.LayerGroup = L.Layer.extend({
	
		initialize: function (layers) {
			this._layers = {};
	
			var i, len;
	
			if (layers) {
				for (i = 0, len = layers.length; i < len; i++) {
					this.addLayer(layers[i]);
				}
			}
		},
	
		// @method addLayer(layer: Layer): this
		// Adds the given layer to the group.
		addLayer: function (layer) {
			var id = this.getLayerId(layer);
	
			this._layers[id] = layer;
	
			if (this._map) {
				this._map.addLayer(layer);
			}
	
			return this;
		},
	
		// @method removeLayer(layer: Layer): this
		// Removes the given layer from the group.
		// @alternative
		// @method removeLayer(id: Number): this
		// Removes the layer with the given internal ID from the group.
		removeLayer: function (layer) {
			var id = layer in this._layers ? layer : this.getLayerId(layer);
	
			if (this._map && this._layers[id]) {
				this._map.removeLayer(this._layers[id]);
			}
	
			delete this._layers[id];
	
			return this;
		},
	
		// @method hasLayer(layer: Layer): Boolean
		// Returns `true` if the given layer is currently added to the group.
		hasLayer: function (layer) {
			return !!layer && (layer in this._layers || this.getLayerId(layer) in this._layers);
		},
	
		// @method clearLayers(): this
		// Removes all the layers from the group.
		clearLayers: function () {
			for (var i in this._layers) {
				this.removeLayer(this._layers[i]);
			}
			return this;
		},
	
		// @method invoke(methodName: String, …): this
		// Calls `methodName` on every layer contained in this group, passing any
		// additional parameters. Has no effect if the layers contained do not
		// implement `methodName`.
		invoke: function (methodName) {
			var args = Array.prototype.slice.call(arguments, 1),
			    i, layer;
	
			for (i in this._layers) {
				layer = this._layers[i];
	
				if (layer[methodName]) {
					layer[methodName].apply(layer, args);
				}
			}
	
			return this;
		},
	
		onAdd: function (map) {
			for (var i in this._layers) {
				map.addLayer(this._layers[i]);
			}
		},
	
		onRemove: function (map) {
			for (var i in this._layers) {
				map.removeLayer(this._layers[i]);
			}
		},
	
		// @method eachLayer(fn: Function, context?: Object): this
		// Iterates over the layers of the group, optionally specifying context of the iterator function.
		// ```js
		// group.eachLayer(function (layer) {
		// 	layer.bindPopup('Hello');
		// });
		// ```
		eachLayer: function (method, context) {
			for (var i in this._layers) {
				method.call(context, this._layers[i]);
			}
			return this;
		},
	
		// @method getLayer(id: Number): Layer
		// Returns the layer with the given internal ID.
		getLayer: function (id) {
			return this._layers[id];
		},
	
		// @method getLayers(): Layer[]
		// Returns an array of all the layers added to the group.
		getLayers: function () {
			var layers = [];
	
			for (var i in this._layers) {
				layers.push(this._layers[i]);
			}
			return layers;
		},
	
		// @method setZIndex(zIndex: Number): this
		// Calls `setZIndex` on every layer contained in this group, passing the z-index.
		setZIndex: function (zIndex) {
			return this.invoke('setZIndex', zIndex);
		},
	
		// @method getLayerId(layer: Layer): Number
		// Returns the internal ID for a layer
		getLayerId: function (layer) {
			return L.stamp(layer);
		}
	});
	
	
	// @factory L.layerGroup(layers: Layer[])
	// Create a layer group, optionally given an initial set of layers.
	L.layerGroup = function (layers) {
		return new L.LayerGroup(layers);
	};
	
	
	
	/*
	 * @class FeatureGroup
	 * @aka L.FeatureGroup
	 * @inherits LayerGroup
	 *
	 * Extended `LayerGroup` that makes it easier to do the same thing to all its member layers:
	 *  * [`bindPopup`](#layer-bindpopup) binds a popup to all of the layers at once (likewise with [`bindTooltip`](#layer-bindtooltip))
	 *  * Events are propagated to the `FeatureGroup`, so if the group has an event
	 * handler, it will handle events from any of the layers. This includes mouse events
	 * and custom events.
	 *  * Has `layeradd` and `layerremove` events
	 *
	 * @example
	 *
	 * ```js
	 * L.featureGroup([marker1, marker2, polyline])
	 * 	.bindPopup('Hello world!')
	 * 	.on('click', function() { alert('Clicked on a member of the group!'); })
	 * 	.addTo(map);
	 * ```
	 */
	
	L.FeatureGroup = L.LayerGroup.extend({
	
		addLayer: function (layer) {
			if (this.hasLayer(layer)) {
				return this;
			}
	
			layer.addEventParent(this);
	
			L.LayerGroup.prototype.addLayer.call(this, layer);
	
			// @event layeradd: LayerEvent
			// Fired when a layer is added to this `FeatureGroup`
			return this.fire('layeradd', {layer: layer});
		},
	
		removeLayer: function (layer) {
			if (!this.hasLayer(layer)) {
				return this;
			}
			if (layer in this._layers) {
				layer = this._layers[layer];
			}
	
			layer.removeEventParent(this);
	
			L.LayerGroup.prototype.removeLayer.call(this, layer);
	
			// @event layerremove: LayerEvent
			// Fired when a layer is removed from this `FeatureGroup`
			return this.fire('layerremove', {layer: layer});
		},
	
		// @method setStyle(style: Path options): this
		// Sets the given path options to each layer of the group that has a `setStyle` method.
		setStyle: function (style) {
			return this.invoke('setStyle', style);
		},
	
		// @method bringToFront(): this
		// Brings the layer group to the top of all other layers
		bringToFront: function () {
			return this.invoke('bringToFront');
		},
	
		// @method bringToBack(): this
		// Brings the layer group to the top of all other layers
		bringToBack: function () {
			return this.invoke('bringToBack');
		},
	
		// @method getBounds(): LatLngBounds
		// Returns the LatLngBounds of the Feature Group (created from bounds and coordinates of its children).
		getBounds: function () {
			var bounds = new L.LatLngBounds();
	
			for (var id in this._layers) {
				var layer = this._layers[id];
				bounds.extend(layer.getBounds ? layer.getBounds() : layer.getLatLng());
			}
			return bounds;
		}
	});
	
	// @factory L.featureGroup(layers: Layer[])
	// Create a feature group, optionally given an initial set of layers.
	L.featureGroup = function (layers) {
		return new L.FeatureGroup(layers);
	};
	
	
	
	/*
	 * @class Renderer
	 * @inherits Layer
	 * @aka L.Renderer
	 *
	 * Base class for vector renderer implementations (`SVG`, `Canvas`). Handles the
	 * DOM container of the renderer, its bounds, and its zoom animation.
	 *
	 * A `Renderer` works as an implicit layer group for all `Path`s - the renderer
	 * itself can be added or removed to the map. All paths use a renderer, which can
	 * be implicit (the map will decide the type of renderer and use it automatically)
	 * or explicit (using the [`renderer`](#path-renderer) option of the path).
	 *
	 * Do not use this class directly, use `SVG` and `Canvas` instead.
	 *
	 * @event update: Event
	 * Fired when the renderer updates its bounds, center and zoom, for example when
	 * its map has moved
	 */
	
	L.Renderer = L.Layer.extend({
	
		// @section
		// @aka Renderer options
		options: {
			// @option padding: Number = 0.1
			// How much to extend the clip area around the map view (relative to its size)
			// e.g. 0.1 would be 10% of map view in each direction
			padding: 0.1
		},
	
		initialize: function (options) {
			L.setOptions(this, options);
			L.stamp(this);
		},
	
		onAdd: function () {
			if (!this._container) {
				this._initContainer(); // defined by renderer implementations
	
				if (this._zoomAnimated) {
					L.DomUtil.addClass(this._container, 'leaflet-zoom-animated');
				}
			}
	
			this.getPane().appendChild(this._container);
			this._update();
		},
	
		onRemove: function () {
			L.DomUtil.remove(this._container);
		},
	
		getEvents: function () {
			var events = {
				viewreset: this._reset,
				zoom: this._onZoom,
				moveend: this._update
			};
			if (this._zoomAnimated) {
				events.zoomanim = this._onAnimZoom;
			}
			return events;
		},
	
		_onAnimZoom: function (ev) {
			this._updateTransform(ev.center, ev.zoom);
		},
	
		_onZoom: function () {
			this._updateTransform(this._map.getCenter(), this._map.getZoom());
		},
	
		_updateTransform: function (center, zoom) {
			var scale = this._map.getZoomScale(zoom, this._zoom),
			    position = L.DomUtil.getPosition(this._container),
			    viewHalf = this._map.getSize().multiplyBy(0.5 + this.options.padding),
			    currentCenterPoint = this._map.project(this._center, zoom),
			    destCenterPoint = this._map.project(center, zoom),
			    centerOffset = destCenterPoint.subtract(currentCenterPoint),
	
			    topLeftOffset = viewHalf.multiplyBy(-scale).add(position).add(viewHalf).subtract(centerOffset);
	
			if (L.Browser.any3d) {
				L.DomUtil.setTransform(this._container, topLeftOffset, scale);
			} else {
				L.DomUtil.setPosition(this._container, topLeftOffset);
			}
		},
	
		_reset: function () {
			this._update();
			this._updateTransform(this._center, this._zoom);
		},
	
		_update: function () {
			// Update pixel bounds of renderer container (for positioning/sizing/clipping later)
			// Subclasses are responsible of firing the 'update' event.
			var p = this.options.padding,
			    size = this._map.getSize(),
			    min = this._map.containerPointToLayerPoint(size.multiplyBy(-p)).round();
	
			this._bounds = new L.Bounds(min, min.add(size.multiplyBy(1 + p * 2)).round());
	
			this._center = this._map.getCenter();
			this._zoom = this._map.getZoom();
		}
	});
	
	
	L.Map.include({
		// @namespace Map; @method getRenderer(layer: Path): Renderer
		// Returns the instance of `Renderer` that should be used to render the given
		// `Path`. It will ensure that the `renderer` options of the map and paths
		// are respected, and that the renderers do exist on the map.
		getRenderer: function (layer) {
			// @namespace Path; @option renderer: Renderer
			// Use this specific instance of `Renderer` for this path. Takes
			// precedence over the map's [default renderer](#map-renderer).
			var renderer = layer.options.renderer || this._getPaneRenderer(layer.options.pane) || this.options.renderer || this._renderer;
	
			if (!renderer) {
				// @namespace Map; @option preferCanvas: Boolean = false
				// Whether `Path`s should be rendered on a `Canvas` renderer.
				// By default, all `Path`s are rendered in a `SVG` renderer.
				renderer = this._renderer = (this.options.preferCanvas && L.canvas()) || L.svg();
			}
	
			if (!this.hasLayer(renderer)) {
				this.addLayer(renderer);
			}
			return renderer;
		},
	
		_getPaneRenderer: function (name) {
			if (name === 'overlayPane' || name === undefined) {
				return false;
			}
	
			var renderer = this._paneRenderers[name];
			if (renderer === undefined) {
				renderer = (L.SVG && L.svg({pane: name})) || (L.Canvas && L.canvas({pane: name}));
				this._paneRenderers[name] = renderer;
			}
			return renderer;
		}
	});
	
	
	
	/*
	 * @class Path
	 * @aka L.Path
	 * @inherits Interactive layer
	 *
	 * An abstract class that contains options and constants shared between vector
	 * overlays (Polygon, Polyline, Circle). Do not use it directly. Extends `Layer`.
	 */
	
	L.Path = L.Layer.extend({
	
		// @section
		// @aka Path options
		options: {
			// @option stroke: Boolean = true
			// Whether to draw stroke along the path. Set it to `false` to disable borders on polygons or circles.
			stroke: true,
	
			// @option color: String = '#3388ff'
			// Stroke color
			color: '#3388ff',
	
			// @option weight: Number = 3
			// Stroke width in pixels
			weight: 3,
	
			// @option opacity: Number = 1.0
			// Stroke opacity
			opacity: 1,
	
			// @option lineCap: String= 'round'
			// A string that defines [shape to be used at the end](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-linecap) of the stroke.
			lineCap: 'round',
	
			// @option lineJoin: String = 'round'
			// A string that defines [shape to be used at the corners](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-linejoin) of the stroke.
			lineJoin: 'round',
	
			// @option dashArray: String = null
			// A string that defines the stroke [dash pattern](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-dasharray). Doesn't work on `Canvas`-powered layers in [some old browsers](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/setLineDash#Browser_compatibility).
			dashArray: null,
	
			// @option dashOffset: String = null
			// A string that defines the [distance into the dash pattern to start the dash](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-dashoffset). Doesn't work on `Canvas`-powered layers in [some old browsers](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/setLineDash#Browser_compatibility).
			dashOffset: null,
	
			// @option fill: Boolean = depends
			// Whether to fill the path with color. Set it to `false` to disable filling on polygons or circles.
			fill: false,
	
			// @option fillColor: String = *
			// Fill color. Defaults to the value of the [`color`](#path-color) option
			fillColor: null,
	
			// @option fillOpacity: Number = 0.2
			// Fill opacity.
			fillOpacity: 0.2,
	
			// @option fillRule: String = 'evenodd'
			// A string that defines [how the inside of a shape](https://developer.mozilla.org/docs/Web/SVG/Attribute/fill-rule) is determined.
			fillRule: 'evenodd',
	
			// className: '',
	
			// Option inherited from "Interactive layer" abstract class
			interactive: true
		},
	
		beforeAdd: function (map) {
			// Renderer is set here because we need to call renderer.getEvents
			// before this.getEvents.
			this._renderer = map.getRenderer(this);
		},
	
		onAdd: function () {
			this._renderer._initPath(this);
			this._reset();
			this._renderer._addPath(this);
			this._renderer.on('update', this._update, this);
		},
	
		onRemove: function () {
			this._renderer._removePath(this);
			this._renderer.off('update', this._update, this);
		},
	
		getEvents: function () {
			return {
				zoomend: this._project,
				viewreset: this._reset
			};
		},
	
		// @method redraw(): this
		// Redraws the layer. Sometimes useful after you changed the coordinates that the path uses.
		redraw: function () {
			if (this._map) {
				this._renderer._updatePath(this);
			}
			return this;
		},
	
		// @method setStyle(style: Path options): this
		// Changes the appearance of a Path based on the options in the `Path options` object.
		setStyle: function (style) {
			L.setOptions(this, style);
			if (this._renderer) {
				this._renderer._updateStyle(this);
			}
			return this;
		},
	
		// @method bringToFront(): this
		// Brings the layer to the top of all path layers.
		bringToFront: function () {
			if (this._renderer) {
				this._renderer._bringToFront(this);
			}
			return this;
		},
	
		// @method bringToBack(): this
		// Brings the layer to the bottom of all path layers.
		bringToBack: function () {
			if (this._renderer) {
				this._renderer._bringToBack(this);
			}
			return this;
		},
	
		getElement: function () {
			return this._path;
		},
	
		_reset: function () {
			// defined in children classes
			this._project();
			this._update();
		},
	
		_clickTolerance: function () {
			// used when doing hit detection for Canvas layers
			return (this.options.stroke ? this.options.weight / 2 : 0) + (L.Browser.touch ? 10 : 0);
		}
	});
	
	
	
	/*
	 * @namespace LineUtil
	 *
	 * Various utility functions for polyine points processing, used by Leaflet internally to make polylines lightning-fast.
	 */
	
	L.LineUtil = {
	
		// Simplify polyline with vertex reduction and Douglas-Peucker simplification.
		// Improves rendering performance dramatically by lessening the number of points to draw.
	
		// @function simplify(points: Point[], tolerance: Number): Point[]
		// Dramatically reduces the number of points in a polyline while retaining
		// its shape and returns a new array of simplified points, using the
		// [Douglas-Peucker algorithm](http://en.wikipedia.org/wiki/Douglas-Peucker_algorithm).
		// Used for a huge performance boost when processing/displaying Leaflet polylines for
		// each zoom level and also reducing visual noise. tolerance affects the amount of
		// simplification (lesser value means higher quality but slower and with more points).
		// Also released as a separated micro-library [Simplify.js](http://mourner.github.com/simplify-js/).
		simplify: function (points, tolerance) {
			if (!tolerance || !points.length) {
				return points.slice();
			}
	
			var sqTolerance = tolerance * tolerance;
	
			// stage 1: vertex reduction
			points = this._reducePoints(points, sqTolerance);
	
			// stage 2: Douglas-Peucker simplification
			points = this._simplifyDP(points, sqTolerance);
	
			return points;
		},
	
		// @function pointToSegmentDistance(p: Point, p1: Point, p2: Point): Number
		// Returns the distance between point `p` and segment `p1` to `p2`.
		pointToSegmentDistance:  function (p, p1, p2) {
			return Math.sqrt(this._sqClosestPointOnSegment(p, p1, p2, true));
		},
	
		// @function closestPointOnSegment(p: Point, p1: Point, p2: Point): Number
		// Returns the closest point from a point `p` on a segment `p1` to `p2`.
		closestPointOnSegment: function (p, p1, p2) {
			return this._sqClosestPointOnSegment(p, p1, p2);
		},
	
		// Douglas-Peucker simplification, see http://en.wikipedia.org/wiki/Douglas-Peucker_algorithm
		_simplifyDP: function (points, sqTolerance) {
	
			var len = points.length,
			    ArrayConstructor = typeof Uint8Array !== undefined + '' ? Uint8Array : Array,
			    markers = new ArrayConstructor(len);
	
			markers[0] = markers[len - 1] = 1;
	
			this._simplifyDPStep(points, markers, sqTolerance, 0, len - 1);
	
			var i,
			    newPoints = [];
	
			for (i = 0; i < len; i++) {
				if (markers[i]) {
					newPoints.push(points[i]);
				}
			}
	
			return newPoints;
		},
	
		_simplifyDPStep: function (points, markers, sqTolerance, first, last) {
	
			var maxSqDist = 0,
			    index, i, sqDist;
	
			for (i = first + 1; i <= last - 1; i++) {
				sqDist = this._sqClosestPointOnSegment(points[i], points[first], points[last], true);
	
				if (sqDist > maxSqDist) {
					index = i;
					maxSqDist = sqDist;
				}
			}
	
			if (maxSqDist > sqTolerance) {
				markers[index] = 1;
	
				this._simplifyDPStep(points, markers, sqTolerance, first, index);
				this._simplifyDPStep(points, markers, sqTolerance, index, last);
			}
		},
	
		// reduce points that are too close to each other to a single point
		_reducePoints: function (points, sqTolerance) {
			var reducedPoints = [points[0]];
	
			for (var i = 1, prev = 0, len = points.length; i < len; i++) {
				if (this._sqDist(points[i], points[prev]) > sqTolerance) {
					reducedPoints.push(points[i]);
					prev = i;
				}
			}
			if (prev < len - 1) {
				reducedPoints.push(points[len - 1]);
			}
			return reducedPoints;
		},
	
	
		// @function clipSegment(a: Point, b: Point, bounds: Bounds, useLastCode?: Boolean, round?: Boolean): Point[]|Boolean
		// Clips the segment a to b by rectangular bounds with the
		// [Cohen-Sutherland algorithm](https://en.wikipedia.org/wiki/Cohen%E2%80%93Sutherland_algorithm)
		// (modifying the segment points directly!). Used by Leaflet to only show polyline
		// points that are on the screen or near, increasing performance.
		clipSegment: function (a, b, bounds, useLastCode, round) {
			var codeA = useLastCode ? this._lastCode : this._getBitCode(a, bounds),
			    codeB = this._getBitCode(b, bounds),
	
			    codeOut, p, newCode;
	
			// save 2nd code to avoid calculating it on the next segment
			this._lastCode = codeB;
	
			while (true) {
				// if a,b is inside the clip window (trivial accept)
				if (!(codeA | codeB)) {
					return [a, b];
				}
	
				// if a,b is outside the clip window (trivial reject)
				if (codeA & codeB) {
					return false;
				}
	
				// other cases
				codeOut = codeA || codeB;
				p = this._getEdgeIntersection(a, b, codeOut, bounds, round);
				newCode = this._getBitCode(p, bounds);
	
				if (codeOut === codeA) {
					a = p;
					codeA = newCode;
				} else {
					b = p;
					codeB = newCode;
				}
			}
		},
	
		_getEdgeIntersection: function (a, b, code, bounds, round) {
			var dx = b.x - a.x,
			    dy = b.y - a.y,
			    min = bounds.min,
			    max = bounds.max,
			    x, y;
	
			if (code & 8) { // top
				x = a.x + dx * (max.y - a.y) / dy;
				y = max.y;
	
			} else if (code & 4) { // bottom
				x = a.x + dx * (min.y - a.y) / dy;
				y = min.y;
	
			} else if (code & 2) { // right
				x = max.x;
				y = a.y + dy * (max.x - a.x) / dx;
	
			} else if (code & 1) { // left
				x = min.x;
				y = a.y + dy * (min.x - a.x) / dx;
			}
	
			return new L.Point(x, y, round);
		},
	
		_getBitCode: function (p, bounds) {
			var code = 0;
	
			if (p.x < bounds.min.x) { // left
				code |= 1;
			} else if (p.x > bounds.max.x) { // right
				code |= 2;
			}
	
			if (p.y < bounds.min.y) { // bottom
				code |= 4;
			} else if (p.y > bounds.max.y) { // top
				code |= 8;
			}
	
			return code;
		},
	
		// square distance (to avoid unnecessary Math.sqrt calls)
		_sqDist: function (p1, p2) {
			var dx = p2.x - p1.x,
			    dy = p2.y - p1.y;
			return dx * dx + dy * dy;
		},
	
		// return closest point on segment or distance to that point
		_sqClosestPointOnSegment: function (p, p1, p2, sqDist) {
			var x = p1.x,
			    y = p1.y,
			    dx = p2.x - x,
			    dy = p2.y - y,
			    dot = dx * dx + dy * dy,
			    t;
	
			if (dot > 0) {
				t = ((p.x - x) * dx + (p.y - y) * dy) / dot;
	
				if (t > 1) {
					x = p2.x;
					y = p2.y;
				} else if (t > 0) {
					x += dx * t;
					y += dy * t;
				}
			}
	
			dx = p.x - x;
			dy = p.y - y;
	
			return sqDist ? dx * dx + dy * dy : new L.Point(x, y);
		}
	};
	
	
	
	/*
	 * @class Polyline
	 * @aka L.Polyline
	 * @inherits Path
	 *
	 * A class for drawing polyline overlays on a map. Extends `Path`.
	 *
	 * @example
	 *
	 * ```js
	 * // create a red polyline from an array of LatLng points
	 * var latlngs = [
	 * 	[-122.68, 45.51],
	 * 	[-122.43, 37.77],
	 * 	[-118.2, 34.04]
	 * ];
	 *
	 * var polyline = L.polyline(latlngs, {color: 'red'}).addTo(map);
	 *
	 * // zoom the map to the polyline
	 * map.fitBounds(polyline.getBounds());
	 * ```
	 *
	 * You can also pass a multi-dimensional array to represent a `MultiPolyline` shape:
	 *
	 * ```js
	 * // create a red polyline from an array of arrays of LatLng points
	 * var latlngs = [
	 * 	[[-122.68, 45.51],
	 * 	 [-122.43, 37.77],
	 * 	 [-118.2, 34.04]],
	 * 	[[-73.91, 40.78],
	 * 	 [-87.62, 41.83],
	 * 	 [-96.72, 32.76]]
	 * ];
	 * ```
	 */
	
	L.Polyline = L.Path.extend({
	
		// @section
		// @aka Polyline options
		options: {
			// @option smoothFactor: Number = 1.0
			// How much to simplify the polyline on each zoom level. More means
			// better performance and smoother look, and less means more accurate representation.
			smoothFactor: 1.0,
	
			// @option noClip: Boolean = false
			// Disable polyline clipping.
			noClip: false
		},
	
		initialize: function (latlngs, options) {
			L.setOptions(this, options);
			this._setLatLngs(latlngs);
		},
	
		// @method getLatLngs(): LatLng[]
		// Returns an array of the points in the path, or nested arrays of points in case of multi-polyline.
		getLatLngs: function () {
			return this._latlngs;
		},
	
		// @method setLatLngs(latlngs: LatLng[]): this
		// Replaces all the points in the polyline with the given array of geographical points.
		setLatLngs: function (latlngs) {
			this._setLatLngs(latlngs);
			return this.redraw();
		},
	
		// @method isEmpty(): Boolean
		// Returns `true` if the Polyline has no LatLngs.
		isEmpty: function () {
			return !this._latlngs.length;
		},
	
		closestLayerPoint: function (p) {
			var minDistance = Infinity,
			    minPoint = null,
			    closest = L.LineUtil._sqClosestPointOnSegment,
			    p1, p2;
	
			for (var j = 0, jLen = this._parts.length; j < jLen; j++) {
				var points = this._parts[j];
	
				for (var i = 1, len = points.length; i < len; i++) {
					p1 = points[i - 1];
					p2 = points[i];
	
					var sqDist = closest(p, p1, p2, true);
	
					if (sqDist < minDistance) {
						minDistance = sqDist;
						minPoint = closest(p, p1, p2);
					}
				}
			}
			if (minPoint) {
				minPoint.distance = Math.sqrt(minDistance);
			}
			return minPoint;
		},
	
		// @method getCenter(): LatLng
		// Returns the center ([centroid](http://en.wikipedia.org/wiki/Centroid)) of the polyline.
		getCenter: function () {
			// throws error when not yet added to map as this center calculation requires projected coordinates
			if (!this._map) {
				throw new Error('Must add layer to map before using getCenter()');
			}
	
			var i, halfDist, segDist, dist, p1, p2, ratio,
			    points = this._rings[0],
			    len = points.length;
	
			if (!len) { return null; }
	
			// polyline centroid algorithm; only uses the first ring if there are multiple
	
			for (i = 0, halfDist = 0; i < len - 1; i++) {
				halfDist += points[i].distanceTo(points[i + 1]) / 2;
			}
	
			// The line is so small in the current view that all points are on the same pixel.
			if (halfDist === 0) {
				return this._map.layerPointToLatLng(points[0]);
			}
	
			for (i = 0, dist = 0; i < len - 1; i++) {
				p1 = points[i];
				p2 = points[i + 1];
				segDist = p1.distanceTo(p2);
				dist += segDist;
	
				if (dist > halfDist) {
					ratio = (dist - halfDist) / segDist;
					return this._map.layerPointToLatLng([
						p2.x - ratio * (p2.x - p1.x),
						p2.y - ratio * (p2.y - p1.y)
					]);
				}
			}
		},
	
		// @method getBounds(): LatLngBounds
		// Returns the `LatLngBounds` of the path.
		getBounds: function () {
			return this._bounds;
		},
	
		// @method addLatLng(latlng: LatLng, latlngs? LatLng[]): this
		// Adds a given point to the polyline. By default, adds to the first ring of
		// the polyline in case of a multi-polyline, but can be overridden by passing
		// a specific ring as a LatLng array (that you can earlier access with [`getLatLngs`](#polyline-getlatlngs)).
		addLatLng: function (latlng, latlngs) {
			latlngs = latlngs || this._defaultShape();
			latlng = L.latLng(latlng);
			latlngs.push(latlng);
			this._bounds.extend(latlng);
			return this.redraw();
		},
	
		_setLatLngs: function (latlngs) {
			this._bounds = new L.LatLngBounds();
			this._latlngs = this._convertLatLngs(latlngs);
		},
	
		_defaultShape: function () {
			return L.Polyline._flat(this._latlngs) ? this._latlngs : this._latlngs[0];
		},
	
		// recursively convert latlngs input into actual LatLng instances; calculate bounds along the way
		_convertLatLngs: function (latlngs) {
			var result = [],
			    flat = L.Polyline._flat(latlngs);
	
			for (var i = 0, len = latlngs.length; i < len; i++) {
				if (flat) {
					result[i] = L.latLng(latlngs[i]);
					this._bounds.extend(result[i]);
				} else {
					result[i] = this._convertLatLngs(latlngs[i]);
				}
			}
	
			return result;
		},
	
		_project: function () {
			var pxBounds = new L.Bounds();
			this._rings = [];
			this._projectLatlngs(this._latlngs, this._rings, pxBounds);
	
			var w = this._clickTolerance(),
			    p = new L.Point(w, w);
	
			if (this._bounds.isValid() && pxBounds.isValid()) {
				pxBounds.min._subtract(p);
				pxBounds.max._add(p);
				this._pxBounds = pxBounds;
			}
		},
	
		// recursively turns latlngs into a set of rings with projected coordinates
		_projectLatlngs: function (latlngs, result, projectedBounds) {
			var flat = latlngs[0] instanceof L.LatLng,
			    len = latlngs.length,
			    i, ring;
	
			if (flat) {
				ring = [];
				for (i = 0; i < len; i++) {
					ring[i] = this._map.latLngToLayerPoint(latlngs[i]);
					projectedBounds.extend(ring[i]);
				}
				result.push(ring);
			} else {
				for (i = 0; i < len; i++) {
					this._projectLatlngs(latlngs[i], result, projectedBounds);
				}
			}
		},
	
		// clip polyline by renderer bounds so that we have less to render for performance
		_clipPoints: function () {
			var bounds = this._renderer._bounds;
	
			this._parts = [];
			if (!this._pxBounds || !this._pxBounds.intersects(bounds)) {
				return;
			}
	
			if (this.options.noClip) {
				this._parts = this._rings;
				return;
			}
	
			var parts = this._parts,
			    i, j, k, len, len2, segment, points;
	
			for (i = 0, k = 0, len = this._rings.length; i < len; i++) {
				points = this._rings[i];
	
				for (j = 0, len2 = points.length; j < len2 - 1; j++) {
					segment = L.LineUtil.clipSegment(points[j], points[j + 1], bounds, j, true);
	
					if (!segment) { continue; }
	
					parts[k] = parts[k] || [];
					parts[k].push(segment[0]);
	
					// if segment goes out of screen, or it's the last one, it's the end of the line part
					if ((segment[1] !== points[j + 1]) || (j === len2 - 2)) {
						parts[k].push(segment[1]);
						k++;
					}
				}
			}
		},
	
		// simplify each clipped part of the polyline for performance
		_simplifyPoints: function () {
			var parts = this._parts,
			    tolerance = this.options.smoothFactor;
	
			for (var i = 0, len = parts.length; i < len; i++) {
				parts[i] = L.LineUtil.simplify(parts[i], tolerance);
			}
		},
	
		_update: function () {
			if (!this._map) { return; }
	
			this._clipPoints();
			this._simplifyPoints();
			this._updatePath();
		},
	
		_updatePath: function () {
			this._renderer._updatePoly(this);
		}
	});
	
	// @factory L.polyline(latlngs: LatLng[], options?: Polyline options)
	// Instantiates a polyline object given an array of geographical points and
	// optionally an options object. You can create a `Polyline` object with
	// multiple separate lines (`MultiPolyline`) by passing an array of arrays
	// of geographic points.
	L.polyline = function (latlngs, options) {
		return new L.Polyline(latlngs, options);
	};
	
	L.Polyline._flat = function (latlngs) {
		// true if it's a flat array of latlngs; false if nested
		return !L.Util.isArray(latlngs[0]) || (typeof latlngs[0][0] !== 'object' && typeof latlngs[0][0] !== 'undefined');
	};
	
	
	
	/*
	 * @namespace PolyUtil
	 * Various utility functions for polygon geometries.
	 */
	
	L.PolyUtil = {};
	
	/* @function clipPolygon(points: Point[], bounds: Bounds, round?: Boolean): Point[]
	 * Clips the polygon geometry defined by the given `points` by the given bounds (using the [Sutherland-Hodgeman algorithm](https://en.wikipedia.org/wiki/Sutherland%E2%80%93Hodgman_algorithm)).
	 * Used by Leaflet to only show polygon points that are on the screen or near, increasing
	 * performance. Note that polygon points needs different algorithm for clipping
	 * than polyline, so there's a seperate method for it.
	 */
	L.PolyUtil.clipPolygon = function (points, bounds, round) {
		var clippedPoints,
		    edges = [1, 4, 2, 8],
		    i, j, k,
		    a, b,
		    len, edge, p,
		    lu = L.LineUtil;
	
		for (i = 0, len = points.length; i < len; i++) {
			points[i]._code = lu._getBitCode(points[i], bounds);
		}
	
		// for each edge (left, bottom, right, top)
		for (k = 0; k < 4; k++) {
			edge = edges[k];
			clippedPoints = [];
	
			for (i = 0, len = points.length, j = len - 1; i < len; j = i++) {
				a = points[i];
				b = points[j];
	
				// if a is inside the clip window
				if (!(a._code & edge)) {
					// if b is outside the clip window (a->b goes out of screen)
					if (b._code & edge) {
						p = lu._getEdgeIntersection(b, a, edge, bounds, round);
						p._code = lu._getBitCode(p, bounds);
						clippedPoints.push(p);
					}
					clippedPoints.push(a);
	
				// else if b is inside the clip window (a->b enters the screen)
				} else if (!(b._code & edge)) {
					p = lu._getEdgeIntersection(b, a, edge, bounds, round);
					p._code = lu._getBitCode(p, bounds);
					clippedPoints.push(p);
				}
			}
			points = clippedPoints;
		}
	
		return points;
	};
	
	
	
	/*
	 * @class Polygon
	 * @aka L.Polygon
	 * @inherits Polyline
	 *
	 * A class for drawing polygon overlays on a map. Extends `Polyline`.
	 *
	 * Note that points you pass when creating a polygon shouldn't have an additional last point equal to the first one — it's better to filter out such points.
	 *
	 *
	 * @example
	 *
	 * ```js
	 * // create a red polygon from an array of LatLng points
	 * var latlngs = [[-111.03, 41],[-111.04, 45],[-104.05, 45],[-104.05, 41]];
	 *
	 * var polygon = L.polygon(latlngs, {color: 'red'}).addTo(map);
	 *
	 * // zoom the map to the polygon
	 * map.fitBounds(polygon.getBounds());
	 * ```
	 *
	 * You can also pass an array of arrays of latlngs, with the first array representing the outer shape and the other arrays representing holes in the outer shape:
	 *
	 * ```js
	 * var latlngs = [
	 *   [[-111.03, 41],[-111.04, 45],[-104.05, 45],[-104.05, 41]], // outer ring
	 *   [[-108.58,37.29],[-108.58,40.71],[-102.50,40.71],[-102.50,37.29]] // hole
	 * ];
	 * ```
	 *
	 * Additionally, you can pass a multi-dimensional array to represent a MultiPolygon shape.
	 *
	 * ```js
	 * var latlngs = [
	 *   [ // first polygon
	 *     [[-111.03, 41],[-111.04, 45],[-104.05, 45],[-104.05, 41]], // outer ring
	 *     [[-108.58,37.29],[-108.58,40.71],[-102.50,40.71],[-102.50,37.29]] // hole
	 *   ],
	 *   [ // second polygon
	 *     [[-109.05, 37],[-109.03, 41],[-102.05, 41],[-102.04, 37],[-109.05, 38]]
	 *   ]
	 * ];
	 * ```
	 */
	
	L.Polygon = L.Polyline.extend({
	
		options: {
			fill: true
		},
	
		isEmpty: function () {
			return !this._latlngs.length || !this._latlngs[0].length;
		},
	
		getCenter: function () {
			// throws error when not yet added to map as this center calculation requires projected coordinates
			if (!this._map) {
				throw new Error('Must add layer to map before using getCenter()');
			}
	
			var i, j, p1, p2, f, area, x, y, center,
			    points = this._rings[0],
			    len = points.length;
	
			if (!len) { return null; }
	
			// polygon centroid algorithm; only uses the first ring if there are multiple
	
			area = x = y = 0;
	
			for (i = 0, j = len - 1; i < len; j = i++) {
				p1 = points[i];
				p2 = points[j];
	
				f = p1.y * p2.x - p2.y * p1.x;
				x += (p1.x + p2.x) * f;
				y += (p1.y + p2.y) * f;
				area += f * 3;
			}
	
			if (area === 0) {
				// Polygon is so small that all points are on same pixel.
				center = points[0];
			} else {
				center = [x / area, y / area];
			}
			return this._map.layerPointToLatLng(center);
		},
	
		_convertLatLngs: function (latlngs) {
			var result = L.Polyline.prototype._convertLatLngs.call(this, latlngs),
			    len = result.length;
	
			// remove last point if it equals first one
			if (len >= 2 && result[0] instanceof L.LatLng && result[0].equals(result[len - 1])) {
				result.pop();
			}
			return result;
		},
	
		_setLatLngs: function (latlngs) {
			L.Polyline.prototype._setLatLngs.call(this, latlngs);
			if (L.Polyline._flat(this._latlngs)) {
				this._latlngs = [this._latlngs];
			}
		},
	
		_defaultShape: function () {
			return L.Polyline._flat(this._latlngs[0]) ? this._latlngs[0] : this._latlngs[0][0];
		},
	
		_clipPoints: function () {
			// polygons need a different clipping algorithm so we redefine that
	
			var bounds = this._renderer._bounds,
			    w = this.options.weight,
			    p = new L.Point(w, w);
	
			// increase clip padding by stroke width to avoid stroke on clip edges
			bounds = new L.Bounds(bounds.min.subtract(p), bounds.max.add(p));
	
			this._parts = [];
			if (!this._pxBounds || !this._pxBounds.intersects(bounds)) {
				return;
			}
	
			if (this.options.noClip) {
				this._parts = this._rings;
				return;
			}
	
			for (var i = 0, len = this._rings.length, clipped; i < len; i++) {
				clipped = L.PolyUtil.clipPolygon(this._rings[i], bounds, true);
				if (clipped.length) {
					this._parts.push(clipped);
				}
			}
		},
	
		_updatePath: function () {
			this._renderer._updatePoly(this, true);
		}
	});
	
	
	// @factory L.polygon(latlngs: LatLng[], options?: Polyline options)
	L.polygon = function (latlngs, options) {
		return new L.Polygon(latlngs, options);
	};
	
	
	
	/*
	 * L.Rectangle extends Polygon and creates a rectangle when passed a LatLngBounds object.
	 */
	
	/*
	 * @class Rectangle
	 * @aka L.Retangle
	 * @inherits Polygon
	 *
	 * A class for drawing rectangle overlays on a map. Extends `Polygon`.
	 *
	 * @example
	 *
	 * ```js
	 * // define rectangle geographical bounds
	 * var bounds = [[54.559322, -5.767822], [56.1210604, -3.021240]];
	 *
	 * // create an orange rectangle
	 * L.rectangle(bounds, {color: "#ff7800", weight: 1}).addTo(map);
	 *
	 * // zoom the map to the rectangle bounds
	 * map.fitBounds(bounds);
	 * ```
	 *
	 */
	
	
	L.Rectangle = L.Polygon.extend({
		initialize: function (latLngBounds, options) {
			L.Polygon.prototype.initialize.call(this, this._boundsToLatLngs(latLngBounds), options);
		},
	
		// @method setBounds(latLngBounds: LatLngBounds): this
		// Redraws the rectangle with the passed bounds.
		setBounds: function (latLngBounds) {
			return this.setLatLngs(this._boundsToLatLngs(latLngBounds));
		},
	
		_boundsToLatLngs: function (latLngBounds) {
			latLngBounds = L.latLngBounds(latLngBounds);
			return [
				latLngBounds.getSouthWest(),
				latLngBounds.getNorthWest(),
				latLngBounds.getNorthEast(),
				latLngBounds.getSouthEast()
			];
		}
	});
	
	
	// @factory L.rectangle(latLngBounds: LatLngBounds, options?: Polyline options)
	L.rectangle = function (latLngBounds, options) {
		return new L.Rectangle(latLngBounds, options);
	};
	
	
	
	/*
	 * @class CircleMarker
	 * @aka L.CircleMarker
	 * @inherits Path
	 *
	 * A circle of a fixed size with radius specified in pixels. Extends `Path`.
	 */
	
	L.CircleMarker = L.Path.extend({
	
		// @section
		// @aka CircleMarker options
		options: {
			fill: true,
	
			// @option radius: Number = 10
			// Radius of the circle marker, in pixels
			radius: 10
		},
	
		initialize: function (latlng, options) {
			L.setOptions(this, options);
			this._latlng = L.latLng(latlng);
			this._radius = this.options.radius;
		},
	
		// @method setLatLng(latLng: LatLng): this
		// Sets the position of a circle marker to a new location.
		setLatLng: function (latlng) {
			this._latlng = L.latLng(latlng);
			this.redraw();
			return this.fire('move', {latlng: this._latlng});
		},
	
		// @method getLatLng(): LatLng
		// Returns the current geographical position of the circle marker
		getLatLng: function () {
			return this._latlng;
		},
	
		// @method setRadius(radius: Number): this
		// Sets the radius of a circle marker. Units are in pixels.
		setRadius: function (radius) {
			this.options.radius = this._radius = radius;
			return this.redraw();
		},
	
		// @method getRadius(): Number
		// Returns the current radius of the circle
		getRadius: function () {
			return this._radius;
		},
	
		setStyle : function (options) {
			var radius = options && options.radius || this._radius;
			L.Path.prototype.setStyle.call(this, options);
			this.setRadius(radius);
			return this;
		},
	
		_project: function () {
			this._point = this._map.latLngToLayerPoint(this._latlng);
			this._updateBounds();
		},
	
		_updateBounds: function () {
			var r = this._radius,
			    r2 = this._radiusY || r,
			    w = this._clickTolerance(),
			    p = [r + w, r2 + w];
			this._pxBounds = new L.Bounds(this._point.subtract(p), this._point.add(p));
		},
	
		_update: function () {
			if (this._map) {
				this._updatePath();
			}
		},
	
		_updatePath: function () {
			this._renderer._updateCircle(this);
		},
	
		_empty: function () {
			return this._radius && !this._renderer._bounds.intersects(this._pxBounds);
		}
	});
	
	
	// @factory L.circleMarker(latlng: LatLng, options?: CircleMarker options)
	// Instantiates a circle marker object given a geographical point, and an optional options object.
	L.circleMarker = function (latlng, options) {
		return new L.CircleMarker(latlng, options);
	};
	
	
	
	/*
	 * @class Circle
	 * @aka L.Circle
	 * @inherits CircleMarker
	 *
	 * A class for drawing circle overlays on a map. Extends `CircleMarker`.
	 *
	 * It's an approximation and starts to diverge from a real circle closer to poles (due to projection distortion).
	 *
	 * @example
	 *
	 * ```js
	 * L.circle([50.5, 30.5], {radius: 200}).addTo(map);
	 * ```
	 */
	
	L.Circle = L.CircleMarker.extend({
	
		initialize: function (latlng, options, legacyOptions) {
			if (typeof options === 'number') {
				// Backwards compatibility with 0.7.x factory (latlng, radius, options?)
				options = L.extend({}, legacyOptions, {radius: options});
			}
			L.setOptions(this, options);
			this._latlng = L.latLng(latlng);
	
			if (isNaN(this.options.radius)) { throw new Error('Circle radius cannot be NaN'); }
	
			// @section
			// @aka Circle options
			// @option radius: Number; Radius of the circle, in meters.
			this._mRadius = this.options.radius;
		},
	
		// @method setRadius(radius: Number): this
		// Sets the radius of a circle. Units are in meters.
		setRadius: function (radius) {
			this._mRadius = radius;
			return this.redraw();
		},
	
		// @method getRadius(): Number
		// Returns the current radius of a circle. Units are in meters.
		getRadius: function () {
			return this._mRadius;
		},
	
		// @method getBounds(): LatLngBounds
		// Returns the `LatLngBounds` of the path.
		getBounds: function () {
			var half = [this._radius, this._radiusY || this._radius];
	
			return new L.LatLngBounds(
				this._map.layerPointToLatLng(this._point.subtract(half)),
				this._map.layerPointToLatLng(this._point.add(half)));
		},
	
		setStyle: L.Path.prototype.setStyle,
	
		_project: function () {
	
			var lng = this._latlng.lng,
			    lat = this._latlng.lat,
			    map = this._map,
			    crs = map.options.crs;
	
			if (crs.distance === L.CRS.Earth.distance) {
				var d = Math.PI / 180,
				    latR = (this._mRadius / L.CRS.Earth.R) / d,
				    top = map.project([lat + latR, lng]),
				    bottom = map.project([lat - latR, lng]),
				    p = top.add(bottom).divideBy(2),
				    lat2 = map.unproject(p).lat,
				    lngR = Math.acos((Math.cos(latR * d) - Math.sin(lat * d) * Math.sin(lat2 * d)) /
				            (Math.cos(lat * d) * Math.cos(lat2 * d))) / d;
	
				if (isNaN(lngR) || lngR === 0) {
					lngR = latR / Math.cos(Math.PI / 180 * lat); // Fallback for edge case, #2425
				}
	
				this._point = p.subtract(map.getPixelOrigin());
				this._radius = isNaN(lngR) ? 0 : Math.max(Math.round(p.x - map.project([lat2, lng - lngR]).x), 1);
				this._radiusY = Math.max(Math.round(p.y - top.y), 1);
	
			} else {
				var latlng2 = crs.unproject(crs.project(this._latlng).subtract([this._mRadius, 0]));
	
				this._point = map.latLngToLayerPoint(this._latlng);
				this._radius = this._point.x - map.latLngToLayerPoint(latlng2).x;
			}
	
			this._updateBounds();
		}
	});
	
	// @factory L.circle(latlng: LatLng, options?: Circle options)
	// Instantiates a circle object given a geographical point, and an options object
	// which contains the circle radius.
	// @alternative
	// @factory L.circle(latlng: LatLng, radius: Number, options?: Circle options)
	// Obsolete way of instantiating a circle, for compatibility with 0.7.x code.
	// Do not use in new applications or plugins.
	L.circle = function (latlng, options, legacyOptions) {
		return new L.Circle(latlng, options, legacyOptions);
	};
	
	
	
	/*
	 * @class SVG
	 * @inherits Renderer
	 * @aka L.SVG
	 *
	 * Allows vector layers to be displayed with [SVG](https://developer.mozilla.org/docs/Web/SVG).
	 * Inherits `Renderer`.
	 *
	 * Due to [technical limitations](http://caniuse.com/#search=svg), SVG is not
	 * available in all web browsers, notably Android 2.x and 3.x.
	 *
	 * Although SVG is not available on IE7 and IE8, these browsers support
	 * [VML](https://en.wikipedia.org/wiki/Vector_Markup_Language)
	 * (a now deprecated technology), and the SVG renderer will fall back to VML in
	 * this case.
	 *
	 * @example
	 *
	 * Use SVG by default for all paths in the map:
	 *
	 * ```js
	 * var map = L.map('map', {
	 * 	renderer: L.svg()
	 * });
	 * ```
	 *
	 * Use a SVG renderer with extra padding for specific vector geometries:
	 *
	 * ```js
	 * var map = L.map('map');
	 * var myRenderer = L.svg({ padding: 0.5 });
	 * var line = L.polyline( coordinates, { renderer: myRenderer } );
	 * var circle = L.circle( center, { renderer: myRenderer } );
	 * ```
	 */
	
	L.SVG = L.Renderer.extend({
	
		getEvents: function () {
			var events = L.Renderer.prototype.getEvents.call(this);
			events.zoomstart = this._onZoomStart;
			return events;
		},
	
		_initContainer: function () {
			this._container = L.SVG.create('svg');
	
			// makes it possible to click through svg root; we'll reset it back in individual paths
			this._container.setAttribute('pointer-events', 'none');
	
			this._rootGroup = L.SVG.create('g');
			this._container.appendChild(this._rootGroup);
		},
	
		_onZoomStart: function () {
			// Drag-then-pinch interactions might mess up the center and zoom.
			// In this case, the easiest way to prevent this is re-do the renderer
			//   bounds and padding when the zooming starts.
			this._update();
		},
	
		_update: function () {
			if (this._map._animatingZoom && this._bounds) { return; }
	
			L.Renderer.prototype._update.call(this);
	
			var b = this._bounds,
			    size = b.getSize(),
			    container = this._container;
	
			// set size of svg-container if changed
			if (!this._svgSize || !this._svgSize.equals(size)) {
				this._svgSize = size;
				container.setAttribute('width', size.x);
				container.setAttribute('height', size.y);
			}
	
			// movement: update container viewBox so that we don't have to change coordinates of individual layers
			L.DomUtil.setPosition(container, b.min);
			container.setAttribute('viewBox', [b.min.x, b.min.y, size.x, size.y].join(' '));
	
			this.fire('update');
		},
	
		// methods below are called by vector layers implementations
	
		_initPath: function (layer) {
			var path = layer._path = L.SVG.create('path');
	
			// @namespace Path
			// @option className: String = null
			// Custom class name set on an element. Only for SVG renderer.
			if (layer.options.className) {
				L.DomUtil.addClass(path, layer.options.className);
			}
	
			if (layer.options.interactive) {
				L.DomUtil.addClass(path, 'leaflet-interactive');
			}
	
			this._updateStyle(layer);
		},
	
		_addPath: function (layer) {
			this._rootGroup.appendChild(layer._path);
			layer.addInteractiveTarget(layer._path);
		},
	
		_removePath: function (layer) {
			L.DomUtil.remove(layer._path);
			layer.removeInteractiveTarget(layer._path);
		},
	
		_updatePath: function (layer) {
			layer._project();
			layer._update();
		},
	
		_updateStyle: function (layer) {
			var path = layer._path,
			    options = layer.options;
	
			if (!path) { return; }
	
			if (options.stroke) {
				path.setAttribute('stroke', options.color);
				path.setAttribute('stroke-opacity', options.opacity);
				path.setAttribute('stroke-width', options.weight);
				path.setAttribute('stroke-linecap', options.lineCap);
				path.setAttribute('stroke-linejoin', options.lineJoin);
	
				if (options.dashArray) {
					path.setAttribute('stroke-dasharray', options.dashArray);
				} else {
					path.removeAttribute('stroke-dasharray');
				}
	
				if (options.dashOffset) {
					path.setAttribute('stroke-dashoffset', options.dashOffset);
				} else {
					path.removeAttribute('stroke-dashoffset');
				}
			} else {
				path.setAttribute('stroke', 'none');
			}
	
			if (options.fill) {
				path.setAttribute('fill', options.fillColor || options.color);
				path.setAttribute('fill-opacity', options.fillOpacity);
				path.setAttribute('fill-rule', options.fillRule || 'evenodd');
			} else {
				path.setAttribute('fill', 'none');
			}
		},
	
		_updatePoly: function (layer, closed) {
			this._setPath(layer, L.SVG.pointsToPath(layer._parts, closed));
		},
	
		_updateCircle: function (layer) {
			var p = layer._point,
			    r = layer._radius,
			    r2 = layer._radiusY || r,
			    arc = 'a' + r + ',' + r2 + ' 0 1,0 ';
	
			// drawing a circle with two half-arcs
			var d = layer._empty() ? 'M0 0' :
					'M' + (p.x - r) + ',' + p.y +
					arc + (r * 2) + ',0 ' +
					arc + (-r * 2) + ',0 ';
	
			this._setPath(layer, d);
		},
	
		_setPath: function (layer, path) {
			layer._path.setAttribute('d', path);
		},
	
		// SVG does not have the concept of zIndex so we resort to changing the DOM order of elements
		_bringToFront: function (layer) {
			L.DomUtil.toFront(layer._path);
		},
	
		_bringToBack: function (layer) {
			L.DomUtil.toBack(layer._path);
		}
	});
	
	
	// @namespace SVG; @section
	// There are several static functions which can be called without instantiating L.SVG:
	L.extend(L.SVG, {
		// @function create(name: String): SVGElement
		// Returns a instance of [SVGElement](https://developer.mozilla.org/docs/Web/API/SVGElement),
		// corresponding to the class name passed. For example, using 'line' will return
		// an instance of [SVGLineElement](https://developer.mozilla.org/docs/Web/API/SVGLineElement).
		create: function (name) {
			return document.createElementNS('http://www.w3.org/2000/svg', name);
		},
	
		// @function pointsToPath(rings: Point[], closed: Boolean): String
		// Generates a SVG path string for multiple rings, with each ring turning
		// into "M..L..L.." instructions
		pointsToPath: function (rings, closed) {
			var str = '',
			    i, j, len, len2, points, p;
	
			for (i = 0, len = rings.length; i < len; i++) {
				points = rings[i];
	
				for (j = 0, len2 = points.length; j < len2; j++) {
					p = points[j];
					str += (j ? 'L' : 'M') + p.x + ' ' + p.y;
				}
	
				// closes the ring for polygons; "x" is VML syntax
				str += closed ? (L.Browser.svg ? 'z' : 'x') : '';
			}
	
			// SVG complains about empty path strings
			return str || 'M0 0';
		}
	});
	
	// @namespace Browser; @property svg: Boolean
	// `true` when the browser supports [SVG](https://developer.mozilla.org/docs/Web/SVG).
	L.Browser.svg = !!(document.createElementNS && L.SVG.create('svg').createSVGRect);
	
	
	// @namespace SVG
	// @factory L.svg(options?: Renderer options)
	// Creates a SVG renderer with the given options.
	L.svg = function (options) {
		return L.Browser.svg || L.Browser.vml ? new L.SVG(options) : null;
	};
	
	
	
	/*
	 * Thanks to Dmitry Baranovsky and his Raphael library for inspiration!
	 */
	
	/*
	 * @class SVG
	 *
	 * Although SVG is not available on IE7 and IE8, these browsers support [VML](https://en.wikipedia.org/wiki/Vector_Markup_Language), and the SVG renderer will fall back to VML in this case.
	 *
	 * VML was deprecated in 2012, which means VML functionality exists only for backwards compatibility
	 * with old versions of Internet Explorer.
	 */
	
	// @namespace Browser; @property vml: Boolean
	// `true` if the browser supports [VML](https://en.wikipedia.org/wiki/Vector_Markup_Language).
	L.Browser.vml = !L.Browser.svg && (function () {
		try {
			var div = document.createElement('div');
			div.innerHTML = '<v:shape adj="1"/>';
	
			var shape = div.firstChild;
			shape.style.behavior = 'url(#default#VML)';
	
			return shape && (typeof shape.adj === 'object');
	
		} catch (e) {
			return false;
		}
	}());
	
	// redefine some SVG methods to handle VML syntax which is similar but with some differences
	L.SVG.include(!L.Browser.vml ? {} : {
	
		_initContainer: function () {
			this._container = L.DomUtil.create('div', 'leaflet-vml-container');
		},
	
		_update: function () {
			if (this._map._animatingZoom) { return; }
			L.Renderer.prototype._update.call(this);
			this.fire('update');
		},
	
		_initPath: function (layer) {
			var container = layer._container = L.SVG.create('shape');
	
			L.DomUtil.addClass(container, 'leaflet-vml-shape ' + (this.options.className || ''));
	
			container.coordsize = '1 1';
	
			layer._path = L.SVG.create('path');
			container.appendChild(layer._path);
	
			this._updateStyle(layer);
		},
	
		_addPath: function (layer) {
			var container = layer._container;
			this._container.appendChild(container);
	
			if (layer.options.interactive) {
				layer.addInteractiveTarget(container);
			}
		},
	
		_removePath: function (layer) {
			var container = layer._container;
			L.DomUtil.remove(container);
			layer.removeInteractiveTarget(container);
		},
	
		_updateStyle: function (layer) {
			var stroke = layer._stroke,
			    fill = layer._fill,
			    options = layer.options,
			    container = layer._container;
	
			container.stroked = !!options.stroke;
			container.filled = !!options.fill;
	
			if (options.stroke) {
				if (!stroke) {
					stroke = layer._stroke = L.SVG.create('stroke');
				}
				container.appendChild(stroke);
				stroke.weight = options.weight + 'px';
				stroke.color = options.color;
				stroke.opacity = options.opacity;
	
				if (options.dashArray) {
					stroke.dashStyle = L.Util.isArray(options.dashArray) ?
					    options.dashArray.join(' ') :
					    options.dashArray.replace(/( *, *)/g, ' ');
				} else {
					stroke.dashStyle = '';
				}
				stroke.endcap = options.lineCap.replace('butt', 'flat');
				stroke.joinstyle = options.lineJoin;
	
			} else if (stroke) {
				container.removeChild(stroke);
				layer._stroke = null;
			}
	
			if (options.fill) {
				if (!fill) {
					fill = layer._fill = L.SVG.create('fill');
				}
				container.appendChild(fill);
				fill.color = options.fillColor || options.color;
				fill.opacity = options.fillOpacity;
	
			} else if (fill) {
				container.removeChild(fill);
				layer._fill = null;
			}
		},
	
		_updateCircle: function (layer) {
			var p = layer._point.round(),
			    r = Math.round(layer._radius),
			    r2 = Math.round(layer._radiusY || r);
	
			this._setPath(layer, layer._empty() ? 'M0 0' :
					'AL ' + p.x + ',' + p.y + ' ' + r + ',' + r2 + ' 0,' + (65535 * 360));
		},
	
		_setPath: function (layer, path) {
			layer._path.v = path;
		},
	
		_bringToFront: function (layer) {
			L.DomUtil.toFront(layer._container);
		},
	
		_bringToBack: function (layer) {
			L.DomUtil.toBack(layer._container);
		}
	});
	
	if (L.Browser.vml) {
		L.SVG.create = (function () {
			try {
				document.namespaces.add('lvml', 'urn:schemas-microsoft-com:vml');
				return function (name) {
					return document.createElement('<lvml:' + name + ' class="lvml">');
				};
			} catch (e) {
				return function (name) {
					return document.createElement('<' + name + ' xmlns="urn:schemas-microsoft.com:vml" class="lvml">');
				};
			}
		})();
	}
	
	
	
	/*
	 * @class Canvas
	 * @inherits Renderer
	 * @aka L.Canvas
	 *
	 * Allows vector layers to be displayed with [`<canvas>`](https://developer.mozilla.org/docs/Web/API/Canvas_API).
	 * Inherits `Renderer`.
	 *
	 * Due to [technical limitations](http://caniuse.com/#search=canvas), Canvas is not
	 * available in all web browsers, notably IE8, and overlapping geometries might
	 * not display properly in some edge cases.
	 *
	 * @example
	 *
	 * Use Canvas by default for all paths in the map:
	 *
	 * ```js
	 * var map = L.map('map', {
	 * 	renderer: L.canvas()
	 * });
	 * ```
	 *
	 * Use a Canvas renderer with extra padding for specific vector geometries:
	 *
	 * ```js
	 * var map = L.map('map');
	 * var myRenderer = L.canvas({ padding: 0.5 });
	 * var line = L.polyline( coordinates, { renderer: myRenderer } );
	 * var circle = L.circle( center, { renderer: myRenderer } );
	 * ```
	 */
	
	L.Canvas = L.Renderer.extend({
	
		onAdd: function () {
			L.Renderer.prototype.onAdd.call(this);
	
			this._layers = this._layers || {};
	
			// Redraw vectors since canvas is cleared upon removal,
			// in case of removing the renderer itself from the map.
			this._draw();
		},
	
		_initContainer: function () {
			var container = this._container = document.createElement('canvas');
	
			L.DomEvent
				.on(container, 'mousemove', L.Util.throttle(this._onMouseMove, 32, this), this)
				.on(container, 'click dblclick mousedown mouseup contextmenu', this._onClick, this)
				.on(container, 'mouseout', this._handleMouseOut, this);
	
			this._ctx = container.getContext('2d');
		},
	
		_update: function () {
			if (this._map._animatingZoom && this._bounds) { return; }
	
			this._drawnLayers = {};
	
			L.Renderer.prototype._update.call(this);
	
			var b = this._bounds,
			    container = this._container,
			    size = b.getSize(),
			    m = L.Browser.retina ? 2 : 1;
	
			L.DomUtil.setPosition(container, b.min);
	
			// set canvas size (also clearing it); use double size on retina
			container.width = m * size.x;
			container.height = m * size.y;
			container.style.width = size.x + 'px';
			container.style.height = size.y + 'px';
	
			if (L.Browser.retina) {
				this._ctx.scale(2, 2);
			}
	
			// translate so we use the same path coordinates after canvas element moves
			this._ctx.translate(-b.min.x, -b.min.y);
	
			// Tell paths to redraw themselves
			this.fire('update');
		},
	
		_initPath: function (layer) {
			this._updateDashArray(layer);
			this._layers[L.stamp(layer)] = layer;
		},
	
		_addPath: L.Util.falseFn,
	
		_removePath: function (layer) {
			layer._removed = true;
			this._requestRedraw(layer);
		},
	
		_updatePath: function (layer) {
			this._redrawBounds = layer._pxBounds;
			this._draw(true);
			layer._project();
			layer._update();
			this._draw();
			this._redrawBounds = null;
		},
	
		_updateStyle: function (layer) {
			this._updateDashArray(layer);
			this._requestRedraw(layer);
		},
	
		_updateDashArray: function (layer) {
			if (layer.options.dashArray) {
				var parts = layer.options.dashArray.split(','),
				    dashArray = [],
				    i;
				for (i = 0; i < parts.length; i++) {
					dashArray.push(Number(parts[i]));
				}
				layer.options._dashArray = dashArray;
			}
		},
	
		_requestRedraw: function (layer) {
			if (!this._map) { return; }
	
			var padding = (layer.options.weight || 0) + 1;
			this._redrawBounds = this._redrawBounds || new L.Bounds();
			this._redrawBounds.extend(layer._pxBounds.min.subtract([padding, padding]));
			this._redrawBounds.extend(layer._pxBounds.max.add([padding, padding]));
	
			this._redrawRequest = this._redrawRequest || L.Util.requestAnimFrame(this._redraw, this);
		},
	
		_redraw: function () {
			this._redrawRequest = null;
	
			this._draw(true); // clear layers in redraw bounds
			this._draw(); // draw layers
	
			this._redrawBounds = null;
		},
	
		_draw: function (clear) {
			this._clear = clear;
			var layer, bounds = this._redrawBounds;
			this._ctx.save();
			if (bounds) {
				this._ctx.beginPath();
				this._ctx.rect(bounds.min.x, bounds.min.y, bounds.max.x - bounds.min.x, bounds.max.y - bounds.min.y);
				this._ctx.clip();
			}
	
			for (var id in this._layers) {
				layer = this._layers[id];
				if (!bounds || (layer._pxBounds && layer._pxBounds.intersects(bounds))) {
					layer._updatePath();
				}
				if (clear && layer._removed) {
					delete layer._removed;
					delete this._layers[id];
				}
			}
			this._ctx.restore();  // Restore state before clipping.
		},
	
		_updatePoly: function (layer, closed) {
	
			var i, j, len2, p,
			    parts = layer._parts,
			    len = parts.length,
			    ctx = this._ctx;
	
			if (!len) { return; }
	
			this._drawnLayers[layer._leaflet_id] = layer;
	
			ctx.beginPath();
	
			if (ctx.setLineDash) {
				ctx.setLineDash(layer.options && layer.options._dashArray || []);
			}
	
			for (i = 0; i < len; i++) {
				for (j = 0, len2 = parts[i].length; j < len2; j++) {
					p = parts[i][j];
					ctx[j ? 'lineTo' : 'moveTo'](p.x, p.y);
				}
				if (closed) {
					ctx.closePath();
				}
			}
	
			this._fillStroke(ctx, layer);
	
			// TODO optimization: 1 fill/stroke for all features with equal style instead of 1 for each feature
		},
	
		_updateCircle: function (layer) {
	
			if (layer._empty()) { return; }
	
			var p = layer._point,
			    ctx = this._ctx,
			    r = layer._radius,
			    s = (layer._radiusY || r) / r;
	
			this._drawnLayers[layer._leaflet_id] = layer;
	
			if (s !== 1) {
				ctx.save();
				ctx.scale(1, s);
			}
	
			ctx.beginPath();
			ctx.arc(p.x, p.y / s, r, 0, Math.PI * 2, false);
	
			if (s !== 1) {
				ctx.restore();
			}
	
			this._fillStroke(ctx, layer);
		},
	
		_fillStroke: function (ctx, layer) {
			var clear = this._clear,
			    options = layer.options;
	
			ctx.globalCompositeOperation = clear ? 'destination-out' : 'source-over';
	
			if (options.fill) {
				ctx.globalAlpha = clear ? 1 : options.fillOpacity;
				ctx.fillStyle = options.fillColor || options.color;
				ctx.fill(options.fillRule || 'evenodd');
			}
	
			if (options.stroke && options.weight !== 0) {
				ctx.globalAlpha = clear ? 1 : options.opacity;
	
				// if clearing shape, do it with the previously drawn line width
				layer._prevWeight = ctx.lineWidth = clear ? layer._prevWeight + 1 : options.weight;
	
				ctx.strokeStyle = options.color;
				ctx.lineCap = options.lineCap;
				ctx.lineJoin = options.lineJoin;
				ctx.stroke();
			}
		},
	
		// Canvas obviously doesn't have mouse events for individual drawn objects,
		// so we emulate that by calculating what's under the mouse on mousemove/click manually
	
		_onClick: function (e) {
			var point = this._map.mouseEventToLayerPoint(e), layers = [], layer;
	
			for (var id in this._layers) {
				layer = this._layers[id];
				if (layer.options.interactive && layer._containsPoint(point) && !this._map._draggableMoved(layer)) {
					L.DomEvent._fakeStop(e);
					layers.push(layer);
				}
			}
			if (layers.length)  {
				this._fireEvent(layers, e);
			}
		},
	
		_onMouseMove: function (e) {
			if (!this._map || this._map.dragging.moving() || this._map._animatingZoom) { return; }
	
			var point = this._map.mouseEventToLayerPoint(e);
			this._handleMouseOut(e, point);
			this._handleMouseHover(e, point);
		},
	
	
		_handleMouseOut: function (e, point) {
			var layer = this._hoveredLayer;
			if (layer && (e.type === 'mouseout' || !layer._containsPoint(point))) {
				// if we're leaving the layer, fire mouseout
				L.DomUtil.removeClass(this._container, 'leaflet-interactive');
				this._fireEvent([layer], e, 'mouseout');
				this._hoveredLayer = null;
			}
		},
	
		_handleMouseHover: function (e, point) {
			var id, layer;
	
			for (id in this._drawnLayers) {
				layer = this._drawnLayers[id];
				if (layer.options.interactive && layer._containsPoint(point)) {
					L.DomUtil.addClass(this._container, 'leaflet-interactive'); // change cursor
					this._fireEvent([layer], e, 'mouseover');
					this._hoveredLayer = layer;
				}
			}
	
			if (this._hoveredLayer) {
				this._fireEvent([this._hoveredLayer], e);
			}
		},
	
		_fireEvent: function (layers, e, type) {
			this._map._fireDOMEvent(e, type || e.type, layers);
		},
	
		// TODO _bringToFront & _bringToBack, pretty tricky
	
		_bringToFront: L.Util.falseFn,
		_bringToBack: L.Util.falseFn
	});
	
	// @namespace Browser; @property canvas: Boolean
	// `true` when the browser supports [`<canvas>`](https://developer.mozilla.org/docs/Web/API/Canvas_API).
	L.Browser.canvas = (function () {
		return !!document.createElement('canvas').getContext;
	}());
	
	// @namespace Canvas
	// @factory L.canvas(options?: Renderer options)
	// Creates a Canvas renderer with the given options.
	L.canvas = function (options) {
		return L.Browser.canvas ? new L.Canvas(options) : null;
	};
	
	L.Polyline.prototype._containsPoint = function (p, closed) {
		var i, j, k, len, len2, part,
		    w = this._clickTolerance();
	
		if (!this._pxBounds.contains(p)) { return false; }
	
		// hit detection for polylines
		for (i = 0, len = this._parts.length; i < len; i++) {
			part = this._parts[i];
	
			for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
				if (!closed && (j === 0)) { continue; }
	
				if (L.LineUtil.pointToSegmentDistance(p, part[k], part[j]) <= w) {
					return true;
				}
			}
		}
		return false;
	};
	
	L.Polygon.prototype._containsPoint = function (p) {
		var inside = false,
		    part, p1, p2, i, j, k, len, len2;
	
		if (!this._pxBounds.contains(p)) { return false; }
	
		// ray casting algorithm for detecting if point is in polygon
		for (i = 0, len = this._parts.length; i < len; i++) {
			part = this._parts[i];
	
			for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
				p1 = part[j];
				p2 = part[k];
	
				if (((p1.y > p.y) !== (p2.y > p.y)) && (p.x < (p2.x - p1.x) * (p.y - p1.y) / (p2.y - p1.y) + p1.x)) {
					inside = !inside;
				}
			}
		}
	
		// also check if it's on polygon stroke
		return inside || L.Polyline.prototype._containsPoint.call(this, p, true);
	};
	
	L.CircleMarker.prototype._containsPoint = function (p) {
		return p.distanceTo(this._point) <= this._radius + this._clickTolerance();
	};
	
	
	
	/*
	 * @class GeoJSON
	 * @aka L.GeoJSON
	 * @inherits FeatureGroup
	 *
	 * Represents a GeoJSON object or an array of GeoJSON objects. Allows you to parse
	 * GeoJSON data and display it on the map. Extends `FeatureGroup`.
	 *
	 * @example
	 *
	 * ```js
	 * L.geoJSON(data, {
	 * 	style: function (feature) {
	 * 		return {color: feature.properties.color};
	 * 	}
	 * }).bindPopup(function (layer) {
	 * 	return layer.feature.properties.description;
	 * }).addTo(map);
	 * ```
	 */
	
	L.GeoJSON = L.FeatureGroup.extend({
	
		/* @section
		 * @aka GeoJSON options
		 *
		 * @option pointToLayer: Function = *
		 * A `Function` defining how GeoJSON points spawn Leaflet layers. It is internally
		 * called when data is added, passing the GeoJSON point feature and its `LatLng`.
		 * The default is to spawn a default `Marker`:
		 * ```js
		 * function(geoJsonPoint, latlng) {
		 * 	return L.marker(latlng);
		 * }
		 * ```
		 *
		 * @option style: Function = *
		 * A `Function` defining the `Path options` for styling GeoJSON lines and polygons,
		 * called internally when data is added.
		 * The default value is to not override any defaults:
		 * ```js
		 * function (geoJsonFeature) {
		 * 	return {}
		 * }
		 * ```
		 *
		 * @option onEachFeature: Function = *
		 * A `Function` that will be called once for each created `Feature`, after it has
		 * been created and styled. Useful for attaching events and popups to features.
		 * The default is to do nothing with the newly created layers:
		 * ```js
		 * function (feature, layer) {}
		 * ```
		 *
		 * @option filter: Function = *
		 * A `Function` that will be used to decide whether to include a feature or not.
		 * The default is to include all features:
		 * ```js
		 * function (geoJsonFeature) {
		 * 	return true;
		 * }
		 * ```
		 * Note: dynamically changing the `filter` option will have effect only on newly
		 * added data. It will _not_ re-evaluate already included features.
		 *
		 * @option coordsToLatLng: Function = *
		 * A `Function` that will be used for converting GeoJSON coordinates to `LatLng`s.
		 * The default is the `coordsToLatLng` static method.
		 */
	
		initialize: function (geojson, options) {
			L.setOptions(this, options);
	
			this._layers = {};
	
			if (geojson) {
				this.addData(geojson);
			}
		},
	
		// @method addData( <GeoJSON> data ): Layer
		// Adds a GeoJSON object to the layer.
		addData: function (geojson) {
			var features = L.Util.isArray(geojson) ? geojson : geojson.features,
			    i, len, feature;
	
			if (features) {
				for (i = 0, len = features.length; i < len; i++) {
					// only add this if geometry or geometries are set and not null
					feature = features[i];
					if (feature.geometries || feature.geometry || feature.features || feature.coordinates) {
						this.addData(feature);
					}
				}
				return this;
			}
	
			var options = this.options;
	
			if (options.filter && !options.filter(geojson)) { return this; }
	
			var layer = L.GeoJSON.geometryToLayer(geojson, options);
			if (!layer) {
				return this;
			}
			layer.feature = L.GeoJSON.asFeature(geojson);
	
			layer.defaultOptions = layer.options;
			this.resetStyle(layer);
	
			if (options.onEachFeature) {
				options.onEachFeature(geojson, layer);
			}
	
			return this.addLayer(layer);
		},
	
		// @method resetStyle( <Path> layer ): Layer
		// Resets the given vector layer's style to the original GeoJSON style, useful for resetting style after hover events.
		resetStyle: function (layer) {
			// reset any custom styles
			layer.options = L.Util.extend({}, layer.defaultOptions);
			this._setLayerStyle(layer, this.options.style);
			return this;
		},
	
		// @method setStyle( <Function> style ): Layer
		// Changes styles of GeoJSON vector layers with the given style function.
		setStyle: function (style) {
			return this.eachLayer(function (layer) {
				this._setLayerStyle(layer, style);
			}, this);
		},
	
		_setLayerStyle: function (layer, style) {
			if (typeof style === 'function') {
				style = style(layer.feature);
			}
			if (layer.setStyle) {
				layer.setStyle(style);
			}
		}
	});
	
	// @section
	// There are several static functions which can be called without instantiating L.GeoJSON:
	L.extend(L.GeoJSON, {
		// @function geometryToLayer(featureData: Object, options?: GeoJSON options): Layer
		// Creates a `Layer` from a given GeoJSON feature. Can use a custom
		// [`pointToLayer`](#geojson-pointtolayer) and/or [`coordsToLatLng`](#geojson-coordstolatlng)
		// functions if provided as options.
		geometryToLayer: function (geojson, options) {
	
			var geometry = geojson.type === 'Feature' ? geojson.geometry : geojson,
			    coords = geometry ? geometry.coordinates : null,
			    layers = [],
			    pointToLayer = options && options.pointToLayer,
			    coordsToLatLng = options && options.coordsToLatLng || this.coordsToLatLng,
			    latlng, latlngs, i, len;
	
			if (!coords && !geometry) {
				return null;
			}
	
			switch (geometry.type) {
			case 'Point':
				latlng = coordsToLatLng(coords);
				return pointToLayer ? pointToLayer(geojson, latlng) : new L.Marker(latlng);
	
			case 'MultiPoint':
				for (i = 0, len = coords.length; i < len; i++) {
					latlng = coordsToLatLng(coords[i]);
					layers.push(pointToLayer ? pointToLayer(geojson, latlng) : new L.Marker(latlng));
				}
				return new L.FeatureGroup(layers);
	
			case 'LineString':
			case 'MultiLineString':
				latlngs = this.coordsToLatLngs(coords, geometry.type === 'LineString' ? 0 : 1, coordsToLatLng);
				return new L.Polyline(latlngs, options);
	
			case 'Polygon':
			case 'MultiPolygon':
				latlngs = this.coordsToLatLngs(coords, geometry.type === 'Polygon' ? 1 : 2, coordsToLatLng);
				return new L.Polygon(latlngs, options);
	
			case 'GeometryCollection':
				for (i = 0, len = geometry.geometries.length; i < len; i++) {
					var layer = this.geometryToLayer({
						geometry: geometry.geometries[i],
						type: 'Feature',
						properties: geojson.properties
					}, options);
	
					if (layer) {
						layers.push(layer);
					}
				}
				return new L.FeatureGroup(layers);
	
			default:
				throw new Error('Invalid GeoJSON object.');
			}
		},
	
		// @function coordsToLatLng(coords: Array): LatLng
		// Creates a `LatLng` object from an array of 2 numbers (longitude, latitude)
		// or 3 numbers (longitude, latitude, altitude) used in GeoJSON for points.
		coordsToLatLng: function (coords) {
			return new L.LatLng(coords[1], coords[0], coords[2]);
		},
	
		// @function coordsToLatLngs(coords: Array, levelsDeep?: Number, coordsToLatLng?: Function): Array
		// Creates a multidimensional array of `LatLng`s from a GeoJSON coordinates array.
		// `levelsDeep` specifies the nesting level (0 is for an array of points, 1 for an array of arrays of points, etc., 0 by default).
		// Can use a custom [`coordsToLatLng`](#geojson-coordstolatlng) function.
		coordsToLatLngs: function (coords, levelsDeep, coordsToLatLng) {
			var latlngs = [];
	
			for (var i = 0, len = coords.length, latlng; i < len; i++) {
				latlng = levelsDeep ?
				        this.coordsToLatLngs(coords[i], levelsDeep - 1, coordsToLatLng) :
				        (coordsToLatLng || this.coordsToLatLng)(coords[i]);
	
				latlngs.push(latlng);
			}
	
			return latlngs;
		},
	
		// @function latLngToCoords(latlng: LatLng): Array
		// Reverse of [`coordsToLatLng`](#geojson-coordstolatlng)
		latLngToCoords: function (latlng) {
			return latlng.alt !== undefined ?
					[latlng.lng, latlng.lat, latlng.alt] :
					[latlng.lng, latlng.lat];
		},
	
		// @function latLngsToCoords(latlngs: Array, levelsDeep?: Number, closed?: Boolean): Array
		// Reverse of [`coordsToLatLngs`](#geojson-coordstolatlngs)
		// `closed` determines whether the first point should be appended to the end of the array to close the feature, only used when `levelsDeep` is 0. False by default.
		latLngsToCoords: function (latlngs, levelsDeep, closed) {
			var coords = [];
	
			for (var i = 0, len = latlngs.length; i < len; i++) {
				coords.push(levelsDeep ?
					L.GeoJSON.latLngsToCoords(latlngs[i], levelsDeep - 1, closed) :
					L.GeoJSON.latLngToCoords(latlngs[i]));
			}
	
			if (!levelsDeep && closed) {
				coords.push(coords[0]);
			}
	
			return coords;
		},
	
		getFeature: function (layer, newGeometry) {
			return layer.feature ?
					L.extend({}, layer.feature, {geometry: newGeometry}) :
					L.GeoJSON.asFeature(newGeometry);
		},
	
		// @function asFeature(geojson: Object): Object
		// Normalize GeoJSON geometries/features into GeoJSON features.
		asFeature: function (geojson) {
			if (geojson.type === 'Feature') {
				return geojson;
			}
	
			return {
				type: 'Feature',
				properties: {},
				geometry: geojson
			};
		}
	});
	
	var PointToGeoJSON = {
		toGeoJSON: function () {
			return L.GeoJSON.getFeature(this, {
				type: 'Point',
				coordinates: L.GeoJSON.latLngToCoords(this.getLatLng())
			});
		}
	};
	
	L.Marker.include(PointToGeoJSON);
	
	// @namespace CircleMarker
	// @method toGeoJSON(): Object
	// Returns a [`GeoJSON`](http://en.wikipedia.org/wiki/GeoJSON) representation of the circle marker (as a GeoJSON `Point` Feature).
	L.Circle.include(PointToGeoJSON);
	L.CircleMarker.include(PointToGeoJSON);
	
	
	// @namespace Polyline
	// @method toGeoJSON(): Object
	// Returns a [`GeoJSON`](http://en.wikipedia.org/wiki/GeoJSON) representation of the polyline (as a GeoJSON `LineString` or `MultiLineString` Feature).
	L.Polyline.prototype.toGeoJSON = function () {
		var multi = !L.Polyline._flat(this._latlngs);
	
		var coords = L.GeoJSON.latLngsToCoords(this._latlngs, multi ? 1 : 0);
	
		return L.GeoJSON.getFeature(this, {
			type: (multi ? 'Multi' : '') + 'LineString',
			coordinates: coords
		});
	};
	
	// @namespace Polygon
	// @method toGeoJSON(): Object
	// Returns a [`GeoJSON`](http://en.wikipedia.org/wiki/GeoJSON) representation of the polygon (as a GeoJSON `Polygon` or `MultiPolygon` Feature).
	L.Polygon.prototype.toGeoJSON = function () {
		var holes = !L.Polyline._flat(this._latlngs),
		    multi = holes && !L.Polyline._flat(this._latlngs[0]);
	
		var coords = L.GeoJSON.latLngsToCoords(this._latlngs, multi ? 2 : holes ? 1 : 0, true);
	
		if (!holes) {
			coords = [coords];
		}
	
		return L.GeoJSON.getFeature(this, {
			type: (multi ? 'Multi' : '') + 'Polygon',
			coordinates: coords
		});
	};
	
	
	// @namespace LayerGroup
	L.LayerGroup.include({
		toMultiPoint: function () {
			var coords = [];
	
			this.eachLayer(function (layer) {
				coords.push(layer.toGeoJSON().geometry.coordinates);
			});
	
			return L.GeoJSON.getFeature(this, {
				type: 'MultiPoint',
				coordinates: coords
			});
		},
	
		// @method toGeoJSON(): Object
		// Returns a [`GeoJSON`](http://en.wikipedia.org/wiki/GeoJSON) representation of the layer group (as a GeoJSON `GeometryCollection`).
		toGeoJSON: function () {
	
			var type = this.feature && this.feature.geometry && this.feature.geometry.type;
	
			if (type === 'MultiPoint') {
				return this.toMultiPoint();
			}
	
			var isGeometryCollection = type === 'GeometryCollection',
			    jsons = [];
	
			this.eachLayer(function (layer) {
				if (layer.toGeoJSON) {
					var json = layer.toGeoJSON();
					jsons.push(isGeometryCollection ? json.geometry : L.GeoJSON.asFeature(json));
				}
			});
	
			if (isGeometryCollection) {
				return L.GeoJSON.getFeature(this, {
					geometries: jsons,
					type: 'GeometryCollection'
				});
			}
	
			return {
				type: 'FeatureCollection',
				features: jsons
			};
		}
	});
	
	// @namespace GeoJSON
	// @factory L.geoJSON(geojson?: Object, options?: GeoJSON options)
	// Creates a GeoJSON layer. Optionally accepts an object in
	// [GeoJSON format](http://geojson.org/geojson-spec.html) to display on the map
	// (you can alternatively add it later with `addData` method) and an `options` object.
	L.geoJSON = function (geojson, options) {
		return new L.GeoJSON(geojson, options);
	};
	// Backward compatibility.
	L.geoJson = L.geoJSON;
	
	
	
	/*
	 * @namespace DomEvent
	 * Utility functions to work with the [DOM events](https://developer.mozilla.org/docs/Web/API/Event), used by Leaflet internally.
	 */
	
	// Inspired by John Resig, Dean Edwards and YUI addEvent implementations.
	
	
	
	var eventsKey = '_leaflet_events';
	
	L.DomEvent = {
	
		// @function on(el: HTMLElement, types: String, fn: Function, context?: Object): this
		// Adds a listener function (`fn`) to a particular DOM event type of the
		// element `el`. You can optionally specify the context of the listener
		// (object the `this` keyword will point to). You can also pass several
		// space-separated types (e.g. `'click dblclick'`).
	
		// @alternative
		// @function on(el: HTMLElement, eventMap: Object, context?: Object): this
		// Adds a set of type/listener pairs, e.g. `{click: onClick, mousemove: onMouseMove}`
		on: function (obj, types, fn, context) {
	
			if (typeof types === 'object') {
				for (var type in types) {
					this._on(obj, type, types[type], fn);
				}
			} else {
				types = L.Util.splitWords(types);
	
				for (var i = 0, len = types.length; i < len; i++) {
					this._on(obj, types[i], fn, context);
				}
			}
	
			return this;
		},
	
		// @function off(el: HTMLElement, types: String, fn: Function, context?: Object): this
		// Removes a previously added listener function. If no function is specified,
		// it will remove all the listeners of that particular DOM event from the element.
		// Note that if you passed a custom context to on, you must pass the same
		// context to `off` in order to remove the listener.
	
		// @alternative
		// @function off(el: HTMLElement, eventMap: Object, context?: Object): this
		// Removes a set of type/listener pairs, e.g. `{click: onClick, mousemove: onMouseMove}`
		off: function (obj, types, fn, context) {
	
			if (typeof types === 'object') {
				for (var type in types) {
					this._off(obj, type, types[type], fn);
				}
			} else {
				types = L.Util.splitWords(types);
	
				for (var i = 0, len = types.length; i < len; i++) {
					this._off(obj, types[i], fn, context);
				}
			}
	
			return this;
		},
	
		_on: function (obj, type, fn, context) {
			var id = type + L.stamp(fn) + (context ? '_' + L.stamp(context) : '');
	
			if (obj[eventsKey] && obj[eventsKey][id]) { return this; }
	
			var handler = function (e) {
				return fn.call(context || obj, e || window.event);
			};
	
			var originalHandler = handler;
	
			if (L.Browser.pointer && type.indexOf('touch') === 0) {
				this.addPointerListener(obj, type, handler, id);
	
			} else if (L.Browser.touch && (type === 'dblclick') && this.addDoubleTapListener) {
				this.addDoubleTapListener(obj, handler, id);
	
			} else if ('addEventListener' in obj) {
	
				if (type === 'mousewheel') {
					obj.addEventListener('onwheel' in obj ? 'wheel' : 'mousewheel', handler, false);
	
				} else if ((type === 'mouseenter') || (type === 'mouseleave')) {
					handler = function (e) {
						e = e || window.event;
						if (L.DomEvent._isExternalTarget(obj, e)) {
							originalHandler(e);
						}
					};
					obj.addEventListener(type === 'mouseenter' ? 'mouseover' : 'mouseout', handler, false);
	
				} else {
					if (type === 'click' && L.Browser.android) {
						handler = function (e) {
							return L.DomEvent._filterClick(e, originalHandler);
						};
					}
					obj.addEventListener(type, handler, false);
				}
	
			} else if ('attachEvent' in obj) {
				obj.attachEvent('on' + type, handler);
			}
	
			obj[eventsKey] = obj[eventsKey] || {};
			obj[eventsKey][id] = handler;
	
			return this;
		},
	
		_off: function (obj, type, fn, context) {
	
			var id = type + L.stamp(fn) + (context ? '_' + L.stamp(context) : ''),
			    handler = obj[eventsKey] && obj[eventsKey][id];
	
			if (!handler) { return this; }
	
			if (L.Browser.pointer && type.indexOf('touch') === 0) {
				this.removePointerListener(obj, type, id);
	
			} else if (L.Browser.touch && (type === 'dblclick') && this.removeDoubleTapListener) {
				this.removeDoubleTapListener(obj, id);
	
			} else if ('removeEventListener' in obj) {
	
				if (type === 'mousewheel') {
					obj.removeEventListener('onwheel' in obj ? 'wheel' : 'mousewheel', handler, false);
	
				} else {
					obj.removeEventListener(
						type === 'mouseenter' ? 'mouseover' :
						type === 'mouseleave' ? 'mouseout' : type, handler, false);
				}
	
			} else if ('detachEvent' in obj) {
				obj.detachEvent('on' + type, handler);
			}
	
			obj[eventsKey][id] = null;
	
			return this;
		},
	
		// @function stopPropagation(ev: DOMEvent): this
		// Stop the given event from propagation to parent elements. Used inside the listener functions:
		// ```js
		// L.DomEvent.on(div, 'click', function (ev) {
		// 	L.DomEvent.stopPropagation(ev);
		// });
		// ```
		stopPropagation: function (e) {
	
			if (e.stopPropagation) {
				e.stopPropagation();
			} else if (e.originalEvent) {  // In case of Leaflet event.
				e.originalEvent._stopped = true;
			} else {
				e.cancelBubble = true;
			}
			L.DomEvent._skipped(e);
	
			return this;
		},
	
		// @function disableScrollPropagation(el: HTMLElement): this
		// Adds `stopPropagation` to the element's `'mousewheel'` events (plus browser variants).
		disableScrollPropagation: function (el) {
			return L.DomEvent.on(el, 'mousewheel', L.DomEvent.stopPropagation);
		},
	
		// @function disableClickPropagation(el: HTMLElement): this
		// Adds `stopPropagation` to the element's `'click'`, `'doubleclick'`,
		// `'mousedown'` and `'touchstart'` events (plus browser variants).
		disableClickPropagation: function (el) {
			var stop = L.DomEvent.stopPropagation;
	
			L.DomEvent.on(el, L.Draggable.START.join(' '), stop);
	
			return L.DomEvent.on(el, {
				click: L.DomEvent._fakeStop,
				dblclick: stop
			});
		},
	
		// @function preventDefault(ev: DOMEvent): this
		// Prevents the default action of the DOM Event `ev` from happening (such as
		// following a link in the href of the a element, or doing a POST request
		// with page reload when a `<form>` is submitted).
		// Use it inside listener functions.
		preventDefault: function (e) {
	
			if (e.preventDefault) {
				e.preventDefault();
			} else {
				e.returnValue = false;
			}
			return this;
		},
	
		// @function stop(ev): this
		// Does `stopPropagation` and `preventDefault` at the same time.
		stop: function (e) {
			return L.DomEvent
				.preventDefault(e)
				.stopPropagation(e);
		},
	
		// @function getMousePosition(ev: DOMEvent, container?: HTMLElement): Point
		// Gets normalized mouse position from a DOM event relative to the
		// `container` or to the whole page if not specified.
		getMousePosition: function (e, container) {
			if (!container) {
				return new L.Point(e.clientX, e.clientY);
			}
	
			var rect = container.getBoundingClientRect();
	
			return new L.Point(
				e.clientX - rect.left - container.clientLeft,
				e.clientY - rect.top - container.clientTop);
		},
	
		// Chrome on Win scrolls double the pixels as in other platforms (see #4538),
		// and Firefox scrolls device pixels, not CSS pixels
		_wheelPxFactor: (L.Browser.win && L.Browser.chrome) ? 2 :
		                L.Browser.gecko ? window.devicePixelRatio :
		                1,
	
		// @function getWheelDelta(ev: DOMEvent): Number
		// Gets normalized wheel delta from a mousewheel DOM event, in vertical
		// pixels scrolled (negative if scrolling down).
		// Events from pointing devices without precise scrolling are mapped to
		// a best guess of 60 pixels.
		getWheelDelta: function (e) {
			return (L.Browser.edge) ? e.wheelDeltaY / 2 : // Don't trust window-geometry-based delta
			       (e.deltaY && e.deltaMode === 0) ? -e.deltaY / L.DomEvent._wheelPxFactor : // Pixels
			       (e.deltaY && e.deltaMode === 1) ? -e.deltaY * 20 : // Lines
			       (e.deltaY && e.deltaMode === 2) ? -e.deltaY * 60 : // Pages
			       (e.deltaX || e.deltaZ) ? 0 :	// Skip horizontal/depth wheel events
			       e.wheelDelta ? (e.wheelDeltaY || e.wheelDelta) / 2 : // Legacy IE pixels
			       (e.detail && Math.abs(e.detail) < 32765) ? -e.detail * 20 : // Legacy Moz lines
			       e.detail ? e.detail / -32765 * 60 : // Legacy Moz pages
			       0;
		},
	
		_skipEvents: {},
	
		_fakeStop: function (e) {
			// fakes stopPropagation by setting a special event flag, checked/reset with L.DomEvent._skipped(e)
			L.DomEvent._skipEvents[e.type] = true;
		},
	
		_skipped: function (e) {
			var skipped = this._skipEvents[e.type];
			// reset when checking, as it's only used in map container and propagates outside of the map
			this._skipEvents[e.type] = false;
			return skipped;
		},
	
		// check if element really left/entered the event target (for mouseenter/mouseleave)
		_isExternalTarget: function (el, e) {
	
			var related = e.relatedTarget;
	
			if (!related) { return true; }
	
			try {
				while (related && (related !== el)) {
					related = related.parentNode;
				}
			} catch (err) {
				return false;
			}
			return (related !== el);
		},
	
		// this is a horrible workaround for a bug in Android where a single touch triggers two click events
		_filterClick: function (e, handler) {
			var timeStamp = (e.timeStamp || (e.originalEvent && e.originalEvent.timeStamp)),
			    elapsed = L.DomEvent._lastClick && (timeStamp - L.DomEvent._lastClick);
	
			// are they closer together than 500ms yet more than 100ms?
			// Android typically triggers them ~300ms apart while multiple listeners
			// on the same event should be triggered far faster;
			// or check if click is simulated on the element, and if it is, reject any non-simulated events
	
			if ((elapsed && elapsed > 100 && elapsed < 500) || (e.target._simulatedClick && !e._simulated)) {
				L.DomEvent.stop(e);
				return;
			}
			L.DomEvent._lastClick = timeStamp;
	
			handler(e);
		}
	};
	
	// @function addListener(…): this
	// Alias to [`L.DomEvent.on`](#domevent-on)
	L.DomEvent.addListener = L.DomEvent.on;
	
	// @function removeListener(…): this
	// Alias to [`L.DomEvent.off`](#domevent-off)
	L.DomEvent.removeListener = L.DomEvent.off;
	
	
	
	/*
	 * @class Draggable
	 * @aka L.Draggable
	 * @inherits Evented
	 *
	 * A class for making DOM elements draggable (including touch support).
	 * Used internally for map and marker dragging. Only works for elements
	 * that were positioned with [`L.DomUtil.setPosition`](#domutil-setposition).
	 *
	 * @example
	 * ```js
	 * var draggable = new L.Draggable(elementToDrag);
	 * draggable.enable();
	 * ```
	 */
	
	L.Draggable = L.Evented.extend({
	
		options: {
			// @option clickTolerance: Number = 3
			// The max number of pixels a user can shift the mouse pointer during a click
			// for it to be considered a valid click (as opposed to a mouse drag).
			clickTolerance: 3
		},
	
		statics: {
			START: L.Browser.touch ? ['touchstart', 'mousedown'] : ['mousedown'],
			END: {
				mousedown: 'mouseup',
				touchstart: 'touchend',
				pointerdown: 'touchend',
				MSPointerDown: 'touchend'
			},
			MOVE: {
				mousedown: 'mousemove',
				touchstart: 'touchmove',
				pointerdown: 'touchmove',
				MSPointerDown: 'touchmove'
			}
		},
	
		// @constructor L.Draggable(el: HTMLElement, dragHandle?: HTMLElement, preventOutline: Boolean)
		// Creates a `Draggable` object for moving `el` when you start dragging the `dragHandle` element (equals `el` itself by default).
		initialize: function (element, dragStartTarget, preventOutline) {
			this._element = element;
			this._dragStartTarget = dragStartTarget || element;
			this._preventOutline = preventOutline;
		},
	
		// @method enable()
		// Enables the dragging ability
		enable: function () {
			if (this._enabled) { return; }
	
			L.DomEvent.on(this._dragStartTarget, L.Draggable.START.join(' '), this._onDown, this);
	
			this._enabled = true;
		},
	
		// @method disable()
		// Disables the dragging ability
		disable: function () {
			if (!this._enabled) { return; }
	
			L.DomEvent.off(this._dragStartTarget, L.Draggable.START.join(' '), this._onDown, this);
	
			this._enabled = false;
			this._moved = false;
		},
	
		_onDown: function (e) {
			// Ignore simulated events, since we handle both touch and
			// mouse explicitly; otherwise we risk getting duplicates of
			// touch events, see #4315.
			// Also ignore the event if disabled; this happens in IE11
			// under some circumstances, see #3666.
			if (e._simulated || !this._enabled) { return; }
	
			this._moved = false;
	
			if (L.DomUtil.hasClass(this._element, 'leaflet-zoom-anim')) { return; }
	
			if (L.Draggable._dragging || e.shiftKey || ((e.which !== 1) && (e.button !== 1) && !e.touches) || !this._enabled) { return; }
			L.Draggable._dragging = true;  // Prevent dragging multiple objects at once.
	
			if (this._preventOutline) {
				L.DomUtil.preventOutline(this._element);
			}
	
			L.DomUtil.disableImageDrag();
			L.DomUtil.disableTextSelection();
	
			if (this._moving) { return; }
	
			// @event down: Event
			// Fired when a drag is about to start.
			this.fire('down');
	
			var first = e.touches ? e.touches[0] : e;
	
			this._startPoint = new L.Point(first.clientX, first.clientY);
	
			L.DomEvent
				.on(document, L.Draggable.MOVE[e.type], this._onMove, this)
				.on(document, L.Draggable.END[e.type], this._onUp, this);
		},
	
		_onMove: function (e) {
			// Ignore simulated events, since we handle both touch and
			// mouse explicitly; otherwise we risk getting duplicates of
			// touch events, see #4315.
			// Also ignore the event if disabled; this happens in IE11
			// under some circumstances, see #3666.
			if (e._simulated || !this._enabled) { return; }
	
			if (e.touches && e.touches.length > 1) {
				this._moved = true;
				return;
			}
	
			var first = (e.touches && e.touches.length === 1 ? e.touches[0] : e),
			    newPoint = new L.Point(first.clientX, first.clientY),
			    offset = newPoint.subtract(this._startPoint);
	
			if (!offset.x && !offset.y) { return; }
			if (Math.abs(offset.x) + Math.abs(offset.y) < this.options.clickTolerance) { return; }
	
			L.DomEvent.preventDefault(e);
	
			if (!this._moved) {
				// @event dragstart: Event
				// Fired when a drag starts
				this.fire('dragstart');
	
				this._moved = true;
				this._startPos = L.DomUtil.getPosition(this._element).subtract(offset);
	
				L.DomUtil.addClass(document.body, 'leaflet-dragging');
	
				this._lastTarget = e.target || e.srcElement;
				// IE and Edge do not give the <use> element, so fetch it
				// if necessary
				if ((window.SVGElementInstance) && (this._lastTarget instanceof SVGElementInstance)) {
					this._lastTarget = this._lastTarget.correspondingUseElement;
				}
				L.DomUtil.addClass(this._lastTarget, 'leaflet-drag-target');
			}
	
			this._newPos = this._startPos.add(offset);
			this._moving = true;
	
			L.Util.cancelAnimFrame(this._animRequest);
			this._lastEvent = e;
			this._animRequest = L.Util.requestAnimFrame(this._updatePosition, this, true);
		},
	
		_updatePosition: function () {
			var e = {originalEvent: this._lastEvent};
	
			// @event predrag: Event
			// Fired continuously during dragging *before* each corresponding
			// update of the element's position.
			this.fire('predrag', e);
			L.DomUtil.setPosition(this._element, this._newPos);
	
			// @event drag: Event
			// Fired continuously during dragging.
			this.fire('drag', e);
		},
	
		_onUp: function (e) {
			// Ignore simulated events, since we handle both touch and
			// mouse explicitly; otherwise we risk getting duplicates of
			// touch events, see #4315.
			// Also ignore the event if disabled; this happens in IE11
			// under some circumstances, see #3666.
			if (e._simulated || !this._enabled) { return; }
	
			L.DomUtil.removeClass(document.body, 'leaflet-dragging');
	
			if (this._lastTarget) {
				L.DomUtil.removeClass(this._lastTarget, 'leaflet-drag-target');
				this._lastTarget = null;
			}
	
			for (var i in L.Draggable.MOVE) {
				L.DomEvent
					.off(document, L.Draggable.MOVE[i], this._onMove, this)
					.off(document, L.Draggable.END[i], this._onUp, this);
			}
	
			L.DomUtil.enableImageDrag();
			L.DomUtil.enableTextSelection();
	
			if (this._moved && this._moving) {
				// ensure drag is not fired after dragend
				L.Util.cancelAnimFrame(this._animRequest);
	
				// @event dragend: DragEndEvent
				// Fired when the drag ends.
				this.fire('dragend', {
					distance: this._newPos.distanceTo(this._startPos)
				});
			}
	
			this._moving = false;
			L.Draggable._dragging = false;
		}
	});
	
	
	
	/*
		L.Handler is a base class for handler classes that are used internally to inject
		interaction features like dragging to classes like Map and Marker.
	*/
	
	// @class Handler
	// @aka L.Handler
	// Abstract class for map interaction handlers
	
	L.Handler = L.Class.extend({
		initialize: function (map) {
			this._map = map;
		},
	
		// @method enable(): this
		// Enables the handler
		enable: function () {
			if (this._enabled) { return this; }
	
			this._enabled = true;
			this.addHooks();
			return this;
		},
	
		// @method disable(): this
		// Disables the handler
		disable: function () {
			if (!this._enabled) { return this; }
	
			this._enabled = false;
			this.removeHooks();
			return this;
		},
	
		// @method enabled(): Boolean
		// Returns `true` if the handler is enabled
		enabled: function () {
			return !!this._enabled;
		}
	
		// @section Extension methods
		// Classes inheriting from `Handler` must implement the two following methods:
		// @method addHooks()
		// Called when the handler is enabled, should add event hooks.
		// @method removeHooks()
		// Called when the handler is disabled, should remove the event hooks added previously.
	});
	
	
	
	/*
	 * L.Handler.MapDrag is used to make the map draggable (with panning inertia), enabled by default.
	 */
	
	// @namespace Map
	// @section Interaction Options
	L.Map.mergeOptions({
		// @option dragging: Boolean = true
		// Whether the map be draggable with mouse/touch or not.
		dragging: true,
	
		// @section Panning Inertia Options
		// @option inertia: Boolean = *
		// If enabled, panning of the map will have an inertia effect where
		// the map builds momentum while dragging and continues moving in
		// the same direction for some time. Feels especially nice on touch
		// devices. Enabled by default unless running on old Android devices.
		inertia: !L.Browser.android23,
	
		// @option inertiaDeceleration: Number = 3000
		// The rate with which the inertial movement slows down, in pixels/second².
		inertiaDeceleration: 3400, // px/s^2
	
		// @option inertiaMaxSpeed: Number = Infinity
		// Max speed of the inertial movement, in pixels/second.
		inertiaMaxSpeed: Infinity, // px/s
	
		// @option easeLinearity: Number = 0.2
		easeLinearity: 0.2,
	
		// TODO refactor, move to CRS
		// @option worldCopyJump: Boolean = false
		// With this option enabled, the map tracks when you pan to another "copy"
		// of the world and seamlessly jumps to the original one so that all overlays
		// like markers and vector layers are still visible.
		worldCopyJump: false,
	
		// @option maxBoundsViscosity: Number = 0.0
		// If `maxBounds` is set, this option will control how solid the bounds
		// are when dragging the map around. The default value of `0.0` allows the
		// user to drag outside the bounds at normal speed, higher values will
		// slow down map dragging outside bounds, and `1.0` makes the bounds fully
		// solid, preventing the user from dragging outside the bounds.
		maxBoundsViscosity: 0.0
	});
	
	L.Map.Drag = L.Handler.extend({
		addHooks: function () {
			if (!this._draggable) {
				var map = this._map;
	
				this._draggable = new L.Draggable(map._mapPane, map._container);
	
				this._draggable.on({
					down: this._onDown,
					dragstart: this._onDragStart,
					drag: this._onDrag,
					dragend: this._onDragEnd
				}, this);
	
				this._draggable.on('predrag', this._onPreDragLimit, this);
				if (map.options.worldCopyJump) {
					this._draggable.on('predrag', this._onPreDragWrap, this);
					map.on('zoomend', this._onZoomEnd, this);
	
					map.whenReady(this._onZoomEnd, this);
				}
			}
			L.DomUtil.addClass(this._map._container, 'leaflet-grab leaflet-touch-drag');
			this._draggable.enable();
			this._positions = [];
			this._times = [];
		},
	
		removeHooks: function () {
			L.DomUtil.removeClass(this._map._container, 'leaflet-grab');
			L.DomUtil.removeClass(this._map._container, 'leaflet-touch-drag');
			this._draggable.disable();
		},
	
		moved: function () {
			return this._draggable && this._draggable._moved;
		},
	
		moving: function () {
			return this._draggable && this._draggable._moving;
		},
	
		_onDown: function () {
			this._map._stop();
		},
	
		_onDragStart: function () {
			var map = this._map;
	
			if (this._map.options.maxBounds && this._map.options.maxBoundsViscosity) {
				var bounds = L.latLngBounds(this._map.options.maxBounds);
	
				this._offsetLimit = L.bounds(
					this._map.latLngToContainerPoint(bounds.getNorthWest()).multiplyBy(-1),
					this._map.latLngToContainerPoint(bounds.getSouthEast()).multiplyBy(-1)
						.add(this._map.getSize()));
	
				this._viscosity = Math.min(1.0, Math.max(0.0, this._map.options.maxBoundsViscosity));
			} else {
				this._offsetLimit = null;
			}
	
			map
			    .fire('movestart')
			    .fire('dragstart');
	
			if (map.options.inertia) {
				this._positions = [];
				this._times = [];
			}
		},
	
		_onDrag: function (e) {
			if (this._map.options.inertia) {
				var time = this._lastTime = +new Date(),
				    pos = this._lastPos = this._draggable._absPos || this._draggable._newPos;
	
				this._positions.push(pos);
				this._times.push(time);
	
				if (time - this._times[0] > 50) {
					this._positions.shift();
					this._times.shift();
				}
			}
	
			this._map
			    .fire('move', e)
			    .fire('drag', e);
		},
	
		_onZoomEnd: function () {
			var pxCenter = this._map.getSize().divideBy(2),
			    pxWorldCenter = this._map.latLngToLayerPoint([0, 0]);
	
			this._initialWorldOffset = pxWorldCenter.subtract(pxCenter).x;
			this._worldWidth = this._map.getPixelWorldBounds().getSize().x;
		},
	
		_viscousLimit: function (value, threshold) {
			return value - (value - threshold) * this._viscosity;
		},
	
		_onPreDragLimit: function () {
			if (!this._viscosity || !this._offsetLimit) { return; }
	
			var offset = this._draggable._newPos.subtract(this._draggable._startPos);
	
			var limit = this._offsetLimit;
			if (offset.x < limit.min.x) { offset.x = this._viscousLimit(offset.x, limit.min.x); }
			if (offset.y < limit.min.y) { offset.y = this._viscousLimit(offset.y, limit.min.y); }
			if (offset.x > limit.max.x) { offset.x = this._viscousLimit(offset.x, limit.max.x); }
			if (offset.y > limit.max.y) { offset.y = this._viscousLimit(offset.y, limit.max.y); }
	
			this._draggable._newPos = this._draggable._startPos.add(offset);
		},
	
		_onPreDragWrap: function () {
			// TODO refactor to be able to adjust map pane position after zoom
			var worldWidth = this._worldWidth,
			    halfWidth = Math.round(worldWidth / 2),
			    dx = this._initialWorldOffset,
			    x = this._draggable._newPos.x,
			    newX1 = (x - halfWidth + dx) % worldWidth + halfWidth - dx,
			    newX2 = (x + halfWidth + dx) % worldWidth - halfWidth - dx,
			    newX = Math.abs(newX1 + dx) < Math.abs(newX2 + dx) ? newX1 : newX2;
	
			this._draggable._absPos = this._draggable._newPos.clone();
			this._draggable._newPos.x = newX;
		},
	
		_onDragEnd: function (e) {
			var map = this._map,
			    options = map.options,
	
			    noInertia = !options.inertia || this._times.length < 2;
	
			map.fire('dragend', e);
	
			if (noInertia) {
				map.fire('moveend');
	
			} else {
	
				var direction = this._lastPos.subtract(this._positions[0]),
				    duration = (this._lastTime - this._times[0]) / 1000,
				    ease = options.easeLinearity,
	
				    speedVector = direction.multiplyBy(ease / duration),
				    speed = speedVector.distanceTo([0, 0]),
	
				    limitedSpeed = Math.min(options.inertiaMaxSpeed, speed),
				    limitedSpeedVector = speedVector.multiplyBy(limitedSpeed / speed),
	
				    decelerationDuration = limitedSpeed / (options.inertiaDeceleration * ease),
				    offset = limitedSpeedVector.multiplyBy(-decelerationDuration / 2).round();
	
				if (!offset.x && !offset.y) {
					map.fire('moveend');
	
				} else {
					offset = map._limitOffset(offset, map.options.maxBounds);
	
					L.Util.requestAnimFrame(function () {
						map.panBy(offset, {
							duration: decelerationDuration,
							easeLinearity: ease,
							noMoveStart: true,
							animate: true
						});
					});
				}
			}
		}
	});
	
	// @section Handlers
	// @property dragging: Handler
	// Map dragging handler (by both mouse and touch).
	L.Map.addInitHook('addHandler', 'dragging', L.Map.Drag);
	
	
	
	/*
	 * L.Handler.DoubleClickZoom is used to handle double-click zoom on the map, enabled by default.
	 */
	
	// @namespace Map
	// @section Interaction Options
	
	L.Map.mergeOptions({
		// @option doubleClickZoom: Boolean|String = true
		// Whether the map can be zoomed in by double clicking on it and
		// zoomed out by double clicking while holding shift. If passed
		// `'center'`, double-click zoom will zoom to the center of the
		//  view regardless of where the mouse was.
		doubleClickZoom: true
	});
	
	L.Map.DoubleClickZoom = L.Handler.extend({
		addHooks: function () {
			this._map.on('dblclick', this._onDoubleClick, this);
		},
	
		removeHooks: function () {
			this._map.off('dblclick', this._onDoubleClick, this);
		},
	
		_onDoubleClick: function (e) {
			var map = this._map,
			    oldZoom = map.getZoom(),
			    delta = map.options.zoomDelta,
			    zoom = e.originalEvent.shiftKey ? oldZoom - delta : oldZoom + delta;
	
			if (map.options.doubleClickZoom === 'center') {
				map.setZoom(zoom);
			} else {
				map.setZoomAround(e.containerPoint, zoom);
			}
		}
	});
	
	// @section Handlers
	//
	// Map properties include interaction handlers that allow you to control
	// interaction behavior in runtime, enabling or disabling certain features such
	// as dragging or touch zoom (see `Handler` methods). For example:
	//
	// ```js
	// map.doubleClickZoom.disable();
	// ```
	//
	// @property doubleClickZoom: Handler
	// Double click zoom handler.
	L.Map.addInitHook('addHandler', 'doubleClickZoom', L.Map.DoubleClickZoom);
	
	
	
	/*
	 * L.Handler.ScrollWheelZoom is used by L.Map to enable mouse scroll wheel zoom on the map.
	 */
	
	// @namespace Map
	// @section Interaction Options
	L.Map.mergeOptions({
		// @section Mousewheel options
		// @option scrollWheelZoom: Boolean|String = true
		// Whether the map can be zoomed by using the mouse wheel. If passed `'center'`,
		// it will zoom to the center of the view regardless of where the mouse was.
		scrollWheelZoom: true,
	
		// @option wheelDebounceTime: Number = 40
		// Limits the rate at which a wheel can fire (in milliseconds). By default
		// user can't zoom via wheel more often than once per 40 ms.
		wheelDebounceTime: 40,
	
		// @option wheelPxPerZoomLevel: Number = 60
		// How many scroll pixels (as reported by [L.DomEvent.getWheelDelta](#domevent-getwheeldelta))
		// mean a change of one full zoom level. Smaller values will make wheel-zooming
		// faster (and vice versa).
		wheelPxPerZoomLevel: 60
	});
	
	L.Map.ScrollWheelZoom = L.Handler.extend({
		addHooks: function () {
			L.DomEvent.on(this._map._container, 'mousewheel', this._onWheelScroll, this);
	
			this._delta = 0;
		},
	
		removeHooks: function () {
			L.DomEvent.off(this._map._container, 'mousewheel', this._onWheelScroll, this);
		},
	
		_onWheelScroll: function (e) {
			var delta = L.DomEvent.getWheelDelta(e);
	
			var debounce = this._map.options.wheelDebounceTime;
	
			this._delta += delta;
			this._lastMousePos = this._map.mouseEventToContainerPoint(e);
	
			if (!this._startTime) {
				this._startTime = +new Date();
			}
	
			var left = Math.max(debounce - (+new Date() - this._startTime), 0);
	
			clearTimeout(this._timer);
			this._timer = setTimeout(L.bind(this._performZoom, this), left);
	
			L.DomEvent.stop(e);
		},
	
		_performZoom: function () {
			var map = this._map,
			    zoom = map.getZoom(),
			    snap = this._map.options.zoomSnap || 0;
	
			map._stop(); // stop panning and fly animations if any
	
			// map the delta with a sigmoid function to -4..4 range leaning on -1..1
			var d2 = this._delta / (this._map.options.wheelPxPerZoomLevel * 4),
			    d3 = 4 * Math.log(2 / (1 + Math.exp(-Math.abs(d2)))) / Math.LN2,
			    d4 = snap ? Math.ceil(d3 / snap) * snap : d3,
			    delta = map._limitZoom(zoom + (this._delta > 0 ? d4 : -d4)) - zoom;
	
			this._delta = 0;
			this._startTime = null;
	
			if (!delta) { return; }
	
			if (map.options.scrollWheelZoom === 'center') {
				map.setZoom(zoom + delta);
			} else {
				map.setZoomAround(this._lastMousePos, zoom + delta);
			}
		}
	});
	
	// @section Handlers
	// @property scrollWheelZoom: Handler
	// Scroll wheel zoom handler.
	L.Map.addInitHook('addHandler', 'scrollWheelZoom', L.Map.ScrollWheelZoom);
	
	
	
	/*
	 * Extends the event handling code with double tap support for mobile browsers.
	 */
	
	L.extend(L.DomEvent, {
	
		_touchstart: L.Browser.msPointer ? 'MSPointerDown' : L.Browser.pointer ? 'pointerdown' : 'touchstart',
		_touchend: L.Browser.msPointer ? 'MSPointerUp' : L.Browser.pointer ? 'pointerup' : 'touchend',
	
		// inspired by Zepto touch code by Thomas Fuchs
		addDoubleTapListener: function (obj, handler, id) {
			var last, touch,
			    doubleTap = false,
			    delay = 250;
	
			function onTouchStart(e) {
				var count;
	
				if (L.Browser.pointer) {
					count = L.DomEvent._pointersCount;
				} else {
					count = e.touches.length;
				}
	
				if (count > 1) { return; }
	
				var now = Date.now(),
				    delta = now - (last || now);
	
				touch = e.touches ? e.touches[0] : e;
				doubleTap = (delta > 0 && delta <= delay);
				last = now;
			}
	
			function onTouchEnd() {
				if (doubleTap && !touch.cancelBubble) {
					if (L.Browser.pointer) {
						// work around .type being readonly with MSPointer* events
						var newTouch = {},
						    prop, i;
	
						for (i in touch) {
							prop = touch[i];
							newTouch[i] = prop && prop.bind ? prop.bind(touch) : prop;
						}
						touch = newTouch;
					}
					touch.type = 'dblclick';
					handler(touch);
					last = null;
				}
			}
	
			var pre = '_leaflet_',
			    touchstart = this._touchstart,
			    touchend = this._touchend;
	
			obj[pre + touchstart + id] = onTouchStart;
			obj[pre + touchend + id] = onTouchEnd;
			obj[pre + 'dblclick' + id] = handler;
	
			obj.addEventListener(touchstart, onTouchStart, false);
			obj.addEventListener(touchend, onTouchEnd, false);
	
			// On some platforms (notably, chrome on win10 + touchscreen + mouse),
			// the browser doesn't fire touchend/pointerup events but does fire
			// native dblclicks. See #4127.
			if (!L.Browser.edge) {
				obj.addEventListener('dblclick', handler, false);
			}
	
			return this;
		},
	
		removeDoubleTapListener: function (obj, id) {
			var pre = '_leaflet_',
			    touchstart = obj[pre + this._touchstart + id],
			    touchend = obj[pre + this._touchend + id],
			    dblclick = obj[pre + 'dblclick' + id];
	
			obj.removeEventListener(this._touchstart, touchstart, false);
			obj.removeEventListener(this._touchend, touchend, false);
			if (!L.Browser.edge) {
				obj.removeEventListener('dblclick', dblclick, false);
			}
	
			return this;
		}
	});
	
	
	
	/*
	 * Extends L.DomEvent to provide touch support for Internet Explorer and Windows-based devices.
	 */
	
	L.extend(L.DomEvent, {
	
		POINTER_DOWN:   L.Browser.msPointer ? 'MSPointerDown'   : 'pointerdown',
		POINTER_MOVE:   L.Browser.msPointer ? 'MSPointerMove'   : 'pointermove',
		POINTER_UP:     L.Browser.msPointer ? 'MSPointerUp'     : 'pointerup',
		POINTER_CANCEL: L.Browser.msPointer ? 'MSPointerCancel' : 'pointercancel',
		TAG_WHITE_LIST: ['INPUT', 'SELECT', 'OPTION'],
	
		_pointers: {},
		_pointersCount: 0,
	
		// Provides a touch events wrapper for (ms)pointer events.
		// ref http://www.w3.org/TR/pointerevents/ https://www.w3.org/Bugs/Public/show_bug.cgi?id=22890
	
		addPointerListener: function (obj, type, handler, id) {
	
			if (type === 'touchstart') {
				this._addPointerStart(obj, handler, id);
	
			} else if (type === 'touchmove') {
				this._addPointerMove(obj, handler, id);
	
			} else if (type === 'touchend') {
				this._addPointerEnd(obj, handler, id);
			}
	
			return this;
		},
	
		removePointerListener: function (obj, type, id) {
			var handler = obj['_leaflet_' + type + id];
	
			if (type === 'touchstart') {
				obj.removeEventListener(this.POINTER_DOWN, handler, false);
	
			} else if (type === 'touchmove') {
				obj.removeEventListener(this.POINTER_MOVE, handler, false);
	
			} else if (type === 'touchend') {
				obj.removeEventListener(this.POINTER_UP, handler, false);
				obj.removeEventListener(this.POINTER_CANCEL, handler, false);
			}
	
			return this;
		},
	
		_addPointerStart: function (obj, handler, id) {
			var onDown = L.bind(function (e) {
				if (e.pointerType !== 'mouse' && e.pointerType !== e.MSPOINTER_TYPE_MOUSE) {
					// In IE11, some touch events needs to fire for form controls, or
					// the controls will stop working. We keep a whitelist of tag names that
					// need these events. For other target tags, we prevent default on the event.
					if (this.TAG_WHITE_LIST.indexOf(e.target.tagName) < 0) {
						L.DomEvent.preventDefault(e);
					} else {
						return;
					}
				}
	
				this._handlePointer(e, handler);
			}, this);
	
			obj['_leaflet_touchstart' + id] = onDown;
			obj.addEventListener(this.POINTER_DOWN, onDown, false);
	
			// need to keep track of what pointers and how many are active to provide e.touches emulation
			if (!this._pointerDocListener) {
				var pointerUp = L.bind(this._globalPointerUp, this);
	
				// we listen documentElement as any drags that end by moving the touch off the screen get fired there
				document.documentElement.addEventListener(this.POINTER_DOWN, L.bind(this._globalPointerDown, this), true);
				document.documentElement.addEventListener(this.POINTER_MOVE, L.bind(this._globalPointerMove, this), true);
				document.documentElement.addEventListener(this.POINTER_UP, pointerUp, true);
				document.documentElement.addEventListener(this.POINTER_CANCEL, pointerUp, true);
	
				this._pointerDocListener = true;
			}
		},
	
		_globalPointerDown: function (e) {
			this._pointers[e.pointerId] = e;
			this._pointersCount++;
		},
	
		_globalPointerMove: function (e) {
			if (this._pointers[e.pointerId]) {
				this._pointers[e.pointerId] = e;
			}
		},
	
		_globalPointerUp: function (e) {
			delete this._pointers[e.pointerId];
			this._pointersCount--;
		},
	
		_handlePointer: function (e, handler) {
			e.touches = [];
			for (var i in this._pointers) {
				e.touches.push(this._pointers[i]);
			}
			e.changedTouches = [e];
	
			handler(e);
		},
	
		_addPointerMove: function (obj, handler, id) {
			var onMove = L.bind(function (e) {
				// don't fire touch moves when mouse isn't down
				if ((e.pointerType === e.MSPOINTER_TYPE_MOUSE || e.pointerType === 'mouse') && e.buttons === 0) { return; }
	
				this._handlePointer(e, handler);
			}, this);
	
			obj['_leaflet_touchmove' + id] = onMove;
			obj.addEventListener(this.POINTER_MOVE, onMove, false);
		},
	
		_addPointerEnd: function (obj, handler, id) {
			var onUp = L.bind(function (e) {
				this._handlePointer(e, handler);
			}, this);
	
			obj['_leaflet_touchend' + id] = onUp;
			obj.addEventListener(this.POINTER_UP, onUp, false);
			obj.addEventListener(this.POINTER_CANCEL, onUp, false);
		}
	});
	
	
	
	/*
	 * L.Handler.TouchZoom is used by L.Map to add pinch zoom on supported mobile browsers.
	 */
	
	// @namespace Map
	// @section Interaction Options
	L.Map.mergeOptions({
		// @section Touch interaction options
		// @option touchZoom: Boolean|String = *
		// Whether the map can be zoomed by touch-dragging with two fingers. If
		// passed `'center'`, it will zoom to the center of the view regardless of
		// where the touch events (fingers) were. Enabled for touch-capable web
		// browsers except for old Androids.
		touchZoom: L.Browser.touch && !L.Browser.android23,
	
		// @option bounceAtZoomLimits: Boolean = true
		// Set it to false if you don't want the map to zoom beyond min/max zoom
		// and then bounce back when pinch-zooming.
		bounceAtZoomLimits: true
	});
	
	L.Map.TouchZoom = L.Handler.extend({
		addHooks: function () {
			L.DomUtil.addClass(this._map._container, 'leaflet-touch-zoom');
			L.DomEvent.on(this._map._container, 'touchstart', this._onTouchStart, this);
		},
	
		removeHooks: function () {
			L.DomUtil.removeClass(this._map._container, 'leaflet-touch-zoom');
			L.DomEvent.off(this._map._container, 'touchstart', this._onTouchStart, this);
		},
	
		_onTouchStart: function (e) {
			var map = this._map;
			if (!e.touches || e.touches.length !== 2 || map._animatingZoom || this._zooming) { return; }
	
			var p1 = map.mouseEventToContainerPoint(e.touches[0]),
			    p2 = map.mouseEventToContainerPoint(e.touches[1]);
	
			this._centerPoint = map.getSize()._divideBy(2);
			this._startLatLng = map.containerPointToLatLng(this._centerPoint);
			if (map.options.touchZoom !== 'center') {
				this._pinchStartLatLng = map.containerPointToLatLng(p1.add(p2)._divideBy(2));
			}
	
			this._startDist = p1.distanceTo(p2);
			this._startZoom = map.getZoom();
	
			this._moved = false;
			this._zooming = true;
	
			map._stop();
	
			L.DomEvent
			    .on(document, 'touchmove', this._onTouchMove, this)
			    .on(document, 'touchend', this._onTouchEnd, this);
	
			L.DomEvent.preventDefault(e);
		},
	
		_onTouchMove: function (e) {
			if (!e.touches || e.touches.length !== 2 || !this._zooming) { return; }
	
			var map = this._map,
			    p1 = map.mouseEventToContainerPoint(e.touches[0]),
			    p2 = map.mouseEventToContainerPoint(e.touches[1]),
			    scale = p1.distanceTo(p2) / this._startDist;
	
	
			this._zoom = map.getScaleZoom(scale, this._startZoom);
	
			if (!map.options.bounceAtZoomLimits && (
				(this._zoom < map.getMinZoom() && scale < 1) ||
				(this._zoom > map.getMaxZoom() && scale > 1))) {
				this._zoom = map._limitZoom(this._zoom);
			}
	
			if (map.options.touchZoom === 'center') {
				this._center = this._startLatLng;
				if (scale === 1) { return; }
			} else {
				// Get delta from pinch to center, so centerLatLng is delta applied to initial pinchLatLng
				var delta = p1._add(p2)._divideBy(2)._subtract(this._centerPoint);
				if (scale === 1 && delta.x === 0 && delta.y === 0) { return; }
				this._center = map.unproject(map.project(this._pinchStartLatLng, this._zoom).subtract(delta), this._zoom);
			}
	
			if (!this._moved) {
				map._moveStart(true);
				this._moved = true;
			}
	
			L.Util.cancelAnimFrame(this._animRequest);
	
			var moveFn = L.bind(map._move, map, this._center, this._zoom, {pinch: true, round: false});
			this._animRequest = L.Util.requestAnimFrame(moveFn, this, true);
	
			L.DomEvent.preventDefault(e);
		},
	
		_onTouchEnd: function () {
			if (!this._moved || !this._zooming) {
				this._zooming = false;
				return;
			}
	
			this._zooming = false;
			L.Util.cancelAnimFrame(this._animRequest);
	
			L.DomEvent
			    .off(document, 'touchmove', this._onTouchMove)
			    .off(document, 'touchend', this._onTouchEnd);
	
			// Pinch updates GridLayers' levels only when zoomSnap is off, so zoomSnap becomes noUpdate.
			if (this._map.options.zoomAnimation) {
				this._map._animateZoom(this._center, this._map._limitZoom(this._zoom), true, this._map.options.zoomSnap);
			} else {
				this._map._resetView(this._center, this._map._limitZoom(this._zoom));
			}
		}
	});
	
	// @section Handlers
	// @property touchZoom: Handler
	// Touch zoom handler.
	L.Map.addInitHook('addHandler', 'touchZoom', L.Map.TouchZoom);
	
	
	
	/*
	 * L.Map.Tap is used to enable mobile hacks like quick taps and long hold.
	 */
	
	// @namespace Map
	// @section Interaction Options
	L.Map.mergeOptions({
		// @section Touch interaction options
		// @option tap: Boolean = true
		// Enables mobile hacks for supporting instant taps (fixing 200ms click
		// delay on iOS/Android) and touch holds (fired as `contextmenu` events).
		tap: true,
	
		// @option tapTolerance: Number = 15
		// The max number of pixels a user can shift his finger during touch
		// for it to be considered a valid tap.
		tapTolerance: 15
	});
	
	L.Map.Tap = L.Handler.extend({
		addHooks: function () {
			L.DomEvent.on(this._map._container, 'touchstart', this._onDown, this);
		},
	
		removeHooks: function () {
			L.DomEvent.off(this._map._container, 'touchstart', this._onDown, this);
		},
	
		_onDown: function (e) {
			if (!e.touches) { return; }
	
			L.DomEvent.preventDefault(e);
	
			this._fireClick = true;
	
			// don't simulate click or track longpress if more than 1 touch
			if (e.touches.length > 1) {
				this._fireClick = false;
				clearTimeout(this._holdTimeout);
				return;
			}
	
			var first = e.touches[0],
			    el = first.target;
	
			this._startPos = this._newPos = new L.Point(first.clientX, first.clientY);
	
			// if touching a link, highlight it
			if (el.tagName && el.tagName.toLowerCase() === 'a') {
				L.DomUtil.addClass(el, 'leaflet-active');
			}
	
			// simulate long hold but setting a timeout
			this._holdTimeout = setTimeout(L.bind(function () {
				if (this._isTapValid()) {
					this._fireClick = false;
					this._onUp();
					this._simulateEvent('contextmenu', first);
				}
			}, this), 1000);
	
			this._simulateEvent('mousedown', first);
	
			L.DomEvent.on(document, {
				touchmove: this._onMove,
				touchend: this._onUp
			}, this);
		},
	
		_onUp: function (e) {
			clearTimeout(this._holdTimeout);
	
			L.DomEvent.off(document, {
				touchmove: this._onMove,
				touchend: this._onUp
			}, this);
	
			if (this._fireClick && e && e.changedTouches) {
	
				var first = e.changedTouches[0],
				    el = first.target;
	
				if (el && el.tagName && el.tagName.toLowerCase() === 'a') {
					L.DomUtil.removeClass(el, 'leaflet-active');
				}
	
				this._simulateEvent('mouseup', first);
	
				// simulate click if the touch didn't move too much
				if (this._isTapValid()) {
					this._simulateEvent('click', first);
				}
			}
		},
	
		_isTapValid: function () {
			return this._newPos.distanceTo(this._startPos) <= this._map.options.tapTolerance;
		},
	
		_onMove: function (e) {
			var first = e.touches[0];
			this._newPos = new L.Point(first.clientX, first.clientY);
			this._simulateEvent('mousemove', first);
		},
	
		_simulateEvent: function (type, e) {
			var simulatedEvent = document.createEvent('MouseEvents');
	
			simulatedEvent._simulated = true;
			e.target._simulatedClick = true;
	
			simulatedEvent.initMouseEvent(
			        type, true, true, window, 1,
			        e.screenX, e.screenY,
			        e.clientX, e.clientY,
			        false, false, false, false, 0, null);
	
			e.target.dispatchEvent(simulatedEvent);
		}
	});
	
	// @section Handlers
	// @property tap: Handler
	// Mobile touch hacks (quick tap and touch hold) handler.
	if (L.Browser.touch && !L.Browser.pointer) {
		L.Map.addInitHook('addHandler', 'tap', L.Map.Tap);
	}
	
	
	
	/*
	 * L.Handler.BoxZoom is used to add shift-drag zoom interaction to the map
	 * (zoom to a selected bounding box), enabled by default.
	 */
	
	// @namespace Map
	// @section Interaction Options
	L.Map.mergeOptions({
		// @option boxZoom: Boolean = true
		// Whether the map can be zoomed to a rectangular area specified by
		// dragging the mouse while pressing the shift key.
		boxZoom: true
	});
	
	L.Map.BoxZoom = L.Handler.extend({
		initialize: function (map) {
			this._map = map;
			this._container = map._container;
			this._pane = map._panes.overlayPane;
		},
	
		addHooks: function () {
			L.DomEvent.on(this._container, 'mousedown', this._onMouseDown, this);
		},
	
		removeHooks: function () {
			L.DomEvent.off(this._container, 'mousedown', this._onMouseDown, this);
		},
	
		moved: function () {
			return this._moved;
		},
	
		_resetState: function () {
			this._moved = false;
		},
	
		_onMouseDown: function (e) {
			if (!e.shiftKey || ((e.which !== 1) && (e.button !== 1))) { return false; }
	
			this._resetState();
	
			L.DomUtil.disableTextSelection();
			L.DomUtil.disableImageDrag();
	
			this._startPoint = this._map.mouseEventToContainerPoint(e);
	
			L.DomEvent.on(document, {
				contextmenu: L.DomEvent.stop,
				mousemove: this._onMouseMove,
				mouseup: this._onMouseUp,
				keydown: this._onKeyDown
			}, this);
		},
	
		_onMouseMove: function (e) {
			if (!this._moved) {
				this._moved = true;
	
				this._box = L.DomUtil.create('div', 'leaflet-zoom-box', this._container);
				L.DomUtil.addClass(this._container, 'leaflet-crosshair');
	
				this._map.fire('boxzoomstart');
			}
	
			this._point = this._map.mouseEventToContainerPoint(e);
	
			var bounds = new L.Bounds(this._point, this._startPoint),
			    size = bounds.getSize();
	
			L.DomUtil.setPosition(this._box, bounds.min);
	
			this._box.style.width  = size.x + 'px';
			this._box.style.height = size.y + 'px';
		},
	
		_finish: function () {
			if (this._moved) {
				L.DomUtil.remove(this._box);
				L.DomUtil.removeClass(this._container, 'leaflet-crosshair');
			}
	
			L.DomUtil.enableTextSelection();
			L.DomUtil.enableImageDrag();
	
			L.DomEvent.off(document, {
				contextmenu: L.DomEvent.stop,
				mousemove: this._onMouseMove,
				mouseup: this._onMouseUp,
				keydown: this._onKeyDown
			}, this);
		},
	
		_onMouseUp: function (e) {
			if ((e.which !== 1) && (e.button !== 1)) { return; }
	
			this._finish();
	
			if (!this._moved) { return; }
			// Postpone to next JS tick so internal click event handling
			// still see it as "moved".
			setTimeout(L.bind(this._resetState, this), 0);
	
			var bounds = new L.LatLngBounds(
			        this._map.containerPointToLatLng(this._startPoint),
			        this._map.containerPointToLatLng(this._point));
	
			this._map
				.fitBounds(bounds)
				.fire('boxzoomend', {boxZoomBounds: bounds});
		},
	
		_onKeyDown: function (e) {
			if (e.keyCode === 27) {
				this._finish();
			}
		}
	});
	
	// @section Handlers
	// @property boxZoom: Handler
	// Box (shift-drag with mouse) zoom handler.
	L.Map.addInitHook('addHandler', 'boxZoom', L.Map.BoxZoom);
	
	
	
	/*
	 * L.Map.Keyboard is handling keyboard interaction with the map, enabled by default.
	 */
	
	// @namespace Map
	// @section Keyboard Navigation Options
	L.Map.mergeOptions({
		// @option keyboard: Boolean = true
		// Makes the map focusable and allows users to navigate the map with keyboard
		// arrows and `+`/`-` keys.
		keyboard: true,
	
		// @option keyboardPanDelta: Number = 80
		// Amount of pixels to pan when pressing an arrow key.
		keyboardPanDelta: 80
	});
	
	L.Map.Keyboard = L.Handler.extend({
	
		keyCodes: {
			left:    [37],
			right:   [39],
			down:    [40],
			up:      [38],
			zoomIn:  [187, 107, 61, 171],
			zoomOut: [189, 109, 54, 173]
		},
	
		initialize: function (map) {
			this._map = map;
	
			this._setPanDelta(map.options.keyboardPanDelta);
			this._setZoomDelta(map.options.zoomDelta);
		},
	
		addHooks: function () {
			var container = this._map._container;
	
			// make the container focusable by tabbing
			if (container.tabIndex <= 0) {
				container.tabIndex = '0';
			}
	
			L.DomEvent.on(container, {
				focus: this._onFocus,
				blur: this._onBlur,
				mousedown: this._onMouseDown
			}, this);
	
			this._map.on({
				focus: this._addHooks,
				blur: this._removeHooks
			}, this);
		},
	
		removeHooks: function () {
			this._removeHooks();
	
			L.DomEvent.off(this._map._container, {
				focus: this._onFocus,
				blur: this._onBlur,
				mousedown: this._onMouseDown
			}, this);
	
			this._map.off({
				focus: this._addHooks,
				blur: this._removeHooks
			}, this);
		},
	
		_onMouseDown: function () {
			if (this._focused) { return; }
	
			var body = document.body,
			    docEl = document.documentElement,
			    top = body.scrollTop || docEl.scrollTop,
			    left = body.scrollLeft || docEl.scrollLeft;
	
			this._map._container.focus();
	
			window.scrollTo(left, top);
		},
	
		_onFocus: function () {
			this._focused = true;
			this._map.fire('focus');
		},
	
		_onBlur: function () {
			this._focused = false;
			this._map.fire('blur');
		},
	
		_setPanDelta: function (panDelta) {
			var keys = this._panKeys = {},
			    codes = this.keyCodes,
			    i, len;
	
			for (i = 0, len = codes.left.length; i < len; i++) {
				keys[codes.left[i]] = [-1 * panDelta, 0];
			}
			for (i = 0, len = codes.right.length; i < len; i++) {
				keys[codes.right[i]] = [panDelta, 0];
			}
			for (i = 0, len = codes.down.length; i < len; i++) {
				keys[codes.down[i]] = [0, panDelta];
			}
			for (i = 0, len = codes.up.length; i < len; i++) {
				keys[codes.up[i]] = [0, -1 * panDelta];
			}
		},
	
		_setZoomDelta: function (zoomDelta) {
			var keys = this._zoomKeys = {},
			    codes = this.keyCodes,
			    i, len;
	
			for (i = 0, len = codes.zoomIn.length; i < len; i++) {
				keys[codes.zoomIn[i]] = zoomDelta;
			}
			for (i = 0, len = codes.zoomOut.length; i < len; i++) {
				keys[codes.zoomOut[i]] = -zoomDelta;
			}
		},
	
		_addHooks: function () {
			L.DomEvent.on(document, 'keydown', this._onKeyDown, this);
		},
	
		_removeHooks: function () {
			L.DomEvent.off(document, 'keydown', this._onKeyDown, this);
		},
	
		_onKeyDown: function (e) {
			if (e.altKey || e.ctrlKey || e.metaKey) { return; }
	
			var key = e.keyCode,
			    map = this._map,
			    offset;
	
			if (key in this._panKeys) {
	
				if (map._panAnim && map._panAnim._inProgress) { return; }
	
				offset = this._panKeys[key];
				if (e.shiftKey) {
					offset = L.point(offset).multiplyBy(3);
				}
	
				map.panBy(offset);
	
				if (map.options.maxBounds) {
					map.panInsideBounds(map.options.maxBounds);
				}
	
			} else if (key in this._zoomKeys) {
				map.setZoom(map.getZoom() + (e.shiftKey ? 3 : 1) * this._zoomKeys[key]);
	
			} else if (key === 27) {
				map.closePopup();
	
			} else {
				return;
			}
	
			L.DomEvent.stop(e);
		}
	});
	
	// @section Handlers
	// @section Handlers
	// @property keyboard: Handler
	// Keyboard navigation handler.
	L.Map.addInitHook('addHandler', 'keyboard', L.Map.Keyboard);
	
	
	
	/*
	 * L.Handler.MarkerDrag is used internally by L.Marker to make the markers draggable.
	 */
	
	
	/* @namespace Marker
	 * @section Interaction handlers
	 *
	 * Interaction handlers are properties of a marker instance that allow you to control interaction behavior in runtime, enabling or disabling certain features such as dragging (see `Handler` methods). Example:
	 *
	 * ```js
	 * marker.dragging.disable();
	 * ```
	 *
	 * @property dragging: Handler
	 * Marker dragging handler (by both mouse and touch).
	 */
	
	L.Handler.MarkerDrag = L.Handler.extend({
		initialize: function (marker) {
			this._marker = marker;
		},
	
		addHooks: function () {
			var icon = this._marker._icon;
	
			if (!this._draggable) {
				this._draggable = new L.Draggable(icon, icon, true);
			}
	
			this._draggable.on({
				dragstart: this._onDragStart,
				drag: this._onDrag,
				dragend: this._onDragEnd
			}, this).enable();
	
			L.DomUtil.addClass(icon, 'leaflet-marker-draggable');
		},
	
		removeHooks: function () {
			this._draggable.off({
				dragstart: this._onDragStart,
				drag: this._onDrag,
				dragend: this._onDragEnd
			}, this).disable();
	
			if (this._marker._icon) {
				L.DomUtil.removeClass(this._marker._icon, 'leaflet-marker-draggable');
			}
		},
	
		moved: function () {
			return this._draggable && this._draggable._moved;
		},
	
		_onDragStart: function () {
			// @section Dragging events
			// @event dragstart: Event
			// Fired when the user starts dragging the marker.
	
			// @event movestart: Event
			// Fired when the marker starts moving (because of dragging).
	
			this._oldLatLng = this._marker.getLatLng();
			this._marker
			    .closePopup()
			    .fire('movestart')
			    .fire('dragstart');
		},
	
		_onDrag: function (e) {
			var marker = this._marker,
			    shadow = marker._shadow,
			    iconPos = L.DomUtil.getPosition(marker._icon),
			    latlng = marker._map.layerPointToLatLng(iconPos);
	
			// update shadow position
			if (shadow) {
				L.DomUtil.setPosition(shadow, iconPos);
			}
	
			marker._latlng = latlng;
			e.latlng = latlng;
			e.oldLatLng = this._oldLatLng;
	
			// @event drag: Event
			// Fired repeatedly while the user drags the marker.
			marker
			    .fire('move', e)
			    .fire('drag', e);
		},
	
		_onDragEnd: function (e) {
			// @event dragend: DragEndEvent
			// Fired when the user stops dragging the marker.
	
			// @event moveend: Event
			// Fired when the marker stops moving (because of dragging).
			delete this._oldLatLng;
			this._marker
			    .fire('moveend')
			    .fire('dragend', e);
		}
	});
	
	
	
	/*
	 * @class Control
	 * @aka L.Control
	 *
	 * L.Control is a base class for implementing map controls. Handles positioning.
	 * All other controls extend from this class.
	 */
	
	L.Control = L.Class.extend({
		// @section
		// @aka Control options
		options: {
			// @option position: String = 'topright'
			// The position of the control (one of the map corners). Possible values are `'topleft'`,
			// `'topright'`, `'bottomleft'` or `'bottomright'`
			position: 'topright'
		},
	
		initialize: function (options) {
			L.setOptions(this, options);
		},
	
		/* @section
		 * Classes extending L.Control will inherit the following methods:
		 *
		 * @method getPosition: string
		 * Returns the position of the control.
		 */
		getPosition: function () {
			return this.options.position;
		},
	
		// @method setPosition(position: string): this
		// Sets the position of the control.
		setPosition: function (position) {
			var map = this._map;
	
			if (map) {
				map.removeControl(this);
			}
	
			this.options.position = position;
	
			if (map) {
				map.addControl(this);
			}
	
			return this;
		},
	
		// @method getContainer: HTMLElement
		// Returns the HTMLElement that contains the control.
		getContainer: function () {
			return this._container;
		},
	
		// @method addTo(map: Map): this
		// Adds the control to the given map.
		addTo: function (map) {
			this.remove();
			this._map = map;
	
			var container = this._container = this.onAdd(map),
			    pos = this.getPosition(),
			    corner = map._controlCorners[pos];
	
			L.DomUtil.addClass(container, 'leaflet-control');
	
			if (pos.indexOf('bottom') !== -1) {
				corner.insertBefore(container, corner.firstChild);
			} else {
				corner.appendChild(container);
			}
	
			return this;
		},
	
		// @method remove: this
		// Removes the control from the map it is currently active on.
		remove: function () {
			if (!this._map) {
				return this;
			}
	
			L.DomUtil.remove(this._container);
	
			if (this.onRemove) {
				this.onRemove(this._map);
			}
	
			this._map = null;
	
			return this;
		},
	
		_refocusOnMap: function (e) {
			// if map exists and event is not a keyboard event
			if (this._map && e && e.screenX > 0 && e.screenY > 0) {
				this._map.getContainer().focus();
			}
		}
	});
	
	L.control = function (options) {
		return new L.Control(options);
	};
	
	/* @section Extension methods
	 * @uninheritable
	 *
	 * Every control should extend from `L.Control` and (re-)implement the following methods.
	 *
	 * @method onAdd(map: Map): HTMLElement
	 * Should return the container DOM element for the control and add listeners on relevant map events. Called on [`control.addTo(map)`](#control-addTo).
	 *
	 * @method onRemove(map: Map)
	 * Optional method. Should contain all clean up code that removes the listeners previously added in [`onAdd`](#control-onadd). Called on [`control.remove()`](#control-remove).
	 */
	
	/* @namespace Map
	 * @section Methods for Layers and Controls
	 */
	L.Map.include({
		// @method addControl(control: Control): this
		// Adds the given control to the map
		addControl: function (control) {
			control.addTo(this);
			return this;
		},
	
		// @method removeControl(control: Control): this
		// Removes the given control from the map
		removeControl: function (control) {
			control.remove();
			return this;
		},
	
		_initControlPos: function () {
			var corners = this._controlCorners = {},
			    l = 'leaflet-',
			    container = this._controlContainer =
			            L.DomUtil.create('div', l + 'control-container', this._container);
	
			function createCorner(vSide, hSide) {
				var className = l + vSide + ' ' + l + hSide;
	
				corners[vSide + hSide] = L.DomUtil.create('div', className, container);
			}
	
			createCorner('top', 'left');
			createCorner('top', 'right');
			createCorner('bottom', 'left');
			createCorner('bottom', 'right');
		},
	
		_clearControlPos: function () {
			L.DomUtil.remove(this._controlContainer);
		}
	});
	
	
	
	/*
	 * @class Control.Zoom
	 * @aka L.Control.Zoom
	 * @inherits Control
	 *
	 * A basic zoom control with two buttons (zoom in and zoom out). It is put on the map by default unless you set its [`zoomControl` option](#map-zoomcontrol) to `false`. Extends `Control`.
	 */
	
	L.Control.Zoom = L.Control.extend({
		// @section
		// @aka Control.Zoom options
		options: {
			position: 'topleft',
	
			// @option zoomInText: String = '+'
			// The text set on the 'zoom in' button.
			zoomInText: '+',
	
			// @option zoomInTitle: String = 'Zoom in'
			// The title set on the 'zoom in' button.
			zoomInTitle: 'Zoom in',
	
			// @option zoomOutText: String = '-'
			// The text set on the 'zoom out' button.
			zoomOutText: '-',
	
			// @option zoomOutTitle: String = 'Zoom out'
			// The title set on the 'zoom out' button.
			zoomOutTitle: 'Zoom out'
		},
	
		onAdd: function (map) {
			var zoomName = 'leaflet-control-zoom',
			    container = L.DomUtil.create('div', zoomName + ' leaflet-bar'),
			    options = this.options;
	
			this._zoomInButton  = this._createButton(options.zoomInText, options.zoomInTitle,
			        zoomName + '-in',  container, this._zoomIn);
			this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle,
			        zoomName + '-out', container, this._zoomOut);
	
			this._updateDisabled();
			map.on('zoomend zoomlevelschange', this._updateDisabled, this);
	
			return container;
		},
	
		onRemove: function (map) {
			map.off('zoomend zoomlevelschange', this._updateDisabled, this);
		},
	
		disable: function () {
			this._disabled = true;
			this._updateDisabled();
			return this;
		},
	
		enable: function () {
			this._disabled = false;
			this._updateDisabled();
			return this;
		},
	
		_zoomIn: function (e) {
			if (!this._disabled && this._map._zoom < this._map.getMaxZoom()) {
				this._map.zoomIn(this._map.options.zoomDelta * (e.shiftKey ? 3 : 1));
			}
		},
	
		_zoomOut: function (e) {
			if (!this._disabled && this._map._zoom > this._map.getMinZoom()) {
				this._map.zoomOut(this._map.options.zoomDelta * (e.shiftKey ? 3 : 1));
			}
		},
	
		_createButton: function (html, title, className, container, fn) {
			var link = L.DomUtil.create('a', className, container);
			link.innerHTML = html;
			link.href = '#';
			link.title = title;
	
			L.DomEvent
			    .on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
			    .on(link, 'click', L.DomEvent.stop)
			    .on(link, 'click', fn, this)
			    .on(link, 'click', this._refocusOnMap, this);
	
			return link;
		},
	
		_updateDisabled: function () {
			var map = this._map,
			    className = 'leaflet-disabled';
	
			L.DomUtil.removeClass(this._zoomInButton, className);
			L.DomUtil.removeClass(this._zoomOutButton, className);
	
			if (this._disabled || map._zoom === map.getMinZoom()) {
				L.DomUtil.addClass(this._zoomOutButton, className);
			}
			if (this._disabled || map._zoom === map.getMaxZoom()) {
				L.DomUtil.addClass(this._zoomInButton, className);
			}
		}
	});
	
	// @namespace Map
	// @section Control options
	// @option zoomControl: Boolean = true
	// Whether a [zoom control](#control-zoom) is added to the map by default.
	L.Map.mergeOptions({
		zoomControl: true
	});
	
	L.Map.addInitHook(function () {
		if (this.options.zoomControl) {
			this.zoomControl = new L.Control.Zoom();
			this.addControl(this.zoomControl);
		}
	});
	
	// @namespace Control.Zoom
	// @factory L.control.zoom(options: Control.Zoom options)
	// Creates a zoom control
	L.control.zoom = function (options) {
		return new L.Control.Zoom(options);
	};
	
	
	
	/*
	 * @class Control.Attribution
	 * @aka L.Control.Attribution
	 * @inherits Control
	 *
	 * The attribution control allows you to display attribution data in a small text box on a map. It is put on the map by default unless you set its [`attributionControl` option](#map-attributioncontrol) to `false`, and it fetches attribution texts from layers with the [`getAttribution` method](#layer-getattribution) automatically. Extends Control.
	 */
	
	L.Control.Attribution = L.Control.extend({
		// @section
		// @aka Control.Attribution options
		options: {
			position: 'bottomright',
	
			// @option prefix: String = 'Leaflet'
			// The HTML text shown before the attributions. Pass `false` to disable.
			prefix: '<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>'
		},
	
		initialize: function (options) {
			L.setOptions(this, options);
	
			this._attributions = {};
		},
	
		onAdd: function (map) {
			map.attributionControl = this;
			this._container = L.DomUtil.create('div', 'leaflet-control-attribution');
			if (L.DomEvent) {
				L.DomEvent.disableClickPropagation(this._container);
			}
	
			// TODO ugly, refactor
			for (var i in map._layers) {
				if (map._layers[i].getAttribution) {
					this.addAttribution(map._layers[i].getAttribution());
				}
			}
	
			this._update();
	
			return this._container;
		},
	
		// @method setPrefix(prefix: String): this
		// Sets the text before the attributions.
		setPrefix: function (prefix) {
			this.options.prefix = prefix;
			this._update();
			return this;
		},
	
		// @method addAttribution(text: String): this
		// Adds an attribution text (e.g. `'Vector data &copy; Mapbox'`).
		addAttribution: function (text) {
			if (!text) { return this; }
	
			if (!this._attributions[text]) {
				this._attributions[text] = 0;
			}
			this._attributions[text]++;
	
			this._update();
	
			return this;
		},
	
		// @method removeAttribution(text: String): this
		// Removes an attribution text.
		removeAttribution: function (text) {
			if (!text) { return this; }
	
			if (this._attributions[text]) {
				this._attributions[text]--;
				this._update();
			}
	
			return this;
		},
	
		_update: function () {
			if (!this._map) { return; }
	
			var attribs = [];
	
			for (var i in this._attributions) {
				if (this._attributions[i]) {
					attribs.push(i);
				}
			}
	
			var prefixAndAttribs = [];
	
			if (this.options.prefix) {
				prefixAndAttribs.push(this.options.prefix);
			}
			if (attribs.length) {
				prefixAndAttribs.push(attribs.join(', '));
			}
	
			this._container.innerHTML = prefixAndAttribs.join(' | ');
		}
	});
	
	// @namespace Map
	// @section Control options
	// @option attributionControl: Boolean = true
	// Whether a [attribution control](#control-attribution) is added to the map by default.
	L.Map.mergeOptions({
		attributionControl: true
	});
	
	L.Map.addInitHook(function () {
		if (this.options.attributionControl) {
			new L.Control.Attribution().addTo(this);
		}
	});
	
	// @namespace Control.Attribution
	// @factory L.control.attribution(options: Control.Attribution options)
	// Creates an attribution control.
	L.control.attribution = function (options) {
		return new L.Control.Attribution(options);
	};
	
	
	
	/*
	 * @class Control.Scale
	 * @aka L.Control.Scale
	 * @inherits Control
	 *
	 * A simple scale control that shows the scale of the current center of screen in metric (m/km) and imperial (mi/ft) systems. Extends `Control`.
	 *
	 * @example
	 *
	 * ```js
	 * L.control.scale().addTo(map);
	 * ```
	 */
	
	L.Control.Scale = L.Control.extend({
		// @section
		// @aka Control.Scale options
		options: {
			position: 'bottomleft',
	
			// @option maxWidth: Number = 100
			// Maximum width of the control in pixels. The width is set dynamically to show round values (e.g. 100, 200, 500).
			maxWidth: 100,
	
			// @option metric: Boolean = True
			// Whether to show the metric scale line (m/km).
			metric: true,
	
			// @option imperial: Boolean = True
			// Whether to show the imperial scale line (mi/ft).
			imperial: true
	
			// @option updateWhenIdle: Boolean = false
			// If `true`, the control is updated on [`moveend`](#map-moveend), otherwise it's always up-to-date (updated on [`move`](#map-move)).
		},
	
		onAdd: function (map) {
			var className = 'leaflet-control-scale',
			    container = L.DomUtil.create('div', className),
			    options = this.options;
	
			this._addScales(options, className + '-line', container);
	
			map.on(options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
			map.whenReady(this._update, this);
	
			return container;
		},
	
		onRemove: function (map) {
			map.off(this.options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
		},
	
		_addScales: function (options, className, container) {
			if (options.metric) {
				this._mScale = L.DomUtil.create('div', className, container);
			}
			if (options.imperial) {
				this._iScale = L.DomUtil.create('div', className, container);
			}
		},
	
		_update: function () {
			var map = this._map,
			    y = map.getSize().y / 2;
	
			var maxMeters = map.distance(
					map.containerPointToLatLng([0, y]),
					map.containerPointToLatLng([this.options.maxWidth, y]));
	
			this._updateScales(maxMeters);
		},
	
		_updateScales: function (maxMeters) {
			if (this.options.metric && maxMeters) {
				this._updateMetric(maxMeters);
			}
			if (this.options.imperial && maxMeters) {
				this._updateImperial(maxMeters);
			}
		},
	
		_updateMetric: function (maxMeters) {
			var meters = this._getRoundNum(maxMeters),
			    label = meters < 1000 ? meters + ' m' : (meters / 1000) + ' km';
	
			this._updateScale(this._mScale, label, meters / maxMeters);
		},
	
		_updateImperial: function (maxMeters) {
			var maxFeet = maxMeters * 3.2808399,
			    maxMiles, miles, feet;
	
			if (maxFeet > 5280) {
				maxMiles = maxFeet / 5280;
				miles = this._getRoundNum(maxMiles);
				this._updateScale(this._iScale, miles + ' mi', miles / maxMiles);
	
			} else {
				feet = this._getRoundNum(maxFeet);
				this._updateScale(this._iScale, feet + ' ft', feet / maxFeet);
			}
		},
	
		_updateScale: function (scale, text, ratio) {
			scale.style.width = Math.round(this.options.maxWidth * ratio) + 'px';
			scale.innerHTML = text;
		},
	
		_getRoundNum: function (num) {
			var pow10 = Math.pow(10, (Math.floor(num) + '').length - 1),
			    d = num / pow10;
	
			d = d >= 10 ? 10 :
			    d >= 5 ? 5 :
			    d >= 3 ? 3 :
			    d >= 2 ? 2 : 1;
	
			return pow10 * d;
		}
	});
	
	
	// @factory L.control.scale(options?: Control.Scale options)
	// Creates an scale control with the given options.
	L.control.scale = function (options) {
		return new L.Control.Scale(options);
	};
	
	
	
	/*
	 * @class Control.Layers
	 * @aka L.Control.Layers
	 * @inherits Control
	 *
	 * The layers control gives users the ability to switch between different base layers and switch overlays on/off (check out the [detailed example](http://leafletjs.com/examples/layers-control.html)). Extends `Control`.
	 *
	 * @example
	 *
	 * ```js
	 * var baseLayers = {
	 * 	"Mapbox": mapbox,
	 * 	"OpenStreetMap": osm
	 * };
	 *
	 * var overlays = {
	 * 	"Marker": marker,
	 * 	"Roads": roadsLayer
	 * };
	 *
	 * L.control.layers(baseLayers, overlays).addTo(map);
	 * ```
	 *
	 * The `baseLayers` and `overlays` parameters are object literals with layer names as keys and `Layer` objects as values:
	 *
	 * ```js
	 * {
	 *     "<someName1>": layer1,
	 *     "<someName2>": layer2
	 * }
	 * ```
	 *
	 * The layer names can contain HTML, which allows you to add additional styling to the items:
	 *
	 * ```js
	 * {"<img src='my-layer-icon' /> <span class='my-layer-item'>My Layer</span>": myLayer}
	 * ```
	 */
	
	
	L.Control.Layers = L.Control.extend({
		// @section
		// @aka Control.Layers options
		options: {
			// @option collapsed: Boolean = true
			// If `true`, the control will be collapsed into an icon and expanded on mouse hover or touch.
			collapsed: true,
			position: 'topright',
	
			// @option autoZIndex: Boolean = true
			// If `true`, the control will assign zIndexes in increasing order to all of its layers so that the order is preserved when switching them on/off.
			autoZIndex: true,
	
			// @option hideSingleBase: Boolean = false
			// If `true`, the base layers in the control will be hidden when there is only one.
			hideSingleBase: false
		},
	
		initialize: function (baseLayers, overlays, options) {
			L.setOptions(this, options);
	
			this._layers = [];
			this._lastZIndex = 0;
			this._handlingClick = false;
	
			for (var i in baseLayers) {
				this._addLayer(baseLayers[i], i);
			}
	
			for (i in overlays) {
				this._addLayer(overlays[i], i, true);
			}
		},
	
		onAdd: function (map) {
			this._initLayout();
			this._update();
	
			this._map = map;
			map.on('zoomend', this._checkDisabledLayers, this);
	
			return this._container;
		},
	
		onRemove: function () {
			this._map.off('zoomend', this._checkDisabledLayers, this);
	
			for (var i = 0; i < this._layers.length; i++) {
				this._layers[i].layer.off('add remove', this._onLayerChange, this);
			}
		},
	
		// @method addBaseLayer(layer: Layer, name: String): this
		// Adds a base layer (radio button entry) with the given name to the control.
		addBaseLayer: function (layer, name) {
			this._addLayer(layer, name);
			return (this._map) ? this._update() : this;
		},
	
		// @method addOverlay(layer: Layer, name: String): this
		// Adds an overlay (checkbox entry) with the given name to the control.
		addOverlay: function (layer, name) {
			this._addLayer(layer, name, true);
			return (this._map) ? this._update() : this;
		},
	
		// @method removeLayer(layer: Layer): this
		// Remove the given layer from the control.
		removeLayer: function (layer) {
			layer.off('add remove', this._onLayerChange, this);
	
			var obj = this._getLayer(L.stamp(layer));
			if (obj) {
				this._layers.splice(this._layers.indexOf(obj), 1);
			}
			return (this._map) ? this._update() : this;
		},
	
		// @method expand(): this
		// Expand the control container if collapsed.
		expand: function () {
			L.DomUtil.addClass(this._container, 'leaflet-control-layers-expanded');
			this._form.style.height = null;
			var acceptableHeight = this._map.getSize().y - (this._container.offsetTop + 50);
			if (acceptableHeight < this._form.clientHeight) {
				L.DomUtil.addClass(this._form, 'leaflet-control-layers-scrollbar');
				this._form.style.height = acceptableHeight + 'px';
			} else {
				L.DomUtil.removeClass(this._form, 'leaflet-control-layers-scrollbar');
			}
			this._checkDisabledLayers();
			return this;
		},
	
		// @method collapse(): this
		// Collapse the control container if expanded.
		collapse: function () {
			L.DomUtil.removeClass(this._container, 'leaflet-control-layers-expanded');
			return this;
		},
	
		_initLayout: function () {
			var className = 'leaflet-control-layers',
			    container = this._container = L.DomUtil.create('div', className);
	
			// makes this work on IE touch devices by stopping it from firing a mouseout event when the touch is released
			container.setAttribute('aria-haspopup', true);
	
			L.DomEvent.disableClickPropagation(container);
			if (!L.Browser.touch) {
				L.DomEvent.disableScrollPropagation(container);
			}
	
			var form = this._form = L.DomUtil.create('form', className + '-list');
	
			if (this.options.collapsed) {
				if (!L.Browser.android) {
					L.DomEvent.on(container, {
						mouseenter: this.expand,
						mouseleave: this.collapse
					}, this);
				}
	
				var link = this._layersLink = L.DomUtil.create('a', className + '-toggle', container);
				link.href = '#';
				link.title = 'Layers';
	
				if (L.Browser.touch) {
					L.DomEvent
					    .on(link, 'click', L.DomEvent.stop)
					    .on(link, 'click', this.expand, this);
				} else {
					L.DomEvent.on(link, 'focus', this.expand, this);
				}
	
				// work around for Firefox Android issue https://github.com/Leaflet/Leaflet/issues/2033
				L.DomEvent.on(form, 'click', function () {
					setTimeout(L.bind(this._onInputClick, this), 0);
				}, this);
	
				this._map.on('click', this.collapse, this);
				// TODO keyboard accessibility
			} else {
				this.expand();
			}
	
			this._baseLayersList = L.DomUtil.create('div', className + '-base', form);
			this._separator = L.DomUtil.create('div', className + '-separator', form);
			this._overlaysList = L.DomUtil.create('div', className + '-overlays', form);
	
			container.appendChild(form);
		},
	
		_getLayer: function (id) {
			for (var i = 0; i < this._layers.length; i++) {
	
				if (this._layers[i] && L.stamp(this._layers[i].layer) === id) {
					return this._layers[i];
				}
			}
		},
	
		_addLayer: function (layer, name, overlay) {
			layer.on('add remove', this._onLayerChange, this);
	
			this._layers.push({
				layer: layer,
				name: name,
				overlay: overlay
			});
	
			if (this.options.autoZIndex && layer.setZIndex) {
				this._lastZIndex++;
				layer.setZIndex(this._lastZIndex);
			}
		},
	
		_update: function () {
			if (!this._container) { return this; }
	
			L.DomUtil.empty(this._baseLayersList);
			L.DomUtil.empty(this._overlaysList);
	
			var baseLayersPresent, overlaysPresent, i, obj, baseLayersCount = 0;
	
			for (i = 0; i < this._layers.length; i++) {
				obj = this._layers[i];
				this._addItem(obj);
				overlaysPresent = overlaysPresent || obj.overlay;
				baseLayersPresent = baseLayersPresent || !obj.overlay;
				baseLayersCount += !obj.overlay ? 1 : 0;
			}
	
			// Hide base layers section if there's only one layer.
			if (this.options.hideSingleBase) {
				baseLayersPresent = baseLayersPresent && baseLayersCount > 1;
				this._baseLayersList.style.display = baseLayersPresent ? '' : 'none';
			}
	
			this._separator.style.display = overlaysPresent && baseLayersPresent ? '' : 'none';
	
			return this;
		},
	
		_onLayerChange: function (e) {
			if (!this._handlingClick) {
				this._update();
			}
	
			var obj = this._getLayer(L.stamp(e.target));
	
			// @namespace Map
			// @section Layer events
			// @event baselayerchange: LayersControlEvent
			// Fired when the base layer is changed through the [layer control](#control-layers).
			// @event overlayadd: LayersControlEvent
			// Fired when an overlay is selected through the [layer control](#control-layers).
			// @event overlayremove: LayersControlEvent
			// Fired when an overlay is deselected through the [layer control](#control-layers).
			// @namespace Control.Layers
			var type = obj.overlay ?
				(e.type === 'add' ? 'overlayadd' : 'overlayremove') :
				(e.type === 'add' ? 'baselayerchange' : null);
	
			if (type) {
				this._map.fire(type, obj);
			}
		},
	
		// IE7 bugs out if you create a radio dynamically, so you have to do it this hacky way (see http://bit.ly/PqYLBe)
		_createRadioElement: function (name, checked) {
	
			var radioHtml = '<input type="radio" class="leaflet-control-layers-selector" name="' +
					name + '"' + (checked ? ' checked="checked"' : '') + '/>';
	
			var radioFragment = document.createElement('div');
			radioFragment.innerHTML = radioHtml;
	
			return radioFragment.firstChild;
		},
	
		_addItem: function (obj) {
			var label = document.createElement('label'),
			    checked = this._map.hasLayer(obj.layer),
			    input;
	
			if (obj.overlay) {
				input = document.createElement('input');
				input.type = 'checkbox';
				input.className = 'leaflet-control-layers-selector';
				input.defaultChecked = checked;
			} else {
				input = this._createRadioElement('leaflet-base-layers', checked);
			}
	
			input.layerId = L.stamp(obj.layer);
	
			L.DomEvent.on(input, 'click', this._onInputClick, this);
	
			var name = document.createElement('span');
			name.innerHTML = ' ' + obj.name;
	
			// Helps from preventing layer control flicker when checkboxes are disabled
			// https://github.com/Leaflet/Leaflet/issues/2771
			var holder = document.createElement('div');
	
			label.appendChild(holder);
			holder.appendChild(input);
			holder.appendChild(name);
	
			var container = obj.overlay ? this._overlaysList : this._baseLayersList;
			container.appendChild(label);
	
			this._checkDisabledLayers();
			return label;
		},
	
		_onInputClick: function () {
			var inputs = this._form.getElementsByTagName('input'),
			    input, layer, hasLayer;
			var addedLayers = [],
			    removedLayers = [];
	
			this._handlingClick = true;
	
			for (var i = inputs.length - 1; i >= 0; i--) {
				input = inputs[i];
				layer = this._getLayer(input.layerId).layer;
				hasLayer = this._map.hasLayer(layer);
	
				if (input.checked && !hasLayer) {
					addedLayers.push(layer);
	
				} else if (!input.checked && hasLayer) {
					removedLayers.push(layer);
				}
			}
	
			// Bugfix issue 2318: Should remove all old layers before readding new ones
			for (i = 0; i < removedLayers.length; i++) {
				this._map.removeLayer(removedLayers[i]);
			}
			for (i = 0; i < addedLayers.length; i++) {
				this._map.addLayer(addedLayers[i]);
			}
	
			this._handlingClick = false;
	
			this._refocusOnMap();
		},
	
		_checkDisabledLayers: function () {
			var inputs = this._form.getElementsByTagName('input'),
			    input,
			    layer,
			    zoom = this._map.getZoom();
	
			for (var i = inputs.length - 1; i >= 0; i--) {
				input = inputs[i];
				layer = this._getLayer(input.layerId).layer;
				input.disabled = (layer.options.minZoom !== undefined && zoom < layer.options.minZoom) ||
				                 (layer.options.maxZoom !== undefined && zoom > layer.options.maxZoom);
	
			}
		},
	
		_expand: function () {
			// Backward compatibility, remove me in 1.1.
			return this.expand();
		},
	
		_collapse: function () {
			// Backward compatibility, remove me in 1.1.
			return this.collapse();
		}
	
	});
	
	
	// @factory L.control.layers(baselayers?: Object, overlays?: Object, options?: Control.Layers options)
	// Creates an attribution control with the given layers. Base layers will be switched with radio buttons, while overlays will be switched with checkboxes. Note that all base layers should be passed in the base layers object, but only one should be added to the map during map instantiation.
	L.control.layers = function (baseLayers, overlays, options) {
		return new L.Control.Layers(baseLayers, overlays, options);
	};
	
	
	
	/*
	 * @class PosAnimation
	 * @aka L.PosAnimation
	 * @inherits Evented
	 * Used internally for panning animations, utilizing CSS3 Transitions for modern browsers and a timer fallback for IE6-9.
	 *
	 * @example
	 * ```js
	 * var fx = new L.PosAnimation();
	 * fx.run(el, [300, 500], 0.5);
	 * ```
	 *
	 * @constructor L.PosAnimation()
	 * Creates a `PosAnimation` object.
	 *
	 */
	
	L.PosAnimation = L.Evented.extend({
	
		// @method run(el: HTMLElement, newPos: Point, duration?: Number, easeLinearity?: Number)
		// Run an animation of a given element to a new position, optionally setting
		// duration in seconds (`0.25` by default) and easing linearity factor (3rd
		// argument of the [cubic bezier curve](http://cubic-bezier.com/#0,0,.5,1),
		// `0.5` by default).
		run: function (el, newPos, duration, easeLinearity) {
			this.stop();
	
			this._el = el;
			this._inProgress = true;
			this._duration = duration || 0.25;
			this._easeOutPower = 1 / Math.max(easeLinearity || 0.5, 0.2);
	
			this._startPos = L.DomUtil.getPosition(el);
			this._offset = newPos.subtract(this._startPos);
			this._startTime = +new Date();
	
			// @event start: Event
			// Fired when the animation starts
			this.fire('start');
	
			this._animate();
		},
	
		// @method stop()
		// Stops the animation (if currently running).
		stop: function () {
			if (!this._inProgress) { return; }
	
			this._step(true);
			this._complete();
		},
	
		_animate: function () {
			// animation loop
			this._animId = L.Util.requestAnimFrame(this._animate, this);
			this._step();
		},
	
		_step: function (round) {
			var elapsed = (+new Date()) - this._startTime,
			    duration = this._duration * 1000;
	
			if (elapsed < duration) {
				this._runFrame(this._easeOut(elapsed / duration), round);
			} else {
				this._runFrame(1);
				this._complete();
			}
		},
	
		_runFrame: function (progress, round) {
			var pos = this._startPos.add(this._offset.multiplyBy(progress));
			if (round) {
				pos._round();
			}
			L.DomUtil.setPosition(this._el, pos);
	
			// @event step: Event
			// Fired continuously during the animation.
			this.fire('step');
		},
	
		_complete: function () {
			L.Util.cancelAnimFrame(this._animId);
	
			this._inProgress = false;
			// @event end: Event
			// Fired when the animation ends.
			this.fire('end');
		},
	
		_easeOut: function (t) {
			return 1 - Math.pow(1 - t, this._easeOutPower);
		}
	});
	
	
	
	/*
	 * Extends L.Map to handle panning animations.
	 */
	
	L.Map.include({
	
		setView: function (center, zoom, options) {
	
			zoom = zoom === undefined ? this._zoom : this._limitZoom(zoom);
			center = this._limitCenter(L.latLng(center), zoom, this.options.maxBounds);
			options = options || {};
	
			this._stop();
	
			if (this._loaded && !options.reset && options !== true) {
	
				if (options.animate !== undefined) {
					options.zoom = L.extend({animate: options.animate}, options.zoom);
					options.pan = L.extend({animate: options.animate, duration: options.duration}, options.pan);
				}
	
				// try animating pan or zoom
				var moved = (this._zoom !== zoom) ?
					this._tryAnimatedZoom && this._tryAnimatedZoom(center, zoom, options.zoom) :
					this._tryAnimatedPan(center, options.pan);
	
				if (moved) {
					// prevent resize handler call, the view will refresh after animation anyway
					clearTimeout(this._sizeTimer);
					return this;
				}
			}
	
			// animation didn't start, just reset the map view
			this._resetView(center, zoom);
	
			return this;
		},
	
		panBy: function (offset, options) {
			offset = L.point(offset).round();
			options = options || {};
	
			if (!offset.x && !offset.y) {
				return this.fire('moveend');
			}
			// If we pan too far, Chrome gets issues with tiles
			// and makes them disappear or appear in the wrong place (slightly offset) #2602
			if (options.animate !== true && !this.getSize().contains(offset)) {
				this._resetView(this.unproject(this.project(this.getCenter()).add(offset)), this.getZoom());
				return this;
			}
	
			if (!this._panAnim) {
				this._panAnim = new L.PosAnimation();
	
				this._panAnim.on({
					'step': this._onPanTransitionStep,
					'end': this._onPanTransitionEnd
				}, this);
			}
	
			// don't fire movestart if animating inertia
			if (!options.noMoveStart) {
				this.fire('movestart');
			}
	
			// animate pan unless animate: false specified
			if (options.animate !== false) {
				L.DomUtil.addClass(this._mapPane, 'leaflet-pan-anim');
	
				var newPos = this._getMapPanePos().subtract(offset).round();
				this._panAnim.run(this._mapPane, newPos, options.duration || 0.25, options.easeLinearity);
			} else {
				this._rawPanBy(offset);
				this.fire('move').fire('moveend');
			}
	
			return this;
		},
	
		_onPanTransitionStep: function () {
			this.fire('move');
		},
	
		_onPanTransitionEnd: function () {
			L.DomUtil.removeClass(this._mapPane, 'leaflet-pan-anim');
			this.fire('moveend');
		},
	
		_tryAnimatedPan: function (center, options) {
			// difference between the new and current centers in pixels
			var offset = this._getCenterOffset(center)._floor();
	
			// don't animate too far unless animate: true specified in options
			if ((options && options.animate) !== true && !this.getSize().contains(offset)) { return false; }
	
			this.panBy(offset, options);
	
			return true;
		}
	});
	
	
	
	/*
	 * Extends L.Map to handle zoom animations.
	 */
	
	// @namespace Map
	// @section Animation Options
	L.Map.mergeOptions({
		// @option zoomAnimation: Boolean = true
		// Whether the map zoom animation is enabled. By default it's enabled
		// in all browsers that support CSS3 Transitions except Android.
		zoomAnimation: true,
	
		// @option zoomAnimationThreshold: Number = 4
		// Won't animate zoom if the zoom difference exceeds this value.
		zoomAnimationThreshold: 4
	});
	
	var zoomAnimated = L.DomUtil.TRANSITION && L.Browser.any3d && !L.Browser.mobileOpera;
	
	if (zoomAnimated) {
	
		L.Map.addInitHook(function () {
			// don't animate on browsers without hardware-accelerated transitions or old Android/Opera
			this._zoomAnimated = this.options.zoomAnimation;
	
			// zoom transitions run with the same duration for all layers, so if one of transitionend events
			// happens after starting zoom animation (propagating to the map pane), we know that it ended globally
			if (this._zoomAnimated) {
	
				this._createAnimProxy();
	
				L.DomEvent.on(this._proxy, L.DomUtil.TRANSITION_END, this._catchTransitionEnd, this);
			}
		});
	}
	
	L.Map.include(!zoomAnimated ? {} : {
	
		_createAnimProxy: function () {
	
			var proxy = this._proxy = L.DomUtil.create('div', 'leaflet-proxy leaflet-zoom-animated');
			this._panes.mapPane.appendChild(proxy);
	
			this.on('zoomanim', function (e) {
				var prop = L.DomUtil.TRANSFORM,
				    transform = proxy.style[prop];
	
				L.DomUtil.setTransform(proxy, this.project(e.center, e.zoom), this.getZoomScale(e.zoom, 1));
	
				// workaround for case when transform is the same and so transitionend event is not fired
				if (transform === proxy.style[prop] && this._animatingZoom) {
					this._onZoomTransitionEnd();
				}
			}, this);
	
			this.on('load moveend', function () {
				var c = this.getCenter(),
				    z = this.getZoom();
				L.DomUtil.setTransform(proxy, this.project(c, z), this.getZoomScale(z, 1));
			}, this);
		},
	
		_catchTransitionEnd: function (e) {
			if (this._animatingZoom && e.propertyName.indexOf('transform') >= 0) {
				this._onZoomTransitionEnd();
			}
		},
	
		_nothingToAnimate: function () {
			return !this._container.getElementsByClassName('leaflet-zoom-animated').length;
		},
	
		_tryAnimatedZoom: function (center, zoom, options) {
	
			if (this._animatingZoom) { return true; }
	
			options = options || {};
	
			// don't animate if disabled, not supported or zoom difference is too large
			if (!this._zoomAnimated || options.animate === false || this._nothingToAnimate() ||
			        Math.abs(zoom - this._zoom) > this.options.zoomAnimationThreshold) { return false; }
	
			// offset is the pixel coords of the zoom origin relative to the current center
			var scale = this.getZoomScale(zoom),
			    offset = this._getCenterOffset(center)._divideBy(1 - 1 / scale);
	
			// don't animate if the zoom origin isn't within one screen from the current center, unless forced
			if (options.animate !== true && !this.getSize().contains(offset)) { return false; }
	
			L.Util.requestAnimFrame(function () {
				this
				    ._moveStart(true)
				    ._animateZoom(center, zoom, true);
			}, this);
	
			return true;
		},
	
		_animateZoom: function (center, zoom, startAnim, noUpdate) {
			if (startAnim) {
				this._animatingZoom = true;
	
				// remember what center/zoom to set after animation
				this._animateToCenter = center;
				this._animateToZoom = zoom;
	
				L.DomUtil.addClass(this._mapPane, 'leaflet-zoom-anim');
			}
	
			// @event zoomanim: ZoomAnimEvent
			// Fired on every frame of a zoom animation
			this.fire('zoomanim', {
				center: center,
				zoom: zoom,
				noUpdate: noUpdate
			});
	
			// Work around webkit not firing 'transitionend', see https://github.com/Leaflet/Leaflet/issues/3689, 2693
			setTimeout(L.bind(this._onZoomTransitionEnd, this), 250);
		},
	
		_onZoomTransitionEnd: function () {
			if (!this._animatingZoom) { return; }
	
			L.DomUtil.removeClass(this._mapPane, 'leaflet-zoom-anim');
	
			this._animatingZoom = false;
	
			this._move(this._animateToCenter, this._animateToZoom);
	
			// This anim frame should prevent an obscure iOS webkit tile loading race condition.
			L.Util.requestAnimFrame(function () {
				this._moveEnd(true);
			}, this);
		}
	});
	
	
	
	// @namespace Map
	// @section Methods for modifying map state
	L.Map.include({
	
		// @method flyTo(latlng: LatLng, zoom?: Number, options?: Zoom/pan options): this
		// Sets the view of the map (geographical center and zoom) performing a smooth
		// pan-zoom animation.
		flyTo: function (targetCenter, targetZoom, options) {
	
			options = options || {};
			if (options.animate === false || !L.Browser.any3d) {
				return this.setView(targetCenter, targetZoom, options);
			}
	
			this._stop();
	
			var from = this.project(this.getCenter()),
			    to = this.project(targetCenter),
			    size = this.getSize(),
			    startZoom = this._zoom;
	
			targetCenter = L.latLng(targetCenter);
			targetZoom = targetZoom === undefined ? startZoom : targetZoom;
	
			var w0 = Math.max(size.x, size.y),
			    w1 = w0 * this.getZoomScale(startZoom, targetZoom),
			    u1 = (to.distanceTo(from)) || 1,
			    rho = 1.42,
			    rho2 = rho * rho;
	
			function r(i) {
				var s1 = i ? -1 : 1,
				    s2 = i ? w1 : w0,
				    t1 = w1 * w1 - w0 * w0 + s1 * rho2 * rho2 * u1 * u1,
				    b1 = 2 * s2 * rho2 * u1,
				    b = t1 / b1,
				    sq = Math.sqrt(b * b + 1) - b;
	
				    // workaround for floating point precision bug when sq = 0, log = -Infinite,
				    // thus triggering an infinite loop in flyTo
				    var log = sq < 0.000000001 ? -18 : Math.log(sq);
	
				return log;
			}
	
			function sinh(n) { return (Math.exp(n) - Math.exp(-n)) / 2; }
			function cosh(n) { return (Math.exp(n) + Math.exp(-n)) / 2; }
			function tanh(n) { return sinh(n) / cosh(n); }
	
			var r0 = r(0);
	
			function w(s) { return w0 * (cosh(r0) / cosh(r0 + rho * s)); }
			function u(s) { return w0 * (cosh(r0) * tanh(r0 + rho * s) - sinh(r0)) / rho2; }
	
			function easeOut(t) { return 1 - Math.pow(1 - t, 1.5); }
	
			var start = Date.now(),
			    S = (r(1) - r0) / rho,
			    duration = options.duration ? 1000 * options.duration : 1000 * S * 0.8;
	
			function frame() {
				var t = (Date.now() - start) / duration,
				    s = easeOut(t) * S;
	
				if (t <= 1) {
					this._flyToFrame = L.Util.requestAnimFrame(frame, this);
	
					this._move(
						this.unproject(from.add(to.subtract(from).multiplyBy(u(s) / u1)), startZoom),
						this.getScaleZoom(w0 / w(s), startZoom),
						{flyTo: true});
	
				} else {
					this
						._move(targetCenter, targetZoom)
						._moveEnd(true);
				}
			}
	
			this._moveStart(true);
	
			frame.call(this);
			return this;
		},
	
		// @method flyToBounds(bounds: LatLngBounds, options?: fitBounds options): this
		// Sets the view of the map with a smooth animation like [`flyTo`](#map-flyto),
		// but takes a bounds parameter like [`fitBounds`](#map-fitbounds).
		flyToBounds: function (bounds, options) {
			var target = this._getBoundsCenterZoom(bounds, options);
			return this.flyTo(target.center, target.zoom, options);
		}
	});
	
	
	
	/*
	 * Provides L.Map with convenient shortcuts for using browser geolocation features.
	 */
	
	// @namespace Map
	
	L.Map.include({
		// @section Geolocation methods
		_defaultLocateOptions: {
			timeout: 10000,
			watch: false
			// setView: false
			// maxZoom: <Number>
			// maximumAge: 0
			// enableHighAccuracy: false
		},
	
		// @method locate(options?: Locate options): this
		// Tries to locate the user using the Geolocation API, firing a [`locationfound`](#map-locationfound)
		// event with location data on success or a [`locationerror`](#map-locationerror) event on failure,
		// and optionally sets the map view to the user's location with respect to
		// detection accuracy (or to the world view if geolocation failed).
		// Note that, if your page doesn't use HTTPS, this method will fail in
		// modern browsers ([Chrome 50 and newer](https://sites.google.com/a/chromium.org/dev/Home/chromium-security/deprecating-powerful-features-on-insecure-origins))
		// See `Locate options` for more details.
		locate: function (options) {
	
			options = this._locateOptions = L.extend({}, this._defaultLocateOptions, options);
	
			if (!('geolocation' in navigator)) {
				this._handleGeolocationError({
					code: 0,
					message: 'Geolocation not supported.'
				});
				return this;
			}
	
			var onResponse = L.bind(this._handleGeolocationResponse, this),
			    onError = L.bind(this._handleGeolocationError, this);
	
			if (options.watch) {
				this._locationWatchId =
				        navigator.geolocation.watchPosition(onResponse, onError, options);
			} else {
				navigator.geolocation.getCurrentPosition(onResponse, onError, options);
			}
			return this;
		},
	
		// @method stopLocate(): this
		// Stops watching location previously initiated by `map.locate({watch: true})`
		// and aborts resetting the map view if map.locate was called with
		// `{setView: true}`.
		stopLocate: function () {
			if (navigator.geolocation && navigator.geolocation.clearWatch) {
				navigator.geolocation.clearWatch(this._locationWatchId);
			}
			if (this._locateOptions) {
				this._locateOptions.setView = false;
			}
			return this;
		},
	
		_handleGeolocationError: function (error) {
			var c = error.code,
			    message = error.message ||
			            (c === 1 ? 'permission denied' :
			            (c === 2 ? 'position unavailable' : 'timeout'));
	
			if (this._locateOptions.setView && !this._loaded) {
				this.fitWorld();
			}
	
			// @section Location events
			// @event locationerror: ErrorEvent
			// Fired when geolocation (using the [`locate`](#map-locate) method) failed.
			this.fire('locationerror', {
				code: c,
				message: 'Geolocation error: ' + message + '.'
			});
		},
	
		_handleGeolocationResponse: function (pos) {
			var lat = pos.coords.latitude,
			    lng = pos.coords.longitude,
			    latlng = new L.LatLng(lat, lng),
			    bounds = latlng.toBounds(pos.coords.accuracy),
			    options = this._locateOptions;
	
			if (options.setView) {
				var zoom = this.getBoundsZoom(bounds);
				this.setView(latlng, options.maxZoom ? Math.min(zoom, options.maxZoom) : zoom);
			}
	
			var data = {
				latlng: latlng,
				bounds: bounds,
				timestamp: pos.timestamp
			};
	
			for (var i in pos.coords) {
				if (typeof pos.coords[i] === 'number') {
					data[i] = pos.coords[i];
				}
			}
	
			// @event locationfound: LocationEvent
			// Fired when geolocation (using the [`locate`](#map-locate) method)
			// went successfully.
			this.fire('locationfound', data);
		}
	});
	
	
	
	}(window, document));
	//# sourceMappingURL=leaflet-src.map

/***/ },
/* 3 */
/***/ function(module, exports) {

	/*
		Leaflet.draw, a plugin that adds drawing and editing tools to Leaflet powered maps.
		(c) 2012-2016, Jacob Toye, Smartrak, Leaflet
	
		https://github.com/Leaflet/Leaflet.draw
		http://leafletjs.com
	*/
	!function(t,e,i){L.drawVersion="0.3.0-dev",L.drawLocal={draw:{toolbar:{actions:{title:"Cancel drawing",text:"Cancel"},finish:{title:"Finish drawing",text:"Finish"},undo:{title:"Delete last point drawn",text:"Delete last point"},buttons:{polyline:"Draw a polyline",polygon:"Draw a polygon",rectangle:"Draw a rectangle",circle:"Draw a circle",marker:"Draw a marker"}},handlers:{circle:{tooltip:{start:"Click and drag to draw circle."},radius:"Radius"},marker:{tooltip:{start:"Click map to place marker."}},polygon:{tooltip:{start:"Click to start drawing shape.",cont:"Click to continue drawing shape.",end:"Click first point to close this shape."}},polyline:{error:"<strong>Error:</strong> shape edges cannot cross!",tooltip:{start:"Click to start drawing line.",cont:"Click to continue drawing line.",end:"Click last point to finish line."}},rectangle:{tooltip:{start:"Click and drag to draw rectangle."}},simpleshape:{tooltip:{end:"Release mouse to finish drawing."}}}},edit:{toolbar:{actions:{save:{title:"Save changes.",text:"Save"},cancel:{title:"Cancel editing, discards all changes.",text:"Cancel"}},buttons:{edit:"Edit layers.",editDisabled:"No layers to edit.",remove:"Delete layers.",removeDisabled:"No layers to delete."}},handlers:{edit:{tooltip:{text:"Drag handles, or marker to edit feature.",subtext:"Click cancel to undo changes."}},remove:{tooltip:{text:"Click on a feature to remove"}}}}},L.Draw={},L.Draw.Feature=L.Handler.extend({includes:L.Mixin.Events,initialize:function(t,e){this._map=t,this._container=t._container,this._overlayPane=t._panes.overlayPane,this._popupPane=t._panes.popupPane,e&&e.shapeOptions&&(e.shapeOptions=L.Util.extend({},this.options.shapeOptions,e.shapeOptions)),L.setOptions(this,e)},enable:function(){this._enabled||(L.Handler.prototype.enable.call(this),this.fire("enabled",{handler:this.type}),this._map.fire("draw:drawstart",{layerType:this.type}))},disable:function(){this._enabled&&(L.Handler.prototype.disable.call(this),this._map.fire("draw:drawstop",{layerType:this.type}),this.fire("disabled",{handler:this.type}))},addHooks:function(){var t=this._map;t&&(L.DomUtil.disableTextSelection(),t.getContainer().focus(),this._tooltip=new L.Tooltip(this._map),L.DomEvent.on(this._container,"keyup",this._cancelDrawing,this))},removeHooks:function(){this._map&&(L.DomUtil.enableTextSelection(),this._tooltip.dispose(),this._tooltip=null,L.DomEvent.off(this._container,"keyup",this._cancelDrawing,this))},setOptions:function(t){L.setOptions(this,t)},_fireCreatedEvent:function(t){this._map.fire("draw:created",{layer:t,layerType:this.type})},_cancelDrawing:function(t){this._map.fire("draw:canceled",{layerType:this.type}),27===t.keyCode&&this.disable()}}),L.Draw.Polyline=L.Draw.Feature.extend({statics:{TYPE:"polyline"},Poly:L.Polyline,options:{allowIntersection:!0,repeatMode:!1,drawError:{color:"#b00b00",timeout:2500},icon:new L.DivIcon({iconSize:new L.Point(8,8),className:"leaflet-div-icon leaflet-editing-icon"}),touchIcon:new L.DivIcon({iconSize:new L.Point(20,20),className:"leaflet-div-icon leaflet-editing-icon leaflet-touch-icon"}),guidelineDistance:20,maxGuideLineLength:4e3,shapeOptions:{stroke:!0,color:"#f06eaa",weight:4,opacity:.5,fill:!1,clickable:!0},metric:!0,feet:!0,showLength:!0,zIndexOffset:2e3},initialize:function(t,e){L.Browser.touch&&(this.options.icon=this.options.touchIcon),this.options.drawError.message=L.drawLocal.draw.handlers.polyline.error,e&&e.drawError&&(e.drawError=L.Util.extend({},this.options.drawError,e.drawError)),this.type=L.Draw.Polyline.TYPE,L.Draw.Feature.prototype.initialize.call(this,t,e)},addHooks:function(){L.Draw.Feature.prototype.addHooks.call(this),this._map&&(this._markers=[],this._markerGroup=new L.LayerGroup,this._map.addLayer(this._markerGroup),this._poly=new L.Polyline([],this.options.shapeOptions),this._tooltip.updateContent(this._getTooltipText()),this._mouseMarker||(this._mouseMarker=L.marker(this._map.getCenter(),{icon:L.divIcon({className:"leaflet-mouse-marker",iconAnchor:[20,20],iconSize:[40,40]}),opacity:0,zIndexOffset:this.options.zIndexOffset})),L.Browser.touch||this._map.on("mouseup",this._onMouseUp,this),this._mouseMarker.on("mousedown",this._onMouseDown,this).on("mouseout",this._onMouseOut,this).on("mouseup",this._onMouseUp,this).on("mousemove",this._onMouseMove,this).addTo(this._map),this._map.on("mouseup",this._onMouseUp,this).on("mousemove",this._onMouseMove,this).on("zoomlevelschange",this._onZoomEnd,this).on("click",this._onTouch,this).on("zoomend",this._onZoomEnd,this))},removeHooks:function(){L.Draw.Feature.prototype.removeHooks.call(this),this._clearHideErrorTimeout(),this._cleanUpShape(),this._map.removeLayer(this._markerGroup),delete this._markerGroup,delete this._markers,this._map.removeLayer(this._poly),delete this._poly,this._mouseMarker.off("mousedown",this._onMouseDown,this).off("mouseout",this._onMouseOut,this).off("mouseup",this._onMouseUp,this).off("mousemove",this._onMouseMove,this),this._map.removeLayer(this._mouseMarker),delete this._mouseMarker,this._clearGuides(),this._map.off("mouseup",this._onMouseUp,this).off("mousemove",this._onMouseMove,this).off("zoomlevelschange",this._onZoomEnd,this).off("zoomend",this._onZoomEnd,this).off("click",this._onTouch,this)},deleteLastVertex:function(){if(!(this._markers.length<=1)){var t=this._markers.pop(),e=this._poly,i=this._poly.spliceLatLngs(e.getLatLngs().length-1,1)[0];this._markerGroup.removeLayer(t),e.getLatLngs().length<2&&this._map.removeLayer(e),this._vertexChanged(i,!1)}},addVertex:function(t){var e=this._markers.length;return e>0&&!this.options.allowIntersection&&this._poly.newLatLngIntersects(t)?void this._showErrorTooltip():(this._errorShown&&this._hideErrorTooltip(),this._markers.push(this._createMarker(t)),this._poly.addLatLng(t),2===this._poly.getLatLngs().length&&this._map.addLayer(this._poly),void this._vertexChanged(t,!0))},completeShape:function(){this._markers.length<=1||(this._fireCreatedEvent(),this.disable(),this.options.repeatMode&&this.enable())},_finishShape:function(){var t=this._poly.newLatLngIntersects(this._poly.getLatLngs()[this._poly.getLatLngs().length-1]);return!this.options.allowIntersection&&t||!this._shapeIsValid()?void this._showErrorTooltip():(this._fireCreatedEvent(),this.disable(),void(this.options.repeatMode&&this.enable()))},_shapeIsValid:function(){return!0},_onZoomEnd:function(){null!==this._markers&&this._updateGuide()},_onMouseMove:function(t){var e=this._map.mouseEventToLayerPoint(t.originalEvent),i=this._map.layerPointToLatLng(e);this._currentLatLng=i,this._updateTooltip(i),this._updateGuide(e),this._mouseMarker.setLatLng(i),L.DomEvent.preventDefault(t.originalEvent)},_vertexChanged:function(t,e){this._map.fire("draw:drawvertex",{layers:this._markerGroup}),this._updateFinishHandler(),this._updateRunningMeasure(t,e),this._clearGuides(),this._updateTooltip()},_onMouseDown:function(t){var e=t.originalEvent;this._mouseDownOrigin=L.point(e.clientX,e.clientY)},_onMouseUp:function(e){if(this._mouseDownOrigin){var i=L.point(e.originalEvent.clientX,e.originalEvent.clientY).distanceTo(this._mouseDownOrigin);Math.abs(i)<9*(t.devicePixelRatio||1)&&this.addVertex(e.latlng)}this._mouseDownOrigin=null},_onTouch:function(t){L.Browser.touch&&(this._onMouseDown(t),this._onMouseUp(t))},_onMouseOut:function(){this._tooltip&&this._tooltip._onMouseOut.call(this._tooltip)},_updateFinishHandler:function(){var t=this._markers.length;t>1&&this._markers[t-1].on("click",this._finishShape,this),t>2&&this._markers[t-2].off("click",this._finishShape,this)},_createMarker:function(t){var e=new L.Marker(t,{icon:this.options.icon,zIndexOffset:2*this.options.zIndexOffset});return this._markerGroup.addLayer(e),e},_updateGuide:function(t){var e=this._markers?this._markers.length:0;e>0&&(t=t||this._map.latLngToLayerPoint(this._currentLatLng),this._clearGuides(),this._drawGuide(this._map.latLngToLayerPoint(this._markers[e-1].getLatLng()),t))},_updateTooltip:function(t){var e=this._getTooltipText();t&&this._tooltip.updatePosition(t),this._errorShown||this._tooltip.updateContent(e)},_drawGuide:function(t,e){var i,o,n,s=Math.floor(Math.sqrt(Math.pow(e.x-t.x,2)+Math.pow(e.y-t.y,2))),a=this.options.guidelineDistance,r=this.options.maxGuideLineLength,h=s>r?s-r:a;for(this._guidesContainer||(this._guidesContainer=L.DomUtil.create("div","leaflet-draw-guides",this._overlayPane));s>h;h+=this.options.guidelineDistance)i=h/s,o={x:Math.floor(t.x*(1-i)+i*e.x),y:Math.floor(t.y*(1-i)+i*e.y)},n=L.DomUtil.create("div","leaflet-draw-guide-dash",this._guidesContainer),n.style.backgroundColor=this._errorShown?this.options.drawError.color:this.options.shapeOptions.color,L.DomUtil.setPosition(n,o)},_updateGuideColor:function(t){if(this._guidesContainer)for(var e=0,i=this._guidesContainer.childNodes.length;i>e;e++)this._guidesContainer.childNodes[e].style.backgroundColor=t},_clearGuides:function(){if(this._guidesContainer)for(;this._guidesContainer.firstChild;)this._guidesContainer.removeChild(this._guidesContainer.firstChild)},_getTooltipText:function(){var t,e,i=this.options.showLength;return 0===this._markers.length?t={text:L.drawLocal.draw.handlers.polyline.tooltip.start}:(e=i?this._getMeasurementString():"",t=1===this._markers.length?{text:L.drawLocal.draw.handlers.polyline.tooltip.cont,subtext:e}:{text:L.drawLocal.draw.handlers.polyline.tooltip.end,subtext:e}),t},_updateRunningMeasure:function(t,e){var i,o,n=this._markers.length;1===this._markers.length?this._measurementRunningTotal=0:(i=n-(e?2:1),o=t.distanceTo(this._markers[i].getLatLng()),this._measurementRunningTotal+=o*(e?1:-1))},_getMeasurementString:function(){var t,e=this._currentLatLng,i=this._markers[this._markers.length-1].getLatLng();return t=this._measurementRunningTotal+e.distanceTo(i),L.GeometryUtil.readableDistance(t,this.options.metric,this.options.feet)},_showErrorTooltip:function(){this._errorShown=!0,this._tooltip.showAsError().updateContent({text:this.options.drawError.message}),this._updateGuideColor(this.options.drawError.color),this._poly.setStyle({color:this.options.drawError.color}),this._clearHideErrorTimeout(),this._hideErrorTimeout=setTimeout(L.Util.bind(this._hideErrorTooltip,this),this.options.drawError.timeout)},_hideErrorTooltip:function(){this._errorShown=!1,this._clearHideErrorTimeout(),this._tooltip.removeError().updateContent(this._getTooltipText()),this._updateGuideColor(this.options.shapeOptions.color),this._poly.setStyle({color:this.options.shapeOptions.color})},_clearHideErrorTimeout:function(){this._hideErrorTimeout&&(clearTimeout(this._hideErrorTimeout),this._hideErrorTimeout=null)},_cleanUpShape:function(){this._markers.length>1&&this._markers[this._markers.length-1].off("click",this._finishShape,this)},_fireCreatedEvent:function(){var t=new this.Poly(this._poly.getLatLngs(),this.options.shapeOptions);L.Draw.Feature.prototype._fireCreatedEvent.call(this,t)}}),L.Draw.Polygon=L.Draw.Polyline.extend({statics:{TYPE:"polygon"},Poly:L.Polygon,options:{showArea:!1,shapeOptions:{stroke:!0,color:"#f06eaa",weight:4,opacity:.5,fill:!0,fillColor:null,fillOpacity:.2,clickable:!0},metric:!0},initialize:function(t,e){L.Draw.Polyline.prototype.initialize.call(this,t,e),this.type=L.Draw.Polygon.TYPE},_updateFinishHandler:function(){var t=this._markers.length;1===t&&this._markers[0].on("click",this._finishShape,this),t>2&&(this._markers[t-1].on("dblclick",this._finishShape,this),t>3&&this._markers[t-2].off("dblclick",this._finishShape,this))},_getTooltipText:function(){var t,e;return 0===this._markers.length?t=L.drawLocal.draw.handlers.polygon.tooltip.start:this._markers.length<3?t=L.drawLocal.draw.handlers.polygon.tooltip.cont:(t=L.drawLocal.draw.handlers.polygon.tooltip.end,e=this._getMeasurementString()),{text:t,subtext:e}},_getMeasurementString:function(){var t=this._area;return t?L.GeometryUtil.readableArea(t,this.options.metric):null},_shapeIsValid:function(){return this._markers.length>=3},_vertexChanged:function(t,e){var i;!this.options.allowIntersection&&this.options.showArea&&(i=this._poly.getLatLngs(),this._area=L.GeometryUtil.geodesicArea(i)),L.Draw.Polyline.prototype._vertexChanged.call(this,t,e)},_cleanUpShape:function(){var t=this._markers.length;t>0&&(this._markers[0].off("click",this._finishShape,this),t>2&&this._markers[t-1].off("dblclick",this._finishShape,this))}}),L.SimpleShape={},L.Draw.SimpleShape=L.Draw.Feature.extend({options:{repeatMode:!1},initialize:function(t,e){this._endLabelText=L.drawLocal.draw.handlers.simpleshape.tooltip.end,L.Draw.Feature.prototype.initialize.call(this,t,e)},addHooks:function(){L.Draw.Feature.prototype.addHooks.call(this),this._map&&(this._mapDraggable=this._map.dragging.enabled(),this._mapDraggable&&this._map.dragging.disable(),this._container.style.cursor="crosshair",this._tooltip.updateContent({text:this._initialLabelText}),this._map.on("mousedown",this._onMouseDown,this).on("mousemove",this._onMouseMove,this).on("touchstart",this._onMouseDown,this).on("touchmove",this._onMouseMove,this))},removeHooks:function(){L.Draw.Feature.prototype.removeHooks.call(this),this._map&&(this._mapDraggable&&this._map.dragging.enable(),this._container.style.cursor="",this._map.off("mousedown",this._onMouseDown,this).off("mousemove",this._onMouseMove,this).off("touchstart",this._onMouseDown,this).off("touchmove",this._onMouseMove,this),L.DomEvent.off(e,"mouseup",this._onMouseUp,this),L.DomEvent.off(e,"touchend",this._onMouseUp,this),this._shape&&(this._map.removeLayer(this._shape),delete this._shape)),this._isDrawing=!1},_getTooltipText:function(){return{text:this._endLabelText}},_onMouseDown:function(t){this._isDrawing=!0,this._startLatLng=t.latlng,L.DomEvent.on(e,"mouseup",this._onMouseUp,this).on(e,"touchend",this._onMouseUp,this).preventDefault(t.originalEvent)},_onMouseMove:function(t){var e=t.latlng;this._tooltip.updatePosition(e),this._isDrawing&&(this._tooltip.updateContent(this._getTooltipText()),this._drawShape(e))},_onMouseUp:function(){this._shape&&this._fireCreatedEvent(),this.disable(),this.options.repeatMode&&this.enable()}}),L.Draw.Rectangle=L.Draw.SimpleShape.extend({statics:{TYPE:"rectangle"},options:{shapeOptions:{stroke:!0,color:"#f06eaa",weight:4,opacity:.5,fill:!0,fillColor:null,fillOpacity:.2,clickable:!0},metric:!0},initialize:function(t,e){this.type=L.Draw.Rectangle.TYPE,this._initialLabelText=L.drawLocal.draw.handlers.rectangle.tooltip.start,L.Draw.SimpleShape.prototype.initialize.call(this,t,e)},_drawShape:function(t){this._shape?this._shape.setBounds(new L.LatLngBounds(this._startLatLng,t)):(this._shape=new L.Rectangle(new L.LatLngBounds(this._startLatLng,t),this.options.shapeOptions),this._map.addLayer(this._shape))},_fireCreatedEvent:function(){var t=new L.Rectangle(this._shape.getBounds(),this.options.shapeOptions);L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this,t)},_getTooltipText:function(){var t,e,i,o=L.Draw.SimpleShape.prototype._getTooltipText.call(this),n=this._shape;return n&&(t=this._shape.getLatLngs(),e=L.GeometryUtil.geodesicArea(t),i=L.GeometryUtil.readableArea(e,this.options.metric)),{text:o.text,subtext:i}}}),L.Draw.Circle=L.Draw.SimpleShape.extend({statics:{TYPE:"circle"},options:{shapeOptions:{stroke:!0,color:"#f06eaa",weight:4,opacity:.5,fill:!0,fillColor:null,fillOpacity:.2,clickable:!0},showRadius:!0,metric:!0,feet:!0},initialize:function(t,e){this.type=L.Draw.Circle.TYPE,this._initialLabelText=L.drawLocal.draw.handlers.circle.tooltip.start,L.Draw.SimpleShape.prototype.initialize.call(this,t,e)},_drawShape:function(t){this._shape?this._shape.setRadius(this._startLatLng.distanceTo(t)):(this._shape=new L.Circle(this._startLatLng,this._startLatLng.distanceTo(t),this.options.shapeOptions),this._map.addLayer(this._shape))},_fireCreatedEvent:function(){var t=new L.Circle(this._startLatLng,this._shape.getRadius(),this.options.shapeOptions);L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this,t)},_onMouseMove:function(t){var e,i=t.latlng,o=this.options.showRadius,n=this.options.metric;this._tooltip.updatePosition(i),this._isDrawing&&(this._drawShape(i),e=this._shape.getRadius().toFixed(1),this._tooltip.updateContent({text:this._endLabelText,subtext:o?L.drawLocal.draw.handlers.circle.radius+": "+L.GeometryUtil.readableDistance(e,n,this.options.feet):""}))}}),L.Draw.Marker=L.Draw.Feature.extend({statics:{TYPE:"marker"},options:{icon:new L.Icon.Default,repeatMode:!1,zIndexOffset:2e3},initialize:function(t,e){this.type=L.Draw.Marker.TYPE,L.Draw.Feature.prototype.initialize.call(this,t,e)},addHooks:function(){L.Draw.Feature.prototype.addHooks.call(this),this._map&&(this._tooltip.updateContent({text:L.drawLocal.draw.handlers.marker.tooltip.start}),this._mouseMarker||(this._mouseMarker=L.marker(this._map.getCenter(),{icon:L.divIcon({className:"leaflet-mouse-marker",iconAnchor:[20,20],iconSize:[40,40]}),opacity:0,zIndexOffset:this.options.zIndexOffset})),this._mouseMarker.on("click",this._onClick,this).addTo(this._map),this._map.on("mousemove",this._onMouseMove,this),this._map.on("click",this._onTouch,this))},removeHooks:function(){L.Draw.Feature.prototype.removeHooks.call(this),this._map&&(this._marker&&(this._marker.off("click",this._onClick,this),this._map.off("click",this._onClick,this).off("click",this._onTouch,this).removeLayer(this._marker),delete this._marker),this._mouseMarker.off("click",this._onClick,this),this._map.removeLayer(this._mouseMarker),delete this._mouseMarker,this._map.off("mousemove",this._onMouseMove,this))},_onMouseMove:function(t){var e=t.latlng;this._tooltip.updatePosition(e),this._mouseMarker.setLatLng(e),this._marker?(e=this._mouseMarker.getLatLng(),this._marker.setLatLng(e)):(this._marker=new L.Marker(e,{icon:this.options.icon,zIndexOffset:this.options.zIndexOffset}),this._marker.on("click",this._onClick,this),this._map.on("click",this._onClick,this).addLayer(this._marker))},_onClick:function(){this._fireCreatedEvent(),this.disable(),this.options.repeatMode&&this.enable()},_onTouch:function(t){this._onMouseMove(t),this._onClick()},_fireCreatedEvent:function(){var t=new L.Marker.Touch(this._marker.getLatLng(),{icon:this.options.icon});L.Draw.Feature.prototype._fireCreatedEvent.call(this,t)}}),L.Edit=L.Edit||{},L.Edit.Marker=L.Handler.extend({initialize:function(t,e){this._marker=t,L.setOptions(this,e)},addHooks:function(){var t=this._marker;t.dragging.enable(),t.on("dragend",this._onDragEnd,t),this._toggleMarkerHighlight()},removeHooks:function(){var t=this._marker;t.dragging.disable(),t.off("dragend",this._onDragEnd,t),this._toggleMarkerHighlight()},_onDragEnd:function(t){var e=t.target;e.edited=!0,this._map.fire("draw:editmove",{layer:e})},_toggleMarkerHighlight:function(){var t=this._marker._icon;t&&(t.style.display="none",L.DomUtil.hasClass(t,"leaflet-edit-marker-selected")?(L.DomUtil.removeClass(t,"leaflet-edit-marker-selected"),this._offsetMarker(t,-4)):(L.DomUtil.addClass(t,"leaflet-edit-marker-selected"),this._offsetMarker(t,4)),t.style.display="")},_offsetMarker:function(t,e){var i=parseInt(t.style.marginTop,10)-e,o=parseInt(t.style.marginLeft,10)-e;t.style.marginTop=i+"px",t.style.marginLeft=o+"px"}}),L.Marker.addInitHook(function(){L.Edit.Marker&&(this.editing=new L.Edit.Marker(this),this.options.editable&&this.editing.enable())}),L.Edit=L.Edit||{},L.Edit.Poly=L.Handler.extend({options:{},initialize:function(t,e){this.latlngs=[t._latlngs],t._holes&&(this.latlngs=this.latlngs.concat(t._holes)),this._poly=t,L.setOptions(this,e),this._poly.on("revert-edited",this._updateLatLngs,this)},_eachVertexHandler:function(t){for(var e=0;e<this._verticesHandlers.length;e++)t(this._verticesHandlers[e])},addHooks:function(){this._initHandlers(),this._eachVertexHandler(function(t){t.addHooks()})},removeHooks:function(){this._eachVertexHandler(function(t){t.removeHooks()})},updateMarkers:function(){this._eachVertexHandler(function(t){t.updateMarkers()})},_initHandlers:function(){this._verticesHandlers=[];for(var t=0;t<this.latlngs.length;t++)this._verticesHandlers.push(new L.Edit.PolyVerticesEdit(this._poly,this.latlngs[t],this.options))},_updateLatLngs:function(t){this.latlngs=[t.layer._latlngs],t.layer._holes&&(this.latlngs=this.latlngs.concat(t.layer._holes))}}),L.Edit.PolyVerticesEdit=L.Handler.extend({options:{icon:new L.DivIcon({iconSize:new L.Point(8,8),className:"leaflet-div-icon leaflet-editing-icon"}),touchIcon:new L.DivIcon({iconSize:new L.Point(20,20),className:"leaflet-div-icon leaflet-editing-icon leaflet-touch-icon"}),drawError:{color:"#b00b00",timeout:1e3}},initialize:function(t,e,i){L.Browser.touch&&(this.options.icon=this.options.touchIcon),this._poly=t,i&&i.drawError&&(i.drawError=L.Util.extend({},this.options.drawError,i.drawError)),this._latlngs=e,L.setOptions(this,i)},addHooks:function(){var t=this._poly;t instanceof L.Polygon||(t.options.fill=!1),t.setStyle(t.options.editing),this._poly._map&&(this._map=this._poly._map,this._markerGroup||this._initMarkers(),this._poly._map.addLayer(this._markerGroup))},removeHooks:function(){var t=this._poly;t.setStyle(t.options.original),t._map&&(t._map.removeLayer(this._markerGroup),delete this._markerGroup,delete this._markers)},updateMarkers:function(){this._markerGroup.clearLayers(),this._initMarkers()},_initMarkers:function(){this._markerGroup||(this._markerGroup=new L.LayerGroup),this._markers=[];var t,e,i,o,n=this._latlngs;for(t=0,i=n.length;i>t;t++)o=this._createMarker(n[t],t),o.on("click",this._onMarkerClick,this),this._markers.push(o);var s,a;for(t=0,e=i-1;i>t;e=t++)(0!==t||L.Polygon&&this._poly instanceof L.Polygon)&&(s=this._markers[e],a=this._markers[t],this._createMiddleMarker(s,a),this._updatePrevNext(s,a))},_createMarker:function(t,e){var i=new L.Marker.Touch(t,{draggable:!0,icon:this.options.icon});return i._origLatLng=t,i._index=e,i.on("dragstart",this._onMarkerDragStart,this).on("drag",this._onMarkerDrag,this).on("dragend",this._fireEdit,this).on("touchmove",this._onTouchMove,this).on("MSPointerMove",this._onTouchMove,this).on("touchend",this._fireEdit,this).on("MSPointerUp",this._fireEdit,this),this._markerGroup.addLayer(i),i},_onMarkerDragStart:function(){this._poly.fire("editstart")},_spliceLatLngs:function(){var t=[].splice.apply(this._latlngs,arguments);return this._poly._convertLatLngs(this._latlngs,!0),this._poly.redraw(),t},_removeMarker:function(t){var e=t._index;this._markerGroup.removeLayer(t),this._markers.splice(e,1),this._spliceLatLngs(e,1),this._updateIndexes(e,-1),t.off("dragstart",this._onMarkerDragStart,this).off("drag",this._onMarkerDrag,this).off("dragend",this._fireEdit,this).off("touchmove",this._onMarkerDrag,this).off("touchend",this._fireEdit,this).off("click",this._onMarkerClick,this).off("MSPointerMove",this._onTouchMove,this).off("MSPointerUp",this._fireEdit,this)},_fireEdit:function(){this._poly.edited=!0,this._poly.fire("edit"),this._poly._map.fire("draw:editvertex",{layers:this._markerGroup})},_onMarkerDrag:function(t){var e=t.target,i=this._poly;if(L.extend(e._origLatLng,e._latlng),e._middleLeft&&e._middleLeft.setLatLng(this._getMiddleLatLng(e._prev,e)),e._middleRight&&e._middleRight.setLatLng(this._getMiddleLatLng(e,e._next)),i.options.poly){var o=i._map._editTooltip;if(!i.options.poly.allowIntersection&&i.intersects()){var n=i.options.color;i.setStyle({color:this.options.drawError.color}),o&&o.updateContent({text:L.drawLocal.draw.handlers.polyline.error}),setTimeout(function(){i.setStyle({color:n}),o&&o.updateContent({text:L.drawLocal.edit.handlers.edit.tooltip.text,subtext:L.drawLocal.edit.handlers.edit.tooltip.subtext})},1e3),this._onMarkerClick(t)}}this._poly.redraw(),this._poly.fire("editdrag")},_onMarkerClick:function(t){var e=L.Polygon&&this._poly instanceof L.Polygon?4:3,i=t.target;this._latlngs.length<e||(this._removeMarker(i),this._updatePrevNext(i._prev,i._next),i._middleLeft&&this._markerGroup.removeLayer(i._middleLeft),i._middleRight&&this._markerGroup.removeLayer(i._middleRight),i._prev&&i._next?this._createMiddleMarker(i._prev,i._next):i._prev?i._next||(i._prev._middleRight=null):i._next._middleLeft=null,this._fireEdit())},_onTouchMove:function(t){var e=this._map.mouseEventToLayerPoint(t.originalEvent.touches[0]),i=this._map.layerPointToLatLng(e),o=t.target;L.extend(o._origLatLng,i),o._middleLeft&&o._middleLeft.setLatLng(this._getMiddleLatLng(o._prev,o)),o._middleRight&&o._middleRight.setLatLng(this._getMiddleLatLng(o,o._next)),this._poly.redraw(),this.updateMarkers()},_updateIndexes:function(t,e){this._markerGroup.eachLayer(function(i){i._index>t&&(i._index+=e)})},_createMiddleMarker:function(t,e){var i,o,n,s=this._getMiddleLatLng(t,e),a=this._createMarker(s);a.setOpacity(.6),t._middleRight=e._middleLeft=a,o=function(){a.off("touchmove",o,this);var n=e._index;a._index=n,a.off("click",i,this).on("click",this._onMarkerClick,this),s.lat=a.getLatLng().lat,s.lng=a.getLatLng().lng,this._spliceLatLngs(n,0,s),this._markers.splice(n,0,a),a.setOpacity(1),this._updateIndexes(n,1),e._index++,this._updatePrevNext(t,a),this._updatePrevNext(a,e),this._poly.fire("editstart")},n=function(){a.off("dragstart",o,this),a.off("dragend",n,this),a.off("touchmove",o,this),this._createMiddleMarker(t,a),this._createMiddleMarker(a,e)},i=function(){o.call(this),n.call(this),this._fireEdit()},a.on("click",i,this).on("dragstart",o,this).on("dragend",n,this).on("touchmove",o,this),this._markerGroup.addLayer(a)},_updatePrevNext:function(t,e){t&&(t._next=e),e&&(e._prev=t)},_getMiddleLatLng:function(t,e){var i=this._poly._map,o=i.project(t.getLatLng()),n=i.project(e.getLatLng());return i.unproject(o._add(n)._divideBy(2))}}),L.Polyline.addInitHook(function(){this.editing||(L.Edit.Poly&&(this.editing=new L.Edit.Poly(this,this.options.poly),this.options.editable&&this.editing.enable()),this.on("add",function(){this.editing&&this.editing.enabled()&&this.editing.addHooks()}),this.on("remove",function(){this.editing&&this.editing.enabled()&&this.editing.removeHooks()}))}),L.Edit=L.Edit||{},L.Edit.SimpleShape=L.Handler.extend({options:{moveIcon:new L.DivIcon({iconSize:new L.Point(8,8),className:"leaflet-div-icon leaflet-editing-icon leaflet-edit-move"}),resizeIcon:new L.DivIcon({iconSize:new L.Point(8,8),className:"leaflet-div-icon leaflet-editing-icon leaflet-edit-resize"}),touchMoveIcon:new L.DivIcon({iconSize:new L.Point(20,20),className:"leaflet-div-icon leaflet-editing-icon leaflet-edit-move leaflet-touch-icon"}),touchResizeIcon:new L.DivIcon({iconSize:new L.Point(20,20),className:"leaflet-div-icon leaflet-editing-icon leaflet-edit-resize leaflet-touch-icon"})},initialize:function(t,e){L.Browser.touch&&(this.options.moveIcon=this.options.touchMoveIcon,this.options.resizeIcon=this.options.touchResizeIcon),this._shape=t,L.Util.setOptions(this,e)},addHooks:function(){var t=this._shape;this._shape._map&&(this._map=this._shape._map,t.setStyle(t.options.editing),t._map&&(this._map=t._map,this._markerGroup||this._initMarkers(),this._map.addLayer(this._markerGroup)))},removeHooks:function(){var t=this._shape;if(t.setStyle(t.options.original),t._map){this._unbindMarker(this._moveMarker);for(var e=0,i=this._resizeMarkers.length;i>e;e++)this._unbindMarker(this._resizeMarkers[e]);this._resizeMarkers=null,this._map.removeLayer(this._markerGroup),delete this._markerGroup}this._map=null},updateMarkers:function(){this._markerGroup.clearLayers(),this._initMarkers()},_initMarkers:function(){this._markerGroup||(this._markerGroup=new L.LayerGroup),this._createMoveMarker(),this._createResizeMarker()},_createMoveMarker:function(){},_createResizeMarker:function(){},_createMarker:function(t,e){var i=new L.Marker.Touch(t,{draggable:!0,icon:e,zIndexOffset:10});return this._bindMarker(i),this._markerGroup.addLayer(i),i},_bindMarker:function(t){t.on("dragstart",this._onMarkerDragStart,this).on("drag",this._onMarkerDrag,this).on("dragend",this._onMarkerDragEnd,this).on("touchstart",this._onTouchStart,this).on("touchmove",this._onTouchMove,this).on("MSPointerMove",this._onTouchMove,this).on("touchend",this._onTouchEnd,this).on("MSPointerUp",this._onTouchEnd,this)},_unbindMarker:function(t){t.off("dragstart",this._onMarkerDragStart,this).off("drag",this._onMarkerDrag,this).off("dragend",this._onMarkerDragEnd,this).off("touchstart",this._onTouchStart,this).off("touchmove",this._onTouchMove,this).off("MSPointerMove",this._onTouchMove,this).off("touchend",this._onTouchEnd,this).off("MSPointerUp",this._onTouchEnd,this)},_onMarkerDragStart:function(t){var e=t.target;e.setOpacity(0),this._shape.fire("editstart")},_fireEdit:function(){this._shape.edited=!0,this._shape.fire("edit")},_onMarkerDrag:function(t){var e=t.target,i=e.getLatLng();e===this._moveMarker?this._move(i):this._resize(i),this._shape.redraw(),this._shape.fire("editdrag")},_onMarkerDragEnd:function(t){var e=t.target;e.setOpacity(1),this._fireEdit()},_onTouchStart:function(t){if(L.Edit.SimpleShape.prototype._onMarkerDragStart.call(this,t),"function"==typeof this._getCorners){var e=this._getCorners(),i=t.target,o=i._cornerIndex;i.setOpacity(0),this._oppositeCorner=e[(o+2)%4],this._toggleCornerMarkers(0,o)}this._shape.fire("editstart")},_onTouchMove:function(t){var e=this._map.mouseEventToLayerPoint(t.originalEvent.touches[0]),i=this._map.layerPointToLatLng(e),o=t.target;return o===this._moveMarker?this._move(i):this._resize(i),this._shape.redraw(),!1},_onTouchEnd:function(t){var e=t.target;e.setOpacity(1),this.updateMarkers(),this._fireEdit()},_move:function(){},_resize:function(){}}),L.Edit=L.Edit||{},L.Edit.Rectangle=L.Edit.SimpleShape.extend({_createMoveMarker:function(){var t=this._shape.getBounds(),e=t.getCenter();this._moveMarker=this._createMarker(e,this.options.moveIcon)},_createResizeMarker:function(){var t=this._getCorners();this._resizeMarkers=[];for(var e=0,i=t.length;i>e;e++)this._resizeMarkers.push(this._createMarker(t[e],this.options.resizeIcon)),this._resizeMarkers[e]._cornerIndex=e},_onMarkerDragStart:function(t){L.Edit.SimpleShape.prototype._onMarkerDragStart.call(this,t);var e=this._getCorners(),i=t.target,o=i._cornerIndex;this._oppositeCorner=e[(o+2)%4],this._toggleCornerMarkers(0,o)},_onMarkerDragEnd:function(t){var e,i,o=t.target;o===this._moveMarker&&(e=this._shape.getBounds(),i=e.getCenter(),o.setLatLng(i)),this._toggleCornerMarkers(1),this._repositionCornerMarkers(),L.Edit.SimpleShape.prototype._onMarkerDragEnd.call(this,t)},_move:function(t){for(var e,i=this._shape.getLatLngs(),o=this._shape.getBounds(),n=o.getCenter(),s=[],a=0,r=i.length;r>a;a++)e=[i[a].lat-n.lat,i[a].lng-n.lng],s.push([t.lat+e[0],t.lng+e[1]]);this._shape.setLatLngs(s),this._repositionCornerMarkers(),this._map.fire("draw:editmove",{layer:this._shape})},_resize:function(t){var e;this._shape.setBounds(L.latLngBounds(t,this._oppositeCorner)),e=this._shape.getBounds(),this._moveMarker.setLatLng(e.getCenter()),this._map.fire("draw:editresize",{layer:this._shape})},_getCorners:function(){var t=this._shape.getBounds(),e=t.getNorthWest(),i=t.getNorthEast(),o=t.getSouthEast(),n=t.getSouthWest();return[e,i,o,n]},_toggleCornerMarkers:function(t){for(var e=0,i=this._resizeMarkers.length;i>e;e++)this._resizeMarkers[e].setOpacity(t)},_repositionCornerMarkers:function(){for(var t=this._getCorners(),e=0,i=this._resizeMarkers.length;i>e;e++)this._resizeMarkers[e].setLatLng(t[e])}}),L.Rectangle.addInitHook(function(){L.Edit.Rectangle&&(this.editing=new L.Edit.Rectangle(this),this.options.editable&&this.editing.enable())}),L.Edit=L.Edit||{},L.Edit.Circle=L.Edit.SimpleShape.extend({_createMoveMarker:function(){var t=this._shape.getLatLng();this._moveMarker=this._createMarker(t,this.options.moveIcon)},_createResizeMarker:function(){var t=this._shape.getLatLng(),e=this._getResizeMarkerPoint(t);this._resizeMarkers=[],this._resizeMarkers.push(this._createMarker(e,this.options.resizeIcon))},_getResizeMarkerPoint:function(t){var e=this._shape._radius*Math.cos(Math.PI/4),i=this._map.project(t);return this._map.unproject([i.x+e,i.y-e])},_move:function(t){var e=this._getResizeMarkerPoint(t);this._resizeMarkers[0].setLatLng(e),this._shape.setLatLng(t),this._map.fire("draw:editmove",{layer:this._shape})},_resize:function(t){
	var e=this._moveMarker.getLatLng(),i=e.distanceTo(t);this._shape.setRadius(i),this._map.fire("draw:editresize",{layer:this._shape})}}),L.Circle.addInitHook(function(){L.Edit.Circle&&(this.editing=new L.Edit.Circle(this),this.options.editable&&this.editing.enable()),this.on("add",function(){this.editing&&this.editing.enabled()&&this.editing.addHooks()}),this.on("remove",function(){this.editing&&this.editing.enabled()&&this.editing.removeHooks()})}),L.Map.mergeOptions({touchExtend:!0}),L.Map.TouchExtend=L.Handler.extend({initialize:function(t){this._map=t,this._container=t._container,this._pane=t._panes.overlayPane},addHooks:function(){L.DomEvent.on(this._container,"touchstart",this._onTouchStart,this),L.DomEvent.on(this._container,"touchend",this._onTouchEnd,this),L.DomEvent.on(this._container,"touchmove",this._onTouchMove,this),this._detectIE()?(L.DomEvent.on(this._container,"MSPointerDown",this._onTouchStart,this),L.DomEvent.on(this._container,"MSPointerUp",this._onTouchEnd,this),L.DomEvent.on(this._container,"MSPointerMove",this._onTouchMove,this),L.DomEvent.on(this._container,"MSPointerCancel",this._onTouchCancel,this)):(L.DomEvent.on(this._container,"touchcancel",this._onTouchCancel,this),L.DomEvent.on(this._container,"touchleave",this._onTouchLeave,this))},removeHooks:function(){L.DomEvent.off(this._container,"touchstart",this._onTouchStart),L.DomEvent.off(this._container,"touchend",this._onTouchEnd),L.DomEvent.off(this._container,"touchmove",this._onTouchMove),this._detectIE()?(L.DomEvent.off(this._container,"MSPointerDowm",this._onTouchStart),L.DomEvent.off(this._container,"MSPointerUp",this._onTouchEnd),L.DomEvent.off(this._container,"MSPointerMove",this._onTouchMove),L.DomEvent.off(this._container,"MSPointerCancel",this._onTouchCancel)):(L.DomEvent.off(this._container,"touchcancel",this._onTouchCancel),L.DomEvent.off(this._container,"touchleave",this._onTouchLeave))},_touchEvent:function(t,e){var i={};if("undefined"!=typeof t.touches){if(!t.touches.length)return;i=t.touches[0]}else{if("touch"!==t.pointerType)return;if(i=t,!this._filterClick(t))return}var o=this._map.mouseEventToContainerPoint(i),n=this._map.mouseEventToLayerPoint(i),s=this._map.layerPointToLatLng(n);this._map.fire(e,{latlng:s,layerPoint:n,containerPoint:o,pageX:i.pageX,pageY:i.pageY,originalEvent:t})},_filterClick:function(t){var e=t.timeStamp||t.originalEvent.timeStamp,i=L.DomEvent._lastClick&&e-L.DomEvent._lastClick;return i&&i>100&&500>i||t.target._simulatedClick&&!t._simulated?(L.DomEvent.stop(t),!1):(L.DomEvent._lastClick=e,!0)},_onTouchStart:function(t){if(this._map._loaded){var e="touchstart";this._touchEvent(t,e)}},_onTouchEnd:function(t){if(this._map._loaded){var e="touchend";this._touchEvent(t,e)}},_onTouchCancel:function(t){if(this._map._loaded){var e="touchcancel";this._detectIE()&&(e="pointercancel"),this._touchEvent(t,e)}},_onTouchLeave:function(t){if(this._map._loaded){var e="touchleave";this._touchEvent(t,e)}},_onTouchMove:function(t){if(this._map._loaded){var e="touchmove";this._touchEvent(t,e)}},_detectIE:function(){var e=t.navigator.userAgent,i=e.indexOf("MSIE ");if(i>0)return parseInt(e.substring(i+5,e.indexOf(".",i)),10);var o=e.indexOf("Trident/");if(o>0){var n=e.indexOf("rv:");return parseInt(e.substring(n+3,e.indexOf(".",n)),10)}var s=e.indexOf("Edge/");return s>0?parseInt(e.substring(s+5,e.indexOf(".",s)),10):!1}}),L.Map.addInitHook("addHandler","touchExtend",L.Map.TouchExtend),L.Marker.Touch=L.Marker.extend({_initInteraction:function(){if(this.options.clickable){var t=this._icon,e=["dblclick","mousedown","mouseover","mouseout","contextmenu","touchstart","touchend","touchmove"];this._detectIE?e.concat(["MSPointerDown","MSPointerUp","MSPointerMove","MSPointerCancel"]):e.concat(["touchcancel"]),L.DomUtil.addClass(t,"leaflet-clickable"),L.DomEvent.on(t,"click",this._onMouseClick,this),L.DomEvent.on(t,"keypress",this._onKeyPress,this);for(var i=0;i<e.length;i++)L.DomEvent.on(t,e[i],this._fireMouseEvent,this);L.Handler.MarkerDrag&&(this.dragging=new L.Handler.MarkerDrag(this),this.options.draggable&&this.dragging.enable())}},_detectIE:function(){var e=t.navigator.userAgent,i=e.indexOf("MSIE ");if(i>0)return parseInt(e.substring(i+5,e.indexOf(".",i)),10);var o=e.indexOf("Trident/");if(o>0){var n=e.indexOf("rv:");return parseInt(e.substring(n+3,e.indexOf(".",n)),10)}var s=e.indexOf("Edge/");return s>0?parseInt(e.substring(s+5,e.indexOf(".",s)),10):!1}}),L.LatLngUtil={cloneLatLngs:function(t){for(var e=[],i=0,o=t.length;o>i;i++)e.push(this.cloneLatLng(t[i]));return e},cloneLatLng:function(t){return L.latLng(t.lat,t.lng)}},L.GeometryUtil=L.extend(L.GeometryUtil||{},{geodesicArea:function(t){var e,i,o=t.length,n=0,s=L.LatLng.DEG_TO_RAD;if(o>2){for(var a=0;o>a;a++)e=t[a],i=t[(a+1)%o],n+=(i.lng-e.lng)*s*(2+Math.sin(e.lat*s)+Math.sin(i.lat*s));n=6378137*n*6378137/2}return Math.abs(n)},readableArea:function(t,e){var i;return e?i=t>=1e4?(1e-4*t).toFixed(2)+" ha":t.toFixed(2)+" m&sup2;":(t/=.836127,i=t>=3097600?(t/3097600).toFixed(2)+" mi&sup2;":t>=4840?(t/4840).toFixed(2)+" acres":Math.ceil(t)+" yd&sup2;"),i},readableDistance:function(t,e,i){var o;if(e)o=t>1e3?(t/1e3).toFixed(2)+" km":Math.ceil(t)+" m";else if(t*=1.09361,t>1760)o=(t/1760).toFixed(2)+" miles";else{var n=" yd";i&&(t=3*t,n=" ft"),o=Math.ceil(t)+n}return o}}),L.Util.extend(L.LineUtil,{segmentsIntersect:function(t,e,i,o){return this._checkCounterclockwise(t,i,o)!==this._checkCounterclockwise(e,i,o)&&this._checkCounterclockwise(t,e,i)!==this._checkCounterclockwise(t,e,o)},_checkCounterclockwise:function(t,e,i){return(i.y-t.y)*(e.x-t.x)>(e.y-t.y)*(i.x-t.x)}}),L.Polyline.include({intersects:function(){var t,e,i,o=this._originalPoints,n=o?o.length:0;if(this._tooFewPointsForIntersection())return!1;for(t=n-1;t>=3;t--)if(e=o[t-1],i=o[t],this._lineSegmentsIntersectsRange(e,i,t-2))return!0;return!1},newLatLngIntersects:function(t,e){return this._map?this.newPointIntersects(this._map.latLngToLayerPoint(t),e):!1},newPointIntersects:function(t,e){var i=this._originalPoints,o=i?i.length:0,n=i?i[o-1]:null,s=o-2;return this._tooFewPointsForIntersection(1)?!1:this._lineSegmentsIntersectsRange(n,t,s,e?1:0)},_tooFewPointsForIntersection:function(t){var e=this._originalPoints,i=e?e.length:0;return i+=t||0,!this._originalPoints||3>=i},_lineSegmentsIntersectsRange:function(t,e,i,o){var n,s,a=this._originalPoints;o=o||0;for(var r=i;r>o;r--)if(n=a[r-1],s=a[r],L.LineUtil.segmentsIntersect(t,e,n,s))return!0;return!1}}),L.Polygon.include({intersects:function(){var t,e,i,o,n,s=this._originalPoints;return this._tooFewPointsForIntersection()?!1:(t=L.Polyline.prototype.intersects.call(this))?!0:(e=s.length,i=s[0],o=s[e-1],n=e-2,this._lineSegmentsIntersectsRange(o,i,n,1))}}),L.Control.Draw=L.Control.extend({options:{position:"topleft",draw:{},edit:!1},initialize:function(t){if(L.version<"0.7")throw new Error("Leaflet.draw 0.2.3+ requires Leaflet 0.7.0+. Download latest from https://github.com/Leaflet/Leaflet/");L.Control.prototype.initialize.call(this,t);var e;this._toolbars={},L.DrawToolbar&&this.options.draw&&(e=new L.DrawToolbar(this.options.draw),this._toolbars[L.DrawToolbar.TYPE]=e,this._toolbars[L.DrawToolbar.TYPE].on("enable",this._toolbarEnabled,this)),L.EditToolbar&&this.options.edit&&(e=new L.EditToolbar(this.options.edit),this._toolbars[L.EditToolbar.TYPE]=e,this._toolbars[L.EditToolbar.TYPE].on("enable",this._toolbarEnabled,this)),L.toolbar=this},onAdd:function(t){var e,i=L.DomUtil.create("div","leaflet-draw"),o=!1,n="leaflet-draw-toolbar-top";for(var s in this._toolbars)this._toolbars.hasOwnProperty(s)&&(e=this._toolbars[s].addToolbar(t),e&&(o||(L.DomUtil.hasClass(e,n)||L.DomUtil.addClass(e.childNodes[0],n),o=!0),i.appendChild(e)));return i},onRemove:function(){for(var t in this._toolbars)this._toolbars.hasOwnProperty(t)&&this._toolbars[t].removeToolbar()},setDrawingOptions:function(t){for(var e in this._toolbars)this._toolbars[e]instanceof L.DrawToolbar&&this._toolbars[e].setOptions(t)},_toolbarEnabled:function(t){var e=t.target;for(var i in this._toolbars)this._toolbars[i]!==e&&this._toolbars[i].disable()}}),L.Map.mergeOptions({drawControlTooltips:!0,drawControl:!1}),L.Map.addInitHook(function(){this.options.drawControl&&(this.drawControl=new L.Control.Draw,this.addControl(this.drawControl))}),L.Toolbar=L.Class.extend({includes:[L.Mixin.Events],initialize:function(t){L.setOptions(this,t),this._modes={},this._actionButtons=[],this._activeMode=null},enabled:function(){return null!==this._activeMode},disable:function(){this.enabled()&&this._activeMode.handler.disable()},addToolbar:function(t){var e,i=L.DomUtil.create("div","leaflet-draw-section"),o=0,n=this._toolbarClass||"",s=this.getModeHandlers(t);for(this._toolbarContainer=L.DomUtil.create("div","leaflet-draw-toolbar leaflet-bar"),this._map=t,e=0;e<s.length;e++)s[e].enabled&&this._initModeHandler(s[e].handler,this._toolbarContainer,o++,n,s[e].title);return o?(this._lastButtonIndex=--o,this._actionsContainer=L.DomUtil.create("ul","leaflet-draw-actions"),i.appendChild(this._toolbarContainer),i.appendChild(this._actionsContainer),i):void 0},removeToolbar:function(){for(var t in this._modes)this._modes.hasOwnProperty(t)&&(this._disposeButton(this._modes[t].button,this._modes[t].handler.enable,this._modes[t].handler),this._modes[t].handler.disable(),this._modes[t].handler.off("enabled",this._handlerActivated,this).off("disabled",this._handlerDeactivated,this));this._modes={};for(var e=0,i=this._actionButtons.length;i>e;e++)this._disposeButton(this._actionButtons[e].button,this._actionButtons[e].callback,this);this._actionButtons=[],this._actionsContainer=null},_initModeHandler:function(t,e,i,o,n){var s=t.type;this._modes[s]={},this._modes[s].handler=t,this._modes[s].button=this._createButton({type:s,title:n,className:o+"-"+s,container:e,callback:this._modes[s].handler.enable,context:this._modes[s].handler}),this._modes[s].buttonIndex=i,this._modes[s].handler.on("enabled",this._handlerActivated,this).on("disabled",this._handlerDeactivated,this)},_createButton:function(t){var e=L.DomUtil.create("a",t.className||"",t.container);return e.href="#",t.text&&(e.innerHTML=t.text),t.title&&(e.title=t.title),L.DomEvent.on(e,"click",L.DomEvent.stopPropagation).on(e,"mousedown",L.DomEvent.stopPropagation).on(e,"dblclick",L.DomEvent.stopPropagation).on(e,"click",L.DomEvent.preventDefault).on(e,"click",t.callback,t.context),e},_disposeButton:function(t,e){L.DomEvent.off(t,"click",L.DomEvent.stopPropagation).off(t,"mousedown",L.DomEvent.stopPropagation).off(t,"dblclick",L.DomEvent.stopPropagation).off(t,"click",L.DomEvent.preventDefault).off(t,"click",e)},_handlerActivated:function(t){this.disable(),this._activeMode=this._modes[t.handler],L.DomUtil.addClass(this._activeMode.button,"leaflet-draw-toolbar-button-enabled"),this._showActionsToolbar(),this.fire("enable")},_handlerDeactivated:function(){this._hideActionsToolbar(),L.DomUtil.removeClass(this._activeMode.button,"leaflet-draw-toolbar-button-enabled"),this._activeMode=null,this.fire("disable")},_createActions:function(t){var e,i,o,n,s=this._actionsContainer,a=this.getActions(t),r=a.length;for(i=0,o=this._actionButtons.length;o>i;i++)this._disposeButton(this._actionButtons[i].button,this._actionButtons[i].callback);for(this._actionButtons=[];s.firstChild;)s.removeChild(s.firstChild);for(var h=0;r>h;h++)"enabled"in a[h]&&!a[h].enabled||(e=L.DomUtil.create("li","",s),n=this._createButton({title:a[h].title,text:a[h].text,container:e,callback:a[h].callback,context:a[h].context}),this._actionButtons.push({button:n,callback:a[h].callback}))},_showActionsToolbar:function(){var t=this._activeMode.buttonIndex,e=this._lastButtonIndex,i=this._activeMode.button.offsetTop-1;this._createActions(this._activeMode.handler),this._actionsContainer.style.top=i+"px",0===t&&(L.DomUtil.addClass(this._toolbarContainer,"leaflet-draw-toolbar-notop"),L.DomUtil.addClass(this._actionsContainer,"leaflet-draw-actions-top")),t===e&&(L.DomUtil.addClass(this._toolbarContainer,"leaflet-draw-toolbar-nobottom"),L.DomUtil.addClass(this._actionsContainer,"leaflet-draw-actions-bottom")),this._actionsContainer.style.display="block"},_hideActionsToolbar:function(){this._actionsContainer.style.display="none",L.DomUtil.removeClass(this._toolbarContainer,"leaflet-draw-toolbar-notop"),L.DomUtil.removeClass(this._toolbarContainer,"leaflet-draw-toolbar-nobottom"),L.DomUtil.removeClass(this._actionsContainer,"leaflet-draw-actions-top"),L.DomUtil.removeClass(this._actionsContainer,"leaflet-draw-actions-bottom")}}),L.Tooltip=L.Class.extend({initialize:function(t){this._map=t,this._popupPane=t._panes.popupPane,this._container=t.options.drawControlTooltips?L.DomUtil.create("div","leaflet-draw-tooltip",this._popupPane):null,this._singleLineLabel=!1,this._map.on("mouseout",this._onMouseOut,this)},dispose:function(){this._map.off("mouseout",this._onMouseOut,this),this._container&&(this._popupPane.removeChild(this._container),this._container=null)},updateContent:function(t){return this._container?(t.subtext=t.subtext||"",0!==t.subtext.length||this._singleLineLabel?t.subtext.length>0&&this._singleLineLabel&&(L.DomUtil.removeClass(this._container,"leaflet-draw-tooltip-single"),this._singleLineLabel=!1):(L.DomUtil.addClass(this._container,"leaflet-draw-tooltip-single"),this._singleLineLabel=!0),this._container.innerHTML=(t.subtext.length>0?'<span class="leaflet-draw-tooltip-subtext">'+t.subtext+"</span><br />":"")+"<span>"+t.text+"</span>",this):this},updatePosition:function(t){var e=this._map.latLngToLayerPoint(t),i=this._container;return this._container&&(i.style.visibility="inherit",L.DomUtil.setPosition(i,e)),this},showAsError:function(){return this._container&&L.DomUtil.addClass(this._container,"leaflet-error-draw-tooltip"),this},removeError:function(){return this._container&&L.DomUtil.removeClass(this._container,"leaflet-error-draw-tooltip"),this},_onMouseOut:function(){this._container&&(this._container.style.visibility="hidden")}}),L.DrawToolbar=L.Toolbar.extend({statics:{TYPE:"draw"},options:{polyline:{},polygon:{},rectangle:{},circle:{},marker:{}},initialize:function(t){for(var e in this.options)this.options.hasOwnProperty(e)&&t[e]&&(t[e]=L.extend({},this.options[e],t[e]));this._toolbarClass="leaflet-draw-draw",L.Toolbar.prototype.initialize.call(this,t)},getModeHandlers:function(t){return[{enabled:this.options.polyline,handler:new L.Draw.Polyline(t,this.options.polyline),title:L.drawLocal.draw.toolbar.buttons.polyline},{enabled:this.options.polygon,handler:new L.Draw.Polygon(t,this.options.polygon),title:L.drawLocal.draw.toolbar.buttons.polygon},{enabled:this.options.rectangle,handler:new L.Draw.Rectangle(t,this.options.rectangle),title:L.drawLocal.draw.toolbar.buttons.rectangle},{enabled:this.options.circle,handler:new L.Draw.Circle(t,this.options.circle),title:L.drawLocal.draw.toolbar.buttons.circle},{enabled:this.options.marker,handler:new L.Draw.Marker(t,this.options.marker),title:L.drawLocal.draw.toolbar.buttons.marker}]},getActions:function(t){return[{enabled:t.completeShape,title:L.drawLocal.draw.toolbar.finish.title,text:L.drawLocal.draw.toolbar.finish.text,callback:t.completeShape,context:t},{enabled:t.deleteLastVertex,title:L.drawLocal.draw.toolbar.undo.title,text:L.drawLocal.draw.toolbar.undo.text,callback:t.deleteLastVertex,context:t},{title:L.drawLocal.draw.toolbar.actions.title,text:L.drawLocal.draw.toolbar.actions.text,callback:this.disable,context:this}]},setOptions:function(t){L.setOptions(this,t);for(var e in this._modes)this._modes.hasOwnProperty(e)&&t.hasOwnProperty(e)&&this._modes[e].handler.setOptions(t[e])}}),L.EditToolbar=L.Toolbar.extend({statics:{TYPE:"edit"},options:{edit:{selectedPathOptions:{dashArray:"10, 10",fill:!0,fillColor:"#fe57a1",fillOpacity:.1,maintainColor:!1}},remove:{},poly:null,featureGroup:null},initialize:function(t){t.edit&&("undefined"==typeof t.edit.selectedPathOptions&&(t.edit.selectedPathOptions=this.options.edit.selectedPathOptions),t.edit.selectedPathOptions=L.extend({},this.options.edit.selectedPathOptions,t.edit.selectedPathOptions)),t.remove&&(t.remove=L.extend({},this.options.remove,t.remove)),t.poly&&(t.poly=L.extend({},this.options.poly,t.poly)),this._toolbarClass="leaflet-draw-edit",L.Toolbar.prototype.initialize.call(this,t),this._selectedFeatureCount=0},getModeHandlers:function(t){var e=this.options.featureGroup;return[{enabled:this.options.edit,handler:new L.EditToolbar.Edit(t,{featureGroup:e,selectedPathOptions:this.options.edit.selectedPathOptions,poly:this.options.poly}),title:L.drawLocal.edit.toolbar.buttons.edit},{enabled:this.options.remove,handler:new L.EditToolbar.Delete(t,{featureGroup:e}),title:L.drawLocal.edit.toolbar.buttons.remove}]},getActions:function(){return[{title:L.drawLocal.edit.toolbar.actions.save.title,text:L.drawLocal.edit.toolbar.actions.save.text,callback:this._save,context:this},{title:L.drawLocal.edit.toolbar.actions.cancel.title,text:L.drawLocal.edit.toolbar.actions.cancel.text,callback:this.disable,context:this}]},addToolbar:function(t){var e=L.Toolbar.prototype.addToolbar.call(this,t);return this._checkDisabled(),this.options.featureGroup.on("layeradd layerremove",this._checkDisabled,this),e},removeToolbar:function(){this.options.featureGroup.off("layeradd layerremove",this._checkDisabled,this),L.Toolbar.prototype.removeToolbar.call(this)},disable:function(){this.enabled()&&(this._activeMode.handler.revertLayers(),L.Toolbar.prototype.disable.call(this))},_save:function(){this._activeMode.handler.save(),this._activeMode&&this._activeMode.handler.disable()},_checkDisabled:function(){var t,e=this.options.featureGroup,i=0!==e.getLayers().length;this.options.edit&&(t=this._modes[L.EditToolbar.Edit.TYPE].button,i?L.DomUtil.removeClass(t,"leaflet-disabled"):L.DomUtil.addClass(t,"leaflet-disabled"),t.setAttribute("title",i?L.drawLocal.edit.toolbar.buttons.edit:L.drawLocal.edit.toolbar.buttons.editDisabled)),this.options.remove&&(t=this._modes[L.EditToolbar.Delete.TYPE].button,i?L.DomUtil.removeClass(t,"leaflet-disabled"):L.DomUtil.addClass(t,"leaflet-disabled"),t.setAttribute("title",i?L.drawLocal.edit.toolbar.buttons.remove:L.drawLocal.edit.toolbar.buttons.removeDisabled))}}),L.EditToolbar.Edit=L.Handler.extend({statics:{TYPE:"edit"},includes:L.Mixin.Events,initialize:function(t,e){if(L.Handler.prototype.initialize.call(this,t),L.setOptions(this,e),this._featureGroup=e.featureGroup,!(this._featureGroup instanceof L.FeatureGroup))throw new Error("options.featureGroup must be a L.FeatureGroup");this._uneditedLayerProps={},this.type=L.EditToolbar.Edit.TYPE},enable:function(){!this._enabled&&this._hasAvailableLayers()&&(this.fire("enabled",{handler:this.type}),this._map.fire("draw:editstart",{handler:this.type}),L.Handler.prototype.enable.call(this),this._featureGroup.on("layeradd",this._enableLayerEdit,this).on("layerremove",this._disableLayerEdit,this))},disable:function(){this._enabled&&(this._featureGroup.off("layeradd",this._enableLayerEdit,this).off("layerremove",this._disableLayerEdit,this),L.Handler.prototype.disable.call(this),this._map.fire("draw:editstop",{handler:this.type}),this.fire("disabled",{handler:this.type}))},addHooks:function(){var t=this._map;t&&(t.getContainer().focus(),this._featureGroup.eachLayer(this._enableLayerEdit,this),this._tooltip=new L.Tooltip(this._map),this._tooltip.updateContent({text:L.drawLocal.edit.handlers.edit.tooltip.text,subtext:L.drawLocal.edit.handlers.edit.tooltip.subtext}),t._editTooltip=this._tooltip,this._updateTooltip(),this._map.on("mousemove",this._onMouseMove,this).on("touchmove",this._onMouseMove,this).on("MSPointerMove",this._onMouseMove,this).on("click",this._editStyle,this).on("draw:editvertex",this._updateTooltip,this))},removeHooks:function(){this._map&&(this._featureGroup.eachLayer(this._disableLayerEdit,this),this._uneditedLayerProps={},this._tooltip.dispose(),this._tooltip=null,this._map.off("mousemove",this._onMouseMove,this).off("touchmove",this._onMouseMove,this).off("MSPointerMove",this._onMouseMove,this).off("click",this._editStyle,this).off("draw:editvertex",this._updateTooltip,this))},revertLayers:function(){this._featureGroup.eachLayer(function(t){this._revertLayer(t)},this)},save:function(){var t=new L.LayerGroup;this._featureGroup.eachLayer(function(e){e.edited&&(t.addLayer(e),e.edited=!1)}),this._map.fire("draw:edited",{layers:t})},_backupLayer:function(t){var e=L.Util.stamp(t);this._uneditedLayerProps[e]||(t instanceof L.Polyline||t instanceof L.Polygon||t instanceof L.Rectangle?this._uneditedLayerProps[e]={latlngs:L.LatLngUtil.cloneLatLngs(t.getLatLngs())}:t instanceof L.Circle?this._uneditedLayerProps[e]={latlng:L.LatLngUtil.cloneLatLng(t.getLatLng()),radius:t.getRadius()}:t instanceof L.Marker&&(this._uneditedLayerProps[e]={latlng:L.LatLngUtil.cloneLatLng(t.getLatLng())}))},_getTooltipText:function(){return{text:L.drawLocal.edit.handlers.edit.tooltip.text,subtext:L.drawLocal.edit.handlers.edit.tooltip.subtext}},_updateTooltip:function(){this._tooltip.updateContent(this._getTooltipText())},_revertLayer:function(t){var e=L.Util.stamp(t);t.edited=!1,this._uneditedLayerProps.hasOwnProperty(e)&&(t instanceof L.Polyline||t instanceof L.Polygon||t instanceof L.Rectangle?t.setLatLngs(this._uneditedLayerProps[e].latlngs):t instanceof L.Circle?(t.setLatLng(this._uneditedLayerProps[e].latlng),t.setRadius(this._uneditedLayerProps[e].radius)):t instanceof L.Marker&&t.setLatLng(this._uneditedLayerProps[e].latlng),t.fire("revert-edited",{layer:t}))},_enableLayerEdit:function(t){var e,i,o=t.layer||t.target||t;this._backupLayer(o),this.options.poly&&(i=L.Util.extend({},this.options.poly),o.options.poly=i),this.options.selectedPathOptions&&(e=L.Util.extend({},this.options.selectedPathOptions),e.maintainColor&&(e.color=o.options.color,e.fillColor=o.options.fillColor),o.options.original=L.extend({},o.options),o.options.editing=e),this.isMarker?(o.dragging.enable(),o.on("dragend",this._onMarkerDragEnd).on("touchmove",this._onTouchMove,this).on("MSPointerMove",this._onTouchMove,this).on("touchend",this._onMarkerDragEnd,this).on("MSPointerUp",this._onMarkerDragEnd,this)):o.editing.enable()},_disableLayerEdit:function(t){var e=t.layer||t.target||t;e.edited=!1,e.editing.disable(),delete e.options.editing,delete e.options.original,this._selectedPathOptions&&(e instanceof L.Marker?this._toggleMarkerHighlight(e):(e.setStyle(e.options.previousOptions),delete e.options.previousOptions)),e instanceof L.Marker?(e.dragging.disable(),e.off("dragend",this._onMarkerDragEnd,this).off("touchmove",this._onTouchMove,this).off("MSPointerMove",this._onTouchMove,this).off("touchend",this._onMarkerDragEnd,this).off("MSPointerUp",this._onMarkerDragEnd,this)):e.editing.disable()},_onMouseMove:function(t){this._tooltip.updatePosition(t.latlng)},_onTouchMove:function(t){var e=t.originalEvent.changedTouches[0],i=this._map.mouseEventToLayerPoint(e),o=this._map.layerPointToLatLng(i);t.target.setLatLng(o)},_hasAvailableLayers:function(){return 0!==this._featureGroup.getLayers().length}}),L.EditToolbar.Delete=L.Handler.extend({statics:{TYPE:"remove"},includes:L.Mixin.Events,initialize:function(t,e){if(L.Handler.prototype.initialize.call(this,t),L.Util.setOptions(this,e),this._deletableLayers=this.options.featureGroup,!(this._deletableLayers instanceof L.FeatureGroup))throw new Error("options.featureGroup must be a L.FeatureGroup");this.type=L.EditToolbar.Delete.TYPE},enable:function(){!this._enabled&&this._hasAvailableLayers()&&(this.fire("enabled",{handler:this.type}),this._map.fire("draw:deletestart",{handler:this.type}),L.Handler.prototype.enable.call(this),this._deletableLayers.on("layeradd",this._enableLayerDelete,this).on("layerremove",this._disableLayerDelete,this))},disable:function(){this._enabled&&(this._deletableLayers.off("layeradd",this._enableLayerDelete,this).off("layerremove",this._disableLayerDelete,this),L.Handler.prototype.disable.call(this),this._map.fire("draw:deletestop",{handler:this.type}),this.fire("disabled",{handler:this.type}))},addHooks:function(){var t=this._map;t&&(t.getContainer().focus(),this._deletableLayers.eachLayer(this._enableLayerDelete,this),this._deletedLayers=new L.LayerGroup,this._tooltip=new L.Tooltip(this._map),this._tooltip.updateContent({text:L.drawLocal.edit.handlers.remove.tooltip.text}),this._map.on("mousemove",this._onMouseMove,this))},removeHooks:function(){this._map&&(this._deletableLayers.eachLayer(this._disableLayerDelete,this),this._deletedLayers=null,this._tooltip.dispose(),this._tooltip=null,this._map.off("mousemove",this._onMouseMove,this))},revertLayers:function(){this._deletedLayers.eachLayer(function(t){this._deletableLayers.addLayer(t),t.fire("revert-deleted",{layer:t})},this)},save:function(){this._map.fire("draw:deleted",{layers:this._deletedLayers})},_enableLayerDelete:function(t){var e=t.layer||t.target||t;e.on("click",this._removeLayer,this)},_disableLayerDelete:function(t){var e=t.layer||t.target||t;e.off("click",this._removeLayer,this),this._deletedLayers.removeLayer(e)},_removeLayer:function(t){var e=t.layer||t.target||t;this._deletableLayers.removeLayer(e),this._deletedLayers.addLayer(e),e.fire("deleted")},_onMouseMove:function(t){this._tooltip.updatePosition(t.latlng)},_hasAvailableLayers:function(){return 0!==this._deletableLayers.getLayers().length}})}(window,document);

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.initProj4 = initProj4;
	exports.transform = transform;
	
	var _proj = __webpack_require__(5);
	
	var proj4 = _interopRequireWildcard(_proj);
	
	__webpack_require__(6);
	
	__webpack_require__(7);
	
	__webpack_require__(8);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	// import * as proj4 from 'proj4'
	var projHash = {};
	
	function initProj4() {
	    var crsDest = document.getElementById('crsDest');
	    var optIndex = 0;
	    for (var def in proj4.defs) {
	        if (proj4.defs.hasOwnProperty(def)) {
	            try {
	                var proj = projHash[def];
	                if (!proj) {
	                    proj = projHash[def] = new proj4.Proj(def);
	                }
	                var label = def + " - " + (proj.title ? proj.title : '');
	                crsDest.options[optIndex] = new Option(label, def);
	                ++optIndex;
	            } catch (er) {
	                console.log(er);
	            }
	        }
	    }
	}
	
	function transform(point, crsDest, crsSource) {
	    crsSource = crsSource || "EPSG:4326";
	    if (crsSource !== crsDest) {
	        var projSource = projHash[crsSource];
	        var projDest = projHash[crsDest];
	        if (projDest && projSource) {
	            var pointSource = new proj4.Point(point);
	            var pointDest = proj4.transform(projSource, projDest, pointSource);
	            return [pointDest.x, pointDest.y];
	        }
	    } else {
	        return point;
	    }
	    return false;
	}

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var require;var require;!function(a){if(true)module.exports=a();else if("function"==typeof define&&define.amd)define([],a);else{var b;b="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,b.proj4=a()}}(function(){return function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var i="function"==typeof require&&require;if(!h&&i)return require(g,!0);if(f)return f(g,!0);var j=new Error("Cannot find module '"+g+"'");throw j.code="MODULE_NOT_FOUND",j}var k=c[g]={exports:{}};b[g][0].call(k.exports,function(a){var c=b[g][1][a];return e(c?c:a)},k,k.exports,a,b,c,d)}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({"./includedProjections":[function(a,b,c){var d=[a("./lib/projections/tmerc"),a("./lib/projections/utm"),a("./lib/projections/sterea"),a("./lib/projections/stere"),a("./lib/projections/somerc"),a("./lib/projections/omerc"),a("./lib/projections/lcc"),a("./lib/projections/krovak"),a("./lib/projections/cass"),a("./lib/projections/laea"),a("./lib/projections/aea"),a("./lib/projections/gnom"),a("./lib/projections/cea"),a("./lib/projections/eqc"),a("./lib/projections/poly"),a("./lib/projections/nzmg"),a("./lib/projections/mill"),a("./lib/projections/sinu"),a("./lib/projections/moll"),a("./lib/projections/eqdc"),a("./lib/projections/vandg"),a("./lib/projections/aeqd"),a("./lib/projections/ortho")];b.exports=function(proj4){d.forEach(function(a){proj4.Proj.projections.add(a)})}},{"./lib/projections/aea":40,"./lib/projections/aeqd":41,"./lib/projections/cass":42,"./lib/projections/cea":43,"./lib/projections/eqc":44,"./lib/projections/eqdc":45,"./lib/projections/gnom":47,"./lib/projections/krovak":48,"./lib/projections/laea":49,"./lib/projections/lcc":50,"./lib/projections/mill":53,"./lib/projections/moll":54,"./lib/projections/nzmg":55,"./lib/projections/omerc":56,"./lib/projections/ortho":57,"./lib/projections/poly":58,"./lib/projections/sinu":59,"./lib/projections/somerc":60,"./lib/projections/stere":61,"./lib/projections/sterea":62,"./lib/projections/tmerc":63,"./lib/projections/utm":64,"./lib/projections/vandg":65}],1:[function(a,b,c){function Point(a,b,c){if(!(this instanceof Point))return new Point(a,b,c);if(Array.isArray(a))this.x=a[0],this.y=a[1],this.z=a[2]||0;else if("object"==typeof a)this.x=a.x,this.y=a.y,this.z=a.z||0;else if("string"==typeof a&&"undefined"==typeof b){var d=a.split(",");this.x=parseFloat(d[0],10),this.y=parseFloat(d[1],10),this.z=parseFloat(d[2],10)||0}else this.x=a,this.y=b,this.z=c||0;console.warn("proj4.Point will be removed in version 3, use proj4.toPoint")}var d=a("mgrs");Point.fromMGRS=function(a){return new Point(d.toPoint(a))},Point.prototype.toMGRS=function(a){return d.forward([this.x,this.y],a)},b.exports=Point},{mgrs:68}],2:[function(a,b,c){function Projection(a,b){if(!(this instanceof Projection))return new Projection(a);b=b||function(a){if(a)throw a};var c=d(a);if("object"!=typeof c)return void b(a);var f=g(c),h=Projection.projections.get(f.projName);h?(e(this,f),e(this,h),this.init(),b(null,this)):b(a)}var d=a("./parseCode"),e=a("./extend"),f=a("./projections"),g=a("./deriveConstants");Projection.projections=f,Projection.projections.start(),b.exports=Projection},{"./deriveConstants":33,"./extend":34,"./parseCode":37,"./projections":39}],3:[function(a,b,c){b.exports=function(a,b,c){var d,e,f,g=c.x,h=c.y,i=c.z||0;for(f=0;3>f;f++)if(!b||2!==f||void 0!==c.z)switch(0===f?(d=g,e="x"):1===f?(d=h,e="y"):(d=i,e="z"),a.axis[f]){case"e":c[e]=d;break;case"w":c[e]=-d;break;case"n":c[e]=d;break;case"s":c[e]=-d;break;case"u":void 0!==c[e]&&(c.z=d);break;case"d":void 0!==c[e]&&(c.z=-d);break;default:return null}return c}},{}],4:[function(a,b,c){var d=Math.PI/2,e=a("./sign");b.exports=function(a){return Math.abs(a)<d?a:a-e(a)*Math.PI}},{"./sign":21}],5:[function(a,b,c){var d=2*Math.PI,e=3.14159265359,f=a("./sign");b.exports=function(a){return Math.abs(a)<=e?a:a-f(a)*d}},{"./sign":21}],6:[function(a,b,c){b.exports=function(a){return Math.abs(a)>1&&(a=a>1?1:-1),Math.asin(a)}},{}],7:[function(a,b,c){b.exports=function(a){return 1-.25*a*(1+a/16*(3+1.25*a))}},{}],8:[function(a,b,c){b.exports=function(a){return.375*a*(1+.25*a*(1+.46875*a))}},{}],9:[function(a,b,c){b.exports=function(a){return.05859375*a*a*(1+.75*a)}},{}],10:[function(a,b,c){b.exports=function(a){return a*a*a*(35/3072)}},{}],11:[function(a,b,c){b.exports=function(a,b,c){var d=b*c;return a/Math.sqrt(1-d*d)}},{}],12:[function(a,b,c){b.exports=function(a,b,c,d,e){var f,g;f=a/b;for(var h=0;15>h;h++)if(g=(a-(b*f-c*Math.sin(2*f)+d*Math.sin(4*f)-e*Math.sin(6*f)))/(b-2*c*Math.cos(2*f)+4*d*Math.cos(4*f)-6*e*Math.cos(6*f)),f+=g,Math.abs(g)<=1e-10)return f;return NaN}},{}],13:[function(a,b,c){var d=Math.PI/2;b.exports=function(a,b){var c=1-(1-a*a)/(2*a)*Math.log((1-a)/(1+a));if(Math.abs(Math.abs(b)-c)<1e-6)return 0>b?-1*d:d;for(var e,f,g,h,i=Math.asin(.5*b),j=0;30>j;j++)if(f=Math.sin(i),g=Math.cos(i),h=a*f,e=Math.pow(1-h*h,2)/(2*g)*(b/(1-a*a)-f/(1-h*h)+.5/a*Math.log((1-h)/(1+h))),i+=e,Math.abs(e)<=1e-10)return i;return NaN}},{}],14:[function(a,b,c){b.exports=function(a,b,c,d,e){return a*e-b*Math.sin(2*e)+c*Math.sin(4*e)-d*Math.sin(6*e)}},{}],15:[function(a,b,c){b.exports=function(a,b,c){var d=a*b;return c/Math.sqrt(1-d*d)}},{}],16:[function(a,b,c){var d=Math.PI/2;b.exports=function(a,b){for(var c,e,f=.5*a,g=d-2*Math.atan(b),h=0;15>=h;h++)if(c=a*Math.sin(g),e=d-2*Math.atan(b*Math.pow((1-c)/(1+c),f))-g,g+=e,Math.abs(e)<=1e-10)return g;return-9999}},{}],17:[function(a,b,c){var d=1,e=.25,f=.046875,g=.01953125,h=.01068115234375,i=.75,j=.46875,k=.013020833333333334,l=.007120768229166667,m=.3645833333333333,n=.005696614583333333,o=.3076171875;b.exports=function(a){var b=[];b[0]=d-a*(e+a*(f+a*(g+a*h))),b[1]=a*(i-a*(f+a*(g+a*h)));var c=a*a;return b[2]=c*(j-a*(k+a*l)),c*=a,b[3]=c*(m-a*n),b[4]=c*a*o,b}},{}],18:[function(a,b,c){var d=a("./pj_mlfn"),e=1e-10,f=20;b.exports=function(a,b,c){for(var g=1/(1-b),h=a,i=f;i;--i){var j=Math.sin(h),k=1-b*j*j;if(k=(d(h,j,Math.cos(h),c)-a)*(k*Math.sqrt(k))*g,h-=k,Math.abs(k)<e)return h}return h}},{"./pj_mlfn":19}],19:[function(a,b,c){b.exports=function(a,b,c,d){return c*=b,b*=b,d[0]*a-c*(d[1]+b*(d[2]+b*(d[3]+b*d[4])))}},{}],20:[function(a,b,c){b.exports=function(a,b){var c;return a>1e-7?(c=a*b,(1-a*a)*(b/(1-c*c)-.5/a*Math.log((1-c)/(1+c)))):2*b}},{}],21:[function(a,b,c){b.exports=function(a){return 0>a?-1:1}},{}],22:[function(a,b,c){b.exports=function(a,b){return Math.pow((1-a)/(1+a),b)}},{}],23:[function(a,b,c){b.exports=function(a){var b={x:a[0],y:a[1]};return a.length>2&&(b.z=a[2]),a.length>3&&(b.m=a[3]),b}},{}],24:[function(a,b,c){var d=Math.PI/2;b.exports=function(a,b,c){var e=a*c,f=.5*a;return e=Math.pow((1-e)/(1+e),f),Math.tan(.5*(d-b))/e}},{}],25:[function(a,b,c){c.wgs84={towgs84:"0,0,0",ellipse:"WGS84",datumName:"WGS84"},c.ch1903={towgs84:"674.374,15.056,405.346",ellipse:"bessel",datumName:"swiss"},c.ggrs87={towgs84:"-199.87,74.79,246.62",ellipse:"GRS80",datumName:"Greek_Geodetic_Reference_System_1987"},c.nad83={towgs84:"0,0,0",ellipse:"GRS80",datumName:"North_American_Datum_1983"},c.nad27={nadgrids:"@conus,@alaska,@ntv2_0.gsb,@ntv1_can.dat",ellipse:"clrk66",datumName:"North_American_Datum_1927"},c.potsdam={towgs84:"606.0,23.0,413.0",ellipse:"bessel",datumName:"Potsdam Rauenberg 1950 DHDN"},c.carthage={towgs84:"-263.0,6.0,431.0",ellipse:"clark80",datumName:"Carthage 1934 Tunisia"},c.hermannskogel={towgs84:"653.0,-212.0,449.0",ellipse:"bessel",datumName:"Hermannskogel"},c.ire65={towgs84:"482.530,-130.596,564.557,-1.042,-0.214,-0.631,8.15",ellipse:"mod_airy",datumName:"Ireland 1965"},c.rassadiran={towgs84:"-133.63,-157.5,-158.62",ellipse:"intl",datumName:"Rassadiran"},c.nzgd49={towgs84:"59.47,-5.04,187.44,0.47,-0.1,1.024,-4.5993",ellipse:"intl",datumName:"New Zealand Geodetic Datum 1949"},c.osgb36={towgs84:"446.448,-125.157,542.060,0.1502,0.2470,0.8421,-20.4894",ellipse:"airy",datumName:"Airy 1830"},c.s_jtsk={towgs84:"589,76,480",ellipse:"bessel",datumName:"S-JTSK (Ferro)"},c.beduaram={towgs84:"-106,-87,188",ellipse:"clrk80",datumName:"Beduaram"},c.gunung_segara={towgs84:"-403,684,41",ellipse:"bessel",datumName:"Gunung Segara Jakarta"},c.rnb72={towgs84:"106.869,-52.2978,103.724,-0.33657,0.456955,-1.84218,1",ellipse:"intl",datumName:"Reseau National Belge 1972"}},{}],26:[function(a,b,c){c.MERIT={a:6378137,rf:298.257,ellipseName:"MERIT 1983"},c.SGS85={a:6378136,rf:298.257,ellipseName:"Soviet Geodetic System 85"},c.GRS80={a:6378137,rf:298.257222101,ellipseName:"GRS 1980(IUGG, 1980)"},c.IAU76={a:6378140,rf:298.257,ellipseName:"IAU 1976"},c.airy={a:6377563.396,b:6356256.91,ellipseName:"Airy 1830"},c.APL4={a:6378137,rf:298.25,ellipseName:"Appl. Physics. 1965"},c.NWL9D={a:6378145,rf:298.25,ellipseName:"Naval Weapons Lab., 1965"},c.mod_airy={a:6377340.189,b:6356034.446,ellipseName:"Modified Airy"},c.andrae={a:6377104.43,rf:300,ellipseName:"Andrae 1876 (Den., Iclnd.)"},c.aust_SA={a:6378160,rf:298.25,ellipseName:"Australian Natl & S. Amer. 1969"},c.GRS67={a:6378160,rf:298.247167427,ellipseName:"GRS 67(IUGG 1967)"},c.bessel={a:6377397.155,rf:299.1528128,ellipseName:"Bessel 1841"},c.bess_nam={a:6377483.865,rf:299.1528128,ellipseName:"Bessel 1841 (Namibia)"},c.clrk66={a:6378206.4,b:6356583.8,ellipseName:"Clarke 1866"},c.clrk80={a:6378249.145,rf:293.4663,ellipseName:"Clarke 1880 mod."},c.clrk58={a:6378293.645208759,rf:294.2606763692654,ellipseName:"Clarke 1858"},c.CPM={a:6375738.7,rf:334.29,ellipseName:"Comm. des Poids et Mesures 1799"},c.delmbr={a:6376428,rf:311.5,ellipseName:"Delambre 1810 (Belgium)"},c.engelis={a:6378136.05,rf:298.2566,ellipseName:"Engelis 1985"},c.evrst30={a:6377276.345,rf:300.8017,ellipseName:"Everest 1830"},c.evrst48={a:6377304.063,rf:300.8017,ellipseName:"Everest 1948"},c.evrst56={a:6377301.243,rf:300.8017,ellipseName:"Everest 1956"},c.evrst69={a:6377295.664,rf:300.8017,ellipseName:"Everest 1969"},c.evrstSS={a:6377298.556,rf:300.8017,ellipseName:"Everest (Sabah & Sarawak)"},c.fschr60={a:6378166,rf:298.3,ellipseName:"Fischer (Mercury Datum) 1960"},c.fschr60m={a:6378155,rf:298.3,ellipseName:"Fischer 1960"},c.fschr68={a:6378150,rf:298.3,ellipseName:"Fischer 1968"},c.helmert={a:6378200,rf:298.3,ellipseName:"Helmert 1906"},c.hough={a:6378270,rf:297,ellipseName:"Hough"},c.intl={a:6378388,rf:297,ellipseName:"International 1909 (Hayford)"},c.kaula={a:6378163,rf:298.24,ellipseName:"Kaula 1961"},c.lerch={a:6378139,rf:298.257,ellipseName:"Lerch 1979"},c.mprts={a:6397300,rf:191,ellipseName:"Maupertius 1738"},c.new_intl={a:6378157.5,b:6356772.2,ellipseName:"New International 1967"},c.plessis={a:6376523,rf:6355863,ellipseName:"Plessis 1817 (France)"},c.krass={a:6378245,rf:298.3,ellipseName:"Krassovsky, 1942"},c.SEasia={a:6378155,b:6356773.3205,ellipseName:"Southeast Asia"},c.walbeck={a:6376896,b:6355834.8467,ellipseName:"Walbeck"},c.WGS60={a:6378165,rf:298.3,ellipseName:"WGS 60"},c.WGS66={a:6378145,rf:298.25,ellipseName:"WGS 66"},c.WGS7={a:6378135,rf:298.26,ellipseName:"WGS 72"},c.WGS84={a:6378137,rf:298.257223563,ellipseName:"WGS 84"},c.sphere={a:6370997,b:6370997,ellipseName:"Normal Sphere (r=6370997)"}},{}],27:[function(a,b,c){c.greenwich=0,c.lisbon=-9.131906111111,c.paris=2.337229166667,c.bogota=-74.080916666667,c.madrid=-3.687938888889,c.rome=12.452333333333,c.bern=7.439583333333,c.jakarta=106.807719444444,c.ferro=-17.666666666667,c.brussels=4.367975,c.stockholm=18.058277777778,c.athens=23.7163375,c.oslo=10.722916666667},{}],28:[function(a,b,c){c.ft={to_meter:.3048},c["us-ft"]={to_meter:1200/3937}},{}],29:[function(a,b,c){function d(a,b,c){var d;return Array.isArray(c)?(d=g(a,b,c),3===c.length?[d.x,d.y,d.z]:[d.x,d.y]):g(a,b,c)}function e(a){return a instanceof f?a:a.oProj?a.oProj:f(a)}function proj4(a,b,c){a=e(a);var f,g=!1;return"undefined"==typeof b?(b=a,a=h,g=!0):("undefined"!=typeof b.x||Array.isArray(b))&&(c=b,b=a,a=h,g=!0),b=e(b),c?d(a,b,c):(f={forward:function(c){return d(a,b,c)},inverse:function(c){return d(b,a,c)}},g&&(f.oProj=b),f)}var f=a("./Proj"),g=a("./transform"),h=f("WGS84");b.exports=proj4},{"./Proj":2,"./transform":66}],30:[function(a,b,c){var d=Math.PI/2,e=1,f=2,g=3,h=4,i=5,j=484813681109536e-20,k=1.0026,l=.3826834323650898,m=function(a){return this instanceof m?(this.datum_type=h,void(a&&(a.datumCode&&"none"===a.datumCode&&(this.datum_type=i),a.datum_params&&(this.datum_params=a.datum_params.map(parseFloat),0===this.datum_params[0]&&0===this.datum_params[1]&&0===this.datum_params[2]||(this.datum_type=e),this.datum_params.length>3&&(0===this.datum_params[3]&&0===this.datum_params[4]&&0===this.datum_params[5]&&0===this.datum_params[6]||(this.datum_type=f,this.datum_params[3]*=j,this.datum_params[4]*=j,this.datum_params[5]*=j,this.datum_params[6]=this.datum_params[6]/1e6+1))),this.datum_type=a.grids?g:this.datum_type,this.a=a.a,this.b=a.b,this.es=a.es,this.ep2=a.ep2,this.datum_type===g&&(this.grids=a.grids)))):new m(a)};m.prototype={compare_datums:function(a){return this.datum_type!==a.datum_type?!1:this.a!==a.a||Math.abs(this.es-a.es)>5e-11?!1:this.datum_type===e?this.datum_params[0]===a.datum_params[0]&&this.datum_params[1]===a.datum_params[1]&&this.datum_params[2]===a.datum_params[2]:this.datum_type===f?this.datum_params[0]===a.datum_params[0]&&this.datum_params[1]===a.datum_params[1]&&this.datum_params[2]===a.datum_params[2]&&this.datum_params[3]===a.datum_params[3]&&this.datum_params[4]===a.datum_params[4]&&this.datum_params[5]===a.datum_params[5]&&this.datum_params[6]===a.datum_params[6]:this.datum_type===g||a.datum_type===g?this.nadgrids===a.nadgrids:!0},geodetic_to_geocentric:function(a){var b,c,e,f,g,h,i,j=a.x,k=a.y,l=a.z?a.z:0,m=0;if(-d>k&&k>-1.001*d)k=-d;else if(k>d&&1.001*d>k)k=d;else if(-d>k||k>d)return null;return j>Math.PI&&(j-=2*Math.PI),g=Math.sin(k),i=Math.cos(k),h=g*g,f=this.a/Math.sqrt(1-this.es*h),b=(f+l)*i*Math.cos(j),c=(f+l)*i*Math.sin(j),e=(f*(1-this.es)+l)*g,a.x=b,a.y=c,a.z=e,m},geocentric_to_geodetic:function(a){var b,c,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t=1e-12,u=t*t,v=30,w=a.x,x=a.y,y=a.z?a.z:0;if(o=!1,b=Math.sqrt(w*w+x*x),c=Math.sqrt(w*w+x*x+y*y),b/this.a<t){if(o=!0,q=0,c/this.a<t)return r=d,void(s=-this.b)}else q=Math.atan2(x,w);e=y/c,f=b/c,g=1/Math.sqrt(1-this.es*(2-this.es)*f*f),j=f*(1-this.es)*g,k=e*g,p=0;do p++,i=this.a/Math.sqrt(1-this.es*k*k),s=b*j+y*k-i*(1-this.es*k*k),h=this.es*i/(i+s),g=1/Math.sqrt(1-h*(2-h)*f*f),l=f*(1-h)*g,m=e*g,n=m*j-l*k,j=l,k=m;while(n*n>u&&v>p);return r=Math.atan(m/Math.abs(l)),a.x=q,a.y=r,a.z=s,a},geocentric_to_geodetic_noniter:function(a){var b,c,e,f,g,h,i,j,m,n,o,p,q,r,s,t,u,v=a.x,w=a.y,x=a.z?a.z:0;if(v=parseFloat(v),w=parseFloat(w),x=parseFloat(x),u=!1,0!==v)b=Math.atan2(w,v);else if(w>0)b=d;else if(0>w)b=-d;else if(u=!0,b=0,x>0)c=d;else{if(!(0>x))return c=d,void(e=-this.b);c=-d}return g=v*v+w*w,f=Math.sqrt(g),h=x*k,j=Math.sqrt(h*h+g),n=h/j,p=f/j,o=n*n*n,i=x+this.b*this.ep2*o,t=f-this.a*this.es*p*p*p,m=Math.sqrt(i*i+t*t),q=i/m,r=t/m,s=this.a/Math.sqrt(1-this.es*q*q),e=r>=l?f/r-s:-l>=r?f/-r-s:x/q+s*(this.es-1),u===!1&&(c=Math.atan(q/r)),a.x=b,a.y=c,a.z=e,a},geocentric_to_wgs84:function(a){if(this.datum_type===e)a.x+=this.datum_params[0],a.y+=this.datum_params[1],a.z+=this.datum_params[2];else if(this.datum_type===f){var b=this.datum_params[0],c=this.datum_params[1],d=this.datum_params[2],g=this.datum_params[3],h=this.datum_params[4],i=this.datum_params[5],j=this.datum_params[6],k=j*(a.x-i*a.y+h*a.z)+b,l=j*(i*a.x+a.y-g*a.z)+c,m=j*(-h*a.x+g*a.y+a.z)+d;a.x=k,a.y=l,a.z=m}},geocentric_from_wgs84:function(a){if(this.datum_type===e)a.x-=this.datum_params[0],a.y-=this.datum_params[1],a.z-=this.datum_params[2];else if(this.datum_type===f){var b=this.datum_params[0],c=this.datum_params[1],d=this.datum_params[2],g=this.datum_params[3],h=this.datum_params[4],i=this.datum_params[5],j=this.datum_params[6],k=(a.x-b)/j,l=(a.y-c)/j,m=(a.z-d)/j;a.x=k+i*l-h*m,a.y=-i*k+l+g*m,a.z=h*k-g*l+m}}},b.exports=m},{}],31:[function(a,b,c){var d=1,e=2,f=3,g=5,h=6378137,i=.006694379990141316;b.exports=function(a,b,c){function j(a){return a===d||a===e}var k,l,m;if(a.compare_datums(b))return c;if(a.datum_type===g||b.datum_type===g)return c;var n=a.a,o=a.es,p=b.a,q=b.es,r=a.datum_type;if(r===f)if(0===this.apply_gridshift(a,0,c))a.a=h,a.es=i;else{if(!a.datum_params)return a.a=n,a.es=a.es,c;for(k=1,l=0,m=a.datum_params.length;m>l;l++)k*=a.datum_params[l];if(0===k)return a.a=n,a.es=a.es,c;r=a.datum_params.length>3?e:d}return b.datum_type===f&&(b.a=h,b.es=i),(a.es!==b.es||a.a!==b.a||j(r)||j(b.datum_type))&&(a.geodetic_to_geocentric(c),j(a.datum_type)&&a.geocentric_to_wgs84(c),j(b.datum_type)&&b.geocentric_from_wgs84(c),b.geocentric_to_geodetic(c)),b.datum_type===f&&this.apply_gridshift(b,1,c),a.a=n,a.es=o,b.a=p,b.es=q,c}},{}],32:[function(a,b,c){function d(a){var b=this;if(2===arguments.length){var c=arguments[1];"string"==typeof c?"+"===c.charAt(0)?d[a]=f(arguments[1]):d[a]=g(arguments[1]):d[a]=c}else if(1===arguments.length){if(Array.isArray(a))return a.map(function(a){Array.isArray(a)?d.apply(b,a):d(a)});if("string"==typeof a){if(a in d)return d[a]}else"EPSG"in a?d["EPSG:"+a.EPSG]=a:"ESRI"in a?d["ESRI:"+a.ESRI]=a:"IAU2000"in a?d["IAU2000:"+a.IAU2000]=a:console.log(a);return}}var e=a("./global"),f=a("./projString"),g=a("./wkt");e(d),b.exports=d},{"./global":35,"./projString":38,"./wkt":67}],33:[function(a,b,c){var d=a("./constants/Datum"),e=a("./constants/Ellipsoid"),f=a("./extend"),g=a("./datum"),h=1e-10,i=.16666666666666666,j=.04722222222222222,k=.022156084656084655;b.exports=function(a){if(a.datumCode&&"none"!==a.datumCode){var b=d[a.datumCode];b&&(a.datum_params=b.towgs84?b.towgs84.split(","):null,a.ellps=b.ellipse,a.datumName=b.datumName?b.datumName:a.datumCode)}if(!a.a){var c=e[a.ellps]?e[a.ellps]:e.WGS84;f(a,c)}return a.rf&&!a.b&&(a.b=(1-1/a.rf)*a.a),(0===a.rf||Math.abs(a.a-a.b)<h)&&(a.sphere=!0,a.b=a.a),a.a2=a.a*a.a,a.b2=a.b*a.b,a.es=(a.a2-a.b2)/a.a2,a.e=Math.sqrt(a.es),a.R_A&&(a.a*=1-a.es*(i+a.es*(j+a.es*k)),a.a2=a.a*a.a,a.b2=a.b*a.b,a.es=0),a.ep2=(a.a2-a.b2)/a.b2,a.k0||(a.k0=1),a.axis||(a.axis="enu"),a.datum||(a.datum=g(a)),a}},{"./constants/Datum":25,"./constants/Ellipsoid":26,"./datum":30,"./extend":34}],34:[function(a,b,c){b.exports=function(a,b){a=a||{};var c,d;if(!b)return a;for(d in b)c=b[d],void 0!==c&&(a[d]=c);return a}},{}],35:[function(a,b,c){b.exports=function(a){a("EPSG:4326","+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees"),a("EPSG:4269","+title=NAD83 (long/lat) +proj=longlat +a=6378137.0 +b=6356752.31414036 +ellps=GRS80 +datum=NAD83 +units=degrees"),a("EPSG:3857","+title=WGS 84 / Pseudo-Mercator +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs"),a.WGS84=a["EPSG:4326"],a["EPSG:3785"]=a["EPSG:3857"],a.GOOGLE=a["EPSG:3857"],a["EPSG:900913"]=a["EPSG:3857"],a["EPSG:102113"]=a["EPSG:3857"]}},{}],36:[function(a,b,c){var proj4=a("./core");proj4.defaultDatum="WGS84",proj4.Proj=a("./Proj"),proj4.WGS84=new proj4.Proj("WGS84"),proj4.Point=a("./Point"),proj4.toPoint=a("./common/toPoint"),proj4.defs=a("./defs"),proj4.transform=a("./transform"),proj4.mgrs=a("mgrs"),proj4.version=a("../package.json").version,a("./includedProjections")(proj4),b.exports=proj4},{"../package.json":69,"./Point":1,"./Proj":2,"./common/toPoint":23,"./core":29,"./defs":32,"./includedProjections":"./includedProjections","./transform":66,mgrs:68}],37:[function(a,b,c){function d(a){return"string"==typeof a}function e(a){return a in i}function f(a){var b=["GEOGCS","GEOCCS","PROJCS","LOCAL_CS"];return b.reduce(function(b,c){return b+1+a.indexOf(c)},0)}function g(a){return"+"===a[0]}function h(a){return d(a)?e(a)?i[a]:f(a)?j(a):g(a)?k(a):void 0:a}var i=a("./defs"),j=a("./wkt"),k=a("./projString");b.exports=h},{"./defs":32,"./projString":38,"./wkt":67}],38:[function(a,b,c){var d=.017453292519943295,e=a("./constants/PrimeMeridian"),f=a("./constants/units");b.exports=function(a){var b={},c={};a.split("+").map(function(a){return a.trim()}).filter(function(a){return a}).forEach(function(a){var b=a.split("=");b.push(!0),c[b[0].toLowerCase()]=b[1]});var g,h,i,j={proj:"projName",datum:"datumCode",rf:function(a){b.rf=parseFloat(a)},lat_0:function(a){b.lat0=a*d},lat_1:function(a){b.lat1=a*d},lat_2:function(a){b.lat2=a*d},lat_ts:function(a){b.lat_ts=a*d},lon_0:function(a){b.long0=a*d},lon_1:function(a){b.long1=a*d},lon_2:function(a){b.long2=a*d},alpha:function(a){b.alpha=parseFloat(a)*d},lonc:function(a){b.longc=a*d},x_0:function(a){b.x0=parseFloat(a)},y_0:function(a){b.y0=parseFloat(a)},k_0:function(a){b.k0=parseFloat(a)},k:function(a){b.k0=parseFloat(a)},a:function(a){b.a=parseFloat(a)},b:function(a){b.b=parseFloat(a)},r_a:function(){b.R_A=!0},zone:function(a){b.zone=parseInt(a,10)},south:function(){b.utmSouth=!0},towgs84:function(a){b.datum_params=a.split(",").map(function(a){return parseFloat(a)})},to_meter:function(a){b.to_meter=parseFloat(a)},units:function(a){b.units=a,f[a]&&(b.to_meter=f[a].to_meter)},from_greenwich:function(a){b.from_greenwich=a*d},pm:function(a){b.from_greenwich=(e[a]?e[a]:parseFloat(a))*d},nadgrids:function(a){"@null"===a?b.datumCode="none":b.nadgrids=a},axis:function(a){var c="ewnsud";3===a.length&&-1!==c.indexOf(a.substr(0,1))&&-1!==c.indexOf(a.substr(1,1))&&-1!==c.indexOf(a.substr(2,1))&&(b.axis=a)}};for(g in c)h=c[g],g in j?(i=j[g],"function"==typeof i?i(h):b[i]=h):b[g]=h;return"string"==typeof b.datumCode&&"WGS84"!==b.datumCode&&(b.datumCode=b.datumCode.toLowerCase()),b}},{"./constants/PrimeMeridian":27,"./constants/units":28}],39:[function(a,b,c){function d(a,b){var c=g.length;return a.names?(g[c]=a,a.names.forEach(function(a){f[a.toLowerCase()]=c}),this):(console.log(b),!0)}var e=[a("./projections/merc"),a("./projections/longlat")],f={},g=[];c.add=d,c.get=function(a){if(!a)return!1;var b=a.toLowerCase();return"undefined"!=typeof f[b]&&g[f[b]]?g[f[b]]:void 0},c.start=function(){e.forEach(d)}},{"./projections/longlat":51,"./projections/merc":52}],40:[function(a,b,c){var d=1e-10,e=a("../common/msfnz"),f=a("../common/qsfnz"),g=a("../common/adjust_lon"),h=a("../common/asinz");c.init=function(){Math.abs(this.lat1+this.lat2)<d||(this.temp=this.b/this.a,this.es=1-Math.pow(this.temp,2),this.e3=Math.sqrt(this.es),this.sin_po=Math.sin(this.lat1),this.cos_po=Math.cos(this.lat1),this.t1=this.sin_po,this.con=this.sin_po,this.ms1=e(this.e3,this.sin_po,this.cos_po),this.qs1=f(this.e3,this.sin_po,this.cos_po),this.sin_po=Math.sin(this.lat2),this.cos_po=Math.cos(this.lat2),this.t2=this.sin_po,this.ms2=e(this.e3,this.sin_po,this.cos_po),this.qs2=f(this.e3,this.sin_po,this.cos_po),this.sin_po=Math.sin(this.lat0),this.cos_po=Math.cos(this.lat0),this.t3=this.sin_po,this.qs0=f(this.e3,this.sin_po,this.cos_po),Math.abs(this.lat1-this.lat2)>d?this.ns0=(this.ms1*this.ms1-this.ms2*this.ms2)/(this.qs2-this.qs1):this.ns0=this.con,this.c=this.ms1*this.ms1+this.ns0*this.qs1,this.rh=this.a*Math.sqrt(this.c-this.ns0*this.qs0)/this.ns0)},c.forward=function(a){var b=a.x,c=a.y;this.sin_phi=Math.sin(c),this.cos_phi=Math.cos(c);var d=f(this.e3,this.sin_phi,this.cos_phi),e=this.a*Math.sqrt(this.c-this.ns0*d)/this.ns0,h=this.ns0*g(b-this.long0),i=e*Math.sin(h)+this.x0,j=this.rh-e*Math.cos(h)+this.y0;return a.x=i,a.y=j,a},c.inverse=function(a){var b,c,d,e,f,h;return a.x-=this.x0,a.y=this.rh-a.y+this.y0,this.ns0>=0?(b=Math.sqrt(a.x*a.x+a.y*a.y),d=1):(b=-Math.sqrt(a.x*a.x+a.y*a.y),d=-1),e=0,0!==b&&(e=Math.atan2(d*a.x,d*a.y)),d=b*this.ns0/this.a,this.sphere?h=Math.asin((this.c-d*d)/(2*this.ns0)):(c=(this.c-d*d)/this.ns0,h=this.phi1z(this.e3,c)),f=g(e/this.ns0+this.long0),a.x=f,a.y=h,a},c.phi1z=function(a,b){var c,e,f,g,i,j=h(.5*b);if(d>a)return j;for(var k=a*a,l=1;25>=l;l++)if(c=Math.sin(j),e=Math.cos(j),f=a*c,g=1-f*f,i=.5*g*g/e*(b/(1-k)-c/g+.5/a*Math.log((1-f)/(1+f))),j+=i,Math.abs(i)<=1e-7)return j;return null},c.names=["Albers_Conic_Equal_Area","Albers","aea"]},{"../common/adjust_lon":5,"../common/asinz":6,"../common/msfnz":15,"../common/qsfnz":20}],41:[function(a,b,c){var d=a("../common/adjust_lon"),e=Math.PI/2,f=1e-10,g=a("../common/mlfn"),h=a("../common/e0fn"),i=a("../common/e1fn"),j=a("../common/e2fn"),k=a("../common/e3fn"),l=a("../common/gN"),m=a("../common/asinz"),n=a("../common/imlfn");c.init=function(){this.sin_p12=Math.sin(this.lat0),this.cos_p12=Math.cos(this.lat0)},c.forward=function(a){var b,c,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G,H=a.x,I=a.y,J=Math.sin(a.y),K=Math.cos(a.y),L=d(H-this.long0);return this.sphere?Math.abs(this.sin_p12-1)<=f?(a.x=this.x0+this.a*(e-I)*Math.sin(L),a.y=this.y0-this.a*(e-I)*Math.cos(L),a):Math.abs(this.sin_p12+1)<=f?(a.x=this.x0+this.a*(e+I)*Math.sin(L),a.y=this.y0+this.a*(e+I)*Math.cos(L),a):(B=this.sin_p12*J+this.cos_p12*K*Math.cos(L),z=Math.acos(B),A=z/Math.sin(z),a.x=this.x0+this.a*A*K*Math.sin(L),a.y=this.y0+this.a*A*(this.cos_p12*J-this.sin_p12*K*Math.cos(L)),a):(b=h(this.es),c=i(this.es),m=j(this.es),n=k(this.es),Math.abs(this.sin_p12-1)<=f?(o=this.a*g(b,c,m,n,e),p=this.a*g(b,c,m,n,I),a.x=this.x0+(o-p)*Math.sin(L),a.y=this.y0-(o-p)*Math.cos(L),a):Math.abs(this.sin_p12+1)<=f?(o=this.a*g(b,c,m,n,e),p=this.a*g(b,c,m,n,I),a.x=this.x0+(o+p)*Math.sin(L),a.y=this.y0+(o+p)*Math.cos(L),a):(q=J/K,r=l(this.a,this.e,this.sin_p12),s=l(this.a,this.e,J),t=Math.atan((1-this.es)*q+this.es*r*this.sin_p12/(s*K)),u=Math.atan2(Math.sin(L),this.cos_p12*Math.tan(t)-this.sin_p12*Math.cos(L)),C=0===u?Math.asin(this.cos_p12*Math.sin(t)-this.sin_p12*Math.cos(t)):Math.abs(Math.abs(u)-Math.PI)<=f?-Math.asin(this.cos_p12*Math.sin(t)-this.sin_p12*Math.cos(t)):Math.asin(Math.sin(L)*Math.cos(t)/Math.sin(u)),v=this.e*this.sin_p12/Math.sqrt(1-this.es),w=this.e*this.cos_p12*Math.cos(u)/Math.sqrt(1-this.es),x=v*w,y=w*w,D=C*C,E=D*C,F=E*C,G=F*C,z=r*C*(1-D*y*(1-y)/6+E/8*x*(1-2*y)+F/120*(y*(4-7*y)-3*v*v*(1-7*y))-G/48*x),a.x=this.x0+z*Math.sin(u),a.y=this.y0+z*Math.cos(u),a))},c.inverse=function(a){a.x-=this.x0,a.y-=this.y0;var b,c,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G,H,I;if(this.sphere){if(b=Math.sqrt(a.x*a.x+a.y*a.y),b>2*e*this.a)return;return c=b/this.a,o=Math.sin(c),p=Math.cos(c),q=this.long0,Math.abs(b)<=f?r=this.lat0:(r=m(p*this.sin_p12+a.y*o*this.cos_p12/b),s=Math.abs(this.lat0)-e,q=d(Math.abs(s)<=f?this.lat0>=0?this.long0+Math.atan2(a.x,-a.y):this.long0-Math.atan2(-a.x,a.y):this.long0+Math.atan2(a.x*o,b*this.cos_p12*p-a.y*this.sin_p12*o))),a.x=q,a.y=r,a}return t=h(this.es),u=i(this.es),v=j(this.es),w=k(this.es),Math.abs(this.sin_p12-1)<=f?(x=this.a*g(t,u,v,w,e),b=Math.sqrt(a.x*a.x+a.y*a.y),y=x-b,r=n(y/this.a,t,u,v,w),q=d(this.long0+Math.atan2(a.x,-1*a.y)),a.x=q,a.y=r,a):Math.abs(this.sin_p12+1)<=f?(x=this.a*g(t,u,v,w,e),b=Math.sqrt(a.x*a.x+a.y*a.y),y=b-x,r=n(y/this.a,t,u,v,w),q=d(this.long0+Math.atan2(a.x,a.y)),a.x=q,a.y=r,a):(b=Math.sqrt(a.x*a.x+a.y*a.y),B=Math.atan2(a.x,a.y),z=l(this.a,this.e,this.sin_p12),C=Math.cos(B),D=this.e*this.cos_p12*C,E=-D*D/(1-this.es),F=3*this.es*(1-E)*this.sin_p12*this.cos_p12*C/(1-this.es),G=b/z,H=G-E*(1+E)*Math.pow(G,3)/6-F*(1+3*E)*Math.pow(G,4)/24,I=1-E*H*H/2-G*H*H*H/6,A=Math.asin(this.sin_p12*Math.cos(H)+this.cos_p12*Math.sin(H)*C),q=d(this.long0+Math.asin(Math.sin(B)*Math.sin(H)/Math.cos(A))),r=Math.atan((1-this.es*I*this.sin_p12/Math.sin(A))*Math.tan(A)/(1-this.es)),a.x=q,a.y=r,a)},c.names=["Azimuthal_Equidistant","aeqd"]},{"../common/adjust_lon":5,"../common/asinz":6,"../common/e0fn":7,"../common/e1fn":8,"../common/e2fn":9,"../common/e3fn":10,"../common/gN":11,"../common/imlfn":12,"../common/mlfn":14}],42:[function(a,b,c){var d=a("../common/mlfn"),e=a("../common/e0fn"),f=a("../common/e1fn"),g=a("../common/e2fn"),h=a("../common/e3fn"),i=a("../common/gN"),j=a("../common/adjust_lon"),k=a("../common/adjust_lat"),l=a("../common/imlfn"),m=Math.PI/2,n=1e-10;c.init=function(){this.sphere||(this.e0=e(this.es),this.e1=f(this.es),this.e2=g(this.es),this.e3=h(this.es),this.ml0=this.a*d(this.e0,this.e1,this.e2,this.e3,this.lat0))},c.forward=function(a){var b,c,e=a.x,f=a.y;if(e=j(e-this.long0),this.sphere)b=this.a*Math.asin(Math.cos(f)*Math.sin(e)),c=this.a*(Math.atan2(Math.tan(f),Math.cos(e))-this.lat0);else{var g=Math.sin(f),h=Math.cos(f),k=i(this.a,this.e,g),l=Math.tan(f)*Math.tan(f),m=e*Math.cos(f),n=m*m,o=this.es*h*h/(1-this.es),p=this.a*d(this.e0,this.e1,this.e2,this.e3,f);b=k*m*(1-n*l*(1/6-(8-l+8*o)*n/120)),c=p-this.ml0+k*g/h*n*(.5+(5-l+6*o)*n/24)}return a.x=b+this.x0,a.y=c+this.y0,a},c.inverse=function(a){a.x-=this.x0,a.y-=this.y0;var b,c,d=a.x/this.a,e=a.y/this.a;if(this.sphere){var f=e+this.lat0;b=Math.asin(Math.sin(f)*Math.cos(d)),c=Math.atan2(Math.tan(d),Math.cos(f))}else{var g=this.ml0/this.a+e,h=l(g,this.e0,this.e1,this.e2,this.e3);if(Math.abs(Math.abs(h)-m)<=n)return a.x=this.long0,a.y=m,0>e&&(a.y*=-1),a;var o=i(this.a,this.e,Math.sin(h)),p=o*o*o/this.a/this.a*(1-this.es),q=Math.pow(Math.tan(h),2),r=d*this.a/o,s=r*r;b=h-o*Math.tan(h)/p*r*r*(.5-(1+3*q)*r*r/24),c=r*(1-s*(q/3+(1+3*q)*q*s/15))/Math.cos(h)}return a.x=j(c+this.long0),a.y=k(b),a},c.names=["Cassini","Cassini_Soldner","cass"]},{"../common/adjust_lat":4,"../common/adjust_lon":5,"../common/e0fn":7,"../common/e1fn":8,"../common/e2fn":9,"../common/e3fn":10,"../common/gN":11,"../common/imlfn":12,"../common/mlfn":14}],43:[function(a,b,c){var d=a("../common/adjust_lon"),e=a("../common/qsfnz"),f=a("../common/msfnz"),g=a("../common/iqsfnz");c.init=function(){this.sphere||(this.k0=f(this.e,Math.sin(this.lat_ts),Math.cos(this.lat_ts)))},c.forward=function(a){var b,c,f=a.x,g=a.y,h=d(f-this.long0);if(this.sphere)b=this.x0+this.a*h*Math.cos(this.lat_ts),c=this.y0+this.a*Math.sin(g)/Math.cos(this.lat_ts);else{var i=e(this.e,Math.sin(g));b=this.x0+this.a*this.k0*h,c=this.y0+this.a*i*.5/this.k0}return a.x=b,a.y=c,a},c.inverse=function(a){a.x-=this.x0,a.y-=this.y0;var b,c;return this.sphere?(b=d(this.long0+a.x/this.a/Math.cos(this.lat_ts)),c=Math.asin(a.y/this.a*Math.cos(this.lat_ts))):(c=g(this.e,2*a.y*this.k0/this.a),b=d(this.long0+a.x/(this.a*this.k0))),a.x=b,a.y=c,a},c.names=["cea"]},{"../common/adjust_lon":5,"../common/iqsfnz":13,"../common/msfnz":15,"../common/qsfnz":20}],44:[function(a,b,c){var d=a("../common/adjust_lon"),e=a("../common/adjust_lat");c.init=function(){this.x0=this.x0||0,this.y0=this.y0||0,this.lat0=this.lat0||0,this.long0=this.long0||0,this.lat_ts=this.lat_ts||0,this.title=this.title||"Equidistant Cylindrical (Plate Carre)",this.rc=Math.cos(this.lat_ts)},c.forward=function(a){var b=a.x,c=a.y,f=d(b-this.long0),g=e(c-this.lat0);return a.x=this.x0+this.a*f*this.rc,a.y=this.y0+this.a*g,a},c.inverse=function(a){var b=a.x,c=a.y;return a.x=d(this.long0+(b-this.x0)/(this.a*this.rc)),a.y=e(this.lat0+(c-this.y0)/this.a),a},c.names=["Equirectangular","Equidistant_Cylindrical","eqc"]},{"../common/adjust_lat":4,"../common/adjust_lon":5}],45:[function(a,b,c){var d=a("../common/e0fn"),e=a("../common/e1fn"),f=a("../common/e2fn"),g=a("../common/e3fn"),h=a("../common/msfnz"),i=a("../common/mlfn"),j=a("../common/adjust_lon"),k=a("../common/adjust_lat"),l=a("../common/imlfn"),m=1e-10;c.init=function(){Math.abs(this.lat1+this.lat2)<m||(this.lat2=this.lat2||this.lat1,this.temp=this.b/this.a,this.es=1-Math.pow(this.temp,2),this.e=Math.sqrt(this.es),this.e0=d(this.es),this.e1=e(this.es),this.e2=f(this.es),this.e3=g(this.es),this.sinphi=Math.sin(this.lat1),this.cosphi=Math.cos(this.lat1),this.ms1=h(this.e,this.sinphi,this.cosphi),this.ml1=i(this.e0,this.e1,this.e2,this.e3,this.lat1),Math.abs(this.lat1-this.lat2)<m?this.ns=this.sinphi:(this.sinphi=Math.sin(this.lat2),this.cosphi=Math.cos(this.lat2),this.ms2=h(this.e,this.sinphi,this.cosphi),this.ml2=i(this.e0,this.e1,this.e2,this.e3,this.lat2),this.ns=(this.ms1-this.ms2)/(this.ml2-this.ml1)),this.g=this.ml1+this.ms1/this.ns,this.ml0=i(this.e0,this.e1,this.e2,this.e3,this.lat0),this.rh=this.a*(this.g-this.ml0))},c.forward=function(a){var b,c=a.x,d=a.y;if(this.sphere)b=this.a*(this.g-d);else{var e=i(this.e0,this.e1,this.e2,this.e3,d);b=this.a*(this.g-e)}var f=this.ns*j(c-this.long0),g=this.x0+b*Math.sin(f),h=this.y0+this.rh-b*Math.cos(f);return a.x=g,a.y=h,a},c.inverse=function(a){a.x-=this.x0,a.y=this.rh-a.y+this.y0;var b,c,d,e;this.ns>=0?(c=Math.sqrt(a.x*a.x+a.y*a.y),
	b=1):(c=-Math.sqrt(a.x*a.x+a.y*a.y),b=-1);var f=0;if(0!==c&&(f=Math.atan2(b*a.x,b*a.y)),this.sphere)return e=j(this.long0+f/this.ns),d=k(this.g-c/this.a),a.x=e,a.y=d,a;var g=this.g-c/this.a;return d=l(g,this.e0,this.e1,this.e2,this.e3),e=j(this.long0+f/this.ns),a.x=e,a.y=d,a},c.names=["Equidistant_Conic","eqdc"]},{"../common/adjust_lat":4,"../common/adjust_lon":5,"../common/e0fn":7,"../common/e1fn":8,"../common/e2fn":9,"../common/e3fn":10,"../common/imlfn":12,"../common/mlfn":14,"../common/msfnz":15}],46:[function(a,b,c){var d=Math.PI/4,e=a("../common/srat"),f=Math.PI/2,g=20;c.init=function(){var a=Math.sin(this.lat0),b=Math.cos(this.lat0);b*=b,this.rc=Math.sqrt(1-this.es)/(1-this.es*a*a),this.C=Math.sqrt(1+this.es*b*b/(1-this.es)),this.phic0=Math.asin(a/this.C),this.ratexp=.5*this.C*this.e,this.K=Math.tan(.5*this.phic0+d)/(Math.pow(Math.tan(.5*this.lat0+d),this.C)*e(this.e*a,this.ratexp))},c.forward=function(a){var b=a.x,c=a.y;return a.y=2*Math.atan(this.K*Math.pow(Math.tan(.5*c+d),this.C)*e(this.e*Math.sin(c),this.ratexp))-f,a.x=this.C*b,a},c.inverse=function(a){for(var b=1e-14,c=a.x/this.C,h=a.y,i=Math.pow(Math.tan(.5*h+d)/this.K,1/this.C),j=g;j>0&&(h=2*Math.atan(i*e(this.e*Math.sin(a.y),-.5*this.e))-f,!(Math.abs(h-a.y)<b));--j)a.y=h;return j?(a.x=c,a.y=h,a):null},c.names=["gauss"]},{"../common/srat":22}],47:[function(a,b,c){var d=a("../common/adjust_lon"),e=1e-10,f=a("../common/asinz");c.init=function(){this.sin_p14=Math.sin(this.lat0),this.cos_p14=Math.cos(this.lat0),this.infinity_dist=1e3*this.a,this.rc=1},c.forward=function(a){var b,c,f,g,h,i,j,k,l=a.x,m=a.y;return f=d(l-this.long0),b=Math.sin(m),c=Math.cos(m),g=Math.cos(f),i=this.sin_p14*b+this.cos_p14*c*g,h=1,i>0||Math.abs(i)<=e?(j=this.x0+this.a*h*c*Math.sin(f)/i,k=this.y0+this.a*h*(this.cos_p14*b-this.sin_p14*c*g)/i):(j=this.x0+this.infinity_dist*c*Math.sin(f),k=this.y0+this.infinity_dist*(this.cos_p14*b-this.sin_p14*c*g)),a.x=j,a.y=k,a},c.inverse=function(a){var b,c,e,g,h,i;return a.x=(a.x-this.x0)/this.a,a.y=(a.y-this.y0)/this.a,a.x/=this.k0,a.y/=this.k0,(b=Math.sqrt(a.x*a.x+a.y*a.y))?(g=Math.atan2(b,this.rc),c=Math.sin(g),e=Math.cos(g),i=f(e*this.sin_p14+a.y*c*this.cos_p14/b),h=Math.atan2(a.x*c,b*this.cos_p14*e-a.y*this.sin_p14*c),h=d(this.long0+h)):(i=this.phic0,h=0),a.x=h,a.y=i,a},c.names=["gnom"]},{"../common/adjust_lon":5,"../common/asinz":6}],48:[function(a,b,c){var d=a("../common/adjust_lon");c.init=function(){this.a=6377397.155,this.es=.006674372230614,this.e=Math.sqrt(this.es),this.lat0||(this.lat0=.863937979737193),this.long0||(this.long0=.4334234309119251),this.k0||(this.k0=.9999),this.s45=.785398163397448,this.s90=2*this.s45,this.fi0=this.lat0,this.e2=this.es,this.e=Math.sqrt(this.e2),this.alfa=Math.sqrt(1+this.e2*Math.pow(Math.cos(this.fi0),4)/(1-this.e2)),this.uq=1.04216856380474,this.u0=Math.asin(Math.sin(this.fi0)/this.alfa),this.g=Math.pow((1+this.e*Math.sin(this.fi0))/(1-this.e*Math.sin(this.fi0)),this.alfa*this.e/2),this.k=Math.tan(this.u0/2+this.s45)/Math.pow(Math.tan(this.fi0/2+this.s45),this.alfa)*this.g,this.k1=this.k0,this.n0=this.a*Math.sqrt(1-this.e2)/(1-this.e2*Math.pow(Math.sin(this.fi0),2)),this.s0=1.37008346281555,this.n=Math.sin(this.s0),this.ro0=this.k1*this.n0/Math.tan(this.s0),this.ad=this.s90-this.uq},c.forward=function(a){var b,c,e,f,g,h,i,j=a.x,k=a.y,l=d(j-this.long0);return b=Math.pow((1+this.e*Math.sin(k))/(1-this.e*Math.sin(k)),this.alfa*this.e/2),c=2*(Math.atan(this.k*Math.pow(Math.tan(k/2+this.s45),this.alfa)/b)-this.s45),e=-l*this.alfa,f=Math.asin(Math.cos(this.ad)*Math.sin(c)+Math.sin(this.ad)*Math.cos(c)*Math.cos(e)),g=Math.asin(Math.cos(c)*Math.sin(e)/Math.cos(f)),h=this.n*g,i=this.ro0*Math.pow(Math.tan(this.s0/2+this.s45),this.n)/Math.pow(Math.tan(f/2+this.s45),this.n),a.y=i*Math.cos(h)/1,a.x=i*Math.sin(h)/1,this.czech||(a.y*=-1,a.x*=-1),a},c.inverse=function(a){var b,c,d,e,f,g,h,i,j=a.x;a.x=a.y,a.y=j,this.czech||(a.y*=-1,a.x*=-1),g=Math.sqrt(a.x*a.x+a.y*a.y),f=Math.atan2(a.y,a.x),e=f/Math.sin(this.s0),d=2*(Math.atan(Math.pow(this.ro0/g,1/this.n)*Math.tan(this.s0/2+this.s45))-this.s45),b=Math.asin(Math.cos(this.ad)*Math.sin(d)-Math.sin(this.ad)*Math.cos(d)*Math.cos(e)),c=Math.asin(Math.cos(d)*Math.sin(e)/Math.cos(b)),a.x=this.long0-c/this.alfa,h=b,i=0;var k=0;do a.y=2*(Math.atan(Math.pow(this.k,-1/this.alfa)*Math.pow(Math.tan(b/2+this.s45),1/this.alfa)*Math.pow((1+this.e*Math.sin(h))/(1-this.e*Math.sin(h)),this.e/2))-this.s45),Math.abs(h-a.y)<1e-10&&(i=1),h=a.y,k+=1;while(0===i&&15>k);return k>=15?null:a},c.names=["Krovak","krovak"]},{"../common/adjust_lon":5}],49:[function(a,b,c){var d=Math.PI/2,e=Math.PI/4,f=1e-10,g=a("../common/qsfnz"),h=a("../common/adjust_lon");c.S_POLE=1,c.N_POLE=2,c.EQUIT=3,c.OBLIQ=4,c.init=function(){var a=Math.abs(this.lat0);if(Math.abs(a-d)<f?this.mode=this.lat0<0?this.S_POLE:this.N_POLE:Math.abs(a)<f?this.mode=this.EQUIT:this.mode=this.OBLIQ,this.es>0){var b;switch(this.qp=g(this.e,1),this.mmf=.5/(1-this.es),this.apa=this.authset(this.es),this.mode){case this.N_POLE:this.dd=1;break;case this.S_POLE:this.dd=1;break;case this.EQUIT:this.rq=Math.sqrt(.5*this.qp),this.dd=1/this.rq,this.xmf=1,this.ymf=.5*this.qp;break;case this.OBLIQ:this.rq=Math.sqrt(.5*this.qp),b=Math.sin(this.lat0),this.sinb1=g(this.e,b)/this.qp,this.cosb1=Math.sqrt(1-this.sinb1*this.sinb1),this.dd=Math.cos(this.lat0)/(Math.sqrt(1-this.es*b*b)*this.rq*this.cosb1),this.ymf=(this.xmf=this.rq)/this.dd,this.xmf*=this.dd}}else this.mode===this.OBLIQ&&(this.sinph0=Math.sin(this.lat0),this.cosph0=Math.cos(this.lat0))},c.forward=function(a){var b,c,i,j,k,l,m,n,o,p,q=a.x,r=a.y;if(q=h(q-this.long0),this.sphere){if(k=Math.sin(r),p=Math.cos(r),i=Math.cos(q),this.mode===this.OBLIQ||this.mode===this.EQUIT){if(c=this.mode===this.EQUIT?1+p*i:1+this.sinph0*k+this.cosph0*p*i,f>=c)return null;c=Math.sqrt(2/c),b=c*p*Math.sin(q),c*=this.mode===this.EQUIT?k:this.cosph0*k-this.sinph0*p*i}else if(this.mode===this.N_POLE||this.mode===this.S_POLE){if(this.mode===this.N_POLE&&(i=-i),Math.abs(r+this.phi0)<f)return null;c=e-.5*r,c=2*(this.mode===this.S_POLE?Math.cos(c):Math.sin(c)),b=c*Math.sin(q),c*=i}}else{switch(m=0,n=0,o=0,i=Math.cos(q),j=Math.sin(q),k=Math.sin(r),l=g(this.e,k),this.mode!==this.OBLIQ&&this.mode!==this.EQUIT||(m=l/this.qp,n=Math.sqrt(1-m*m)),this.mode){case this.OBLIQ:o=1+this.sinb1*m+this.cosb1*n*i;break;case this.EQUIT:o=1+n*i;break;case this.N_POLE:o=d+r,l=this.qp-l;break;case this.S_POLE:o=r-d,l=this.qp+l}if(Math.abs(o)<f)return null;switch(this.mode){case this.OBLIQ:case this.EQUIT:o=Math.sqrt(2/o),c=this.mode===this.OBLIQ?this.ymf*o*(this.cosb1*m-this.sinb1*n*i):(o=Math.sqrt(2/(1+n*i)))*m*this.ymf,b=this.xmf*o*n*j;break;case this.N_POLE:case this.S_POLE:l>=0?(b=(o=Math.sqrt(l))*j,c=i*(this.mode===this.S_POLE?o:-o)):b=c=0}}return a.x=this.a*b+this.x0,a.y=this.a*c+this.y0,a},c.inverse=function(a){a.x-=this.x0,a.y-=this.y0;var b,c,e,g,i,j,k,l=a.x/this.a,m=a.y/this.a;if(this.sphere){var n,o=0,p=0;if(n=Math.sqrt(l*l+m*m),c=.5*n,c>1)return null;switch(c=2*Math.asin(c),this.mode!==this.OBLIQ&&this.mode!==this.EQUIT||(p=Math.sin(c),o=Math.cos(c)),this.mode){case this.EQUIT:c=Math.abs(n)<=f?0:Math.asin(m*p/n),l*=p,m=o*n;break;case this.OBLIQ:c=Math.abs(n)<=f?this.phi0:Math.asin(o*this.sinph0+m*p*this.cosph0/n),l*=p*this.cosph0,m=(o-Math.sin(c)*this.sinph0)*n;break;case this.N_POLE:m=-m,c=d-c;break;case this.S_POLE:c-=d}b=0!==m||this.mode!==this.EQUIT&&this.mode!==this.OBLIQ?Math.atan2(l,m):0}else{if(k=0,this.mode===this.OBLIQ||this.mode===this.EQUIT){if(l/=this.dd,m*=this.dd,j=Math.sqrt(l*l+m*m),f>j)return a.x=0,a.y=this.phi0,a;g=2*Math.asin(.5*j/this.rq),e=Math.cos(g),l*=g=Math.sin(g),this.mode===this.OBLIQ?(k=e*this.sinb1+m*g*this.cosb1/j,i=this.qp*k,m=j*this.cosb1*e-m*this.sinb1*g):(k=m*g/j,i=this.qp*k,m=j*e)}else if(this.mode===this.N_POLE||this.mode===this.S_POLE){if(this.mode===this.N_POLE&&(m=-m),i=l*l+m*m,!i)return a.x=0,a.y=this.phi0,a;k=1-i/this.qp,this.mode===this.S_POLE&&(k=-k)}b=Math.atan2(l,m),c=this.authlat(Math.asin(k),this.apa)}return a.x=h(this.long0+b),a.y=c,a},c.P00=.3333333333333333,c.P01=.17222222222222222,c.P02=.10257936507936508,c.P10=.06388888888888888,c.P11=.0664021164021164,c.P20=.016415012942191543,c.authset=function(a){var b,c=[];return c[0]=a*this.P00,b=a*a,c[0]+=b*this.P01,c[1]=b*this.P10,b*=a,c[0]+=b*this.P02,c[1]+=b*this.P11,c[2]=b*this.P20,c},c.authlat=function(a,b){var c=a+a;return a+b[0]*Math.sin(c)+b[1]*Math.sin(c+c)+b[2]*Math.sin(c+c+c)},c.names=["Lambert Azimuthal Equal Area","Lambert_Azimuthal_Equal_Area","laea"]},{"../common/adjust_lon":5,"../common/qsfnz":20}],50:[function(a,b,c){var d=1e-10,e=a("../common/msfnz"),f=a("../common/tsfnz"),g=Math.PI/2,h=a("../common/sign"),i=a("../common/adjust_lon"),j=a("../common/phi2z");c.init=function(){if(this.lat2||(this.lat2=this.lat1),this.k0||(this.k0=1),this.x0=this.x0||0,this.y0=this.y0||0,!(Math.abs(this.lat1+this.lat2)<d)){var a=this.b/this.a;this.e=Math.sqrt(1-a*a);var b=Math.sin(this.lat1),c=Math.cos(this.lat1),g=e(this.e,b,c),h=f(this.e,this.lat1,b),i=Math.sin(this.lat2),j=Math.cos(this.lat2),k=e(this.e,i,j),l=f(this.e,this.lat2,i),m=f(this.e,this.lat0,Math.sin(this.lat0));Math.abs(this.lat1-this.lat2)>d?this.ns=Math.log(g/k)/Math.log(h/l):this.ns=b,isNaN(this.ns)&&(this.ns=b),this.f0=g/(this.ns*Math.pow(h,this.ns)),this.rh=this.a*this.f0*Math.pow(m,this.ns),this.title||(this.title="Lambert Conformal Conic")}},c.forward=function(a){var b=a.x,c=a.y;Math.abs(2*Math.abs(c)-Math.PI)<=d&&(c=h(c)*(g-2*d));var e,j,k=Math.abs(Math.abs(c)-g);if(k>d)e=f(this.e,c,Math.sin(c)),j=this.a*this.f0*Math.pow(e,this.ns);else{if(k=c*this.ns,0>=k)return null;j=0}var l=this.ns*i(b-this.long0);return a.x=this.k0*(j*Math.sin(l))+this.x0,a.y=this.k0*(this.rh-j*Math.cos(l))+this.y0,a},c.inverse=function(a){var b,c,d,e,f,h=(a.x-this.x0)/this.k0,k=this.rh-(a.y-this.y0)/this.k0;this.ns>0?(b=Math.sqrt(h*h+k*k),c=1):(b=-Math.sqrt(h*h+k*k),c=-1);var l=0;if(0!==b&&(l=Math.atan2(c*h,c*k)),0!==b||this.ns>0){if(c=1/this.ns,d=Math.pow(b/(this.a*this.f0),c),e=j(this.e,d),-9999===e)return null}else e=-g;return f=i(l/this.ns+this.long0),a.x=f,a.y=e,a},c.names=["Lambert Tangential Conformal Conic Projection","Lambert_Conformal_Conic","Lambert_Conformal_Conic_2SP","lcc"]},{"../common/adjust_lon":5,"../common/msfnz":15,"../common/phi2z":16,"../common/sign":21,"../common/tsfnz":24}],51:[function(a,b,c){function d(a){return a}c.init=function(){},c.forward=d,c.inverse=d,c.names=["longlat","identity"]},{}],52:[function(a,b,c){var d=a("../common/msfnz"),e=Math.PI/2,f=1e-10,g=57.29577951308232,h=a("../common/adjust_lon"),i=Math.PI/4,j=a("../common/tsfnz"),k=a("../common/phi2z");c.init=function(){var a=this.b/this.a;this.es=1-a*a,"x0"in this||(this.x0=0),"y0"in this||(this.y0=0),this.e=Math.sqrt(this.es),this.lat_ts?this.sphere?this.k0=Math.cos(this.lat_ts):this.k0=d(this.e,Math.sin(this.lat_ts),Math.cos(this.lat_ts)):this.k0||(this.k?this.k0=this.k:this.k0=1)},c.forward=function(a){var b=a.x,c=a.y;if(c*g>90&&-90>c*g&&b*g>180&&-180>b*g)return null;var d,k;if(Math.abs(Math.abs(c)-e)<=f)return null;if(this.sphere)d=this.x0+this.a*this.k0*h(b-this.long0),k=this.y0+this.a*this.k0*Math.log(Math.tan(i+.5*c));else{var l=Math.sin(c),m=j(this.e,c,l);d=this.x0+this.a*this.k0*h(b-this.long0),k=this.y0-this.a*this.k0*Math.log(m)}return a.x=d,a.y=k,a},c.inverse=function(a){var b,c,d=a.x-this.x0,f=a.y-this.y0;if(this.sphere)c=e-2*Math.atan(Math.exp(-f/(this.a*this.k0)));else{var g=Math.exp(-f/(this.a*this.k0));if(c=k(this.e,g),-9999===c)return null}return b=h(this.long0+d/(this.a*this.k0)),a.x=b,a.y=c,a},c.names=["Mercator","Popular Visualisation Pseudo Mercator","Mercator_1SP","Mercator_Auxiliary_Sphere","merc"]},{"../common/adjust_lon":5,"../common/msfnz":15,"../common/phi2z":16,"../common/tsfnz":24}],53:[function(a,b,c){var d=a("../common/adjust_lon");c.init=function(){},c.forward=function(a){var b=a.x,c=a.y,e=d(b-this.long0),f=this.x0+this.a*e,g=this.y0+this.a*Math.log(Math.tan(Math.PI/4+c/2.5))*1.25;return a.x=f,a.y=g,a},c.inverse=function(a){a.x-=this.x0,a.y-=this.y0;var b=d(this.long0+a.x/this.a),c=2.5*(Math.atan(Math.exp(.8*a.y/this.a))-Math.PI/4);return a.x=b,a.y=c,a},c.names=["Miller_Cylindrical","mill"]},{"../common/adjust_lon":5}],54:[function(a,b,c){var d=a("../common/adjust_lon"),e=1e-10;c.init=function(){},c.forward=function(a){for(var b=a.x,c=a.y,f=d(b-this.long0),g=c,h=Math.PI*Math.sin(c),i=0;!0;i++){var j=-(g+Math.sin(g)-h)/(1+Math.cos(g));if(g+=j,Math.abs(j)<e)break}g/=2,Math.PI/2-Math.abs(c)<e&&(f=0);var k=.900316316158*this.a*f*Math.cos(g)+this.x0,l=1.4142135623731*this.a*Math.sin(g)+this.y0;return a.x=k,a.y=l,a},c.inverse=function(a){var b,c;a.x-=this.x0,a.y-=this.y0,c=a.y/(1.4142135623731*this.a),Math.abs(c)>.999999999999&&(c=.999999999999),b=Math.asin(c);var e=d(this.long0+a.x/(.900316316158*this.a*Math.cos(b)));e<-Math.PI&&(e=-Math.PI),e>Math.PI&&(e=Math.PI),c=(2*b+Math.sin(2*b))/Math.PI,Math.abs(c)>1&&(c=1);var f=Math.asin(c);return a.x=e,a.y=f,a},c.names=["Mollweide","moll"]},{"../common/adjust_lon":5}],55:[function(a,b,c){var d=484813681109536e-20;c.iterations=1,c.init=function(){this.A=[],this.A[1]=.6399175073,this.A[2]=-.1358797613,this.A[3]=.063294409,this.A[4]=-.02526853,this.A[5]=.0117879,this.A[6]=-.0055161,this.A[7]=.0026906,this.A[8]=-.001333,this.A[9]=67e-5,this.A[10]=-34e-5,this.B_re=[],this.B_im=[],this.B_re[1]=.7557853228,this.B_im[1]=0,this.B_re[2]=.249204646,this.B_im[2]=.003371507,this.B_re[3]=-.001541739,this.B_im[3]=.04105856,this.B_re[4]=-.10162907,this.B_im[4]=.01727609,this.B_re[5]=-.26623489,this.B_im[5]=-.36249218,this.B_re[6]=-.6870983,this.B_im[6]=-1.1651967,this.C_re=[],this.C_im=[],this.C_re[1]=1.3231270439,this.C_im[1]=0,this.C_re[2]=-.577245789,this.C_im[2]=-.007809598,this.C_re[3]=.508307513,this.C_im[3]=-.112208952,this.C_re[4]=-.15094762,this.C_im[4]=.18200602,this.C_re[5]=1.01418179,this.C_im[5]=1.64497696,this.C_re[6]=1.9660549,this.C_im[6]=2.5127645,this.D=[],this.D[1]=1.5627014243,this.D[2]=.5185406398,this.D[3]=-.03333098,this.D[4]=-.1052906,this.D[5]=-.0368594,this.D[6]=.007317,this.D[7]=.0122,this.D[8]=.00394,this.D[9]=-.0013},c.forward=function(a){var b,c=a.x,e=a.y,f=e-this.lat0,g=c-this.long0,h=f/d*1e-5,i=g,j=1,k=0;for(b=1;10>=b;b++)j*=h,k+=this.A[b]*j;var l,m,n=k,o=i,p=1,q=0,r=0,s=0;for(b=1;6>=b;b++)l=p*n-q*o,m=q*n+p*o,p=l,q=m,r=r+this.B_re[b]*p-this.B_im[b]*q,s=s+this.B_im[b]*p+this.B_re[b]*q;return a.x=s*this.a+this.x0,a.y=r*this.a+this.y0,a},c.inverse=function(a){var b,c,e,f=a.x,g=a.y,h=f-this.x0,i=g-this.y0,j=i/this.a,k=h/this.a,l=1,m=0,n=0,o=0;for(b=1;6>=b;b++)c=l*j-m*k,e=m*j+l*k,l=c,m=e,n=n+this.C_re[b]*l-this.C_im[b]*m,o=o+this.C_im[b]*l+this.C_re[b]*m;for(var p=0;p<this.iterations;p++){var q,r,s=n,t=o,u=j,v=k;for(b=2;6>=b;b++)q=s*n-t*o,r=t*n+s*o,s=q,t=r,u+=(b-1)*(this.B_re[b]*s-this.B_im[b]*t),v+=(b-1)*(this.B_im[b]*s+this.B_re[b]*t);s=1,t=0;var w=this.B_re[1],x=this.B_im[1];for(b=2;6>=b;b++)q=s*n-t*o,r=t*n+s*o,s=q,t=r,w+=b*(this.B_re[b]*s-this.B_im[b]*t),x+=b*(this.B_im[b]*s+this.B_re[b]*t);var y=w*w+x*x;n=(u*w+v*x)/y,o=(v*w-u*x)/y}var z=n,A=o,B=1,C=0;for(b=1;9>=b;b++)B*=z,C+=this.D[b]*B;var D=this.lat0+C*d*1e5,E=this.long0+A;return a.x=E,a.y=D,a},c.names=["New_Zealand_Map_Grid","nzmg"]},{}],56:[function(a,b,c){var d=a("../common/tsfnz"),e=a("../common/adjust_lon"),f=a("../common/phi2z"),g=Math.PI/2,h=Math.PI/4,i=1e-10;c.init=function(){this.no_off=this.no_off||!1,this.no_rot=this.no_rot||!1,isNaN(this.k0)&&(this.k0=1);var a=Math.sin(this.lat0),b=Math.cos(this.lat0),c=this.e*a;this.bl=Math.sqrt(1+this.es/(1-this.es)*Math.pow(b,4)),this.al=this.a*this.bl*this.k0*Math.sqrt(1-this.es)/(1-c*c);var f=d(this.e,this.lat0,a),g=this.bl/b*Math.sqrt((1-this.es)/(1-c*c));1>g*g&&(g=1);var h,i;if(isNaN(this.longc)){var j=d(this.e,this.lat1,Math.sin(this.lat1)),k=d(this.e,this.lat2,Math.sin(this.lat2));this.lat0>=0?this.el=(g+Math.sqrt(g*g-1))*Math.pow(f,this.bl):this.el=(g-Math.sqrt(g*g-1))*Math.pow(f,this.bl);var l=Math.pow(j,this.bl),m=Math.pow(k,this.bl);h=this.el/l,i=.5*(h-1/h);var n=(this.el*this.el-m*l)/(this.el*this.el+m*l),o=(m-l)/(m+l),p=e(this.long1-this.long2);this.long0=.5*(this.long1+this.long2)-Math.atan(n*Math.tan(.5*this.bl*p)/o)/this.bl,this.long0=e(this.long0);var q=e(this.long1-this.long0);this.gamma0=Math.atan(Math.sin(this.bl*q)/i),this.alpha=Math.asin(g*Math.sin(this.gamma0))}else h=this.lat0>=0?g+Math.sqrt(g*g-1):g-Math.sqrt(g*g-1),this.el=h*Math.pow(f,this.bl),i=.5*(h-1/h),this.gamma0=Math.asin(Math.sin(this.alpha)/g),this.long0=this.longc-Math.asin(i*Math.tan(this.gamma0))/this.bl;this.no_off?this.uc=0:this.lat0>=0?this.uc=this.al/this.bl*Math.atan2(Math.sqrt(g*g-1),Math.cos(this.alpha)):this.uc=-1*this.al/this.bl*Math.atan2(Math.sqrt(g*g-1),Math.cos(this.alpha))},c.forward=function(a){var b,c,f,j=a.x,k=a.y,l=e(j-this.long0);if(Math.abs(Math.abs(k)-g)<=i)f=k>0?-1:1,c=this.al/this.bl*Math.log(Math.tan(h+f*this.gamma0*.5)),b=-1*f*g*this.al/this.bl;else{var m=d(this.e,k,Math.sin(k)),n=this.el/Math.pow(m,this.bl),o=.5*(n-1/n),p=.5*(n+1/n),q=Math.sin(this.bl*l),r=(o*Math.sin(this.gamma0)-q*Math.cos(this.gamma0))/p;c=Math.abs(Math.abs(r)-1)<=i?Number.POSITIVE_INFINITY:.5*this.al*Math.log((1-r)/(1+r))/this.bl,b=Math.abs(Math.cos(this.bl*l))<=i?this.al*this.bl*l:this.al*Math.atan2(o*Math.cos(this.gamma0)+q*Math.sin(this.gamma0),Math.cos(this.bl*l))/this.bl}return this.no_rot?(a.x=this.x0+b,a.y=this.y0+c):(b-=this.uc,a.x=this.x0+c*Math.cos(this.alpha)+b*Math.sin(this.alpha),a.y=this.y0+b*Math.cos(this.alpha)-c*Math.sin(this.alpha)),a},c.inverse=function(a){var b,c;this.no_rot?(c=a.y-this.y0,b=a.x-this.x0):(c=(a.x-this.x0)*Math.cos(this.alpha)-(a.y-this.y0)*Math.sin(this.alpha),b=(a.y-this.y0)*Math.cos(this.alpha)+(a.x-this.x0)*Math.sin(this.alpha),b+=this.uc);var d=Math.exp(-1*this.bl*c/this.al),h=.5*(d-1/d),j=.5*(d+1/d),k=Math.sin(this.bl*b/this.al),l=(k*Math.cos(this.gamma0)+h*Math.sin(this.gamma0))/j,m=Math.pow(this.el/Math.sqrt((1+l)/(1-l)),1/this.bl);return Math.abs(l-1)<i?(a.x=this.long0,a.y=g):Math.abs(l+1)<i?(a.x=this.long0,a.y=-1*g):(a.y=f(this.e,m),a.x=e(this.long0-Math.atan2(h*Math.cos(this.gamma0)-k*Math.sin(this.gamma0),Math.cos(this.bl*b/this.al))/this.bl)),a},c.names=["Hotine_Oblique_Mercator","Hotine Oblique Mercator","Hotine_Oblique_Mercator_Azimuth_Natural_Origin","Hotine_Oblique_Mercator_Azimuth_Center","omerc"]},{"../common/adjust_lon":5,"../common/phi2z":16,"../common/tsfnz":24}],57:[function(a,b,c){var d=a("../common/adjust_lon"),e=1e-10,f=a("../common/asinz"),g=Math.PI/2;c.init=function(){this.sin_p14=Math.sin(this.lat0),this.cos_p14=Math.cos(this.lat0)},c.forward=function(a){var b,c,f,g,h,i,j,k,l=a.x,m=a.y;return f=d(l-this.long0),b=Math.sin(m),c=Math.cos(m),g=Math.cos(f),i=this.sin_p14*b+this.cos_p14*c*g,h=1,(i>0||Math.abs(i)<=e)&&(j=this.a*h*c*Math.sin(f),k=this.y0+this.a*h*(this.cos_p14*b-this.sin_p14*c*g)),a.x=j,a.y=k,a},c.inverse=function(a){var b,c,h,i,j,k,l;return a.x-=this.x0,a.y-=this.y0,b=Math.sqrt(a.x*a.x+a.y*a.y),c=f(b/this.a),h=Math.sin(c),i=Math.cos(c),k=this.long0,Math.abs(b)<=e?(l=this.lat0,a.x=k,a.y=l,a):(l=f(i*this.sin_p14+a.y*h*this.cos_p14/b),j=Math.abs(this.lat0)-g,Math.abs(j)<=e?(k=d(this.lat0>=0?this.long0+Math.atan2(a.x,-a.y):this.long0-Math.atan2(-a.x,a.y)),a.x=k,a.y=l,a):(k=d(this.long0+Math.atan2(a.x*h,b*this.cos_p14*i-a.y*this.sin_p14*h)),a.x=k,a.y=l,a))},c.names=["ortho"]},{"../common/adjust_lon":5,"../common/asinz":6}],58:[function(a,b,c){var d=a("../common/e0fn"),e=a("../common/e1fn"),f=a("../common/e2fn"),g=a("../common/e3fn"),h=a("../common/adjust_lon"),i=a("../common/adjust_lat"),j=a("../common/mlfn"),k=1e-10,l=a("../common/gN"),m=20;c.init=function(){this.temp=this.b/this.a,this.es=1-Math.pow(this.temp,2),this.e=Math.sqrt(this.es),this.e0=d(this.es),this.e1=e(this.es),this.e2=f(this.es),this.e3=g(this.es),this.ml0=this.a*j(this.e0,this.e1,this.e2,this.e3,this.lat0)},c.forward=function(a){var b,c,d,e=a.x,f=a.y,g=h(e-this.long0);if(d=g*Math.sin(f),this.sphere)Math.abs(f)<=k?(b=this.a*g,c=-1*this.a*this.lat0):(b=this.a*Math.sin(d)/Math.tan(f),c=this.a*(i(f-this.lat0)+(1-Math.cos(d))/Math.tan(f)));else if(Math.abs(f)<=k)b=this.a*g,c=-1*this.ml0;else{var m=l(this.a,this.e,Math.sin(f))/Math.tan(f);b=m*Math.sin(d),c=this.a*j(this.e0,this.e1,this.e2,this.e3,f)-this.ml0+m*(1-Math.cos(d))}return a.x=b+this.x0,a.y=c+this.y0,a},c.inverse=function(a){var b,c,d,e,f,g,i,l,n;if(d=a.x-this.x0,e=a.y-this.y0,this.sphere)if(Math.abs(e+this.a*this.lat0)<=k)b=h(d/this.a+this.long0),c=0;else{g=this.lat0+e/this.a,i=d*d/this.a/this.a+g*g,l=g;var o;for(f=m;f;--f)if(o=Math.tan(l),n=-1*(g*(l*o+1)-l-.5*(l*l+i)*o)/((l-g)/o-1),l+=n,Math.abs(n)<=k){c=l;break}b=h(this.long0+Math.asin(d*Math.tan(l)/this.a)/Math.sin(c))}else if(Math.abs(e+this.ml0)<=k)c=0,b=h(this.long0+d/this.a);else{g=(this.ml0+e)/this.a,i=d*d/this.a/this.a+g*g,l=g;var p,q,r,s,t;for(f=m;f;--f)if(t=this.e*Math.sin(l),p=Math.sqrt(1-t*t)*Math.tan(l),q=this.a*j(this.e0,this.e1,this.e2,this.e3,l),r=this.e0-2*this.e1*Math.cos(2*l)+4*this.e2*Math.cos(4*l)-6*this.e3*Math.cos(6*l),s=q/this.a,n=(g*(p*s+1)-s-.5*p*(s*s+i))/(this.es*Math.sin(2*l)*(s*s+i-2*g*s)/(4*p)+(g-s)*(p*r-2/Math.sin(2*l))-r),l-=n,Math.abs(n)<=k){c=l;break}p=Math.sqrt(1-this.es*Math.pow(Math.sin(c),2))*Math.tan(c),b=h(this.long0+Math.asin(d*p/this.a)/Math.sin(c))}return a.x=b,a.y=c,a},c.names=["Polyconic","poly"]},{"../common/adjust_lat":4,"../common/adjust_lon":5,"../common/e0fn":7,"../common/e1fn":8,"../common/e2fn":9,"../common/e3fn":10,"../common/gN":11,"../common/mlfn":14}],59:[function(a,b,c){var d=a("../common/adjust_lon"),e=a("../common/adjust_lat"),f=a("../common/pj_enfn"),g=20,h=a("../common/pj_mlfn"),i=a("../common/pj_inv_mlfn"),j=Math.PI/2,k=1e-10,l=a("../common/asinz");c.init=function(){this.sphere?(this.n=1,this.m=0,this.es=0,this.C_y=Math.sqrt((this.m+1)/this.n),this.C_x=this.C_y/(this.m+1)):this.en=f(this.es)},c.forward=function(a){var b,c,e=a.x,f=a.y;if(e=d(e-this.long0),this.sphere){if(this.m)for(var i=this.n*Math.sin(f),j=g;j;--j){var l=(this.m*f+Math.sin(f)-i)/(this.m+Math.cos(f));if(f-=l,Math.abs(l)<k)break}else f=1!==this.n?Math.asin(this.n*Math.sin(f)):f;b=this.a*this.C_x*e*(this.m+Math.cos(f)),c=this.a*this.C_y*f}else{var m=Math.sin(f),n=Math.cos(f);c=this.a*h(f,m,n,this.en),b=this.a*e*n/Math.sqrt(1-this.es*m*m)}return a.x=b,a.y=c,a},c.inverse=function(a){var b,c,f,g;return a.x-=this.x0,f=a.x/this.a,a.y-=this.y0,b=a.y/this.a,this.sphere?(b/=this.C_y,f/=this.C_x*(this.m+Math.cos(b)),this.m?b=l((this.m*b+Math.sin(b))/this.n):1!==this.n&&(b=l(Math.sin(b)/this.n)),f=d(f+this.long0),b=e(b)):(b=i(a.y/this.a,this.es,this.en),g=Math.abs(b),j>g?(g=Math.sin(b),c=this.long0+a.x*Math.sqrt(1-this.es*g*g)/(this.a*Math.cos(b)),f=d(c)):j>g-k&&(f=this.long0)),a.x=f,a.y=b,a},c.names=["Sinusoidal","sinu"]},{"../common/adjust_lat":4,"../common/adjust_lon":5,"../common/asinz":6,"../common/pj_enfn":17,"../common/pj_inv_mlfn":18,"../common/pj_mlfn":19}],60:[function(a,b,c){c.init=function(){var a=this.lat0;this.lambda0=this.long0;var b=Math.sin(a),c=this.a,d=this.rf,e=1/d,f=2*e-Math.pow(e,2),g=this.e=Math.sqrt(f);this.R=this.k0*c*Math.sqrt(1-f)/(1-f*Math.pow(b,2)),this.alpha=Math.sqrt(1+f/(1-f)*Math.pow(Math.cos(a),4)),this.b0=Math.asin(b/this.alpha);var h=Math.log(Math.tan(Math.PI/4+this.b0/2)),i=Math.log(Math.tan(Math.PI/4+a/2)),j=Math.log((1+g*b)/(1-g*b));this.K=h-this.alpha*i+this.alpha*g/2*j},c.forward=function(a){var b=Math.log(Math.tan(Math.PI/4-a.y/2)),c=this.e/2*Math.log((1+this.e*Math.sin(a.y))/(1-this.e*Math.sin(a.y))),d=-this.alpha*(b+c)+this.K,e=2*(Math.atan(Math.exp(d))-Math.PI/4),f=this.alpha*(a.x-this.lambda0),g=Math.atan(Math.sin(f)/(Math.sin(this.b0)*Math.tan(e)+Math.cos(this.b0)*Math.cos(f))),h=Math.asin(Math.cos(this.b0)*Math.sin(e)-Math.sin(this.b0)*Math.cos(e)*Math.cos(f));return a.y=this.R/2*Math.log((1+Math.sin(h))/(1-Math.sin(h)))+this.y0,a.x=this.R*g+this.x0,a},c.inverse=function(a){for(var b=a.x-this.x0,c=a.y-this.y0,d=b/this.R,e=2*(Math.atan(Math.exp(c/this.R))-Math.PI/4),f=Math.asin(Math.cos(this.b0)*Math.sin(e)+Math.sin(this.b0)*Math.cos(e)*Math.cos(d)),g=Math.atan(Math.sin(d)/(Math.cos(this.b0)*Math.cos(d)-Math.sin(this.b0)*Math.tan(e))),h=this.lambda0+g/this.alpha,i=0,j=f,k=-1e3,l=0;Math.abs(j-k)>1e-7;){if(++l>20)return;i=1/this.alpha*(Math.log(Math.tan(Math.PI/4+f/2))-this.K)+this.e*Math.log(Math.tan(Math.PI/4+Math.asin(this.e*Math.sin(j))/2)),k=j,j=2*Math.atan(Math.exp(i))-Math.PI/2}return a.x=h,a.y=j,a},c.names=["somerc"]},{}],61:[function(a,b,c){var d=Math.PI/2,e=1e-10,f=a("../common/sign"),g=a("../common/msfnz"),h=a("../common/tsfnz"),i=a("../common/phi2z"),j=a("../common/adjust_lon");c.ssfn_=function(a,b,c){return b*=c,Math.tan(.5*(d+a))*Math.pow((1-b)/(1+b),.5*c)},c.init=function(){this.coslat0=Math.cos(this.lat0),this.sinlat0=Math.sin(this.lat0),this.sphere?1===this.k0&&!isNaN(this.lat_ts)&&Math.abs(this.coslat0)<=e&&(this.k0=.5*(1+f(this.lat0)*Math.sin(this.lat_ts))):(Math.abs(this.coslat0)<=e&&(this.lat0>0?this.con=1:this.con=-1),this.cons=Math.sqrt(Math.pow(1+this.e,1+this.e)*Math.pow(1-this.e,1-this.e)),1===this.k0&&!isNaN(this.lat_ts)&&Math.abs(this.coslat0)<=e&&(this.k0=.5*this.cons*g(this.e,Math.sin(this.lat_ts),Math.cos(this.lat_ts))/h(this.e,this.con*this.lat_ts,this.con*Math.sin(this.lat_ts))),this.ms1=g(this.e,this.sinlat0,this.coslat0),this.X0=2*Math.atan(this.ssfn_(this.lat0,this.sinlat0,this.e))-d,this.cosX0=Math.cos(this.X0),this.sinX0=Math.sin(this.X0))},c.forward=function(a){var b,c,f,g,i,k,l=a.x,m=a.y,n=Math.sin(m),o=Math.cos(m),p=j(l-this.long0);return Math.abs(Math.abs(l-this.long0)-Math.PI)<=e&&Math.abs(m+this.lat0)<=e?(a.x=NaN,a.y=NaN,a):this.sphere?(b=2*this.k0/(1+this.sinlat0*n+this.coslat0*o*Math.cos(p)),a.x=this.a*b*o*Math.sin(p)+this.x0,a.y=this.a*b*(this.coslat0*n-this.sinlat0*o*Math.cos(p))+this.y0,a):(c=2*Math.atan(this.ssfn_(m,n,this.e))-d,g=Math.cos(c),f=Math.sin(c),Math.abs(this.coslat0)<=e?(i=h(this.e,m*this.con,this.con*n),k=2*this.a*this.k0*i/this.cons,a.x=this.x0+k*Math.sin(l-this.long0),a.y=this.y0-this.con*k*Math.cos(l-this.long0),a):(Math.abs(this.sinlat0)<e?(b=2*this.a*this.k0/(1+g*Math.cos(p)),a.y=b*f):(b=2*this.a*this.k0*this.ms1/(this.cosX0*(1+this.sinX0*f+this.cosX0*g*Math.cos(p))),a.y=b*(this.cosX0*f-this.sinX0*g*Math.cos(p))+this.y0),a.x=b*g*Math.sin(p)+this.x0,a))},c.inverse=function(a){a.x-=this.x0,a.y-=this.y0;var b,c,f,g,h,k=Math.sqrt(a.x*a.x+a.y*a.y);if(this.sphere){var l=2*Math.atan(k/(.5*this.a*this.k0));return b=this.long0,c=this.lat0,e>=k?(a.x=b,a.y=c,a):(c=Math.asin(Math.cos(l)*this.sinlat0+a.y*Math.sin(l)*this.coslat0/k),b=j(Math.abs(this.coslat0)<e?this.lat0>0?this.long0+Math.atan2(a.x,-1*a.y):this.long0+Math.atan2(a.x,a.y):this.long0+Math.atan2(a.x*Math.sin(l),k*this.coslat0*Math.cos(l)-a.y*this.sinlat0*Math.sin(l))),a.x=b,a.y=c,a)}if(Math.abs(this.coslat0)<=e){if(e>=k)return c=this.lat0,b=this.long0,a.x=b,a.y=c,a;a.x*=this.con,a.y*=this.con,f=k*this.cons/(2*this.a*this.k0),c=this.con*i(this.e,f),b=this.con*j(this.con*this.long0+Math.atan2(a.x,-1*a.y))}else g=2*Math.atan(k*this.cosX0/(2*this.a*this.k0*this.ms1)),b=this.long0,e>=k?h=this.X0:(h=Math.asin(Math.cos(g)*this.sinX0+a.y*Math.sin(g)*this.cosX0/k),b=j(this.long0+Math.atan2(a.x*Math.sin(g),k*this.cosX0*Math.cos(g)-a.y*this.sinX0*Math.sin(g)))),c=-1*i(this.e,Math.tan(.5*(d+h)));return a.x=b,a.y=c,a},c.names=["stere","Stereographic_South_Pole","Polar Stereographic (variant B)"]},{"../common/adjust_lon":5,"../common/msfnz":15,"../common/phi2z":16,"../common/sign":21,"../common/tsfnz":24}],62:[function(a,b,c){var d=a("./gauss"),e=a("../common/adjust_lon");c.init=function(){d.init.apply(this),this.rc&&(this.sinc0=Math.sin(this.phic0),this.cosc0=Math.cos(this.phic0),this.R2=2*this.rc,this.title||(this.title="Oblique Stereographic Alternative"))},c.forward=function(a){var b,c,f,g;return a.x=e(a.x-this.long0),d.forward.apply(this,[a]),b=Math.sin(a.y),c=Math.cos(a.y),f=Math.cos(a.x),g=this.k0*this.R2/(1+this.sinc0*b+this.cosc0*c*f),a.x=g*c*Math.sin(a.x),a.y=g*(this.cosc0*b-this.sinc0*c*f),a.x=this.a*a.x+this.x0,a.y=this.a*a.y+this.y0,a},c.inverse=function(a){var b,c,f,g,h;if(a.x=(a.x-this.x0)/this.a,a.y=(a.y-this.y0)/this.a,a.x/=this.k0,a.y/=this.k0,h=Math.sqrt(a.x*a.x+a.y*a.y)){var i=2*Math.atan2(h,this.R2);b=Math.sin(i),c=Math.cos(i),g=Math.asin(c*this.sinc0+a.y*b*this.cosc0/h),f=Math.atan2(a.x*b,h*this.cosc0*c-a.y*this.sinc0*b)}else g=this.phic0,f=0;return a.x=f,a.y=g,d.inverse.apply(this,[a]),a.x=e(a.x+this.long0),a},c.names=["Stereographic_North_Pole","Oblique_Stereographic","Polar_Stereographic","sterea","Oblique Stereographic Alternative"]},{"../common/adjust_lon":5,"./gauss":46}],63:[function(a,b,c){var d=a("../common/e0fn"),e=a("../common/e1fn"),f=a("../common/e2fn"),g=a("../common/e3fn"),h=a("../common/mlfn"),i=a("../common/adjust_lon"),j=Math.PI/2,k=1e-10,l=a("../common/sign"),m=a("../common/asinz");c.init=function(){this.e0=d(this.es),this.e1=e(this.es),this.e2=f(this.es),this.e3=g(this.es),this.ml0=this.a*h(this.e0,this.e1,this.e2,this.e3,this.lat0)},c.forward=function(a){var b,c,d,e=a.x,f=a.y,g=i(e-this.long0),j=Math.sin(f),k=Math.cos(f);if(this.sphere){var l=k*Math.sin(g);if(Math.abs(Math.abs(l)-1)<1e-10)return 93;c=.5*this.a*this.k0*Math.log((1+l)/(1-l)),b=Math.acos(k*Math.cos(g)/Math.sqrt(1-l*l)),0>f&&(b=-b),d=this.a*this.k0*(b-this.lat0)}else{var m=k*g,n=Math.pow(m,2),o=this.ep2*Math.pow(k,2),p=Math.tan(f),q=Math.pow(p,2);b=1-this.es*Math.pow(j,2);var r=this.a/Math.sqrt(b),s=this.a*h(this.e0,this.e1,this.e2,this.e3,f);c=this.k0*r*m*(1+n/6*(1-q+o+n/20*(5-18*q+Math.pow(q,2)+72*o-58*this.ep2)))+this.x0,d=this.k0*(s-this.ml0+r*p*(n*(.5+n/24*(5-q+9*o+4*Math.pow(o,2)+n/30*(61-58*q+Math.pow(q,2)+600*o-330*this.ep2)))))+this.y0}return a.x=c,a.y=d,a},c.inverse=function(a){var b,c,d,e,f,g,h=6;if(this.sphere){var n=Math.exp(a.x/(this.a*this.k0)),o=.5*(n-1/n),p=this.lat0+a.y/(this.a*this.k0),q=Math.cos(p);b=Math.sqrt((1-q*q)/(1+o*o)),f=m(b),0>p&&(f=-f),g=0===o&&0===q?this.long0:i(Math.atan2(o,q)+this.long0)}else{var r=a.x-this.x0,s=a.y-this.y0;for(b=(this.ml0+s/this.k0)/this.a,c=b,e=0;!0&&(d=(b+this.e1*Math.sin(2*c)-this.e2*Math.sin(4*c)+this.e3*Math.sin(6*c))/this.e0-c,c+=d,!(Math.abs(d)<=k));e++)if(e>=h)return 95;if(Math.abs(c)<j){var t=Math.sin(c),u=Math.cos(c),v=Math.tan(c),w=this.ep2*Math.pow(u,2),x=Math.pow(w,2),y=Math.pow(v,2),z=Math.pow(y,2);b=1-this.es*Math.pow(t,2);var A=this.a/Math.sqrt(b),B=A*(1-this.es)/b,C=r/(A*this.k0),D=Math.pow(C,2);f=c-A*v*D/B*(.5-D/24*(5+3*y+10*w-4*x-9*this.ep2-D/30*(61+90*y+298*w+45*z-252*this.ep2-3*x))),g=i(this.long0+C*(1-D/6*(1+2*y+w-D/20*(5-2*w+28*y-3*x+8*this.ep2+24*z)))/u)}else f=j*l(s),g=this.long0}return a.x=g,a.y=f,a},c.names=["Transverse_Mercator","Transverse Mercator","tmerc"]},{"../common/adjust_lon":5,"../common/asinz":6,"../common/e0fn":7,"../common/e1fn":8,"../common/e2fn":9,"../common/e3fn":10,"../common/mlfn":14,"../common/sign":21}],64:[function(a,b,c){var d=.017453292519943295,e=a("./tmerc");c.dependsOn="tmerc",c.init=function(){this.zone&&(this.lat0=0,this.long0=(6*Math.abs(this.zone)-183)*d,this.x0=5e5,this.y0=this.utmSouth?1e7:0,this.k0=.9996,e.init.apply(this),this.forward=e.forward,this.inverse=e.inverse)},c.names=["Universal Transverse Mercator System","utm"]},{"./tmerc":63}],65:[function(a,b,c){var d=a("../common/adjust_lon"),e=Math.PI/2,f=1e-10,g=a("../common/asinz");c.init=function(){this.R=this.a},c.forward=function(a){var b,c,h=a.x,i=a.y,j=d(h-this.long0);Math.abs(i)<=f&&(b=this.x0+this.R*j,c=this.y0);var k=g(2*Math.abs(i/Math.PI));(Math.abs(j)<=f||Math.abs(Math.abs(i)-e)<=f)&&(b=this.x0,c=i>=0?this.y0+Math.PI*this.R*Math.tan(.5*k):this.y0+Math.PI*this.R*-Math.tan(.5*k));var l=.5*Math.abs(Math.PI/j-j/Math.PI),m=l*l,n=Math.sin(k),o=Math.cos(k),p=o/(n+o-1),q=p*p,r=p*(2/n-1),s=r*r,t=Math.PI*this.R*(l*(p-s)+Math.sqrt(m*(p-s)*(p-s)-(s+m)*(q-s)))/(s+m);0>j&&(t=-t),b=this.x0+t;var u=m+p;return t=Math.PI*this.R*(r*u-l*Math.sqrt((s+m)*(m+1)-u*u))/(s+m),c=i>=0?this.y0+t:this.y0-t,a.x=b,a.y=c,a},c.inverse=function(a){var b,c,e,g,h,i,j,k,l,m,n,o,p;return a.x-=this.x0,a.y-=this.y0,n=Math.PI*this.R,e=a.x/n,g=a.y/n,h=e*e+g*g,i=-Math.abs(g)*(1+h),
	j=i-2*g*g+e*e,k=-2*i+1+2*g*g+h*h,p=g*g/k+(2*j*j*j/k/k/k-9*i*j/k/k)/27,l=(i-j*j/3/k)/k,m=2*Math.sqrt(-l/3),n=3*p/l/m,Math.abs(n)>1&&(n=n>=0?1:-1),o=Math.acos(n)/3,c=a.y>=0?(-m*Math.cos(o+Math.PI/3)-j/3/k)*Math.PI:-(-m*Math.cos(o+Math.PI/3)-j/3/k)*Math.PI,b=Math.abs(e)<f?this.long0:d(this.long0+Math.PI*(h-1+Math.sqrt(1+2*(e*e-g*g)+h*h))/2/e),a.x=b,a.y=c,a},c.names=["Van_der_Grinten_I","VanDerGrinten","vandg"]},{"../common/adjust_lon":5,"../common/asinz":6}],66:[function(a,b,c){var d=.017453292519943295,e=57.29577951308232,f=1,g=2,h=a("./datum_transform"),i=a("./adjust_axis"),j=a("./Proj"),k=a("./common/toPoint");b.exports=function l(a,b,c){function m(a,b){return(a.datum.datum_type===f||a.datum.datum_type===g)&&"WGS84"!==b.datumCode}var n;return Array.isArray(c)&&(c=k(c)),a.datum&&b.datum&&(m(a,b)||m(b,a))&&(n=new j("WGS84"),l(a,n,c),a=n),"enu"!==a.axis&&i(a,!1,c),"longlat"===a.projName?(c.x*=d,c.y*=d):(a.to_meter&&(c.x*=a.to_meter,c.y*=a.to_meter),a.inverse(c)),a.from_greenwich&&(c.x+=a.from_greenwich),c=h(a.datum,b.datum,c),b.from_greenwich&&(c.x-=b.from_greenwich),"longlat"===b.projName?(c.x*=e,c.y*=e):(b.forward(c),b.to_meter&&(c.x/=b.to_meter,c.y/=b.to_meter)),"enu"!==b.axis&&i(b,!0,c),c}},{"./Proj":2,"./adjust_axis":3,"./common/toPoint":23,"./datum_transform":31}],67:[function(a,b,c){function d(a,b,c){a[b]=c.map(function(a){var b={};return e(a,b),b}).reduce(function(a,b){return j(a,b)},{})}function e(a,b){var c;return Array.isArray(a)?(c=a.shift(),"PARAMETER"===c&&(c=a.shift()),1===a.length?Array.isArray(a[0])?(b[c]={},e(a[0],b[c])):b[c]=a[0]:a.length?"TOWGS84"===c?b[c]=a:(b[c]={},["UNIT","PRIMEM","VERT_DATUM"].indexOf(c)>-1?(b[c]={name:a[0].toLowerCase(),convert:a[1]},3===a.length&&(b[c].auth=a[2])):"SPHEROID"===c?(b[c]={name:a[0],a:a[1],rf:a[2]},4===a.length&&(b[c].auth=a[3])):["GEOGCS","GEOCCS","DATUM","VERT_CS","COMPD_CS","LOCAL_CS","FITTED_CS","LOCAL_DATUM"].indexOf(c)>-1?(a[0]=["name",a[0]],d(b,c,a)):a.every(function(a){return Array.isArray(a)})?d(b,c,a):e(a,b[c])):b[c]=!0,void 0):void(b[a]=!0)}function f(a,b){var c=b[0],d=b[1];!(c in a)&&d in a&&(a[c]=a[d],3===b.length&&(a[c]=b[2](a[c])))}function g(a){return a*i}function h(a){function b(b){var c=a.to_meter||1;return parseFloat(b,10)*c}"GEOGCS"===a.type?a.projName="longlat":"LOCAL_CS"===a.type?(a.projName="identity",a.local=!0):"object"==typeof a.PROJECTION?a.projName=Object.keys(a.PROJECTION)[0]:a.projName=a.PROJECTION,a.UNIT&&(a.units=a.UNIT.name.toLowerCase(),"metre"===a.units&&(a.units="meter"),a.UNIT.convert&&("GEOGCS"===a.type?a.DATUM&&a.DATUM.SPHEROID&&(a.to_meter=parseFloat(a.UNIT.convert,10)*a.DATUM.SPHEROID.a):a.to_meter=parseFloat(a.UNIT.convert,10))),a.GEOGCS&&(a.GEOGCS.DATUM?a.datumCode=a.GEOGCS.DATUM.name.toLowerCase():a.datumCode=a.GEOGCS.name.toLowerCase(),"d_"===a.datumCode.slice(0,2)&&(a.datumCode=a.datumCode.slice(2)),"new_zealand_geodetic_datum_1949"!==a.datumCode&&"new_zealand_1949"!==a.datumCode||(a.datumCode="nzgd49"),"wgs_1984"===a.datumCode&&("Mercator_Auxiliary_Sphere"===a.PROJECTION&&(a.sphere=!0),a.datumCode="wgs84"),"_ferro"===a.datumCode.slice(-6)&&(a.datumCode=a.datumCode.slice(0,-6)),"_jakarta"===a.datumCode.slice(-8)&&(a.datumCode=a.datumCode.slice(0,-8)),~a.datumCode.indexOf("belge")&&(a.datumCode="rnb72"),a.GEOGCS.DATUM&&a.GEOGCS.DATUM.SPHEROID&&(a.ellps=a.GEOGCS.DATUM.SPHEROID.name.replace("_19","").replace(/[Cc]larke\_18/,"clrk"),"international"===a.ellps.toLowerCase().slice(0,13)&&(a.ellps="intl"),a.a=a.GEOGCS.DATUM.SPHEROID.a,a.rf=parseFloat(a.GEOGCS.DATUM.SPHEROID.rf,10)),~a.datumCode.indexOf("osgb_1936")&&(a.datumCode="osgb36")),a.b&&!isFinite(a.b)&&(a.b=a.a);var c=function(b){return f(a,b)},d=[["standard_parallel_1","Standard_Parallel_1"],["standard_parallel_2","Standard_Parallel_2"],["false_easting","False_Easting"],["false_northing","False_Northing"],["central_meridian","Central_Meridian"],["latitude_of_origin","Latitude_Of_Origin"],["latitude_of_origin","Central_Parallel"],["scale_factor","Scale_Factor"],["k0","scale_factor"],["latitude_of_center","Latitude_of_center"],["lat0","latitude_of_center",g],["longitude_of_center","Longitude_Of_Center"],["longc","longitude_of_center",g],["x0","false_easting",b],["y0","false_northing",b],["long0","central_meridian",g],["lat0","latitude_of_origin",g],["lat0","standard_parallel_1",g],["lat1","standard_parallel_1",g],["lat2","standard_parallel_2",g],["alpha","azimuth",g],["srsCode","name"]];d.forEach(c),a.long0||!a.longc||"Albers_Conic_Equal_Area"!==a.projName&&"Lambert_Azimuthal_Equal_Area"!==a.projName||(a.long0=a.longc),a.lat_ts||!a.lat1||"Stereographic_South_Pole"!==a.projName&&"Polar Stereographic (variant B)"!==a.projName||(a.lat0=g(a.lat1>0?90:-90),a.lat_ts=a.lat1)}var i=.017453292519943295,j=a("./extend");b.exports=function(a,b){var c=JSON.parse((","+a).replace(/\s*\,\s*([A-Z_0-9]+?)(\[)/g,',["$1",').slice(1).replace(/\s*\,\s*([A-Z_0-9]+?)\]/g,',"$1"]').replace(/,\["VERTCS".+/,"")),d=c.shift(),f=c.shift();c.unshift(["name",f]),c.unshift(["type",d]),c.unshift("output");var g={};return e(c,g),h(g.output),j(b,g.output)}},{"./extend":34}],68:[function(a,b,c){function d(a){return a*(Math.PI/180)}function e(a){return 180*(a/Math.PI)}function f(a){var b,c,e,f,g,i,j,k,l,m=a.lat,n=a.lon,o=6378137,p=.00669438,q=.9996,r=d(m),s=d(n);l=Math.floor((n+180)/6)+1,180===n&&(l=60),m>=56&&64>m&&n>=3&&12>n&&(l=32),m>=72&&84>m&&(n>=0&&9>n?l=31:n>=9&&21>n?l=33:n>=21&&33>n?l=35:n>=33&&42>n&&(l=37)),b=6*(l-1)-180+3,k=d(b),c=p/(1-p),e=o/Math.sqrt(1-p*Math.sin(r)*Math.sin(r)),f=Math.tan(r)*Math.tan(r),g=c*Math.cos(r)*Math.cos(r),i=Math.cos(r)*(s-k),j=o*((1-p/4-3*p*p/64-5*p*p*p/256)*r-(3*p/8+3*p*p/32+45*p*p*p/1024)*Math.sin(2*r)+(15*p*p/256+45*p*p*p/1024)*Math.sin(4*r)-35*p*p*p/3072*Math.sin(6*r));var t=q*e*(i+(1-f+g)*i*i*i/6+(5-18*f+f*f+72*g-58*c)*i*i*i*i*i/120)+5e5,u=q*(j+e*Math.tan(r)*(i*i/2+(5-f+9*g+4*g*g)*i*i*i*i/24+(61-58*f+f*f+600*g-330*c)*i*i*i*i*i*i/720));return 0>m&&(u+=1e7),{northing:Math.round(u),easting:Math.round(t),zoneNumber:l,zoneLetter:h(m)}}function g(a){var b=a.northing,c=a.easting,d=a.zoneLetter,f=a.zoneNumber;if(0>f||f>60)return null;var h,i,j,k,l,m,n,o,p,q,r=.9996,s=6378137,t=.00669438,u=(1-Math.sqrt(1-t))/(1+Math.sqrt(1-t)),v=c-5e5,w=b;"N">d&&(w-=1e7),o=6*(f-1)-180+3,h=t/(1-t),n=w/r,p=n/(s*(1-t/4-3*t*t/64-5*t*t*t/256)),q=p+(3*u/2-27*u*u*u/32)*Math.sin(2*p)+(21*u*u/16-55*u*u*u*u/32)*Math.sin(4*p)+151*u*u*u/96*Math.sin(6*p),i=s/Math.sqrt(1-t*Math.sin(q)*Math.sin(q)),j=Math.tan(q)*Math.tan(q),k=h*Math.cos(q)*Math.cos(q),l=s*(1-t)/Math.pow(1-t*Math.sin(q)*Math.sin(q),1.5),m=v/(i*r);var x=q-i*Math.tan(q)/l*(m*m/2-(5+3*j+10*k-4*k*k-9*h)*m*m*m*m/24+(61+90*j+298*k+45*j*j-252*h-3*k*k)*m*m*m*m*m*m/720);x=e(x);var y=(m-(1+2*j+k)*m*m*m/6+(5-2*k+28*j-3*k*k+8*h+24*j*j)*m*m*m*m*m/120)/Math.cos(q);y=o+e(y);var z;if(a.accuracy){var A=g({northing:a.northing+a.accuracy,easting:a.easting+a.accuracy,zoneLetter:a.zoneLetter,zoneNumber:a.zoneNumber});z={top:A.lat,right:A.lon,bottom:x,left:y}}else z={lat:x,lon:y};return z}function h(a){var b="Z";return 84>=a&&a>=72?b="X":72>a&&a>=64?b="W":64>a&&a>=56?b="V":56>a&&a>=48?b="U":48>a&&a>=40?b="T":40>a&&a>=32?b="S":32>a&&a>=24?b="R":24>a&&a>=16?b="Q":16>a&&a>=8?b="P":8>a&&a>=0?b="N":0>a&&a>=-8?b="M":-8>a&&a>=-16?b="L":-16>a&&a>=-24?b="K":-24>a&&a>=-32?b="J":-32>a&&a>=-40?b="H":-40>a&&a>=-48?b="G":-48>a&&a>=-56?b="F":-56>a&&a>=-64?b="E":-64>a&&a>=-72?b="D":-72>a&&a>=-80&&(b="C"),b}function i(a,b){var c="00000"+a.easting,d="00000"+a.northing;return a.zoneNumber+a.zoneLetter+j(a.easting,a.northing,a.zoneNumber)+c.substr(c.length-5,b)+d.substr(d.length-5,b)}function j(a,b,c){var d=k(c),e=Math.floor(a/1e5),f=Math.floor(b/1e5)%20;return l(e,f,d)}function k(a){var b=a%q;return 0===b&&(b=q),b}function l(a,b,c){var d=c-1,e=r.charCodeAt(d),f=s.charCodeAt(d),g=e+a-1,h=f+b,i=!1;g>x&&(g=g-x+t-1,i=!0),(g===u||u>e&&g>u||(g>u||u>e)&&i)&&g++,(g===v||v>e&&g>v||(g>v||v>e)&&i)&&(g++,g===u&&g++),g>x&&(g=g-x+t-1),h>w?(h=h-w+t-1,i=!0):i=!1,(h===u||u>f&&h>u||(h>u||u>f)&&i)&&h++,(h===v||v>f&&h>v||(h>v||v>f)&&i)&&(h++,h===u&&h++),h>w&&(h=h-w+t-1);var j=String.fromCharCode(g)+String.fromCharCode(h);return j}function m(a){if(a&&0===a.length)throw"MGRSPoint coverting from nothing";for(var b,c=a.length,d=null,e="",f=0;!/[A-Z]/.test(b=a.charAt(f));){if(f>=2)throw"MGRSPoint bad conversion from: "+a;e+=b,f++}var g=parseInt(e,10);if(0===f||f+3>c)throw"MGRSPoint bad conversion from: "+a;var h=a.charAt(f++);if("A">=h||"B"===h||"Y"===h||h>="Z"||"I"===h||"O"===h)throw"MGRSPoint zone letter "+h+" not handled: "+a;d=a.substring(f,f+=2);for(var i=k(g),j=n(d.charAt(0),i),l=o(d.charAt(1),i);l<p(h);)l+=2e6;var m=c-f;if(m%2!==0)throw"MGRSPoint has to have an even number \nof digits after the zone letter and two 100km letters - front \nhalf for easting meters, second half for \nnorthing meters"+a;var q,r,s,t,u,v=m/2,w=0,x=0;return v>0&&(q=1e5/Math.pow(10,v),r=a.substring(f,f+v),w=parseFloat(r)*q,s=a.substring(f+v),x=parseFloat(s)*q),t=w+j,u=x+l,{easting:t,northing:u,zoneLetter:h,zoneNumber:g,accuracy:q}}function n(a,b){for(var c=r.charCodeAt(b-1),d=1e5,e=!1;c!==a.charCodeAt(0);){if(c++,c===u&&c++,c===v&&c++,c>x){if(e)throw"Bad character: "+a;c=t,e=!0}d+=1e5}return d}function o(a,b){if(a>"V")throw"MGRSPoint given invalid Northing "+a;for(var c=s.charCodeAt(b-1),d=0,e=!1;c!==a.charCodeAt(0);){if(c++,c===u&&c++,c===v&&c++,c>w){if(e)throw"Bad character: "+a;c=t,e=!0}d+=1e5}return d}function p(a){var b;switch(a){case"C":b=11e5;break;case"D":b=2e6;break;case"E":b=28e5;break;case"F":b=37e5;break;case"G":b=46e5;break;case"H":b=55e5;break;case"J":b=64e5;break;case"K":b=73e5;break;case"L":b=82e5;break;case"M":b=91e5;break;case"N":b=0;break;case"P":b=8e5;break;case"Q":b=17e5;break;case"R":b=26e5;break;case"S":b=35e5;break;case"T":b=44e5;break;case"U":b=53e5;break;case"V":b=62e5;break;case"W":b=7e6;break;case"X":b=79e5;break;default:b=-1}if(b>=0)return b;throw"Invalid zone letter: "+a}var q=6,r="AJSAJS",s="AFAFAF",t=65,u=73,v=79,w=86,x=90;c.forward=function(a,b){return b=b||5,i(f({lat:a[1],lon:a[0]}),b)},c.inverse=function(a){var b=g(m(a.toUpperCase()));return b.lat&&b.lon?[b.lon,b.lat,b.lon,b.lat]:[b.left,b.bottom,b.right,b.top]},c.toPoint=function(a){var b=g(m(a.toUpperCase()));return b.lat&&b.lon?[b.lon,b.lat]:[(b.left+b.right)/2,(b.top+b.bottom)/2]}},{}],69:[function(a,b,c){b.exports={name:"proj4",version:"2.3.15",description:"Proj4js is a JavaScript library to transform point coordinates from one coordinate system to another, including datum transformations.",main:"lib/index.js",directories:{test:"test",doc:"docs"},scripts:{test:"./node_modules/istanbul/lib/cli.js test ./node_modules/mocha/bin/_mocha test/test.js"},repository:{type:"git",url:"git://github.com/proj4js/proj4js.git"},author:"",license:"MIT",jam:{main:"dist/proj4.js",include:["dist/proj4.js","README.md","AUTHORS","LICENSE.md"]},devDependencies:{"grunt-cli":"~0.1.13",grunt:"~0.4.2","grunt-contrib-connect":"~0.6.0","grunt-contrib-jshint":"~0.8.0",chai:"~1.8.1",mocha:"~1.17.1","grunt-mocha-phantomjs":"~0.4.0",browserify:"~12.0.1","grunt-browserify":"~4.0.1","grunt-contrib-uglify":"~0.11.1",curl:"git://github.com/cujojs/curl.git",istanbul:"~0.2.4",tin:"~0.4.0"},dependencies:{mgrs:"~0.0.2"}}},{}]},{},[36])(36)});

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _proj = __webpack_require__(5);
	
	var Proj4js = _interopRequireWildcard(_proj);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	/**
	  Initialize Transverse Mercator projection
	*/
	
	Proj4js.Proj.tmerc = {
	  init: function init() {
	    this.e0 = Proj4js.common.e0fn(this.es);
	    this.e1 = Proj4js.common.e1fn(this.es);
	    this.e2 = Proj4js.common.e2fn(this.es);
	    this.e3 = Proj4js.common.e3fn(this.es);
	    this.ml0 = this.a * Proj4js.common.mlfn(this.e0, this.e1, this.e2, this.e3, this.lat0);
	  },
	
	  /**
	    Transverse Mercator Forward  - long/lat to x/y
	    long/lat in radians
	  */
	  forward: function forward(p) {
	    var lon = p.x;
	    var lat = p.y;
	
	    var delta_lon = Proj4js.common.adjust_lon(lon - this.long0); // Delta longitude
	    var con; // cone constant
	    var x, y;
	    var sin_phi = Math.sin(lat);
	    var cos_phi = Math.cos(lat);
	
	    if (this.sphere) {
	      /* spherical form */
	      var b = cos_phi * Math.sin(delta_lon);
	      if (Math.abs(Math.abs(b) - 1.0) < .0000000001) {
	        Proj4js.reportError("tmerc:forward: Point projects into infinity");
	        return 93;
	      } else {
	        x = .5 * this.a * this.k0 * Math.log((1.0 + b) / (1.0 - b));
	        con = Math.acos(cos_phi * Math.cos(delta_lon) / Math.sqrt(1.0 - b * b));
	        if (lat < 0) con = -con;
	        y = this.a * this.k0 * (con - this.lat0);
	      }
	    } else {
	      var al = cos_phi * delta_lon;
	      var als = Math.pow(al, 2);
	      var c = this.ep2 * Math.pow(cos_phi, 2);
	      var tq = Math.tan(lat);
	      var t = Math.pow(tq, 2);
	      con = 1.0 - this.es * Math.pow(sin_phi, 2);
	      var n = this.a / Math.sqrt(con);
	      var ml = this.a * Proj4js.common.mlfn(this.e0, this.e1, this.e2, this.e3, lat);
	
	      x = this.k0 * n * al * (1.0 + als / 6.0 * (1.0 - t + c + als / 20.0 * (5.0 - 18.0 * t + Math.pow(t, 2) + 72.0 * c - 58.0 * this.ep2))) + this.x0;
	      y = this.k0 * (ml - this.ml0 + n * tq * (als * (0.5 + als / 24.0 * (5.0 - t + 9.0 * c + 4.0 * Math.pow(c, 2) + als / 30.0 * (61.0 - 58.0 * t + Math.pow(t, 2) + 600.0 * c - 330.0 * this.ep2))))) + this.y0;
	    }
	    p.x = x;p.y = y;
	    return p;
	  }, // tmercFwd()
	
	  /**
	    Transverse Mercator Inverse  -  x/y to long/lat
	  */
	  inverse: function inverse(p) {
	    var con, phi; /* temporary angles       */
	    var delta_phi; /* difference between longitudes    */
	    var i;
	    var max_iter = 6; /* maximun number of iterations */
	    var lat, lon;
	
	    if (this.sphere) {
	      /* spherical form */
	      var f = Math.exp(p.x / (this.a * this.k0));
	      var g = .5 * (f - 1 / f);
	      var temp = this.lat0 + p.y / (this.a * this.k0);
	      var h = Math.cos(temp);
	      con = Math.sqrt((1.0 - h * h) / (1.0 + g * g));
	      lat = Proj4js.common.asinz(con);
	      if (temp < 0) lat = -lat;
	      if (g == 0 && h == 0) {
	        lon = this.long0;
	      } else {
	        lon = Proj4js.common.adjust_lon(Math.atan2(g, h) + this.long0);
	      }
	    } else {
	      // ellipsoidal form
	      var x = p.x - this.x0;
	      var y = p.y - this.y0;
	
	      con = (this.ml0 + y / this.k0) / this.a;
	      phi = con;
	      for (i = 0; true; i++) {
	        delta_phi = (con + this.e1 * Math.sin(2.0 * phi) - this.e2 * Math.sin(4.0 * phi) + this.e3 * Math.sin(6.0 * phi)) / this.e0 - phi;
	        phi += delta_phi;
	        if (Math.abs(delta_phi) <= Proj4js.common.EPSLN) break;
	        if (i >= max_iter) {
	          Proj4js.reportError("tmerc:inverse: Latitude failed to converge");
	          return 95;
	        }
	      } // for()
	      if (Math.abs(phi) < Proj4js.common.HALF_PI) {
	        // sincos(phi, &sin_phi, &cos_phi);
	        var sin_phi = Math.sin(phi);
	        var cos_phi = Math.cos(phi);
	        var tan_phi = Math.tan(phi);
	        var c = this.ep2 * Math.pow(cos_phi, 2);
	        var cs = Math.pow(c, 2);
	        var t = Math.pow(tan_phi, 2);
	        var ts = Math.pow(t, 2);
	        con = 1.0 - this.es * Math.pow(sin_phi, 2);
	        var n = this.a / Math.sqrt(con);
	        var r = n * (1.0 - this.es) / con;
	        var d = x / (n * this.k0);
	        var ds = Math.pow(d, 2);
	        lat = phi - n * tan_phi * ds / r * (0.5 - ds / 24.0 * (5.0 + 3.0 * t + 10.0 * c - 4.0 * cs - 9.0 * this.ep2 - ds / 30.0 * (61.0 + 90.0 * t + 298.0 * c + 45.0 * ts - 252.0 * this.ep2 - 3.0 * cs)));
	        lon = Proj4js.common.adjust_lon(this.long0 + d * (1.0 - ds / 6.0 * (1.0 + 2.0 * t + c - ds / 20.0 * (5.0 - 2.0 * c + 28.0 * t - 3.0 * cs + 8.0 * this.ep2 + 24.0 * ts))) / cos_phi);
	      } else {
	        lat = Proj4js.common.HALF_PI * Proj4js.common.sign(y);
	        lon = this.long0;
	      }
	    }
	    p.x = lon;
	    p.y = lat;
	    return p;
	  } // tmercInv()
	}; /*******************************************************************************
	   NAME                            TRANSVERSE MERCATOR
	   
	   PURPOSE:	Transforms input longitude and latitude to Easting and
	   		Northing for the Transverse Mercator projection.  The
	   		longitude and latitude must be in radians.  The Easting
	   		and Northing values will be returned in meters.
	   
	   ALGORITHM REFERENCES
	   
	   1.  Snyder, John P., "Map Projections--A Working Manual", U.S. Geological
	       Survey Professional Paper 1395 (Supersedes USGS Bulletin 1532), United
	       State Government Printing Office, Washington D.C., 1987.
	   
	   2.  Snyder, John P. and Voxland, Philip M., "An Album of Map Projections",
	       U.S. Geological Survey Professional Paper 1453 , United State Government
	       Printing Office, Washington D.C., 1989.
	   *******************************************************************************/

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _proj = __webpack_require__(5);
	
	var Proj4js = _interopRequireWildcard(_proj);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	/*******************************************************************************
	NAME                            MERCATOR
	
	PURPOSE:	Transforms input longitude and latitude to Easting and
			Northing for the Mercator projection.  The
			longitude and latitude must be in radians.  The Easting
			and Northing values will be returned in meters.
	
	PROGRAMMER              DATE
	----------              ----
	D. Steinwand, EROS      Nov, 1991
	T. Mittan		Mar, 1993
	
	ALGORITHM REFERENCES
	
	1.  Snyder, John P., "Map Projections--A Working Manual", U.S. Geological
	    Survey Professional Paper 1395 (Supersedes USGS Bulletin 1532), United
	    State Government Printing Office, Washington D.C., 1987.
	
	2.  Snyder, John P. and Voxland, Philip M., "An Album of Map Projections",
	    U.S. Geological Survey Professional Paper 1453 , United State Government
	    Printing Office, Washington D.C., 1989.
	*******************************************************************************/
	
	//static double r_major = a;		   /* major axis 				*/
	//static double r_minor = b;		   /* minor axis 				*/
	//static double lon_center = long0;	   /* Center longitude (projection center) */
	//static double lat_origin =  lat0;	   /* center latitude			*/
	//static double e,es;		           /* eccentricity constants		*/
	//static double m1;		               /* small value m			*/
	//static double false_northing = y0;   /* y offset in meters			*/
	//static double false_easting = x0;	   /* x offset in meters			*/
	//scale_fact = k0 
	
	Proj4js.Proj.merc = {
	  init: function init() {
	    //?this.temp = this.r_minor / this.r_major;
	    //this.temp = this.b / this.a;
	    //this.es = 1.0 - Math.sqrt(this.temp);
	    //this.e = Math.sqrt( this.es );
	    //?this.m1 = Math.cos(this.lat_origin) / (Math.sqrt( 1.0 - this.es * Math.sin(this.lat_origin) * Math.sin(this.lat_origin)));
	    //this.m1 = Math.cos(0.0) / (Math.sqrt( 1.0 - this.es * Math.sin(0.0) * Math.sin(0.0)));
	    if (this.lat_ts) {
	      if (this.sphere) {
	        this.k0 = Math.cos(this.lat_ts);
	      } else {
	        this.k0 = Proj4js.common.msfnz(this.es, Math.sin(this.lat_ts), Math.cos(this.lat_ts));
	      }
	    }
	  },
	
	  /* Mercator forward equations--mapping lat,long to x,y
	    --------------------------------------------------*/
	
	  forward: function forward(p) {
	    //alert("ll2m coords : "+coords);
	    var lon = p.x;
	    var lat = p.y;
	    // convert to radians
	    if (lat * Proj4js.common.R2D > 90.0 && lat * Proj4js.common.R2D < -90.0 && lon * Proj4js.common.R2D > 180.0 && lon * Proj4js.common.R2D < -180.0) {
	      Proj4js.reportError("merc:forward: llInputOutOfRange: " + lon + " : " + lat);
	      return null;
	    }
	
	    var x, y;
	    if (Math.abs(Math.abs(lat) - Proj4js.common.HALF_PI) <= Proj4js.common.EPSLN) {
	      Proj4js.reportError("merc:forward: ll2mAtPoles");
	      return null;
	    } else {
	      if (this.sphere) {
	        x = this.x0 + this.a * this.k0 * Proj4js.common.adjust_lon(lon - this.long0);
	        y = this.y0 + this.a * this.k0 * Math.log(Math.tan(Proj4js.common.FORTPI + 0.5 * lat));
	      } else {
	        var sinphi = Math.sin(lat);
	        var ts = Proj4js.common.tsfnz(this.e, lat, sinphi);
	        x = this.x0 + this.a * this.k0 * Proj4js.common.adjust_lon(lon - this.long0);
	        y = this.y0 - this.a * this.k0 * Math.log(ts);
	      }
	      p.x = x;
	      p.y = y;
	      return p;
	    }
	  },
	
	  /* Mercator inverse equations--mapping x,y to lat/long
	  --------------------------------------------------*/
	  inverse: function inverse(p) {
	
	    var x = p.x - this.x0;
	    var y = p.y - this.y0;
	    var lon, lat;
	
	    if (this.sphere) {
	      lat = Proj4js.common.HALF_PI - 2.0 * Math.atan(Math.exp(-y / this.a * this.k0));
	    } else {
	      var ts = Math.exp(-y / (this.a * this.k0));
	      lat = Proj4js.common.phi2z(this.e, ts);
	      if (lat == -9999) {
	        Proj4js.reportError("merc:inverse: lat = -9999");
	        return null;
	      }
	    }
	    lon = Proj4js.common.adjust_lon(this.long0 + x / (this.a * this.k0));
	
	    p.x = lon;
	    p.y = lat;
	    return p;
	  }
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _proj = __webpack_require__(5);
	
	var proj4 = _interopRequireWildcard(_proj);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	proj4.defs([["EPSG:6330101", "+title= МСК-01 зона 1 Республика Адыгея    +proj=tmerc +lat_0=0 +lon_0=37.98333333333 +k=1 +x_0=1300000 +y_0=-4511057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6330102", "+title= МСК-01 зона 2 Республика Адыгея    +proj=tmerc +lat_0=0 +lon_0=40.98333333333 +k=1 +x_0=2300000 +y_0=-4511057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6330201", "+title= МСК-02 зона 1 Республика Башкортостан    +proj=tmerc +lat_0=0 +lon_0=55.03333333333 +k=1 +x_0=1300000 +y_0=-5409414.70 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6330202", "+title= МСК-02 зона 2 Республика Башкортостан    +proj=tmerc +lat_0=0 +lon_0=58.03333333333 +k=1 +x_0=2300000 +y_0=-5409414.70 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6330301", "+title= МСК-03 зона 1 Республика Бурятия    +proj=tmerc +lat_0=0 +lon_0=100.03333333333 +k=1 +x_0=1250000 +y_0=-5211057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6330302", "+title= МСК-03 зона 2 Республика Бурятия    +proj=tmerc +lat_0=0 +lon_0=103.03333333333 +k=1 +x_0=2250000 +y_0=-5211057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6330303", "+title= МСК-03 зона 3 Республика Бурятия    +proj=tmerc +lat_0=0 +lon_0=106.03333333333 +k=1 +x_0=3250000 +y_0=-5211057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6330304", "+title= МСК-03 зона 4 Республика Бурятия    +proj=tmerc +lat_0=0 +lon_0=109.03333333333 +k=1 +x_0=4250000 +y_0=-5211057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6330305", "+title= МСК-03 зона 5 Республика Бурятия    +proj=tmerc +lat_0=0 +lon_0=112.03333333333 +k=1 +x_0=5250000 +y_0=-5211057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6330306", "+title= МСК-03 зона 6 Республика Бурятия    +proj=tmerc +lat_0=0 +lon_0=115.03333333333 +k=1 +x_0=6250000 +y_0=-5211057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6330307", "+title= МСК-03 зона 7 Республика Бурятия    +proj=tmerc +lat_0=0 +lon_0=118.03333333333 +k=1 +x_0=7250000 +y_0=-5211057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6330401", "+title= МСК-04 зона 1 Республика Алтай    +proj=tmerc +lat_0=0 +lon_0=85.46666666666 +k=1 +x_0=1300000 +y_0=-5112900.56 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6330402", "+title= МСК-04 зона 2 Республика Алтай    +proj=tmerc +lat_0=0 +lon_0=88.46666666666 +k=1 +x_0=2300000 +y_0=-5112900.56 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6330501", "+title= МСК-05 зона 1 Республика Дагестан    +proj=tmerc +lat_0=0 +lon_0=46.98333333333 +k=1 +x_0=4300000 +y_0=-11057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6330601", "+title= МСК-06 зона 1 Республика Ингушетия    +proj=tmerc +lat_0=0 +lon_0=43.98333333333 +k=1 +x_0=1300000 +y_0=-4311057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6330701", "+title= МСК-07 зона 1 Кабардино-Балкарская Республика    +proj=tmerc +lat_0=0 +lon_0=43.98333333333 +k=1 +x_0=1300000 +y_0=-4311057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6330801", "+title= МСК-08 зона 1 Республика Калмыкия    +proj=tmerc +lat_0=0 +lon_0=40.98333333333 +k=1 +x_0=1300000 +y_0=-4711057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6330802", "+title= МСК-08 зона 2 Республика Калмыкия    +proj=tmerc +lat_0=0 +lon_0=43.98333333333 +k=1 +x_0=2300000 +y_0=-4711057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6330803", "+title= МСК-08 зона 3 Республика Калмыкия    +proj=tmerc +lat_0=0 +lon_0=46.98333333333 +k=1 +x_0=3300000 +y_0=-4711057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6330901", "+title= МСК-09 зона 1 Республика Карачаево-Черкесия    +proj=tmerc +lat_0=0 +lon_0=40.98333333333 +k=1 +x_0=1300000 +y_0=-4311057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6361001", "+title= МСК-10 зона 1 (6 градусная) Республика Карелия    +proj=tmerc +lat_0=0 +lon_0=32.03333333333 +k=1 +x_0=1400000 +y_0=-6511057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6361002", "+title= МСК-10 зона 2 (6 градусная) Республика Карелия    +proj=tmerc +lat_0=0 +lon_0=38.03333333333 +k=1 +x_0=2400000 +y_0=-6511057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6331101", "+title= МСК-11 зона 1 Республика Коми    +proj=tmerc +lat_0=0 +lon_0=41.03333333333 +k=1 +x_0=1400000 +y_0=-6211057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6331102", "+title= МСК-11 зона 2 Республика Коми    +proj=tmerc +lat_0=0 +lon_0=44.03333333333 +k=1 +x_0=2400000 +y_0=-6211057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6331103", "+title= МСК-11 зона 3 Республика Коми    +proj=tmerc +lat_0=0 +lon_0=47.03333333333 +k=1 +x_0=3400000 +y_0=-6211057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6331104", "+title= МСК-11 зона 4 Республика Коми    +proj=tmerc +lat_0=0 +lon_0=50.03333333333 +k=1 +x_0=4400000 +y_0=-6211057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6331105", "+title= МСК-11 зона 5 Республика Коми    +proj=tmerc +lat_0=0 +lon_0=53.03333333333 +k=1 +x_0=5400000 +y_0=-6211057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6331106", "+title= МСК-11 зона 6 Республика Коми    +proj=tmerc +lat_0=0 +lon_0=56.03333333333 +k=1 +x_0=6400000 +y_0=-6211057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6331107", "+title= МСК-11 зона 7 Республика Коми    +proj=tmerc +lat_0=0 +lon_0=59.03333333333 +k=1 +x_0=7400000 +y_0=-6211057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6331108", "+title= МСК-11 зона 8 Республика Коми    +proj=tmerc +lat_0=0 +lon_0=62.03333333333 +k=1 +x_0=8400000 +y_0=-6211057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6331109", "+title= МСК-11 зона 9 Республика Коми    +proj=tmerc +lat_0=0 +lon_0=65.03333333333 +k=1 +x_0=9400000 +y_0=-6211057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6331201", "+title= МСК-12 зона 1 Республика Марий Эл    +proj=tmerc +lat_0=0 +lon_0=47.55 +k=1 +x_0=1250000 +y_0=-5914743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6331202", "+title= МСК-12 зона 2 Республика Марий Эл    +proj=tmerc +lat_0=0 +lon_0=50.55 +k=1 +x_0=2250000 +y_0=-5914743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6331301", "+title= МСК-13 зона 1 Республика Мордовия    +proj=tmerc +lat_0=0 +lon_0=44.55 +k=1 +x_0=1250000 +y_0=-5614743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6331302", "+title= МСК-13 зона 2 Республика Мордовия    +proj=tmerc +lat_0=0 +lon_0=47.55 +k=1 +x_0=2250000 +y_0=-5614743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6361401", "+title= МСК-14 зона 1 (6 градусная) Республика Саха (Якутия)    +proj=tmerc +lat_0=0 +lon_0=108.45 +k=1 +x_0=1400000 +y_0=-5912900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6361402", "+title= МСК-14 зона 2 (6 градусная) Республика Саха (Якутия)    +proj=tmerc +lat_0=0 +lon_0=114.45 +k=1 +x_0=2400000 +y_0=-5912900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6361403", "+title= МСК-14 зона 3 (6 градусная) Республика Саха (Якутия)    +proj=tmerc +lat_0=0 +lon_0=120.45 +k=1 +x_0=3400000 +y_0=-5912900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6361404", "+title= МСК-14 зона 4 (6 градусная) Республика Саха (Якутия)    +proj=tmerc +lat_0=0 +lon_0=126.45 +k=1 +x_0=4400000 +y_0=-5912900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6361405", "+title= МСК-14 зона 5 (6 градусная) Республика Саха (Якутия)    +proj=tmerc +lat_0=0 +lon_0=132.45 +k=1 +x_0=5400000 +y_0=-5912900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6361406", "+title= МСК-14 зона 6 (6 градусная) Республика Саха (Якутия)    +proj=tmerc +lat_0=0 +lon_0=138.45 +k=1 +x_0=6400000 +y_0=-5912900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6361407", "+title= МСК-14 зона 7 (6 градусная) Республика Саха (Якутия)    +proj=tmerc +lat_0=0 +lon_0=144.45 +k=1 +x_0=7400000 +y_0=-5912900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6361408", "+title= МСК-14 зона 8 (6 градусная) Республика Саха (Якутия)    +proj=tmerc +lat_0=0 +lon_0=150.45 +k=1 +x_0=8400000 +y_0=-5912900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6361409", "+title= МСК-14 зона 9 (6 градусная) Республика Саха (Якутия)    +proj=tmerc +lat_0=0 +lon_0=156.45 +k=1 +x_0=9400000 +y_0=-5912900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6331501", "+title= МСК-15 зона 1 Северная Осетия - Алания    +proj=tmerc +lat_0=0 +lon_0=43.98333333333 +k=1 +x_0=1300000 +y_0=-4311057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6331601", "+title= МСК-16 зона 1 Республика Татарстан    +proj=tmerc +lat_0=0 +lon_0=49.033333333333 +k=1 +x_0=1300000 +y_0=-5709414.70 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6331602", "+title= МСК-16 зона 2 Республика Татарстан    +proj=tmerc +lat_0=0 +lon_0=52.033333333333 +k=1 +x_0=2300000 +y_0=-5709414.70 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6331603", "+title= МСК-16 зона 3 Республика Татарстан    +proj=tmerc +lat_0=0 +lon_0=55.033333333333 +k=1 +x_0=3300000 +y_0=-5709414.70 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6331801", "+title= МСК-18 зона 1 Удмуртская Республика    +proj=tmerc +lat_0=0 +lon_0=50.55 +k=1 +x_0=1250000 +y_0=-5914743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6331802", "+title= МСК-18 зона 2 Удмуртская Республика    +proj=tmerc +lat_0=0 +lon_0=53.55 +k=1 +x_0=2250000 +y_0=-5914743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6332001", "+title= МСК-20 зона 1 Чеченская Республика    +proj=tmerc +lat_0=0 +lon_0=43.98333333333 +k=1 +x_0=1300000 +y_0=-4311057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6332002", "+title= МСК-20 зона 2 Чеченская Республика    +proj=tmerc +lat_0=0 +lon_0=46.98333333333 +k=1 +x_0=2300000 +y_0=-4311057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6332101", "+title= МСК-21 зона 1 Чувашская Республика    +proj=tmerc +lat_0=0 +lon_0=47.55 +k=1 +x_0=1250000 +y_0=-5814743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6332102", "+title= МСК-21 зона 2 Чувашская Республика    +proj=tmerc +lat_0=0 +lon_0=50.55 +k=1 +x_0=2250000 +y_0=-5814743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6332201", "+title= МСК-22 зона 1 Алтайский край    +proj=tmerc +lat_0=0 +lon_0=79.46666666666 +k=1 +x_0=1300000 +y_0=-5312900.56 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6332202", "+title= МСК-22 зона 2 Алтайский край    +proj=tmerc +lat_0=0 +lon_0=82.46666666666 +k=1 +x_0=2300000 +y_0=-5312900.56 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6332203", "+title= МСК-22 зона 3 Алтайский край    +proj=tmerc +lat_0=0 +lon_0=85.46666666666 +k=1 +x_0=3300000 +y_0=-5312900.56 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6332301", "+title= МСК-23 зона 1 Краснодарский край    +proj=tmerc +lat_0=0 +lon_0=37.98333333333 +k=1 +x_0=1300000 +y_0=-4511057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6332302", "+title= МСК-23 зона 2 Краснодарский край    +proj=tmerc +lat_0=0 +lon_0=40.98333333333 +k=1 +x_0=2300000 +y_0=-4511057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6362401", "+title= МСК-24 зона 1 (6 градусная) Красноярский край    +proj=tmerc +lat_0=0 +lon_0=81.51666666666 +k=1 +x_0=1500000 +y_0=-5416586.442 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6362402", "+title= МСК-24 зона 2 (6 градусная) Красноярский край    +proj=tmerc +lat_0=0 +lon_0=87.51666666666 +k=1 +x_0=2500000 +y_0=-5416586.442 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6362403", "+title= МСК-24 зона 3 (6 градусная) Красноярский край    +proj=tmerc +lat_0=0 +lon_0=93.51666666666 +k=1 +x_0=3500000 +y_0=-5416586.442 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6362404", "+title= МСК-24 зона 4 (6 градусная) Красноярский край    +proj=tmerc +lat_0=0 +lon_0=99.51666666666 +k=1 +x_0=4500000 +y_0=-5416586.442 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6362405", "+title= МСК-24 зона 5 (6 градусная) Красноярский край    +proj=tmerc +lat_0=0 +lon_0=105.51666666666 +k=1 +x_0=5500000 +y_0=-5416586.442 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6362406", "+title= МСК-24 зона 6 (6 градусная) Красноярский край    +proj=tmerc +lat_0=0 +lon_0=111.51666666666 +k=1 +x_0=6500000 +y_0=-5416586.442 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6302400", "+title= МСК г. Красноярск    +proj=tmerc +lat_0=0 +lon_0=93 +k=1 +x_0=54304.47 +y_0=-6196680.59 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6302464", "+title= МСК-164 Красноярский край    +proj=tmerc +lat_0=0 +lon_0=84 +k=1 +x_0=86209.80 +y_0=-6542783.50 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6302465", "+title= МСК-165 Красноярский край    +proj=tmerc +lat_0=0 +lon_0=87 +k=1 +x_0=105295.80 +y_0=-5652185.00 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6302466", "+title= МСК-166 Красноярский край    +proj=tmerc +lat_0=0 +lon_0=90 +k=1 +x_0=107543.30 +y_0=-5540944.50 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6302467", "+title= МСК-167 Красноярский край    +proj=tmerc +lat_0=0 +lon_0=93 +k=1 +x_0=106797.80 +y_0=-5578022.50 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6302468", "+title= МСК-168 Красноярский край    +proj=tmerc +lat_0=0 +lon_0=96 +k=1 +x_0=108285.20 +y_0=-5503868.60 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6302469", "+title= МСК-169 Красноярский край    +proj=tmerc +lat_0=0 +lon_0=99 +k=1 +x_0=117308.60 +y_0=-5503868.60 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6332501", "+title= МСК-25 зона 1 Приморский край    +proj=tmerc +lat_0=0 +lon_0=130.71666666666 +k=1 +x_0=1300000 +y_0=-4416586.44 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6332502", "+title= МСК-25 зона 2 Приморский край    +proj=tmerc +lat_0=0 +lon_0=133.71666666666 +k=1 +x_0=2300000 +y_0=-4416586.44 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6332503", "+title= МСК-25 зона 3 Приморский край    +proj=tmerc +lat_0=0 +lon_0=136.71666666666 +k=1 +x_0=3300000 +y_0=-4416586.44 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6332504", "+title= МСК-25 зона 4 Приморский край    +proj=tmerc +lat_0=0 +lon_0=139.71666666666 +k=1 +x_0=4300000 +y_0=-4416586.44 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6332601", "+title= МСК-26 зона 1 Ставропольский край    +proj=tmerc +lat_0=0 +lon_0=40.98333333333 +k=1 +x_0=1300000 +y_0=-4511057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6332602", "+title= МСК-26 зона 2 Ставропольский край    +proj=tmerc +lat_0=0 +lon_0=43.98333333333 +k=1 +x_0=2300000 +y_0=-4511057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6332701", "+title= МСК-27 зона 1 Хабаровский край    +proj=tmerc +lat_0=0 +lon_0=130.71666666666 +k=1 +x_0=1300000 +y_0=-4916586.44 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6332702", "+title= МСК-27 зона 2 Хабаровский край    +proj=tmerc +lat_0=0 +lon_0=133.71666666666 +k=1 +x_0=2300000 +y_0=-4916586.44 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6332703", "+title= МСК-27 зона 3 Хабаровский край    +proj=tmerc +lat_0=0 +lon_0=136.71666666666 +k=1 +x_0=3300000 +y_0=-4916586.44 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6332704", "+title= МСК-27 зона 4 Хабаровский край    +proj=tmerc +lat_0=0 +lon_0=139.71666666666 +k=1 +x_0=4300000 +y_0=-4916586.44 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6332705", "+title= МСК-27 зона 5 Хабаровский край    +proj=tmerc +lat_0=0 +lon_0=142.71666666666 +k=1 +x_0=5300000 +y_0=-4916586.44 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6332706", "+title= МСК-27 зона 6 Хабаровский край    +proj=tmerc +lat_0=0 +lon_0=145.71666666666 +k=1 +x_0=6300000 +y_0=-4916586.44 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6332801", "+title= МСК-28 зона 1 Амурская область    +proj=tmerc +lat_0=0 +lon_0=121.71666666666 +k=1 +x_0=1300000 +y_0=-5116586.44 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6332802", "+title= МСК-28 зона 2 Амурская область    +proj=tmerc +lat_0=0 +lon_0=124.71666666666 +k=1 +x_0=2300000 +y_0=-5116586.44 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6332803", "+title= МСК-28 зона 3 Амурская область    +proj=tmerc +lat_0=0 +lon_0=127.71666666666 +k=1 +x_0=3300000 +y_0=-5116586.44 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6332804", "+title= МСК-28 зона 4 Амурская область    +proj=tmerc +lat_0=0 +lon_0=130.71666666666 +k=1 +x_0=4300000 +y_0=-5116586.44 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6332805", "+title= МСК-28 зона 5 Амурская область    +proj=tmerc +lat_0=0 +lon_0=133.71666666666 +k=1 +x_0=5300000 +y_0=-5116586.44 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6362901", "+title= МСК-29 зона 1 (6 градусная) Архангельская область    +proj=tmerc +lat_0=0 +lon_0=32.03333333333 +k=1 +x_0=1400000 +y_0=-6511057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6362902", "+title= МСК-29 зона 2 (6 градусная) Архангельская область    +proj=tmerc +lat_0=0 +lon_0=38.03333333333 +k=1 +x_0=2400000 +y_0=-6511057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6362903", "+title= МСК-29 зона 3 (6 градусная) Архангельская область    +proj=tmerc +lat_0=0 +lon_0=44.03333333333 +k=1 +x_0=3400000 +y_0=-6511057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6362904", "+title= МСК-29 зона 4 (6 градусная) Архангельская область    +proj=tmerc +lat_0=0 +lon_0=50.03333333333 +k=1 +x_0=4400000 +y_0=-6511057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6333001", "+title= МСК-30 зона 1 Астраханская область    +proj=tmerc +lat_0=0 +lon_0=46.05 +k=1 +x_0=1300000 +y_0=-4714743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6333002", "+title= МСК-30 зона 2 Астраханская область    +proj=tmerc +lat_0=0 +lon_0=49.05 +k=1 +x_0=2300000 +y_0=-4714743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6333101", "+title= МСК-31 зона 1 Белгородская область    +proj=tmerc +lat_0=0 +lon_0=35.48333333333 +k=1 +x_0=1250000 +y_0=-5212900.56 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6333102", "+title= МСК-31 зона 2 Белгородская область    +proj=tmerc +lat_0=0 +lon_0=38.48333333333 +k=1 +x_0=2250000 +y_0=-5212900.56 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6333201", "+title= МСК-32 зона 1 Брянская область    +proj=tmerc +lat_0=0 +lon_0=32.48333333333 +k=1 +x_0=1250000 +y_0=-5412900.56 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6333202", "+title= МСК-32 зона 2 Брянская область    +proj=tmerc +lat_0=0 +lon_0=35.48333333333 +k=1 +x_0=2250000 +y_0=-5412900.56 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6333301", "+title= МСК-33 от СК-63 зона 1 Владимирская область    +proj=tmerc +lat_0=0 +lon_0=38.55 +k=1 +x_0=1250000 +y_0=-5814743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6333302", "+title= МСК-33 от СК-63 зона 2 Владимирская область    +proj=tmerc +lat_0=0 +lon_0=41.55 +k=1 +x_0=2250000 +y_0=-5814743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6333303", "+title= МСК-33 от СК-63 зона 3 Владимирская область    +proj=tmerc +lat_0=0 +lon_0=44.55 +k=1 +x_0=3250000 +y_0=-5814743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:9503300", "+title= МСК-33 от СК-95 Владимирская область    +proj=tmerc +lat_0=0 +lon_0=39 +k=1 +x_0=134156.988 +y_0=-6032524.376 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6333401", "+title= МСК-34 зона 1 Волгоградская область    +proj=tmerc +lat_0=0 +lon_0=43.05 +k=1 +x_0=1300000 +y_0=-4914743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6333402", "+title= МСК-34 зона 2 Волгоградская область    +proj=tmerc +lat_0=0 +lon_0=46.05 +k=1 +x_0=2300000 +y_0=-4914743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6333501", "+title= МСК-35 зона 1 Вологодская область    +proj=tmerc +lat_0=0 +lon_0=35.55 +k=1 +x_0=1250000 +y_0=-6214743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6333502", "+title= МСК-35 зона 2 Вологодская область    +proj=tmerc +lat_0=0 +lon_0=38.55 +k=1 +x_0=2250000 +y_0=-6214743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6333503", "+title= МСК-35 зона 3 Вологодская область    +proj=tmerc +lat_0=0 +lon_0=41.55 +k=1 +x_0=3250000 +y_0=-6214743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6333504", "+title= МСК-35 зона 4 Вологодская область    +proj=tmerc +lat_0=0 +lon_0=44.55 +k=1 +x_0=4250000 +y_0=-6214743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6333601", "+title= МСК-36 зона 1 Воронежская область    +proj=tmerc +lat_0=0 +lon_0=38.48333333333 +k=1 +x_0=1250000 +y_0=-5212900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6333602", "+title= МСК-36 зона 2 Воронежская область    +proj=tmerc +lat_0=0 +lon_0=41.48333333333 +k=1 +x_0=2250000 +y_0=-5212900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6333701", "+title= МСК-37 зона 1 Ивановская область    +proj=tmerc +lat_0=0 +lon_0=38.55 +k=1 +x_0=1250000 +y_0=-6014743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6333702", "+title= МСК-37 зона 2 Ивановская область    +proj=tmerc +lat_0=0 +lon_0=41.55 +k=1 +x_0=2250000 +y_0=-6014743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6333801", "+title= МСК-38 зона 1 Иркутская область    +proj=tmerc +lat_0=0 +lon_0=97.03333333333 +k=1 +x_0=1250000 +y_0=-5411057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6333802", "+title= МСК-38 зона 2 Иркутская область    +proj=tmerc +lat_0=0 +lon_0=100.03333333333 +k=1 +x_0=2250000 +y_0=-5411057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6333803", "+title= МСК-38 зона 3 Иркутская область    +proj=tmerc +lat_0=0 +lon_0=103.03333333333 +k=1 +x_0=3250000 +y_0=-5411057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6333804", "+title= МСК-38 зона 4 Иркутская область    +proj=tmerc +lat_0=0 +lon_0=106.03333333333 +k=1 +x_0=4250000 +y_0=-5411057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6333805", "+title= МСК-38 зона 5 Иркутская область    +proj=tmerc +lat_0=0 +lon_0=109.03333333333 +k=1 +x_0=5250000 +y_0=-5411057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6333806", "+title= МСК-38 зона 6 Иркутская область    +proj=tmerc +lat_0=0 +lon_0=112.03333333333 +k=1 +x_0=6250000 +y_0=-5411057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6333807", "+title= МСК-38 зона 7 Иркутская область    +proj=tmerc +lat_0=0 +lon_0=115.03333333333 +k=1 +x_0=7250000 +y_0=-5411057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6333808", "+title= МСК-38 зона 8 Иркутская область    +proj=tmerc +lat_0=0 +lon_0=118.03333333333 +k=1 +x_0=8250000 +y_0=-5411057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6333901", "+title= МСК-39 зона 1 Калининградская область    +proj=tmerc +lat_0=0 +lon_0=21.45 +k=1 +x_0=1250000 +y_0=-5711057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6334001", "+title= МСК-40 зона 1 Калужская область    +proj=tmerc +lat_0=0 +lon_0=35.48333333333 +k=1 +x_0=1250000 +y_0=-5612900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6364101", "+title= МСК-41 зона 1 (6 градусная) Камчатский край    +proj=tmerc +lat_0=0 +lon_0=158.46666666667 +k=1 +x_0=1400000 +y_0=-5316586.442 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6364102", "+title= МСК-41 зона 2 (6 градусная) Камчатский край    +proj=tmerc +lat_0=0 +lon_0=164.46666666667 +k=1 +x_0=2400000 +y_0=-5316586.442 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6364103", "+title= МСК-41 зона 3 (6 градусная) Камчатский край    +proj=tmerc +lat_0=0 +lon_0=170.46666666667 +k=1 +x_0=3400000 +y_0=-5316586.442 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6334201", "+title= МСК-42 зона 1 Кемеровская область    +proj=tmerc +lat_0=0 +lon_0=85.46666666666 +k=1 +x_0=1300000 +y_0=-5512900.56 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6334202", "+title= МСК-42 зона 2 Кемеровская область    +proj=tmerc +lat_0=0 +lon_0=88.46666666666 +k=1 +x_0=2300000 +y_0=-5512900.56 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6334301", "+title= МСК-43 зона 1 Кировская область    +proj=tmerc +lat_0=0 +lon_0=47.55 +k=1 +x_0=1250000 +y_0=-5914743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6334302", "+title= МСК-43 зона 2 Кировская область    +proj=tmerc +lat_0=0 +lon_0=50.55 +k=1 +x_0=2250000 +y_0=-5914743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6334303", "+title= МСК-43 зона 3 Кировская область    +proj=tmerc +lat_0=0 +lon_0=53.55 +k=1 +x_0=3250000 +y_0=-5914743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6334401", "+title= МСК-44 зона 1 Костромская область    +proj=tmerc +lat_0=0 +lon_0=41.55 +k=1 +x_0=1250000 +y_0=-6114743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6334402", "+title= МСК-44 зона 2 Костромская область    +proj=tmerc +lat_0=0 +lon_0=44.55 +k=1 +x_0=2250000 +y_0=-6114743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6334403", "+title= МСК-44 зона 3 Костромская область    +proj=tmerc +lat_0=0 +lon_0=47.55 +k=1 +x_0=3250000 +y_0=-6114743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6334501", "+title= МСК-45 зона 1 Курганская область    +proj=tmerc +lat_0=0 +lon_0=61.03333333333 +k=1 +x_0=1300000 +y_0=-5709414.70 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6334502", "+title= МСК-45 зона 2 Курганская область    +proj=tmerc +lat_0=0 +lon_0=64.03333333333 +k=1 +x_0=2300000 +y_0=-5709414.70 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6334503", "+title= МСК-45 зона 3 Курганская область    +proj=tmerc +lat_0=0 +lon_0=67.03333333333 +k=1 +x_0=3300000 +y_0=-5709414.70 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6334601", "+title= МСК-46 зона 1 Курская область    +proj=tmerc +lat_0=0 +lon_0=35.48333333333 +k=1 +x_0=1250000 +y_0=-5312900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6334602", "+title= МСК-46 зона 2 Курская область    +proj=tmerc +lat_0=0 +lon_0=38.48333333333 +k=1 +x_0=2250000 +y_0=-5312900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6334701", "+title= МСК-47 зона 1 Ленинградская область    +proj=tmerc +lat_0=0 +lon_0=27.95 +k=1 +x_0=1250000 +y_0=-6211057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6334702", "+title= МСК-47 зона 2 Ленинградская область    +proj=tmerc +lat_0=0 +lon_0=30.95 +k=1 +x_0=2250000 +y_0=-6211057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6334703", "+title= МСК-47 зона 3 Ленинградская область    +proj=tmerc +lat_0=0 +lon_0=33.95 +k=1 +x_0=3250000 +y_0=-6211057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6331964", "+title= МСК-1964 Санкт-Петербург    +proj=tmerc +lat_0=0 +lon_0=30 +k=1 +x_0=95942.17 +y_0=-6552810.0 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6334801", "+title= МСК-48 зона 1 Липецкая область    +proj=tmerc +lat_0=0 +lon_0=38.48333333333 +k=1 +x_0=1250000 +y_0=-5412900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6334802", "+title= МСК-48 зона 2 Липецкая область    +proj=tmerc +lat_0=0 +lon_0=41.48333333333 +k=1 +x_0=2250000 +y_0=-5412900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6364901", "+title= МСК-49 зона 1 (6 градусная) Магаданская область    +proj=tmerc +lat_0=0 +lon_0=144.45 +k=1 +x_0=1400000 +y_0=-6212900.566  +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6364902", "+title= МСК-49 зона 2 (6 градусная) Магаданская область    +proj=tmerc +lat_0=0 +lon_0=150.45 +k=1 +x_0=2400000 +y_0=-6212900.566  +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6364903", "+title= МСК-49 зона 3 (6 градусная) Магаданская область    +proj=tmerc +lat_0=0 +lon_0=156.45 +k=1 +x_0=3400000 +y_0=-6212900.566  +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6364904", "+title= МСК-49 зона 4 (6 градусная) Магаданская область    +proj=tmerc +lat_0=0 +lon_0=162.45 +k=1 +x_0=4400000 +y_0=-6212900.566  +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6335000", "+title= Московская СК (МГГТ)    +proj=tmerc +lat_0=55.66666666667 +lon_0=37.5 +k=1 +x_0=16.098 +y_0=14.512 +ellps=bessel +towgs84=316.151,78.924,589.650,-1.57273,2.69209,2.34693,8.4507 +units=m +no_defs"], ["EPSG:6335001", "+title= МСК-50 зона 1 Московская область    +proj=tmerc +lat_0=0 +lon_0=35.48333333333 +k=1 +x_0=1250000 +y_0=-5712900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6335002", "+title= МСК-50 зона 2 Московская область    +proj=tmerc +lat_0=0 +lon_0=38.48333333333 +k=1 +x_0=2250000 +y_0=-5712900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6365101", "+title= МСК-51 зона 1 (6 градусная) Мурманская область    +proj=tmerc +lat_0=0 +lon_0=32.03333333333 +k=1 +x_0=1400000 +y_0=-7011057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6365102", "+title= МСК-51 зона 2 (6 градусная) Мурманская область    +proj=tmerc +lat_0=0 +lon_0=38.03333333333 +k=1 +x_0=2400000 +y_0=-7011057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6335201", "+title= МСК-52 зона 1 Нижегородская область    +proj=tmerc +lat_0=0 +lon_0=41.55 +k=1 +x_0=1250000 +y_0=-5714743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6335202", "+title= МСК-52 зона 2 Нижегородская область    +proj=tmerc +lat_0=0 +lon_0=44.55 +k=1 +x_0=2250000 +y_0=-5714743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6335203", "+title= МСК-52 зона 3 Нижегородская область    +proj=tmerc +lat_0=0 +lon_0=47.55 +k=1 +x_0=3250000 +y_0=-5714743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6335301", "+title= МСК-53 зона 1 Новгородская область    +proj=tmerc +lat_0=0 +lon_0=29.48333333333 +k=1 +x_0=1250000 +y_0=-5912900.56 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6335302", "+title= МСК-53 зона 2 Новгородская область    +proj=tmerc +lat_0=0 +lon_0=32.48333333333 +k=1 +x_0=2250000 +y_0=-5912900.56 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6335303", "+title= МСК-53 зона 3 Новгородская область    +proj=tmerc +lat_0=0 +lon_0=35.48333333333 +k=1 +x_0=3250000 +y_0=-5912900.56 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6335401", "+title= МСК-54 зона 1 Новосибирская область    +proj=tmerc +lat_0=0 +lon_0=74.73333333333 +k=1 +x_0=1250000 +y_0=-5612900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6335402", "+title= МСК-54 зона 2 Новосибирская область    +proj=tmerc +lat_0=0 +lon_0=77.73333333333 +k=1 +x_0=2250000 +y_0=-5612900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6335403", "+title= МСК-54 зона 3 Новосибирская область    +proj=tmerc +lat_0=0 +lon_0=80.73333333333 +k=1 +x_0=3250000 +y_0=-5612900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6335404", "+title= МСК-54 зона 4 Новосибирская область    +proj=tmerc +lat_0=0 +lon_0=83.73333333333 +k=1 +x_0=4250000 +y_0=-5612900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6335501", "+title= МСК-55 зона 1 Омская область    +proj=tmerc +lat_0=0 +lon_0=71.73333333333 +k=1 +x_0=1250000 +y_0=-5612900.563 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6335502", "+title= МСК-55 зона 2 Омская область    +proj=tmerc +lat_0=0 +lon_0=74.73333333333 +k=1 +x_0=2250000 +y_0=-5612900.563 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6335601", "+title= МСК-56 зона 1 Оренбургская область    +proj=tmerc +lat_0=0 +lon_0=52.03333333333 +k=1 +x_0=1300000 +y_0=-5309414.70 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6335602", "+title= МСК-56 зона 2 Оренбургская область    +proj=tmerc +lat_0=0 +lon_0=55.03333333333 +k=1 +x_0=2300000 +y_0=-5309414.70 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6335603", "+title= МСК-56 зона 3 Оренбургская область    +proj=tmerc +lat_0=0 +lon_0=58.03333333333 +k=1 +x_0=3300000 +y_0=-5309414.70 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6335604", "+title= МСК-56 зона 4 Оренбургская область    +proj=tmerc +lat_0=0 +lon_0=61.03333333333 +k=1 +x_0=4300000 +y_0=-5309414.70 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6335701", "+title= МСК-57 зона 1 Орловская область    +proj=tmerc +lat_0=0 +lon_0=32.48333333333 +k=1 +x_0=1250000 +y_0=-12900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6335702", "+title= МСК-57 зона 2 Орловская область    +proj=tmerc +lat_0=0 +lon_0=35.48333333333 +k=1 +x_0=2250000 +y_0=-12900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6335703", "+title= МСК-57 зона 3 Орловская область    +proj=tmerc +lat_0=0 +lon_0=38.48333333333 +k=1 +x_0=3250000 +y_0=-12900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6335801", "+title= МСК-58 зона 1 Пензенская область    +proj=tmerc +lat_0=0 +lon_0=43.05 +k=1 +x_0=1300000 +y_0=-5514743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6335802", "+title= МСК-58 зона 2 Пензенская область    +proj=tmerc +lat_0=0 +lon_0=46.05 +k=1 +x_0=2300000 +y_0=-5514743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6335901", "+title= МСК-59 зона 1 Пермский край    +proj=tmerc +lat_0=0 +lon_0=53.55 +k=1 +x_0=1250000 +y_0=-5914743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6335902", "+title= МСК-59 зона 2 Пермский край    +proj=tmerc +lat_0=0 +lon_0=56.55 +k=1 +x_0=2250000 +y_0=-5914743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6335903", "+title= МСК-59 зона 3 Пермский край    +proj=tmerc +lat_0=0 +lon_0=59.55 +k=1 +x_0=3250000 +y_0=-5914743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6336001", "+title= МСК-60 зона 1 Псковская область    +proj=tmerc +lat_0=0 +lon_0=27.95 +k=1 +x_0=1250000 +y_0=-5911057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6336002", "+title= МСК-60 зона 2 Псковская область    +proj=tmerc +lat_0=0 +lon_0=30.95 +k=1 +x_0=2250000 +y_0=-5911057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6336003", "+title= МСК-60 зона 3 Псковская область    +proj=tmerc +lat_0=0 +lon_0=33.95 +k=1 +x_0=3250000 +y_0=-5911057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6336101", "+title= МСК-61 зона 1 Ростовская область    +proj=tmerc +lat_0=0 +lon_0=37.98333333333 +k=1 +x_0=1300000 +y_0=-4811057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6336102", "+title= МСК-61 зона 2 Ростовская область    +proj=tmerc +lat_0=0 +lon_0=40.98333333333 +k=1 +x_0=2300000 +y_0=-4811057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6336103", "+title= МСК-61 зона 3 Ростовская область    +proj=tmerc +lat_0=0 +lon_0=43.98333333333 +k=1 +x_0=3300000 +y_0=-4811057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6336201", "+title= МСК-62 зона 1 Рязанская область    +proj=tmerc +lat_0=0 +lon_0=38.48333333333 +k=1 +x_0=1250000 +y_0=-5612900.56 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6336202", "+title= МСК-62 зона 2 Рязанская область    +proj=tmerc +lat_0=0 +lon_0=41.48333333333 +k=1 +x_0=2250000 +y_0=-5612900.56 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6336203", "+title= МСК-62 зона 3 Рязанская область    +proj=tmerc +lat_0=0 +lon_0=44.48333333333 +k=1 +x_0=3250000 +y_0=-5612900.56 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6336301", "+title= МСК-63 зона 1 Самарская область    +proj=tmerc +lat_0=0 +lon_0=49.03333333333 +k=1 +x_0=1300000 +y_0=-5509414.70 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6336302", "+title= МСК-63 зона 2 Самарская область    +proj=tmerc +lat_0=0 +lon_0=52.03333333333 +k=1 +x_0=2300000 +y_0=-5509414.70 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6336401", "+title= МСК-64 зона 1 Саратовская область    +proj=tmerc +lat_0=0 +lon_0=43.05 +k=1 +x_0=1300000 +y_0=-5214743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6336402", "+title= МСК-64 зона 2 Саратовская область    +proj=tmerc +lat_0=0 +lon_0=46.05 +k=1 +x_0=2300000 +y_0=-5214743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6336403", "+title= МСК-64 зона 3 Саратовская область    +proj=tmerc +lat_0=0 +lon_0=49.05 +k=1 +x_0=3300000 +y_0=-5214743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6336501", "+title= МСК-65 зона 1 Сахалинская область    +proj=tmerc +lat_0=0 +lon_0=142.71666666667 +k=1 +x_0=1300000 +y_0=-4516586.439 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6336601", "+title= МСК-66 зона 1 Свердловская область    +proj=tmerc +lat_0=0 +lon_0=60.05 +k=1 +x_0=1500000 +y_0=-5911057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6336602", "+title= МСК-66 зона 2 Свердловская область    +proj=tmerc +lat_0=0 +lon_0=63.05 +k=1 +x_0=2500000 +y_0=-5911057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6336603", "+title= МСК-66 зона 3 Свердловская область    +proj=tmerc +lat_0=0 +lon_0=66.05 +k=1 +x_0=3500000 +y_0=-5911057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6366601", "+title= МСК-66 зона 1 (6 градусная) Свердловская область    +proj=tmerc +lat_0=0 +lon_0=60.05 +k=1 +x_0=1500000 +y_0=-5911057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6366602", "+title= МСК-66 зона 2 (6 градусная) Свердловская область    +proj=tmerc +lat_0=0 +lon_0=66.05 +k=1 +x_0=2500000 +y_0=-5911057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6336701", "+title= МСК-67 зона 1 Смоленская область    +proj=tmerc +lat_0=0 +lon_0=32.48333333333 +k=1 +x_0=1250000 +y_0=-5612900.56 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6336702", "+title= МСК-67 зона 2 Смоленская область    +proj=tmerc +lat_0=0 +lon_0=35.48333333333 +k=1 +x_0=2250000 +y_0=-5612900.56 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6336703", "+title= МСК-67 зона 3 Смоленская область    +proj=tmerc +lat_0=0 +lon_0=38.48333333333 +k=1 +x_0=3250000 +y_0=-5612900.56 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6336801", "+title= МСК-68 зона 1 Тамбовская область    +proj=tmerc +lat_0=0 +lon_0=41.48333333333 +k=1 +x_0=1250000 +y_0=-5412900.56 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6336802", "+title= МСК-68 зона 2 Тамбовская область    +proj=tmerc +lat_0=0 +lon_0=44.48333333333 +k=1 +x_0=2250000 +y_0=-5412900.56 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6336803", "+title= МСК-68 зона 3 Тамбовская область    +proj=tmerc +lat_0=0 +lon_0=47.48333333333 +k=1 +x_0=3250000 +y_0=-5412900.56 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6336901", "+title= МСК-69 зона 1 Тверская область    +proj=tmerc +lat_0=0 +lon_0=32.48333333333 +k=1 +x_0=1250000 +y_0=-6012900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6336902", "+title= МСК-69 зона 2 Тверская область    +proj=tmerc +lat_0=0 +lon_0=35.48333333333 +k=1 +x_0=2250000 +y_0=-6012900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6336903", "+title= МСК-69 зона 3 Тверская область    +proj=tmerc +lat_0=0 +lon_0=38.48333333333 +k=1 +x_0=3250000 +y_0=-6012900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6337001", "+title= МСК-70 зона 1 Томская область    +proj=tmerc +lat_0=0 +lon_0=74.73333333333 +k=1 +x_0=1250000 +y_0=-5912900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6337002", "+title= МСК-70 зона 2 Томская область    +proj=tmerc +lat_0=0 +lon_0=77.73333333333 +k=1 +x_0=2250000 +y_0=-5912900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6337003", "+title= МСК-70 зона 3 Томская область    +proj=tmerc +lat_0=0 +lon_0=80.73333333333 +k=1 +x_0=3250000 +y_0=-5912900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6337004", "+title= МСК-70 зона 4 Томская область    +proj=tmerc +lat_0=0 +lon_0=83.73333333333 +k=1 +x_0=4250000 +y_0=-5912900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6337005", "+title= МСК-70 зона 5 Томская область    +proj=tmerc +lat_0=0 +lon_0=86.73333333333 +k=1 +x_0=5250000 +y_0=-5912900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6337006", "+title= МСК-70 зона 6 Томская область    +proj=tmerc +lat_0=0 +lon_0=89.73333333333 +k=1 +x_0=6250000 +y_0=-5912900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6337101", "+title= МСК-71 от СК-63 зона 1 Тульская область    +proj=tmerc +lat_0=0 +lon_0=35.48333333333 +k=1 +x_0=1250000 +y_0=-5612900.563 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6337102", "+title= МСК-71 от СК-63 зона 2 Тульская область    +proj=tmerc +lat_0=0 +lon_0=38.48333333333 +k=1 +x_0=2250000 +y_0=-5612900.563 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:9507110", "+title= МСК-71.1 от СК-95 зона 1 Тульская область    +proj=tmerc +lat_0=0 +lon_0=37.427222222222 +k=1 +x_0=250000 +y_0=-5263444.764 +ellps=krass +towgs84=24.83,-130.97,-81.74,0,0,0.13,-0.22 +units=m +no_defs"], ["EPSG:6317201", "+title= МСК-72 зона 1 (1.5 градусная) Тюменская область    +proj=tmerc +lat_0=0 +lon_0=66.08333333 +k=1 +x_0=1500000 +y_0=-6000000 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6317202", "+title= МСК-72 зона 2 (1.5 градусная) Тюменская область    +proj=tmerc +lat_0=0 +lon_0=67.58333333 +k=1 +x_0=2500000 +y_0=-6000000 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6317203", "+title= МСК-72 зона 3 (1.5 градусная) Тюменская область    +proj=tmerc +lat_0=0 +lon_0=69.08333333 +k=1 +x_0=3500000 +y_0=-6000000 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6317204", "+title= МСК-72 зона 4 (1.5 градусная) Тюменская область    +proj=tmerc +lat_0=0 +lon_0=70.58333333 +k=1 +x_0=4500000 +y_0=-6000000 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6317205", "+title= МСК-72 зона 5 (1.5 градусная) Тюменская область    +proj=tmerc +lat_0=0 +lon_0=72.08333333 +k=1 +x_0=5500000 +y_0=-6000000 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6317206", "+title= МСК-72 зона 6 (1.5 градусная) Тюменская область    +proj=tmerc +lat_0=0 +lon_0=73.58333333 +k=1 +x_0=6500000 +y_0=-6000000 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6337201", "+title= МСК-72 зона 1 Тюменская область    +proj=tmerc +lat_0=0 +lon_0=63.05 +k=1 +x_0=1500000 +y_0=-5811057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6337202", "+title= МСК-72 зона 2 Тюменская область    +proj=tmerc +lat_0=0 +lon_0=66.05 +k=1 +x_0=2500000 +y_0=-5811057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6337203", "+title= МСК-72 зона 3 Тюменская область    +proj=tmerc +lat_0=0 +lon_0=69.05 +k=1 +x_0=3500000 +y_0=-5811057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6337204", "+title= МСК-72 зона 4 Тюменская область    +proj=tmerc +lat_0=0 +lon_0=72.05 +k=1 +x_0=4500000 +y_0=-5811057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6337205", "+title= МСК-72 зона 5 Тюменская область    +proj=tmerc +lat_0=0 +lon_0=75.05 +k=1 +x_0=5500000 +y_0=-5811057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6367201", "+title= МСК-72 зона 1 (6 градусная) Тюменская область    +proj=tmerc +lat_0=0 +lon_0=63.05 +k=1 +x_0=1500000 +y_0=-5811057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6367202", "+title= МСК-72 зона 2 (6 градусная) Тюменская область    +proj=tmerc +lat_0=0 +lon_0=69.05 +k=1 +x_0=2500000 +y_0=-5811057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6367203", "+title= МСК-72 зона 3 (6 градусная) Тюменская область    +proj=tmerc +lat_0=0 +lon_0=75.05 +k=1 +x_0=3500000 +y_0=-5811057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6337301", "+title= МСК-73 зона 1 Ульяновская область    +proj=tmerc +lat_0=0 +lon_0=46.05 +k=1 +x_0=1300000 +y_0=-5514743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6337302", "+title= МСК-73 зона 2 Ульяновская область    +proj=tmerc +lat_0=0 +lon_0=49.05 +k=1 +x_0=2300000 +y_0=-5514743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6337401", "+title= МСК-74 зона 1 Челябинская область    +proj=tmerc +lat_0=0 +lon_0=58.03333333333 +k=1 +x_0=1300000 +y_0=-5509414.70 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6337402", "+title= МСК-74 зона 2 Челябинская область    +proj=tmerc +lat_0=0 +lon_0=61.03333333333 +k=1 +x_0=2300000 +y_0=-5509414.70 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6337403", "+title= МСК-74 зона 3 Челябинская область    +proj=tmerc +lat_0=0 +lon_0=64.03333333333 +k=1 +x_0=3300000 +y_0=-5509414.70 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6337501", "+title= МСК-75 зона 1 Забайкальский край    +proj=tmerc +lat_0=0 +lon_0=109.03333333333 +k=1 +x_0=1250000 +y_0=-5111057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6337502", "+title= МСК-75 зона 2 Забайкальский край    +proj=tmerc +lat_0=0 +lon_0=112.03333333333 +k=1 +x_0=2250000 +y_0=-5111057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6337503", "+title= МСК-75 зона 3 Забайкальский край    +proj=tmerc +lat_0=0 +lon_0=115.03333333333 +k=1 +x_0=3250000 +y_0=-5111057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6337504", "+title= МСК-75 зона 4 Забайкальский край    +proj=tmerc +lat_0=0 +lon_0=118.03333333333 +k=1 +x_0=4250000 +y_0=-5111057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6337505", "+title= МСК-75 зона 5 Забайкальский край    +proj=tmerc +lat_0=0 +lon_0=121.03333333333 +k=1 +x_0=5250000 +y_0=-5111057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6337601", "+title= МСК-76 зона 1 Ярославская область    +proj=tmerc +lat_0=0 +lon_0=38.55 +k=1 +x_0=1250000 +y_0=-6014743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6337602", "+title= МСК-76 зона 2 Ярославская область    +proj=tmerc +lat_0=0 +lon_0=41.55 +k=1 +x_0=2250000 +y_0=-6014743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6368303", "+title= МСК-83 зона 3 (6 градусная) Ненецкий автономный округ    +proj=tmerc +lat_0=0 +lon_0=44.03333333333 +k=1 +x_0=3400000 +y_0=-6511057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6368304", "+title= МСК-83 зона 4 (6 градусная) Ненецкий автономный округ    +proj=tmerc +lat_0=0 +lon_0=50.03333333333 +k=1 +x_0=4400000 +y_0=-6511057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6368305", "+title= МСК-83 зона 5 (6 градусная) Ненецкий автономный округ    +proj=tmerc +lat_0=0 +lon_0=56.03333333333 +k=1 +x_0=5400000 +y_0=-6511057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6368306", "+title= МСК-83 зона 6 (6 градусная) Ненецкий автономный округ    +proj=tmerc +lat_0=0 +lon_0=62.03333333333 +k=1 +x_0=6400000 +y_0=-6511057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6368307", "+title= МСК-83 зона 7 (6 градусная) Ненецкий автономный округ    +proj=tmerc +lat_0=0 +lon_0=68.03333333333 +k=1 +x_0=7400000 +y_0=-6511057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6368601", "+title= МСК-86 зона 1 (6 градусная) Ханты-Мансийский автономный округ — Югра    +proj=tmerc +lat_0=0 +lon_0=60.05 +k=1 +x_0=1500000 +y_0=-5811057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6368602", "+title= МСК-86 зона 2 (6 градусная) Ханты-Мансийский автономный округ — Югра    +proj=tmerc +lat_0=0 +lon_0=66.05 +k=1 +x_0=2500000 +y_0=-5811057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6368603", "+title= МСК-86 зона 3 (6 градусная) Ханты-Мансийский автономный округ — Югра    +proj=tmerc +lat_0=0 +lon_0=72.05 +k=1 +x_0=3500000 +y_0=-5811057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6368604", "+title= МСК-86 зона 4 (6 градусная) Ханты-Мансийский автономный округ — Югра    +proj=tmerc +lat_0=0 +lon_0=78.05 +k=1 +x_0=4500000 +y_0=-5811057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6368605", "+title= МСК-86 зона 5 (6 градусная) Ханты-Мансийский автономный округ — Югра    +proj=tmerc +lat_0=0 +lon_0=84.05 +k=1 +x_0=5500000 +y_0=-5811057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6368703", "+title= МСК-87 зона 3 (6 градусная) Чукотский автономный округ    +proj=tmerc +lat_0=0 +lon_0=156.45 +k=1 +x_0=3400000 +y_0=-6212900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6368704", "+title= МСК-87 зона 4 (6 градусная) Чукотский автономный округ    +proj=tmerc +lat_0=0 +lon_0=162.45 +k=1 +x_0=4400000 +y_0=-6212900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6368705", "+title= МСК-87 зона 5 (6 градусная) Чукотский автономный округ    +proj=tmerc +lat_0=0 +lon_0=168.45 +k=1 +x_0=5400000 +y_0=-6212900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6368706", "+title= МСК-87 зона 6 (6 градусная) Чукотский автономный округ    +proj=tmerc +lat_0=0 +lon_0=174.45 +k=1 +x_0=6400000 +y_0=-6212900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6368707", "+title= МСК-87 зона 7 (6 градусная) Чукотский автономный округ    +proj=tmerc +lat_0=0 +lon_0=180.45 +k=1 +x_0=7400000 +y_0=-6212900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:6368708", "+title= МСК-87 зона 8 (6 градусная) Чукотский автономный округ    +proj=tmerc +lat_0=0 +lon_0=186.45 +k=1 +x_0=8400000 +y_0=-6212900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633C01", "+title= СК-1963 район C зона 1    +proj=tmerc +lat_0=0 +lon_0=24.95 +k=1 +x_0=1250000 +y_0=-11057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633C02", "+title= СК-1963 район C зона 2    +proj=tmerc +lat_0=0 +lon_0=27.95 +k=1 +x_0=2250000 +y_0=-11057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633C03", "+title= СК-1963 район C зона 3    +proj=tmerc +lat_0=0 +lon_0=30.95 +k=1 +x_0=3250000 +y_0=-11057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633C04", "+title= СК-1963 район C зона 4    +proj=tmerc +lat_0=0 +lon_0=33.95 +k=1 +x_0=4250000 +y_0=-11057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633C05", "+title= СК-1963 район C зона 5    +proj=tmerc +lat_0=0 +lon_0=36.95 +k=1 +x_0=5250000 +y_0=-11057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633C06", "+title= СК-1963 район C зона 6    +proj=tmerc +lat_0=0 +lon_0=39.95 +k=1 +x_0=6250000 +y_0=-11057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633D01", "+title= СК-1963 район D зона 1    +proj=tmerc +lat_0=0 +lon_0=38.55 +k=1 +x_0=1250000 +y_0=-14743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633D02", "+title= СК-1963 район D зона 2    +proj=tmerc +lat_0=0 +lon_0=41.55 +k=1 +x_0=2250000 +y_0=-14743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633D03", "+title= СК-1963 район D зона 3    +proj=tmerc +lat_0=0 +lon_0=44.55 +k=1 +x_0=3250000 +y_0=-14743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633D04", "+title= СК-1963 район D зона 4    +proj=tmerc +lat_0=0 +lon_0=47.55 +k=1 +x_0=4250000 +y_0=-14743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633D05", "+title= СК-1963 район D зона 5    +proj=tmerc +lat_0=0 +lon_0=50.55 +k=1 +x_0=5250000 +y_0=-14743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633D06", "+title= СК-1963 район D зона 6    +proj=tmerc +lat_0=0 +lon_0=53.55 +k=1 +x_0=6250000 +y_0=-14743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633D07", "+title= СК-1963 район D зона 7    +proj=tmerc +lat_0=0 +lon_0=56.55 +k=1 +x_0=7250000 +y_0=-14743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633D08", "+title= СК-1963 район D зона 8    +proj=tmerc +lat_0=0 +lon_0=59.55 +k=1 +x_0=8250000 +y_0=-14743.504 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633F01", "+title= СК-1963 район F зона 1    +proj=tmerc +lat_0=0 +lon_0=97.033333333333 +k=1 +x_0=1250000 +y_0=-11057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633F02", "+title= СК-1963 район F зона 2    +proj=tmerc +lat_0=0 +lon_0=100.033333333333 +k=1 +x_0=2250000 +y_0=-11057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633F03", "+title= СК-1963 район F зона 3    +proj=tmerc +lat_0=0 +lon_0=103.033333333333 +k=1 +x_0=3250000 +y_0=-11057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633G01", "+title= СК-1963 район G зона 1    +proj=tmerc +lat_0=0 +lon_0=121.71666666667 +k=1 +x_0=1300000 +y_0=-16586.44 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633G02", "+title= СК-1963 район G зона 2    +proj=tmerc +lat_0=0 +lon_0=124.71666666667 +k=1 +x_0=2300000 +y_0=-16586.44 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633G03", "+title= СК-1963 район G зона 3    +proj=tmerc +lat_0=0 +lon_0=127.71666666667 +k=1 +x_0=3300000 +y_0=-16586.44 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633G04", "+title= СК-1963 район G зона 4    +proj=tmerc +lat_0=0 +lon_0=130.71666666667 +k=1 +x_0=4300000 +y_0=-16586.44 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633G05", "+title= СК-1963 район G зона 5    +proj=tmerc +lat_0=0 +lon_0=133.71666666667 +k=1 +x_0=5300000 +y_0=-16586.44 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633G06", "+title= СК-1963 район G зона 6    +proj=tmerc +lat_0=0 +lon_0=136.71666666667 +k=1 +x_0=6300000 +y_0=-16586.44 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633G07", "+title= СК-1963 район G зона 7    +proj=tmerc +lat_0=0 +lon_0=139.71666666667 +k=1 +x_0=7300000 +y_0=-16586.44 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633G08", "+title= СК-1963 район G зона 8    +proj=tmerc +lat_0=0 +lon_0=142.71666666667 +k=1 +x_0=8300000 +y_0=-16586.44 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633G09", "+title= СК-1963 район G зона 9    +proj=tmerc +lat_0=0 +lon_0=145.71666666667 +k=1 +x_0=9300000 +y_0=-16586.44 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633I01", "+title= СК-1963 район I зона 1    +proj=tmerc +lat_0=0 +lon_0=71.73333333333 +k=1 +x_0=1250000 +y_0=-12900.60 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633I02", "+title= СК-1963 район I зона 2    +proj=tmerc +lat_0=0 +lon_0=74.73333333333 +k=1 +x_0=2250000 +y_0=-12900.60 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633I03", "+title= СК-1963 район I зона 3    +proj=tmerc +lat_0=0 +lon_0=77.73333333333 +k=1 +x_0=3250000 +y_0=-12900.60 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633I04", "+title= СК-1963 район I зона 4    +proj=tmerc +lat_0=0 +lon_0=80.73333333333 +k=1 +x_0=4250000 +y_0=-12900.60 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633I05", "+title= СК-1963 район I зона 5    +proj=tmerc +lat_0=0 +lon_0=83.73333333333 +k=1 +x_0=5250000 +y_0=-12900.60 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633I06", "+title= СК-1963 район I зона 6    +proj=tmerc +lat_0=0 +lon_0=86.73333333333 +k=1 +x_0=6250000 +y_0=-12900.60 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:636L01", "+title= СК-1963 район L зона 1 (6-ти градусная)    +proj=tmerc +lat_0=0 +lon_0=81.51666666667 +k=1 +x_0=1500000 +y_0=-16586.442 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:636L02", "+title= СК-1963 район L зона 2 (6-ти градусная)    +proj=tmerc +lat_0=0 +lon_0=87.51666666667 +k=1 +x_0=2500000 +y_0=-16586.442 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:636L03", "+title= СК-1963 район L зона 3 (6-ти градусная)    +proj=tmerc +lat_0=0 +lon_0=93.51666666667 +k=1 +x_0=3500000 +y_0=-16586.442 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:636L04", "+title= СК-1963 район L зона 4 (6-ти градусная)    +proj=tmerc +lat_0=0 +lon_0=99.51666666667 +k=1 +x_0=4500000 +y_0=-16586.442 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:636L05", "+title= СК-1963 район L зона 5 (6-ти градусная)    +proj=tmerc +lat_0=0 +lon_0=105.51666666667 +k=1 +x_0=5500000 +y_0=-16586.442 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:636L06", "+title= СК-1963 район L зона 6 (6-ти градусная)    +proj=tmerc +lat_0=0 +lon_0=111.51666666667 +k=1 +x_0=6500000 +y_0=-16586.442 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633M01", "+title= СК-1963 район M зона 1    +proj=tmerc +lat_0=0 +lon_0=79.466666666677 +k=1 +x_0=1300000 +y_0=-12900.57 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633M02", "+title= СК-1963 район M зона 2    +proj=tmerc +lat_0=0 +lon_0=82.466666666677 +k=1 +x_0=2300000 +y_0=-12900.57 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633M03", "+title= СК-1963 район M зона 3    +proj=tmerc +lat_0=0 +lon_0=85.466666666677 +k=1 +x_0=3300000 +y_0=-12900.57 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633M04", "+title= СК-1963 район M зона 4    +proj=tmerc +lat_0=0 +lon_0=88.466666666677 +k=1 +x_0=4300000 +y_0=-12900.57 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633P01", "+title= СК-1963 район P зона 1    +proj=tmerc +lat_0=0 +lon_0=32.48333333333 +k=1 +x_0=1250000 +y_0=-12900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633P02", "+title= СК-1963 район P зона 2    +proj=tmerc +lat_0=0 +lon_0=35.48333333333 +k=1 +x_0=2250000 +y_0=-12900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633P03", "+title= СК-1963 район P зона 3    +proj=tmerc +lat_0=0 +lon_0=38.48333333333 +k=1 +x_0=3250000 +y_0=-12900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633P04", "+title= СК-1963 район P зона 4    +proj=tmerc +lat_0=0 +lon_0=41.48333333333 +k=1 +x_0=4250000 +y_0=-12900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:636Q01", "+title= СК-1963 район Q зона 1 (6-ти градусная)    +proj=tmerc +lat_0=0 +lon_0=32.03333333333 +k=1 +x_0=1400000 +y_0=-11057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:636Q02", "+title= СК-1963 район Q зона 2 (6-ти градусная)    +proj=tmerc +lat_0=0 +lon_0=38.03333333333 +k=1 +x_0=2400000 +y_0=-11057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:636Q03", "+title= СК-1963 район Q зона 3 (6-ти градусная)    +proj=tmerc +lat_0=0 +lon_0=44.03333333333 +k=1 +x_0=3400000 +y_0=-11057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:636Q04", "+title= СК-1963 район Q зона 4 (6-ти градусная)    +proj=tmerc +lat_0=0 +lon_0=50.03333333333 +k=1 +x_0=4400000 +y_0=-11057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:636Q05", "+title= СК-1963 район Q зона 5 (6-ти градусная)    +proj=tmerc +lat_0=0 +lon_0=56.03333333333 +k=1 +x_0=5400000 +y_0=-11057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633R01", "+title= СК-1963 район R зона 1    +proj=tmerc +lat_0=0 +lon_0=43.05 +k=1 +x_0=1300000 +y_0=-14743.501 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633R02", "+title= СК-1963 район R зона 2    +proj=tmerc +lat_0=0 +lon_0=46.05 +k=1 +x_0=2300000 +y_0=-14743.501 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633R03", "+title= СК-1963 район R зона 3    +proj=tmerc +lat_0=0 +lon_0=49.05 +k=1 +x_0=3300000 +y_0=-14743.501 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:636S01", "+title= СК-1963 район S зона 1 (6-ти градусная)    +proj=tmerc +lat_0=0 +lon_0=108.45 +k=1 +x_0=1400000 +y_0=-12900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:636S02", "+title= СК-1963 район S зона 2 (6-ти градусная)    +proj=tmerc +lat_0=0 +lon_0=114.45 +k=1 +x_0=2400000 +y_0=-12900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:636S03", "+title= СК-1963 район S зона 3 (6-ти градусная)    +proj=tmerc +lat_0=0 +lon_0=120.45 +k=1 +x_0=3400000 +y_0=-12900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:636S04", "+title= СК-1963 район S зона 4 (6-ти градусная)    +proj=tmerc +lat_0=0 +lon_0=126.45 +k=1 +x_0=4400000 +y_0=-12900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:636S05", "+title= СК-1963 район S зона 5 (6-ти градусная)    +proj=tmerc +lat_0=0 +lon_0=132.45 +k=1 +x_0=5400000 +y_0=-12900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:636S06", "+title= СК-1963 район S зона 6 (6-ти градусная)    +proj=tmerc +lat_0=0 +lon_0=138.45 +k=1 +x_0=6400000 +y_0=-12900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:636S07", "+title= СК-1963 район S зона 7 (6-ти градусная)    +proj=tmerc +lat_0=0 +lon_0=144.45 +k=1 +x_0=7400000 +y_0=-12900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:636S08", "+title= СК-1963 район S зона 8 (6-ти градусная)    +proj=tmerc +lat_0=0 +lon_0=150.45 +k=1 +x_0=8400000 +y_0=-12900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:636S09", "+title= СК-1963 район S зона 9 (6-ти градусная)    +proj=tmerc +lat_0=0 +lon_0=156.45 +k=1 +x_0=9400000 +y_0=-12900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:636S10", "+title= СК-1963 район S зона 10 (6-ти градусная)    +proj=tmerc +lat_0=0 +lon_0=162.45 +k=1 +x_0=10400000 +y_0=-12900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:636S11", "+title= СК-1963 район S зона 11 (6-ти градусная)    +proj=tmerc +lat_0=0 +lon_0=168.45 +k=1 +x_0=11400000 +y_0=-12900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:636S12", "+title= СК-1963 район S зона 12 (6-ти градусная)    +proj=tmerc +lat_0=0 +lon_0=174.45 +k=1 +x_0=12400000 +y_0=-12900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:636S13", "+title= СК-1963 район S зона 13 (6-ти градусная)    +proj=tmerc +lat_0=0 +lon_0=180.45 +k=1 +x_0=13400000 +y_0=-12900.566 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633T01", "+title= СК-1963 район T зона 1    +proj=tmerc +lat_0=0 +lon_0=37.98333333333 +k=1 +x_0=1300000 +y_0=-11057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633T02", "+title= СК-1963 район T зона 2    +proj=tmerc +lat_0=0 +lon_0=40.98333333333 +k=1 +x_0=2300000 +y_0=-11057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633T03", "+title= СК-1963 район T зона 3    +proj=tmerc +lat_0=0 +lon_0=43.98333333333 +k=1 +x_0=3300000 +y_0=-11057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633T04", "+title= СК-1963 район T зона 4    +proj=tmerc +lat_0=0 +lon_0=46.98333333333 +k=1 +x_0=4300000 +y_0=-11057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633V01", "+title= СК-1963 район V зона 1    +proj=tmerc +lat_0=0 +lon_0=49.03333333333 +k=1 +x_0=1300000 +y_0=-9414.70 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633V02", "+title= СК-1963 район V зона 2    +proj=tmerc +lat_0=0 +lon_0=52.03333333333 +k=1 +x_0=2300000 +y_0=-9414.70 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633V03", "+title= СК-1963 район V зона 3    +proj=tmerc +lat_0=0 +lon_0=55.03333333333 +k=1 +x_0=3300000 +y_0=-9414.70 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633V04", "+title= СК-1963 район V зона 4    +proj=tmerc +lat_0=0 +lon_0=58.03333333333 +k=1 +x_0=4300000 +y_0=-9414.70 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633V05", "+title= СК-1963 район V зона 5    +proj=tmerc +lat_0=0 +lon_0=61.03333333333 +k=1 +x_0=5300000 +y_0=-9414.70 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633V06", "+title= СК-1963 район V зона 6    +proj=tmerc +lat_0=0 +lon_0=64.03333333333 +k=1 +x_0=6300000 +y_0=-9414.70 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:636W01", "+title= СК-1963 район W зона 1 (6-ти градусная)    +proj=tmerc +lat_0=0 +lon_0=60.05 +k=1 +x_0=1500000 +y_0=-11057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:636W02", "+title= СК-1963 район W зона 2 (6-ти градусная)    +proj=tmerc +lat_0=0 +lon_0=66.05 +k=1 +x_0=2500000 +y_0=-11057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:636W03", "+title= СК-1963 район W зона 3 (6-ти градусная)    +proj=tmerc +lat_0=0 +lon_0=72.05 +k=1 +x_0=3500000 +y_0=-11057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:636W04", "+title= СК-1963 район W зона 4 (6-ти градусная)    +proj=tmerc +lat_0=0 +lon_0=78.05 +k=1 +x_0=4500000 +y_0=-11057.628 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633X01", "+title= СК-1963 район X зона 1    +proj=tmerc +lat_0=0 +lon_0=23.05 +k=1 +x_0=1300000 +y_0=-9414.70 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633X02", "+title= СК-1963 район X зона 2    +proj=tmerc +lat_0=0 +lon_0=26.05 +k=1 +x_0=2300000 +y_0=-9414.70 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633X03", "+title= СК-1963 район X зона 3    +proj=tmerc +lat_0=0 +lon_0=29.05 +k=1 +x_0=3300000 +y_0=-9414.70 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633X04", "+title= СК-1963 район X зона 4    +proj=tmerc +lat_0=0 +lon_0=32.05 +k=1 +x_0=4300000 +y_0=-9414.70 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633X05", "+title= СК-1963 район X зона 5    +proj=tmerc +lat_0=0 +lon_0=35.05 +k=1 +x_0=5300000 +y_0=-9414.70 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:633X06", "+title= СК-1963 район X зона 6    +proj=tmerc +lat_0=0 +lon_0=38.05 +k=1 +x_0=6300000 +y_0=-9414.70 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:28402", "+title= Пулково 1942 зона 2 ГОСТ 51794-2008   +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=2500000 +y_0=0 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:28403", "+title= Пулково 1942 зона 3 ГОСТ 51794-2008   +proj=tmerc +lat_0=0 +lon_0=15 +k=1 +x_0=3500000 +y_0=0 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:28404", "+title= Пулково 1942 зона 4 ГОСТ 51794-2008   +proj=tmerc +lat_0=0 +lon_0=21 +k=1 +x_0=4500000 +y_0=0 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:28405", "+title= Пулково 1942 зона 5 ГОСТ 51794-2008   +proj=tmerc +lat_0=0 +lon_0=27 +k=1 +x_0=5500000 +y_0=0 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:28406", "+title= Пулково 1942 зона 6 ГОСТ 51794-2008   +proj=tmerc +lat_0=0 +lon_0=33 +k=1 +x_0=6500000 +y_0=0 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:28407", "+title= Пулково 1942 зона 7 ГОСТ 51794-2008   +proj=tmerc +lat_0=0 +lon_0=39 +k=1 +x_0=7500000 +y_0=0 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:28408", "+title= Пулково 1942 зона 8 ГОСТ 51794-2008   +proj=tmerc +lat_0=0 +lon_0=45 +k=1 +x_0=8500000 +y_0=0 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:28409", "+title= Пулково 1942 зона 9 ГОСТ 51794-2008   +proj=tmerc +lat_0=0 +lon_0=51 +k=1 +x_0=9500000 +y_0=0 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:28410", "+title= Пулково 1942 зона 10 ГОСТ 51794-2008   +proj=tmerc +lat_0=0 +lon_0=57 +k=1 +x_0=10500000 +y_0=0 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:28411", "+title= Пулково 1942 зона 11 ГОСТ 51794-2008   +proj=tmerc +lat_0=0 +lon_0=63 +k=1 +x_0=11500000 +y_0=0 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:28412", "+title= Пулково 1942 зона 12 ГОСТ 51794-2008   +proj=tmerc +lat_0=0 +lon_0=69 +k=1 +x_0=12500000 +y_0=0 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:28413", "+title= Пулково 1942 зона 13 ГОСТ 51794-2008   +proj=tmerc +lat_0=0 +lon_0=75 +k=1 +x_0=13500000 +y_0=0 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:28414", "+title= Пулково 1942 зона 14 ГОСТ 51794-2008   +proj=tmerc +lat_0=0 +lon_0=81 +k=1 +x_0=14500000 +y_0=0 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:28415", "+title= Пулково 1942 зона 15 ГОСТ 51794-2008   +proj=tmerc +lat_0=0 +lon_0=87 +k=1 +x_0=15500000 +y_0=0 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:28416", "+title= Пулково 1942 зона 16 ГОСТ 51794-2008   +proj=tmerc +lat_0=0 +lon_0=93 +k=1 +x_0=16500000 +y_0=0 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:28417", "+title= Пулково 1942 зона 17 ГОСТ 51794-2008   +proj=tmerc +lat_0=0 +lon_0=99 +k=1 +x_0=17500000 +y_0=0 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:28418", "+title= Пулково 1942 зона 18 ГОСТ 51794-2008   +proj=tmerc +lat_0=0 +lon_0=105 +k=1 +x_0=18500000 +y_0=0 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:28419", "+title= Пулково 1942 зона 19 ГОСТ 51794-2008   +proj=tmerc +lat_0=0 +lon_0=111 +k=1 +x_0=19500000 +y_0=0 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:28420", "+title= Пулково 1942 зона 20 ГОСТ 51794-2008   +proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=20500000 +y_0=0 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:28421", "+title= Пулково 1942 зона 21 ГОСТ 51794-2008   +proj=tmerc +lat_0=0 +lon_0=123 +k=1 +x_0=21500000 +y_0=0 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:28422", "+title= Пулково 1942 зона 22 ГОСТ 51794-2008   +proj=tmerc +lat_0=0 +lon_0=129 +k=1 +x_0=22500000 +y_0=0 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:28423", "+title= Пулково 1942 зона 23 ГОСТ 51794-2008   +proj=tmerc +lat_0=0 +lon_0=135 +k=1 +x_0=23500000 +y_0=0 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:28424", "+title= Пулково 1942 зона 24 ГОСТ 51794-2008   +proj=tmerc +lat_0=0 +lon_0=141 +k=1 +x_0=24500000 +y_0=0 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:28425", "+title= Пулково 1942 зона 25 ГОСТ 51794-2008   +proj=tmerc +lat_0=0 +lon_0=147 +k=1 +x_0=25500000 +y_0=0 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:28426", "+title= Пулково 1942 зона 26 ГОСТ 51794-2008   +proj=tmerc +lat_0=0 +lon_0=153 +k=1 +x_0=26500000 +y_0=0 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:28427", "+title= Пулково 1942 зона 27 ГОСТ 51794-2008   +proj=tmerc +lat_0=0 +lon_0=159 +k=1 +x_0=27500000 +y_0=0 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:28428", "+title= Пулково 1942 зона 28 ГОСТ 51794-2008   +proj=tmerc +lat_0=0 +lon_0=165 +k=1 +x_0=28500000 +y_0=0 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:28429", "+title= Пулково 1942 зона 29 ГОСТ 51794-2008   +proj=tmerc +lat_0=0 +lon_0=171 +k=1 +x_0=29500000 +y_0=0 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:28430", "+title= Пулково 1942 зона 30 ГОСТ 51794-2008   +proj=tmerc +lat_0=0 +lon_0=177 +k=1 +x_0=30500000 +y_0=0 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs"], ["EPSG:4284", "+title= Pulkovo 1942    +proj=longlat +ellps=krass +towgs84=23.92,-141.27,-80.9,-0,0.35,0.82,-0.12 +no_defs"], ["EPSG:42842008", "+title= Pulkovo 1942 ГОСТ 51794-2008    +proj=longlat +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +no_defs"], ["EPSG:4740", "+title= ПЗ-90    +proj=longlat +a=6378136 +b=6356751.361745712 +towgs84=0,0,1.5,-0,-0,0.076,0 +no_defs"]]);

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Promise, fetch) {"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getJSON = getJSON;
	function status(response) {
	  if (response.status >= 200 && response.status < 300) {
	    return Promise.resolve(response);
	  } else {
	    return Promise.reject(new Error(response.statusText));
	  }
	}
	
	function json(response) {
	  return response.json();
	}
	
	function getJSON(url, opt) {
	  return fetch(url, opt).then(status).then(json);
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(10), __webpack_require__(13)))

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var require;/* WEBPACK VAR INJECTION */(function(process, Promise, global) {/*** IMPORTS FROM imports-loader ***/
	(function() {
	
	/*!
	 * @overview es6-promise - a tiny implementation of Promises/A+.
	 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
	 * @license   Licensed under MIT license
	 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
	 * @version   4.0.3+28cd7ddc
	 */
	
	(function (global, factory) {
	     true ? module.exports = factory() :
	    typeof define === 'function' && define.amd ? define(factory) :
	    (global.ES6Promise = factory());
	}(this, (function () { 'use strict';
	
	function objectOrFunction(x) {
	  return typeof x === 'function' || typeof x === 'object' && x !== null;
	}
	
	function isFunction(x) {
	  return typeof x === 'function';
	}
	
	var _isArray = undefined;
	if (!Array.isArray) {
	  _isArray = function (x) {
	    return Object.prototype.toString.call(x) === '[object Array]';
	  };
	} else {
	  _isArray = Array.isArray;
	}
	
	var isArray = _isArray;
	
	var len = 0;
	var vertxNext = undefined;
	var customSchedulerFn = undefined;
	
	var asap = function asap(callback, arg) {
	  queue[len] = callback;
	  queue[len + 1] = arg;
	  len += 2;
	  if (len === 2) {
	    // If len is 2, that means that we need to schedule an async flush.
	    // If additional callbacks are queued before the queue is flushed, they
	    // will be processed by this flush that we are scheduling.
	    if (customSchedulerFn) {
	      customSchedulerFn(flush);
	    } else {
	      scheduleFlush();
	    }
	  }
	};
	
	function setScheduler(scheduleFn) {
	  customSchedulerFn = scheduleFn;
	}
	
	function setAsap(asapFn) {
	  asap = asapFn;
	}
	
	var browserWindow = typeof window !== 'undefined' ? window : undefined;
	var browserGlobal = browserWindow || {};
	var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
	var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && ({}).toString.call(process) === '[object process]';
	
	// test for web worker but not in IE10
	var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';
	
	// node
	function useNextTick() {
	  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
	  // see https://github.com/cujojs/when/issues/410 for details
	  return function () {
	    return process.nextTick(flush);
	  };
	}
	
	// vertx
	function useVertxTimer() {
	  return function () {
	    vertxNext(flush);
	  };
	}
	
	function useMutationObserver() {
	  var iterations = 0;
	  var observer = new BrowserMutationObserver(flush);
	  var node = document.createTextNode('');
	  observer.observe(node, { characterData: true });
	
	  return function () {
	    node.data = iterations = ++iterations % 2;
	  };
	}
	
	// web worker
	function useMessageChannel() {
	  var channel = new MessageChannel();
	  channel.port1.onmessage = flush;
	  return function () {
	    return channel.port2.postMessage(0);
	  };
	}
	
	function useSetTimeout() {
	  // Store setTimeout reference so es6-promise will be unaffected by
	  // other code modifying setTimeout (like sinon.useFakeTimers())
	  var globalSetTimeout = setTimeout;
	  return function () {
	    return globalSetTimeout(flush, 1);
	  };
	}
	
	var queue = new Array(1000);
	function flush() {
	  for (var i = 0; i < len; i += 2) {
	    var callback = queue[i];
	    var arg = queue[i + 1];
	
	    callback(arg);
	
	    queue[i] = undefined;
	    queue[i + 1] = undefined;
	  }
	
	  len = 0;
	}
	
	function attemptVertx() {
	  try {
	    var r = require;
	    var vertx = __webpack_require__(12);
	    vertxNext = vertx.runOnLoop || vertx.runOnContext;
	    return useVertxTimer();
	  } catch (e) {
	    return useSetTimeout();
	  }
	}
	
	var scheduleFlush = undefined;
	// Decide what async method to use to triggering processing of queued callbacks:
	if (isNode) {
	  scheduleFlush = useNextTick();
	} else if (BrowserMutationObserver) {
	  scheduleFlush = useMutationObserver();
	} else if (isWorker) {
	  scheduleFlush = useMessageChannel();
	} else if (browserWindow === undefined && "function" === 'function') {
	  scheduleFlush = attemptVertx();
	} else {
	  scheduleFlush = useSetTimeout();
	}
	
	function then(onFulfillment, onRejection) {
	  var _arguments = arguments;
	
	  var parent = this;
	
	  var child = new this.constructor(noop);
	
	  if (child[PROMISE_ID] === undefined) {
	    makePromise(child);
	  }
	
	  var _state = parent._state;
	
	  if (_state) {
	    (function () {
	      var callback = _arguments[_state - 1];
	      asap(function () {
	        return invokeCallback(_state, child, callback, parent._result);
	      });
	    })();
	  } else {
	    subscribe(parent, child, onFulfillment, onRejection);
	  }
	
	  return child;
	}
	
	/**
	  `Promise.resolve` returns a promise that will become resolved with the
	  passed `value`. It is shorthand for the following:
	
	  ```javascript
	  let promise = new Promise(function(resolve, reject){
	    resolve(1);
	  });
	
	  promise.then(function(value){
	    // value === 1
	  });
	  ```
	
	  Instead of writing the above, your code now simply becomes the following:
	
	  ```javascript
	  let promise = Promise.resolve(1);
	
	  promise.then(function(value){
	    // value === 1
	  });
	  ```
	
	  @method resolve
	  @static
	  @param {Any} value value that the returned promise will be resolved with
	  Useful for tooling.
	  @return {Promise} a promise that will become fulfilled with the given
	  `value`
	*/
	function resolve(object) {
	  /*jshint validthis:true */
	  var Constructor = this;
	
	  if (object && typeof object === 'object' && object.constructor === Constructor) {
	    return object;
	  }
	
	  var promise = new Constructor(noop);
	  _resolve(promise, object);
	  return promise;
	}
	
	var PROMISE_ID = Math.random().toString(36).substring(16);
	
	function noop() {}
	
	var PENDING = void 0;
	var FULFILLED = 1;
	var REJECTED = 2;
	
	var GET_THEN_ERROR = new ErrorObject();
	
	function selfFulfillment() {
	  return new TypeError("You cannot resolve a promise with itself");
	}
	
	function cannotReturnOwn() {
	  return new TypeError('A promises callback cannot return that same promise.');
	}
	
	function getThen(promise) {
	  try {
	    return promise.then;
	  } catch (error) {
	    GET_THEN_ERROR.error = error;
	    return GET_THEN_ERROR;
	  }
	}
	
	function tryThen(then, value, fulfillmentHandler, rejectionHandler) {
	  try {
	    then.call(value, fulfillmentHandler, rejectionHandler);
	  } catch (e) {
	    return e;
	  }
	}
	
	function handleForeignThenable(promise, thenable, then) {
	  asap(function (promise) {
	    var sealed = false;
	    var error = tryThen(then, thenable, function (value) {
	      if (sealed) {
	        return;
	      }
	      sealed = true;
	      if (thenable !== value) {
	        _resolve(promise, value);
	      } else {
	        fulfill(promise, value);
	      }
	    }, function (reason) {
	      if (sealed) {
	        return;
	      }
	      sealed = true;
	
	      _reject(promise, reason);
	    }, 'Settle: ' + (promise._label || ' unknown promise'));
	
	    if (!sealed && error) {
	      sealed = true;
	      _reject(promise, error);
	    }
	  }, promise);
	}
	
	function handleOwnThenable(promise, thenable) {
	  if (thenable._state === FULFILLED) {
	    fulfill(promise, thenable._result);
	  } else if (thenable._state === REJECTED) {
	    _reject(promise, thenable._result);
	  } else {
	    subscribe(thenable, undefined, function (value) {
	      return _resolve(promise, value);
	    }, function (reason) {
	      return _reject(promise, reason);
	    });
	  }
	}
	
	function handleMaybeThenable(promise, maybeThenable, then$$) {
	  if (maybeThenable.constructor === promise.constructor && then$$ === then && maybeThenable.constructor.resolve === resolve) {
	    handleOwnThenable(promise, maybeThenable);
	  } else {
	    if (then$$ === GET_THEN_ERROR) {
	      _reject(promise, GET_THEN_ERROR.error);
	    } else if (then$$ === undefined) {
	      fulfill(promise, maybeThenable);
	    } else if (isFunction(then$$)) {
	      handleForeignThenable(promise, maybeThenable, then$$);
	    } else {
	      fulfill(promise, maybeThenable);
	    }
	  }
	}
	
	function _resolve(promise, value) {
	  if (promise === value) {
	    _reject(promise, selfFulfillment());
	  } else if (objectOrFunction(value)) {
	    handleMaybeThenable(promise, value, getThen(value));
	  } else {
	    fulfill(promise, value);
	  }
	}
	
	function publishRejection(promise) {
	  if (promise._onerror) {
	    promise._onerror(promise._result);
	  }
	
	  publish(promise);
	}
	
	function fulfill(promise, value) {
	  if (promise._state !== PENDING) {
	    return;
	  }
	
	  promise._result = value;
	  promise._state = FULFILLED;
	
	  if (promise._subscribers.length !== 0) {
	    asap(publish, promise);
	  }
	}
	
	function _reject(promise, reason) {
	  if (promise._state !== PENDING) {
	    return;
	  }
	  promise._state = REJECTED;
	  promise._result = reason;
	
	  asap(publishRejection, promise);
	}
	
	function subscribe(parent, child, onFulfillment, onRejection) {
	  var _subscribers = parent._subscribers;
	  var length = _subscribers.length;
	
	  parent._onerror = null;
	
	  _subscribers[length] = child;
	  _subscribers[length + FULFILLED] = onFulfillment;
	  _subscribers[length + REJECTED] = onRejection;
	
	  if (length === 0 && parent._state) {
	    asap(publish, parent);
	  }
	}
	
	function publish(promise) {
	  var subscribers = promise._subscribers;
	  var settled = promise._state;
	
	  if (subscribers.length === 0) {
	    return;
	  }
	
	  var child = undefined,
	      callback = undefined,
	      detail = promise._result;
	
	  for (var i = 0; i < subscribers.length; i += 3) {
	    child = subscribers[i];
	    callback = subscribers[i + settled];
	
	    if (child) {
	      invokeCallback(settled, child, callback, detail);
	    } else {
	      callback(detail);
	    }
	  }
	
	  promise._subscribers.length = 0;
	}
	
	function ErrorObject() {
	  this.error = null;
	}
	
	var TRY_CATCH_ERROR = new ErrorObject();
	
	function tryCatch(callback, detail) {
	  try {
	    return callback(detail);
	  } catch (e) {
	    TRY_CATCH_ERROR.error = e;
	    return TRY_CATCH_ERROR;
	  }
	}
	
	function invokeCallback(settled, promise, callback, detail) {
	  var hasCallback = isFunction(callback),
	      value = undefined,
	      error = undefined,
	      succeeded = undefined,
	      failed = undefined;
	
	  if (hasCallback) {
	    value = tryCatch(callback, detail);
	
	    if (value === TRY_CATCH_ERROR) {
	      failed = true;
	      error = value.error;
	      value = null;
	    } else {
	      succeeded = true;
	    }
	
	    if (promise === value) {
	      _reject(promise, cannotReturnOwn());
	      return;
	    }
	  } else {
	    value = detail;
	    succeeded = true;
	  }
	
	  if (promise._state !== PENDING) {
	    // noop
	  } else if (hasCallback && succeeded) {
	      _resolve(promise, value);
	    } else if (failed) {
	      _reject(promise, error);
	    } else if (settled === FULFILLED) {
	      fulfill(promise, value);
	    } else if (settled === REJECTED) {
	      _reject(promise, value);
	    }
	}
	
	function initializePromise(promise, resolver) {
	  try {
	    resolver(function resolvePromise(value) {
	      _resolve(promise, value);
	    }, function rejectPromise(reason) {
	      _reject(promise, reason);
	    });
	  } catch (e) {
	    _reject(promise, e);
	  }
	}
	
	var id = 0;
	function nextId() {
	  return id++;
	}
	
	function makePromise(promise) {
	  promise[PROMISE_ID] = id++;
	  promise._state = undefined;
	  promise._result = undefined;
	  promise._subscribers = [];
	}
	
	function Enumerator(Constructor, input) {
	  this._instanceConstructor = Constructor;
	  this.promise = new Constructor(noop);
	
	  if (!this.promise[PROMISE_ID]) {
	    makePromise(this.promise);
	  }
	
	  if (isArray(input)) {
	    this._input = input;
	    this.length = input.length;
	    this._remaining = input.length;
	
	    this._result = new Array(this.length);
	
	    if (this.length === 0) {
	      fulfill(this.promise, this._result);
	    } else {
	      this.length = this.length || 0;
	      this._enumerate();
	      if (this._remaining === 0) {
	        fulfill(this.promise, this._result);
	      }
	    }
	  } else {
	    _reject(this.promise, validationError());
	  }
	}
	
	function validationError() {
	  return new Error('Array Methods must be provided an Array');
	};
	
	Enumerator.prototype._enumerate = function () {
	  var length = this.length;
	  var _input = this._input;
	
	  for (var i = 0; this._state === PENDING && i < length; i++) {
	    this._eachEntry(_input[i], i);
	  }
	};
	
	Enumerator.prototype._eachEntry = function (entry, i) {
	  var c = this._instanceConstructor;
	  var resolve$$ = c.resolve;
	
	  if (resolve$$ === resolve) {
	    var _then = getThen(entry);
	
	    if (_then === then && entry._state !== PENDING) {
	      this._settledAt(entry._state, i, entry._result);
	    } else if (typeof _then !== 'function') {
	      this._remaining--;
	      this._result[i] = entry;
	    } else if (c === Promise) {
	      var promise = new c(noop);
	      handleMaybeThenable(promise, entry, _then);
	      this._willSettleAt(promise, i);
	    } else {
	      this._willSettleAt(new c(function (resolve$$) {
	        return resolve$$(entry);
	      }), i);
	    }
	  } else {
	    this._willSettleAt(resolve$$(entry), i);
	  }
	};
	
	Enumerator.prototype._settledAt = function (state, i, value) {
	  var promise = this.promise;
	
	  if (promise._state === PENDING) {
	    this._remaining--;
	
	    if (state === REJECTED) {
	      _reject(promise, value);
	    } else {
	      this._result[i] = value;
	    }
	  }
	
	  if (this._remaining === 0) {
	    fulfill(promise, this._result);
	  }
	};
	
	Enumerator.prototype._willSettleAt = function (promise, i) {
	  var enumerator = this;
	
	  subscribe(promise, undefined, function (value) {
	    return enumerator._settledAt(FULFILLED, i, value);
	  }, function (reason) {
	    return enumerator._settledAt(REJECTED, i, reason);
	  });
	};
	
	/**
	  `Promise.all` accepts an array of promises, and returns a new promise which
	  is fulfilled with an array of fulfillment values for the passed promises, or
	  rejected with the reason of the first passed promise to be rejected. It casts all
	  elements of the passed iterable to promises as it runs this algorithm.
	
	  Example:
	
	  ```javascript
	  let promise1 = resolve(1);
	  let promise2 = resolve(2);
	  let promise3 = resolve(3);
	  let promises = [ promise1, promise2, promise3 ];
	
	  Promise.all(promises).then(function(array){
	    // The array here would be [ 1, 2, 3 ];
	  });
	  ```
	
	  If any of the `promises` given to `all` are rejected, the first promise
	  that is rejected will be given as an argument to the returned promises's
	  rejection handler. For example:
	
	  Example:
	
	  ```javascript
	  let promise1 = resolve(1);
	  let promise2 = reject(new Error("2"));
	  let promise3 = reject(new Error("3"));
	  let promises = [ promise1, promise2, promise3 ];
	
	  Promise.all(promises).then(function(array){
	    // Code here never runs because there are rejected promises!
	  }, function(error) {
	    // error.message === "2"
	  });
	  ```
	
	  @method all
	  @static
	  @param {Array} entries array of promises
	  @param {String} label optional string for labeling the promise.
	  Useful for tooling.
	  @return {Promise} promise that is fulfilled when all `promises` have been
	  fulfilled, or rejected if any of them become rejected.
	  @static
	*/
	function all(entries) {
	  return new Enumerator(this, entries).promise;
	}
	
	/**
	  `Promise.race` returns a new promise which is settled in the same way as the
	  first passed promise to settle.
	
	  Example:
	
	  ```javascript
	  let promise1 = new Promise(function(resolve, reject){
	    setTimeout(function(){
	      resolve('promise 1');
	    }, 200);
	  });
	
	  let promise2 = new Promise(function(resolve, reject){
	    setTimeout(function(){
	      resolve('promise 2');
	    }, 100);
	  });
	
	  Promise.race([promise1, promise2]).then(function(result){
	    // result === 'promise 2' because it was resolved before promise1
	    // was resolved.
	  });
	  ```
	
	  `Promise.race` is deterministic in that only the state of the first
	  settled promise matters. For example, even if other promises given to the
	  `promises` array argument are resolved, but the first settled promise has
	  become rejected before the other promises became fulfilled, the returned
	  promise will become rejected:
	
	  ```javascript
	  let promise1 = new Promise(function(resolve, reject){
	    setTimeout(function(){
	      resolve('promise 1');
	    }, 200);
	  });
	
	  let promise2 = new Promise(function(resolve, reject){
	    setTimeout(function(){
	      reject(new Error('promise 2'));
	    }, 100);
	  });
	
	  Promise.race([promise1, promise2]).then(function(result){
	    // Code here never runs
	  }, function(reason){
	    // reason.message === 'promise 2' because promise 2 became rejected before
	    // promise 1 became fulfilled
	  });
	  ```
	
	  An example real-world use case is implementing timeouts:
	
	  ```javascript
	  Promise.race([ajax('foo.json'), timeout(5000)])
	  ```
	
	  @method race
	  @static
	  @param {Array} promises array of promises to observe
	  Useful for tooling.
	  @return {Promise} a promise which settles in the same way as the first passed
	  promise to settle.
	*/
	function race(entries) {
	  /*jshint validthis:true */
	  var Constructor = this;
	
	  if (!isArray(entries)) {
	    return new Constructor(function (_, reject) {
	      return reject(new TypeError('You must pass an array to race.'));
	    });
	  } else {
	    return new Constructor(function (resolve, reject) {
	      var length = entries.length;
	      for (var i = 0; i < length; i++) {
	        Constructor.resolve(entries[i]).then(resolve, reject);
	      }
	    });
	  }
	}
	
	/**
	  `Promise.reject` returns a promise rejected with the passed `reason`.
	  It is shorthand for the following:
	
	  ```javascript
	  let promise = new Promise(function(resolve, reject){
	    reject(new Error('WHOOPS'));
	  });
	
	  promise.then(function(value){
	    // Code here doesn't run because the promise is rejected!
	  }, function(reason){
	    // reason.message === 'WHOOPS'
	  });
	  ```
	
	  Instead of writing the above, your code now simply becomes the following:
	
	  ```javascript
	  let promise = Promise.reject(new Error('WHOOPS'));
	
	  promise.then(function(value){
	    // Code here doesn't run because the promise is rejected!
	  }, function(reason){
	    // reason.message === 'WHOOPS'
	  });
	  ```
	
	  @method reject
	  @static
	  @param {Any} reason value that the returned promise will be rejected with.
	  Useful for tooling.
	  @return {Promise} a promise rejected with the given `reason`.
	*/
	function reject(reason) {
	  /*jshint validthis:true */
	  var Constructor = this;
	  var promise = new Constructor(noop);
	  _reject(promise, reason);
	  return promise;
	}
	
	function needsResolver() {
	  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
	}
	
	function needsNew() {
	  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
	}
	
	/**
	  Promise objects represent the eventual result of an asynchronous operation. The
	  primary way of interacting with a promise is through its `then` method, which
	  registers callbacks to receive either a promise's eventual value or the reason
	  why the promise cannot be fulfilled.
	
	  Terminology
	  -----------
	
	  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
	  - `thenable` is an object or function that defines a `then` method.
	  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
	  - `exception` is a value that is thrown using the throw statement.
	  - `reason` is a value that indicates why a promise was rejected.
	  - `settled` the final resting state of a promise, fulfilled or rejected.
	
	  A promise can be in one of three states: pending, fulfilled, or rejected.
	
	  Promises that are fulfilled have a fulfillment value and are in the fulfilled
	  state.  Promises that are rejected have a rejection reason and are in the
	  rejected state.  A fulfillment value is never a thenable.
	
	  Promises can also be said to *resolve* a value.  If this value is also a
	  promise, then the original promise's settled state will match the value's
	  settled state.  So a promise that *resolves* a promise that rejects will
	  itself reject, and a promise that *resolves* a promise that fulfills will
	  itself fulfill.
	
	
	  Basic Usage:
	  ------------
	
	  ```js
	  let promise = new Promise(function(resolve, reject) {
	    // on success
	    resolve(value);
	
	    // on failure
	    reject(reason);
	  });
	
	  promise.then(function(value) {
	    // on fulfillment
	  }, function(reason) {
	    // on rejection
	  });
	  ```
	
	  Advanced Usage:
	  ---------------
	
	  Promises shine when abstracting away asynchronous interactions such as
	  `XMLHttpRequest`s.
	
	  ```js
	  function getJSON(url) {
	    return new Promise(function(resolve, reject){
	      let xhr = new XMLHttpRequest();
	
	      xhr.open('GET', url);
	      xhr.onreadystatechange = handler;
	      xhr.responseType = 'json';
	      xhr.setRequestHeader('Accept', 'application/json');
	      xhr.send();
	
	      function handler() {
	        if (this.readyState === this.DONE) {
	          if (this.status === 200) {
	            resolve(this.response);
	          } else {
	            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
	          }
	        }
	      };
	    });
	  }
	
	  getJSON('/posts.json').then(function(json) {
	    // on fulfillment
	  }, function(reason) {
	    // on rejection
	  });
	  ```
	
	  Unlike callbacks, promises are great composable primitives.
	
	  ```js
	  Promise.all([
	    getJSON('/posts'),
	    getJSON('/comments')
	  ]).then(function(values){
	    values[0] // => postsJSON
	    values[1] // => commentsJSON
	
	    return values;
	  });
	  ```
	
	  @class Promise
	  @param {function} resolver
	  Useful for tooling.
	  @constructor
	*/
	function Promise(resolver) {
	  this[PROMISE_ID] = nextId();
	  this._result = this._state = undefined;
	  this._subscribers = [];
	
	  if (noop !== resolver) {
	    typeof resolver !== 'function' && needsResolver();
	    this instanceof Promise ? initializePromise(this, resolver) : needsNew();
	  }
	}
	
	Promise.all = all;
	Promise.race = race;
	Promise.resolve = resolve;
	Promise.reject = reject;
	Promise._setScheduler = setScheduler;
	Promise._setAsap = setAsap;
	Promise._asap = asap;
	
	Promise.prototype = {
	  constructor: Promise,
	
	  /**
	    The primary way of interacting with a promise is through its `then` method,
	    which registers callbacks to receive either a promise's eventual value or the
	    reason why the promise cannot be fulfilled.
	  
	    ```js
	    findUser().then(function(user){
	      // user is available
	    }, function(reason){
	      // user is unavailable, and you are given the reason why
	    });
	    ```
	  
	    Chaining
	    --------
	  
	    The return value of `then` is itself a promise.  This second, 'downstream'
	    promise is resolved with the return value of the first promise's fulfillment
	    or rejection handler, or rejected if the handler throws an exception.
	  
	    ```js
	    findUser().then(function (user) {
	      return user.name;
	    }, function (reason) {
	      return 'default name';
	    }).then(function (userName) {
	      // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
	      // will be `'default name'`
	    });
	  
	    findUser().then(function (user) {
	      throw new Error('Found user, but still unhappy');
	    }, function (reason) {
	      throw new Error('`findUser` rejected and we're unhappy');
	    }).then(function (value) {
	      // never reached
	    }, function (reason) {
	      // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
	      // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
	    });
	    ```
	    If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
	  
	    ```js
	    findUser().then(function (user) {
	      throw new PedagogicalException('Upstream error');
	    }).then(function (value) {
	      // never reached
	    }).then(function (value) {
	      // never reached
	    }, function (reason) {
	      // The `PedgagocialException` is propagated all the way down to here
	    });
	    ```
	  
	    Assimilation
	    ------------
	  
	    Sometimes the value you want to propagate to a downstream promise can only be
	    retrieved asynchronously. This can be achieved by returning a promise in the
	    fulfillment or rejection handler. The downstream promise will then be pending
	    until the returned promise is settled. This is called *assimilation*.
	  
	    ```js
	    findUser().then(function (user) {
	      return findCommentsByAuthor(user);
	    }).then(function (comments) {
	      // The user's comments are now available
	    });
	    ```
	  
	    If the assimliated promise rejects, then the downstream promise will also reject.
	  
	    ```js
	    findUser().then(function (user) {
	      return findCommentsByAuthor(user);
	    }).then(function (comments) {
	      // If `findCommentsByAuthor` fulfills, we'll have the value here
	    }, function (reason) {
	      // If `findCommentsByAuthor` rejects, we'll have the reason here
	    });
	    ```
	  
	    Simple Example
	    --------------
	  
	    Synchronous Example
	  
	    ```javascript
	    let result;
	  
	    try {
	      result = findResult();
	      // success
	    } catch(reason) {
	      // failure
	    }
	    ```
	  
	    Errback Example
	  
	    ```js
	    findResult(function(result, err){
	      if (err) {
	        // failure
	      } else {
	        // success
	      }
	    });
	    ```
	  
	    Promise Example;
	  
	    ```javascript
	    findResult().then(function(result){
	      // success
	    }, function(reason){
	      // failure
	    });
	    ```
	  
	    Advanced Example
	    --------------
	  
	    Synchronous Example
	  
	    ```javascript
	    let author, books;
	  
	    try {
	      author = findAuthor();
	      books  = findBooksByAuthor(author);
	      // success
	    } catch(reason) {
	      // failure
	    }
	    ```
	  
	    Errback Example
	  
	    ```js
	  
	    function foundBooks(books) {
	  
	    }
	  
	    function failure(reason) {
	  
	    }
	  
	    findAuthor(function(author, err){
	      if (err) {
	        failure(err);
	        // failure
	      } else {
	        try {
	          findBoooksByAuthor(author, function(books, err) {
	            if (err) {
	              failure(err);
	            } else {
	              try {
	                foundBooks(books);
	              } catch(reason) {
	                failure(reason);
	              }
	            }
	          });
	        } catch(error) {
	          failure(err);
	        }
	        // success
	      }
	    });
	    ```
	  
	    Promise Example;
	  
	    ```javascript
	    findAuthor().
	      then(findBooksByAuthor).
	      then(function(books){
	        // found books
	    }).catch(function(reason){
	      // something went wrong
	    });
	    ```
	  
	    @method then
	    @param {Function} onFulfilled
	    @param {Function} onRejected
	    Useful for tooling.
	    @return {Promise}
	  */
	  then: then,
	
	  /**
	    `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
	    as the catch block of a try/catch statement.
	  
	    ```js
	    function findAuthor(){
	      throw new Error('couldn't find that author');
	    }
	  
	    // synchronous
	    try {
	      findAuthor();
	    } catch(reason) {
	      // something went wrong
	    }
	  
	    // async with promises
	    findAuthor().catch(function(reason){
	      // something went wrong
	    });
	    ```
	  
	    @method catch
	    @param {Function} onRejection
	    Useful for tooling.
	    @return {Promise}
	  */
	  'catch': function _catch(onRejection) {
	    return this.then(null, onRejection);
	  }
	};
	
	function polyfill() {
	    var local = undefined;
	
	    if (typeof global !== 'undefined') {
	        local = global;
	    } else if (typeof self !== 'undefined') {
	        local = self;
	    } else {
	        try {
	            local = Function('return this')();
	        } catch (e) {
	            throw new Error('polyfill failed because global object is unavailable in this environment');
	        }
	    }
	
	    var P = local.Promise;
	
	    if (P) {
	        var promiseToString = null;
	        try {
	            promiseToString = Object.prototype.toString.call(P.resolve());
	        } catch (e) {
	            // silently ignored
	        }
	
	        if (promiseToString === '[object Promise]' && !P.cast) {
	            return;
	        }
	    }
	
	    local.Promise = Promise;
	}
	
	// Strange compat..
	Promise.polyfill = polyfill;
	Promise.Promise = Promise;
	
	return Promise;
	
	})));
	//# sourceMappingURL=es6-promise.map
	
	/*** EXPORTS FROM exports-loader ***/
	module.exports = global.Promise;
	}.call(global));
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(11), __webpack_require__(10), (function() { return this; }())))

/***/ },
/* 11 */
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};
	
	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.
	
	var cachedSetTimeout;
	var cachedClearTimeout;
	
	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }
	
	
	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }
	
	
	
	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 12 */
/***/ function(module, exports) {

	/* (ignored) */

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Promise, global) {/*** IMPORTS FROM imports-loader ***/
	(function() {
	
	(function(self) {
	  'use strict';
	
	  if (self.fetch) {
	    return
	  }
	
	  var support = {
	    searchParams: 'URLSearchParams' in self,
	    iterable: 'Symbol' in self && 'iterator' in Symbol,
	    blob: 'FileReader' in self && 'Blob' in self && (function() {
	      try {
	        new Blob()
	        return true
	      } catch(e) {
	        return false
	      }
	    })(),
	    formData: 'FormData' in self,
	    arrayBuffer: 'ArrayBuffer' in self
	  }
	
	  function normalizeName(name) {
	    if (typeof name !== 'string') {
	      name = String(name)
	    }
	    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
	      throw new TypeError('Invalid character in header field name')
	    }
	    return name.toLowerCase()
	  }
	
	  function normalizeValue(value) {
	    if (typeof value !== 'string') {
	      value = String(value)
	    }
	    return value
	  }
	
	  // Build a destructive iterator for the value list
	  function iteratorFor(items) {
	    var iterator = {
	      next: function() {
	        var value = items.shift()
	        return {done: value === undefined, value: value}
	      }
	    }
	
	    if (support.iterable) {
	      iterator[Symbol.iterator] = function() {
	        return iterator
	      }
	    }
	
	    return iterator
	  }
	
	  function Headers(headers) {
	    this.map = {}
	
	    if (headers instanceof Headers) {
	      headers.forEach(function(value, name) {
	        this.append(name, value)
	      }, this)
	
	    } else if (headers) {
	      Object.getOwnPropertyNames(headers).forEach(function(name) {
	        this.append(name, headers[name])
	      }, this)
	    }
	  }
	
	  Headers.prototype.append = function(name, value) {
	    name = normalizeName(name)
	    value = normalizeValue(value)
	    var list = this.map[name]
	    if (!list) {
	      list = []
	      this.map[name] = list
	    }
	    list.push(value)
	  }
	
	  Headers.prototype['delete'] = function(name) {
	    delete this.map[normalizeName(name)]
	  }
	
	  Headers.prototype.get = function(name) {
	    var values = this.map[normalizeName(name)]
	    return values ? values[0] : null
	  }
	
	  Headers.prototype.getAll = function(name) {
	    return this.map[normalizeName(name)] || []
	  }
	
	  Headers.prototype.has = function(name) {
	    return this.map.hasOwnProperty(normalizeName(name))
	  }
	
	  Headers.prototype.set = function(name, value) {
	    this.map[normalizeName(name)] = [normalizeValue(value)]
	  }
	
	  Headers.prototype.forEach = function(callback, thisArg) {
	    Object.getOwnPropertyNames(this.map).forEach(function(name) {
	      this.map[name].forEach(function(value) {
	        callback.call(thisArg, value, name, this)
	      }, this)
	    }, this)
	  }
	
	  Headers.prototype.keys = function() {
	    var items = []
	    this.forEach(function(value, name) { items.push(name) })
	    return iteratorFor(items)
	  }
	
	  Headers.prototype.values = function() {
	    var items = []
	    this.forEach(function(value) { items.push(value) })
	    return iteratorFor(items)
	  }
	
	  Headers.prototype.entries = function() {
	    var items = []
	    this.forEach(function(value, name) { items.push([name, value]) })
	    return iteratorFor(items)
	  }
	
	  if (support.iterable) {
	    Headers.prototype[Symbol.iterator] = Headers.prototype.entries
	  }
	
	  function consumed(body) {
	    if (body.bodyUsed) {
	      return Promise.reject(new TypeError('Already read'))
	    }
	    body.bodyUsed = true
	  }
	
	  function fileReaderReady(reader) {
	    return new Promise(function(resolve, reject) {
	      reader.onload = function() {
	        resolve(reader.result)
	      }
	      reader.onerror = function() {
	        reject(reader.error)
	      }
	    })
	  }
	
	  function readBlobAsArrayBuffer(blob) {
	    var reader = new FileReader()
	    reader.readAsArrayBuffer(blob)
	    return fileReaderReady(reader)
	  }
	
	  function readBlobAsText(blob) {
	    var reader = new FileReader()
	    reader.readAsText(blob)
	    return fileReaderReady(reader)
	  }
	
	  function Body() {
	    this.bodyUsed = false
	
	    this._initBody = function(body) {
	      this._bodyInit = body
	      if (typeof body === 'string') {
	        this._bodyText = body
	      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
	        this._bodyBlob = body
	      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
	        this._bodyFormData = body
	      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
	        this._bodyText = body.toString()
	      } else if (!body) {
	        this._bodyText = ''
	      } else if (support.arrayBuffer && ArrayBuffer.prototype.isPrototypeOf(body)) {
	        // Only support ArrayBuffers for POST method.
	        // Receiving ArrayBuffers happens via Blobs, instead.
	      } else {
	        throw new Error('unsupported BodyInit type')
	      }
	
	      if (!this.headers.get('content-type')) {
	        if (typeof body === 'string') {
	          this.headers.set('content-type', 'text/plain;charset=UTF-8')
	        } else if (this._bodyBlob && this._bodyBlob.type) {
	          this.headers.set('content-type', this._bodyBlob.type)
	        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
	          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
	        }
	      }
	    }
	
	    if (support.blob) {
	      this.blob = function() {
	        var rejected = consumed(this)
	        if (rejected) {
	          return rejected
	        }
	
	        if (this._bodyBlob) {
	          return Promise.resolve(this._bodyBlob)
	        } else if (this._bodyFormData) {
	          throw new Error('could not read FormData body as blob')
	        } else {
	          return Promise.resolve(new Blob([this._bodyText]))
	        }
	      }
	
	      this.arrayBuffer = function() {
	        return this.blob().then(readBlobAsArrayBuffer)
	      }
	
	      this.text = function() {
	        var rejected = consumed(this)
	        if (rejected) {
	          return rejected
	        }
	
	        if (this._bodyBlob) {
	          return readBlobAsText(this._bodyBlob)
	        } else if (this._bodyFormData) {
	          throw new Error('could not read FormData body as text')
	        } else {
	          return Promise.resolve(this._bodyText)
	        }
	      }
	    } else {
	      this.text = function() {
	        var rejected = consumed(this)
	        return rejected ? rejected : Promise.resolve(this._bodyText)
	      }
	    }
	
	    if (support.formData) {
	      this.formData = function() {
	        return this.text().then(decode)
	      }
	    }
	
	    this.json = function() {
	      return this.text().then(JSON.parse)
	    }
	
	    return this
	  }
	
	  // HTTP methods whose capitalization should be normalized
	  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']
	
	  function normalizeMethod(method) {
	    var upcased = method.toUpperCase()
	    return (methods.indexOf(upcased) > -1) ? upcased : method
	  }
	
	  function Request(input, options) {
	    options = options || {}
	    var body = options.body
	    if (Request.prototype.isPrototypeOf(input)) {
	      if (input.bodyUsed) {
	        throw new TypeError('Already read')
	      }
	      this.url = input.url
	      this.credentials = input.credentials
	      if (!options.headers) {
	        this.headers = new Headers(input.headers)
	      }
	      this.method = input.method
	      this.mode = input.mode
	      if (!body) {
	        body = input._bodyInit
	        input.bodyUsed = true
	      }
	    } else {
	      this.url = input
	    }
	
	    this.credentials = options.credentials || this.credentials || 'omit'
	    if (options.headers || !this.headers) {
	      this.headers = new Headers(options.headers)
	    }
	    this.method = normalizeMethod(options.method || this.method || 'GET')
	    this.mode = options.mode || this.mode || null
	    this.referrer = null
	
	    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
	      throw new TypeError('Body not allowed for GET or HEAD requests')
	    }
	    this._initBody(body)
	  }
	
	  Request.prototype.clone = function() {
	    return new Request(this)
	  }
	
	  function decode(body) {
	    var form = new FormData()
	    body.trim().split('&').forEach(function(bytes) {
	      if (bytes) {
	        var split = bytes.split('=')
	        var name = split.shift().replace(/\+/g, ' ')
	        var value = split.join('=').replace(/\+/g, ' ')
	        form.append(decodeURIComponent(name), decodeURIComponent(value))
	      }
	    })
	    return form
	  }
	
	  function headers(xhr) {
	    var head = new Headers()
	    var pairs = (xhr.getAllResponseHeaders() || '').trim().split('\n')
	    pairs.forEach(function(header) {
	      var split = header.trim().split(':')
	      var key = split.shift().trim()
	      var value = split.join(':').trim()
	      head.append(key, value)
	    })
	    return head
	  }
	
	  Body.call(Request.prototype)
	
	  function Response(bodyInit, options) {
	    if (!options) {
	      options = {}
	    }
	
	    this.type = 'default'
	    this.status = options.status
	    this.ok = this.status >= 200 && this.status < 300
	    this.statusText = options.statusText
	    this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers)
	    this.url = options.url || ''
	    this._initBody(bodyInit)
	  }
	
	  Body.call(Response.prototype)
	
	  Response.prototype.clone = function() {
	    return new Response(this._bodyInit, {
	      status: this.status,
	      statusText: this.statusText,
	      headers: new Headers(this.headers),
	      url: this.url
	    })
	  }
	
	  Response.error = function() {
	    var response = new Response(null, {status: 0, statusText: ''})
	    response.type = 'error'
	    return response
	  }
	
	  var redirectStatuses = [301, 302, 303, 307, 308]
	
	  Response.redirect = function(url, status) {
	    if (redirectStatuses.indexOf(status) === -1) {
	      throw new RangeError('Invalid status code')
	    }
	
	    return new Response(null, {status: status, headers: {location: url}})
	  }
	
	  self.Headers = Headers
	  self.Request = Request
	  self.Response = Response
	
	  self.fetch = function(input, init) {
	    return new Promise(function(resolve, reject) {
	      var request
	      if (Request.prototype.isPrototypeOf(input) && !init) {
	        request = input
	      } else {
	        request = new Request(input, init)
	      }
	
	      var xhr = new XMLHttpRequest()
	
	      function responseURL() {
	        if ('responseURL' in xhr) {
	          return xhr.responseURL
	        }
	
	        // Avoid security warnings on getResponseHeader when not allowed by CORS
	        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
	          return xhr.getResponseHeader('X-Request-URL')
	        }
	
	        return
	      }
	
	      xhr.onload = function() {
	        var options = {
	          status: xhr.status,
	          statusText: xhr.statusText,
	          headers: headers(xhr),
	          url: responseURL()
	        }
	        var body = 'response' in xhr ? xhr.response : xhr.responseText
	        resolve(new Response(body, options))
	      }
	
	      xhr.onerror = function() {
	        reject(new TypeError('Network request failed'))
	      }
	
	      xhr.ontimeout = function() {
	        reject(new TypeError('Network request failed'))
	      }
	
	      xhr.open(request.method, request.url, true)
	
	      if (request.credentials === 'include') {
	        xhr.withCredentials = true
	      }
	
	      if ('responseType' in xhr && support.blob) {
	        xhr.responseType = 'blob'
	      }
	
	      request.headers.forEach(function(value, name) {
	        xhr.setRequestHeader(name, value)
	      })
	
	      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
	    })
	  }
	  self.fetch.polyfill = true
	})(typeof self !== 'undefined' ? self : this);
	
	
	/*** EXPORTS FROM exports-loader ***/
	module.exports = global.fetch;
	}.call(global));
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(10), (function() { return this; }())))

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _leaflet = __webpack_require__(2);
	
	var _leaflet2 = _interopRequireDefault(_leaflet);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	// import '../../assets/leaflet-plugins/TileLayer.EsriRest'
	
	var OSM = _leaflet2.default.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
	    maxZoom: 22
	});
	
	var _class = function () {
	    function _class(id) {
	        _classCallCheck(this, _class);
	
	        this.id = id;
	        this._map = null;
	    }
	
	    _createClass(_class, [{
	        key: 'getMap',
	        value: function getMap() {
	            if (!this._map) {
	                this._map = this.build();
	            }
	            return this._map;
	        }
	    }, {
	        key: 'build',
	        value: function build() {
	            var map = _leaflet2.default.map(this.id, {
	                layers: [OSM],
	                center: [60, 100],
	                zoom: 3,
	                maxZoom: 22
	            });
	
	            _leaflet2.default.tileLayer.wms("http://pkk5.rosreestr.ru/arcgis/services/Cadastre/CadastreWMS/MapServer/WmsServer", {
	                layers: '24,23,22,21,20,19,18,16,15,14,13,12,11,10,9,7,6,5,2,1',
	                subdomains: "abcd",
	                format: 'image/png24',
	                transparent: true,
	                attribution: "РосРеестр",
	                maxZoom: 22
	            }).addTo(map);
	
	            // if (L.TileLayer.EsriRest) {
	            //
	            //     new L.TileLayer.EsriRest("http://pkk5.rosreestr.ru/arcgis/rest/services/Cadastre/Cadastre/MapServer", {
	            //         subdomains: "abcd",
	            //         layers: '0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,21',
	            //         transparent: true,
	            //         maxZoom: 22
	            //     }).addTo(map);
	            // }
	            return map;
	        }
	    }]);

	    return _class;
	}();

	exports.default = _class;

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.AreaTypes = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _area_types = __webpack_require__(16);
	
	__webpack_require__(17);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var AreaTypes = exports.AreaTypes = function () {
	    function AreaTypes() {
	        _classCallCheck(this, AreaTypes);
	
	        this.dropdown = document.getElementById("area-types-btn");
	        this.dropdownUl = document.getElementById("area-types-options");
	        this._fillAreaTypeOptions();
	        this._type = null;
	
	        this.setType("Участки");
	    }
	
	    _createClass(AreaTypes, [{
	        key: "_fillAreaTypeOptions",
	        value: function _fillAreaTypeOptions() {
	            var _this = this;
	
	            _area_types.AREA_TYPES.forEach(function (value, key) {
	                var option = document.createElement("li");
	                var a = document.createElement("a");
	                a.href = "#";
	                a.innerHTML = key;
	                a.onclick = function () {
	                    _this.setType(key);
	                };
	                option.appendChild(a);
	                _this.dropdownUl.appendChild(option);
	            });
	        }
	    }, {
	        key: "setType",
	        value: function setType(key) {
	            this._type = _area_types.AREA_TYPES.get(key);
	            this.dropdown.getElementsByClassName("type-selected")[0].innerHTML = key;
	            this.close();
	        }
	    }, {
	        key: "setTypeById",
	        value: function setTypeById(id) {
	            var _this2 = this;
	
	            _area_types.AREA_TYPES.forEach(function (value, key) {
	                if (value === parseInt(id)) {
	                    _this2.setType(key);
	                    return true;
	                }
	            });
	        }
	    }, {
	        key: "close",
	        value: function close() {
	            this.dropdown.parentNode.className = this.dropdown.parentNode.className.replace(/\bopen/, '');
	            this.dropdown.setAttribute('aria-expanded', false);
	        }
	    }, {
	        key: "type",
	        get: function get() {
	            return this._type;
	        }
	    }]);

	    return AreaTypes;
	}();

/***/ },
/* 16 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	var AREA_TYPES = exports.AREA_TYPES = new Map([["Участки", 1], ["ОКС", 5], ["Кварталы", 2], ["Районы", 3], ["Округа", 4], ["Границы", 7], ["ЗОУИТ", 10], ["Тер. зоны", 6], ["Красные линии", 13], ["Лес", 12], ["СРЗУ", 15], ["ОЭЗ", 16], ["ГОК", 9]]);
	
	// export const AREA_TYPES = {
	//     "Участки": 1,
	//     "ОКС": 5,
	//     "Кварталы": 2,
	//     "Районы": 3,
	//     "Округа": 4,
	//     "Границы": 7,
	//     "ЗОУИТ": 10,
	//     "Тер. зоны": 6,
	//     "Красные линии": 13,
	//     "Лес": 12,
	//     "СРЗУ": 15,
	//     "ОЭЗ": 16,
	//     "ГОК": 9,
	// };

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	// Native Javascript for Bootstrap 3 | Dropdown
	// by dnp_theme
	
	(function(factory){
	
	  // CommonJS/RequireJS and "native" compatibility
	  if(true) {
	    // A commonJS/RequireJS environment
	    if(typeof window != "undefined") {
	      // Window and document exist, so return the factory's return value.
	      module.exports = factory();
	    } else {
	      // Let the user give the factory a Window and Document.
	      module.exports = factory;
	    }
	  } else {
	    // Assume a traditional browser.
	    window.Dropdown = factory();
	  }
	
	})(function(root){
	
	  // DROPDOWN DEFINITION
	  // ===================
	  var Dropdown = function( element) {
	    this.menu = typeof element === 'object' ? element : document.querySelector(element);
	    var self = this;
	    
	    this.handle = function(e) { // fix some Safari bug with <button>
	      var target = e.target || e.currentTarget,
	          children = [], c = self.menu.parentNode.getElementsByTagName('*');
	      /\#$/g.test(target.href) && e.preventDefault();
	
	      for ( var i=0, l = c.length||0; i<l; i++) { l && children.push(c[i]); }
	      if ( target === self.menu || target.parentNode === self.menu || target.parentNode.parentNode === self.menu ) { 
	        self.toggle(e); 
	      }  else if ( children && children.indexOf(target) > -1  ) {
	        return;
	      } else { self.close(); }
	    }
	    this.toggle = function(e) {
	      if (/\bopen/.test(this.menu.parentNode.className)) {
	        this.close();
	        document.removeEventListener('keydown', this.key, false);
	      } else {
	        this.menu.parentNode.className += ' open';
	        this.menu.setAttribute('aria-expanded',true);
	        document.addEventListener('keydown', this.key, false);
	      }
	    }
	    this.key = function(e) {
	      if (e.which == 27) {self.close();}
	    }
	    this.close = function() {
	      self.menu.parentNode.className = self.menu.parentNode.className.replace(/\bopen/,'');
	      self.menu.setAttribute('aria-expanded',false);
	    }
	    this.menu.setAttribute('tabindex', '0'); // Fix onblur on Chrome | Safari
	    document.addEventListener('click', this.handle, false);
	  }
	
	  // DROPDOWN DATA API
	  // =================
	  var Dropdowns = document.querySelectorAll('[data-toggle=dropdown]'), i = 0, ddl = Dropdowns.length;
	  for (i;i<ddl;i++) {
	    new Dropdown(Dropdowns[i]);
	  }
	
	  return Dropdown;
	
	});

/***/ },
/* 18 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.serializeUrlParam = serializeUrlParam;
	function serializeUrlParam(obj) {
	    var str = [];
	    for (var p in obj) {
	        if (obj.hasOwnProperty(p)) {
	            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
	        }
	    }return str.join("&");
	}

/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map