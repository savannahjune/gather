var Bx = Math.cos(lat2) * Math.cos(dLon);
var By = Math.cos(lat2) * Math.sin(dLon);
var lat3 = Math.atan2(Math.sin(lat1)+Math.sin(lat2),
                      Math.sqrt( (Math.cos(lat1)+Bx)*(Math.cos(lat1)+Bx) + By*By ) );
var lon3 = lon1 + Math.atan2(By, Math.cos(lat1) + Bx);

var map, directionsService, iconImage, MM, RM, poly, polypoi, geocoder,
    placesList;
var PM = new Array();
var categories = new Array("restaurant", "asian|japanese|chinese+restaurant",
    "bar|pub|tavern", "buffet", "coffee|cafe", "fast+food",
    "ice+cream|yogurt", "italian", "mexican", "pizza", "sandwich|subs",
    "entertainment", "fun|amusement|bowling", "golf",
    "hotel|motel|inn|lodge", "movie+theater", "local+parks", "store");
var ck = new Array();
var lats = new Array();
var lons = new Array();
var addresses = new Array();
var adds = new Array();
var pr = new Object();
var googlesearchdiv = "DG";
var mid, p, FS, mapLoaded, launchState, searchZoom, query, T;
var par, infoWindow;
var M = Math;
var M1 = "No response was received for ";
var M2 = "Be sure you are connected to the Internet";
var M3 = " For best results, wait until the map has finished loading before ";
var M4 = " then try again.";
var kRoute = "Route halfway point";
var kMid = "Midpoint";
var f1 = D("frm");
p = f1.places;
p.length = 0;
var f2 = D("frm2");
document.getElementById("copyyear").innerHTML = new Date().getFullYear();
f1.address.focus();

function initialize() {
    var F = document.createElement("script");
    F.src = "v3_epoly.js";
    F.type = "text/javascript";
    document.getElementsByTagName("head")[0].appendChild(F);
    infoWindow = new google.maps.InfoWindow({
        content: ""
    });
    geocoder = new google.maps.Geocoder();
    directionsService = new google.maps.DirectionsService();
    placesList = document.getElementById("DT");
    var u, A, g = "",
        d = "",
        h = "",
        k = "",
        C = "",
        n = "",
        a = "",
        B = "",
        f;
    var r = window.location.search.substring(1);
    r = r.replace(/\+/gi, " ");
    var G = r.split("&");
    if (G.length > 0) {
        for (A = 0; A < G.length; A++) {
            var E = G[A].split("=");
            u = decodeURIComponent(E[1]);
            switch (E[0]) {
                case "ml":
                    pr.ml = u;
                    break;
                case "mn":
                    pr.mn = u;
                    break;
                case "rl":
                    pr.rl = u;
                    break;
                case "rn":
                    pr.rn = u;
                    break;
                case "l":
                    lats = u.split("|");
                    break;
                case "n":
                    lons = u.split("|");
                    break;
                case "a":
                    addresses = u.split("|");
                    break;
                case "cl":
                    g = u;
                    break;
                case "cn":
                    d = u;
                    break;
                case "z":
                    h = parseInt(u);
                    break;
                case "av":
                    n = 1;
                    f1.avoid.checked = (u == 1);
                    break;
                case "cx":
                    a = 1;
                    f2.category.selectedIndex = u;
                    break;
                case "c":
                    pr.c = u;
                    break;
                case "name":
                    pr.name = u;
                    break;
                case "addr":
                    pr.addr = u;
                    break;
                case "pl":
                    pr.lat = u;
                    break;
                case "pn":
                    pr.lng = u;
                    break;
                case "u":
                    pr.url = "https://plus.google.com/" + u;
                    break;
                case "x":
                    k = 1;
                    f2.large.checked = (u == "1");
                    switchMap();
                    break
            }
        }
    }
    readCookie("ckDataM");
    if (k == "") {
        f2.large.checked = (ck[0] == "1");
        switchMap()
    }
    if (n == "") {
        f1.avoid.checked = (ck[4] == 1)
    }
    if (a == "") {
        f2.category.selectedIndex = M.max(ck[5], 0)
    }
    if (g != "" && d != "" && g >= -90 && g <= 90 && d >= -180 && d <= 180) {
        if (h == "") {
            h = 3
        }
        pr.b = 1;
        f = new google.maps.LatLng(g, d)
    } else {
        if (!isNaN(ck[1]) && !isNaN(ck[2])) {
            f = new google.maps.LatLng(ck[1], ck[2]);
            h = ck[3] * 1
        } else {
            f = new google.maps.LatLng(39.17, -98.297);
            h = 3
        }
    }
    var b = {
        zoom: h,
        center: f,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(D("map"), b);
    google.maps.event.addListener(map, "tilesloaded", function() {
        mapLoaded = true
    });
    setFocus(kMid);
    D("route").disabled = true;
    if (lats.length || !isNaN(pr.ml) || !isNaN(pr.rl) || !isNaN(pr.lat)) {
        var w, v, m;
        p.length = 0;
        for (i = 0; i < lats.length; i++) {
            var y = addresses[i];
            appendOptionLast("places", y);
            v = p.length - 1;
            p[v].lat = lats[v];
            p[v].lng = lons[v];
            m = splitAddress(addresses[v]);
            w = new google.maps.LatLng(p[v].lat, p[v].lng);
            p[v].marker = createMarker(w, formatInfo(addresses[v]), "", "");
            p[v].html = addresses[v]
        }
        if (v >= 0 && p.selectedIndex == -1) {
            p.selectedIndex = 0
        }
        if (!isNaN(pr.ml) && !isNaN(pr.mn)) {
            FS = kMid;
            if (lats.length == 1) {
                w = new google.maps.LatLng(lats[0], lons[0]);
                m = formatInfo(addresses[0], null, null, 1);
                MM = createMarker(w, m, "", kMid);
                p[0].marker.setVisible(false)
            } else {
                var o = "";
                if (lats.length == 2) {
                    o = "  'as the crow flies'"
                }
                var m = formatInfo("<b>Midpoint</b>" + o, pr.ml, pr.mn, 1);
                iconImage = "images/paleblue_MarkerM.png";
                var w = new google.maps.LatLng(pr.ml, pr.mn);
                MM = createMarker(w, m, iconImage, kMid)
            }
            MM.html = m
        }
        MM.startLatLng = w;
        addressCount();
        if (!isNaN(pr.lat) && !isNaN(pr.lng)) {
            pr.k = 1;
            searchCallback()
        }
        if (p.length == 2 && !isNaN(pr.rl) & !isNaN(pr.rn)) {
            par = 1;
            directions(p[1].lat, p[1].lng, 1, 0)
        }
        if (pr.c == 1) {
            pr.c = -1;
            setFocus(kRoute);
            D("route").disabled = false
        } else {
            if (pr.c == 0) {
                pr.c = -1;
                setFocus(kMid)
            }
        }
    }
    parBounds()
}

function parBounds() {
    if (!pr.b && lats.length) {
        setBounds(1, 1, 1, 1)
    }
    pr.b = 0
}

function unload() {
    setCookie("ckDataM", f2.large.checked * 1, map.getCenter().lat(), map.getCenter()
        .lng(), map.getZoom(), f1.avoid.checked * 1, f2.category.selectedIndex
    )
}

function readCookie(e) {
    var b = "" + document.cookie;
    var d = b.indexOf(e);
    if (d == -1 || e == "") {
        return ""
    }
    var a = b.indexOf(";", d);
    if (a == -1) {
        a = b.length
    }
    var c = unescape(b.substring(d + e.length + 1, a));
    ck = c.split("|")
}

function setCookie(l, n, o, m, k, c, d, f) {
    var h = 2500;
    var g = new Date();
    var b = new Date();
    b.setTime(g.getTime() + 3600000 * 24 * h);
    var a = n + "|" + o + "|" + m + "|" + k + "|" + c + "|" + d;
    document.cookie = l + "=" + escape(a) + ";expires=" + b.toGMTString()
}

function setFocus(a) {
    if (pr.c >= 0) {
        return
    }
    if (a == kRoute) {
        D("route").checked = true
    } else {
        D("midpoint").checked = true
    } if (a) {
        FS = a
    }
    for (i = 0; i < 2; i++) {}
}

function selectText(a) {
    if (window.getSelection) {
        var c = window.getSelection();
        if (c.setBaseAndExtent) {
            c.setBaseAndExtent(a, 0, a, 1)
        } else {
            var b = document.createRange();
            b.selectNodeContents(a);
            c.removeAllRanges();
            c.addRange(b)
        }
    } else {
        var b = document.body.createTextRange();
        b.moveToElementText(a);
        b.select()
    }
}

function setBounds(g, e, c, b) {
    if (pr.b) {
        return
    }
    var d = new google.maps.LatLngBounds();
    var a, f;
    if (c && MM) {
        a = MM.getPosition();
        d.extend(a)
    }
    if (b && RM) {
        a = RM.getPosition();
        d.extend(a)
    }
    if (e) {
        for (i = 0; i < PM.length; i++) {
            a = PM[i].getPosition();
            d.extend(a)
        }
    }
    if (g) {
        for (i = 0; i < p.length; i++) {
            var a = new google.maps.LatLng(p[i].lat, p[i].lng);
            d.extend(a)
        }
    }
    mapLoaded = false;
    map.fitBounds(d);
    if (map.getZoom() > 15) {
        map.setZoom(15)
    }
}

function dirError1() {
    if (directionsService.display) {
        displayError(
            "Driving directions could not be found for this point of interest.",
            0)
    } else {
        displayError("A route could not be found for these points.", 0)
    }
    clearTimeout(T)
}

function dirTimeout() {
    clearTimeout(T);
    if (D("DD").style.display == "none") {
        if (!launchState) {
            displayError(M1 + "your directions request." + M3 +
                "requesting directions.", 0)
        }
    }
}

function directions(a, b, g, h, c) {
    var f = p.selectedIndex;
    if (h == 0) {
        var d = new google.maps.LatLng(p[0].lat, p[0].lng)
    } else {
        if (f == -1) {
            displayError("You must select a starting address.", 0);
            p.focus();
            return false
        }
        var d = new google.maps.LatLng(p[f].lat, p[f].lng)
    }
    var k = new google.maps.LatLng(a, b);
    directionsService.display = h;
    if (g) {
        if (h) {
            directionsService.addressLine = adds[c]
        }
        var e = {
            origin: d,
            destination: k,
            travelMode: google.maps.TravelMode.DRIVING,
            avoidHighways: f1.avoid.checked
        }
    } else {
        directionsService.addressLine = p[f].text;
        var e = {
            origin: k,
            destination: d,
            travelMode: google.maps.TravelMode.DRIVING,
            avoidHighways: f1.avoid.checked
        }
    }
    directionsService.route(e, directionsCallback);
    launchState = mapLoaded;
    clearTimeout(T);
    T = window.setTimeout(dirTimeout, 8000)
}

function directionsCallback(b, c) {
    clearTimeout(T);
    if (c == google.maps.DirectionsStatus.OK) {
        infoWindow.close();
        if (p.length == 1) {
            MM.setPosition(MM.startLatLng)
        }
        if (p.length == 2 && directionsService.display == 0) {
            if (poly) {
                poly.setMap(null)
            }
            path = b.routes[0].overview_path;
            createPoly(path);
            if (poly) {
                var k = poly.Distance() / 2;
                mid = poly.GetPointAtDistance(k);
                if (RM) {
                    RM = remove(RM)
                }
                if (!par) {
                    var a = new google.maps.LatLng(mid.lat(), mid.lng())
                } else {
                    var a = new google.maps.LatLng(pr.rl, pr.rn)
                }
                var d = formatInfo("<b>Route halfway point</b>", a.lat(), a
                    .lng(), 1);
                iconImage = "images/purple_MarkerR.png";
                RM = createMarker(a, d, iconImage, kRoute);
                setFocus(kRoute);
                D("route").disabled = false;
                RM.html = d;
                RM.startLatLng = a;
                geocoder.geocode({
                    latLng: a
                }, revGeoCallback)
            }
            toggleDivs(["DX", "DE", "DS"], 1);
            par = 0
        } else {
            var g = b.routes[0].legs[0].steps;
            var e = "";
            for (i = 0; i < g.length; i++) {
                e +=
                    '<p style="width: 15.6em; margin: auto 0.3em auto auto; padding: 2px; border-top: #C0C0C0 solid 1px">' +
                    (i + 1) + ". " + trim(g[i].instructions) + "  " + trim(
                        g[i].distance.text) + "</p>"
            }
            e += '<p style="margin: 0">' + directionsService.addressLine +
                "</p>";
            e += '<p style="margin: 0">Total distance: ' + b.routes[0].legs[
                0].distance.text + "</p>";
            e += '<p style="margin: 0">' + b.routes[0].copyrights + "</p>";
            e +=
                '<p style="margin: 0"><a class="bluelink" href="javascript:hideDirections()" style="margin-left: 2px">Hide directions</a></p>';
            D("DD").innerHTML = e;
            toggleDivs(["DD", "DC", "DT", "DX", "DE", "DS"], 1);
            if (polypoi) {
                polypoi.setMap(null)
            }
            path = b.routes[0].overview_path;
            createPolypoi(path);
            var f = b.routes[0].bounds;
            if (f) {
                mapLoaded = false;
                map.fitBounds(f);
                if (map.getZoom() > 15) {
                    map.setZoom(15)
                }
            }
        }
    } else {
        dirError1()
    }
}

function revGeoCallback(d, b) {
    if (d && b == google.maps.GeocoderStatus.OK) {
        var c = "<b>Route halfway point</b>";
        var a = RM.startLatLng;
        var e = "Nearest address: <br>" + splitAddress(d[0].formatted_address);
        c = formatInfo(c, a.lat(), a.lng(), 1, e);
        RM.setMap(null);
        RM = createMarker(a, c, iconImage, kRoute);
        RM.startLatLng = a;
        RM.html = c
    }
}

function hideDirections() {
    if (D("DD").style.display == "block") {
        toggleDivs(["DT", "DX", "DC", "DD", "DS", "DE"], 1);
        if (polypoi) {
            polypoi.setMap(null)
        }
        setBounds(0, 1, 0, 0)
    }
}

function getDragHtml(d) {
    var a, b;
    if (FS == kMid) {
        a = MM;
        b = "MM"
    } else {
        a = RM;
        b = "RM"
    }
    var c = "<div style='width: 15.62em'>";
    c +=
        '<a class="bluelink" href="javascript:infoWindow.close(); if (PM.length>0) setBounds(0,1,0,0)">Zoom to points of interest</a><br>';
    c += "Current location:<br>";
    c += "Latitude: " + roundx(a.getPosition().lat(), 7) +
        "<br>Longitude: " + roundx(a.getPosition().lng(), 7) + "<br>";
    c += '<a class="bluelink" href="javascript:' + b +
        ".dragHtml=undefined; " + b + ".setPosition(" + b +
        '.startLatLng); clearResults(1); setBounds(1,0,1,1)">Reset to ' +
        FS + "</a></div>";
    a.dragHtml = c;
    if (d) {
        searchZoom = 0;
        search()
    }
}

function searchTimeout() {
    clearTimeout(T);
    if (D("DT").style.display == "none") {
        if (!launchState) {
            displayError(M1 + "your search." + M3 + "starting a search.", 0)
        }
    }
}

function search() {
    if (p.length == 0 && !MM) {
        displayError(
            "You must add one or more addresses before searching for points of interest.",
            0);
        if (D("DA").style.display != "none") {
            f1.address.focus()
        }
        return
    }
    var b, e;
    var c = f2.category.selectedIndex;
    if (c > -1) {
        e = categories[c]
    } else {
        e = trim(f2.categoryedit.value)
    } if (!e) {
        displayError("A search category must be selected or entered.", 8);
        f2.categoryedit.focus();
        return
    }
    if (RM && FS == kRoute) {
        b = RM.getPosition()
    } else {
        if (MM && FS == kMid) {
            b = MM.getPosition()
        } else {
            b = new google.maps.LatLng(p[0].lat, p[0].lng)
        }
    }
    var d = {
        location: b,
        radius: 10,
        query: e
    };
    clearGeocode();
    clearResults(0);
    t5();
    pr.k = 0;
    var a = new google.maps.places.PlacesService(map);
    a.textSearch(d, searchCallback);
    launchState = mapLoaded;
    clearTimeout(T);
    T = window.setTimeout(searchTimeout, 8000)
}

function searchCallback(a, c) {
    if (!pr.k && c != google.maps.places.PlacesServiceStatus.OK) {
        displayError("No search results were found near this location.", 8);
        return
    } else {
        if (!pr.k) {
            var d = a
        } else {
            var d = new Array();
            d[0] = {
                geometry: {
                    location: new google.maps.LatLng(pr.lat, pr.lng)
                },
                name: pr.name,
                formatted_address: pr.addr,
                opening_hours: {
                    open_now: 0
                }
            }
        }
        D("DP").style.display = "none";
        toggleDivs(["DT", "DC", "DD", "DX", "DE", "DS"], 1);
        var h, b, g, f;
        for (var e = 0; e < d.length; e++) {
            h = e;
            b = d[e].geometry.location;
            adds[h] = d[e].formatted_address;
            g = '<div style="width: 15em">' + d[e].name + "<br>" +
                splitAddress(d[e].formatted_address) +
                '<br>Directions: <a class="bluelink" href="javascript:directions(' +
                b.lat() + "," + b.lng() + ",1,1," + h +
                ')">To here</a> - <a class="bluelink" href="javascript:directions(' +
                b.lat() + "," + b.lng() + ",0,1," + h + ')">From here</a>';
            if (d[e].rating >= 0) {
                g += "<br>Rating: " + d[e].rating
            }
            if (d[e].opening_hours && d[e].opening_hours.open_now) {
                g += "<br>Open now: Yes"
            }
            g += '<br><a class="bluelink" href="javascript:more(' + h +
                ',0)">Info page</a>';
            g += '       <a class="bluelink" href="javascript:more(' + h +
                ',1)">Send</a>';
            if (!pr.k) {
                g += '       <a class="bluelink" href="javascript:more(' +
                    h + ',2)">Save</a>'
            }
            g += "</div>";
            var k = "images/blue_Marker" + String.fromCharCode(e + 65) +
                ".png";
            f = createMarker(b, "", k, "");
            f.html = g;
            f.reference = d[e].reference;
            f.i = h;
            PM.push(f);
            placesList.innerHTML +=
                '<a class="bluelink" href="javascript:google.maps.event.trigger(PM[' +
                (h) + "], 'click')\">" + String.fromCharCode(e + 65) +
                "</a>&nbsp;" + d[e].name + "<br />"
        }
        switch (searchZoom) {
            case 0:
                getDragHtml(0);
                break;
            case 1:
                if (FS == kMid) {
                    setBounds(0, 1, 1, 0)
                } else {
                    setBounds(0, 1, 0, 1)
                }
                break;
            case 2:
                setBounds(0, 1, 0, 0)
        }
    }
}

function createPoly(a) {
    poly = new google.maps.Polyline({
        path: [],
        strokeColor: "#0000FF",
        strokeWeight: 5
    });
    for (j = 0; j < a.length; j++) {
        poly.getPath().push(a[j])
    }
    poly.setMap(map)
}

function createPolypoi(a) {
    polypoi = new google.maps.Polyline({
        path: [],
        strokeColor: "#00FF00",
        strokeWeight: 5
    });
    for (j = 0; j < a.length; j++) {
        polypoi.getPath().push(a[j])
    }
    polypoi.setMap(map)
}

function createMarker(a, d, c, h) {
    var e = null,
        g = null,
        f = true;
    if (c) {
        e = c;
        g = {
            url: "images/shadow50.png",
            size: new google.maps.Size(37, 34),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(10, 34)
        }
    }
    var b = new google.maps.Marker({
        position: a,
        map: map,
        icon: e,
        shadow: g,
        visible: f
    });
    if (h) {
        b.setDraggable(true)
    }
    google.maps.event.addListener(b, "click", function() {
        if (b.dragHtml) {
            infoWindow.content = b.dragHtml
        } else {
            if (b.html) {
                infoWindow.content = b.html
            } else {
                infoWindow.content = d
            }
        }
        infoWindow.open(map, b);
        if (h) {
            setFocus(h)
        }
    });
    google.maps.event.addListener(b, "dragstart", function() {
        infoWindow.close();
        setFocus(h)
    });
    google.maps.event.addListener(b, "dragend", function() {
        getDragHtml(1)
    });å
    return b
}

function triggerMid() {
    if (MM && p.length > 1) {
        clearResults(0);
        google.maps.event.trigger(MM, "click")
    }
}

function triggerRoute() {
    if (RM) {
        clearResults(0);
        google.maps.event.trigger(RM, "click")
    }
}

function clearResults(a) {
    clearTimeout(T);
    for (i = PM.length - 1; i >= 0; i--) {
        PM[i].setMap(null)
    }
    PM.length = 0;
    infoWindow.close();
    if (polypoi) {
        polypoi.setMap(null)
    }
    D("DD").innerHTML = "";
    D("DT").innerHTML = "";
    D("DBR").style.display = "none";
    toggleDivs(["DX", "DC", "DT", "DD", "DE", "DS"], 2);
    if (a) {
        setBounds(1, 0, 1, 1)
    }
}

function clearAll() {
    clearResults(0);
    for (i = p.length - 1; i >= 0; i--) {
        p[i].marker.setMap(null)
    }
    p.length = 0;
    addressCount();
    MM = remove(MM);
    RM = remove(RM);
    setFocus(kMid);
    D("route").disabled = true;
    if (poly) {
        poly.setMap(null)
    }
    clearGeocode();
    FS = kMid
}

function clearGeocode() {
    f1.address.value = "";
    toggleDivs(["DA", "DB", "DR", "DB2"], 2);
    f1.results.length = 0
}

function removeOptionSelected() {
    var a = p.selectedIndex;
    if (a >= 0) {
        clearTimeout(T);
        p[a].marker.setMap(null);
        p.remove(a);
        addressCount();
        if (p.length > 0 && p.selectedIndex == -1) {
            p.selectedIndex = 0
        }
        switch (p.length) {
            case 0:
                clearAll();
                return false;
                break;
            case 1:
                RM = remove(RM);
                setFocus(kMid);
                D("route").disabled = true;
                if (poly) {
                    poly.setMap(null)
                }
                p[0].marker.setVisible(false);
                clearResults(1);
                break;
            case 2:
                clearResults(1);
                directions(p[1].lat, p[1].lng, 1, 0)
        }
        calculate()
    }
}

function appendToList() {
    var f = f1.results;
    var e = M.max(f.selectedIndex, 0);
    var c = f[e].text;
    clearResults(0);
    appendOptionLast("places", c);
    var b = p.length - 1;
    p[b].lat = f[e].lat;
    p[b].lng = f[e].lng;
    clearGeocode();
    if (b >= 0 && p.selectedIndex == -1) {
        p.selectedIndex = 0
    }
    if (b == 1) {
        p[0].marker.setVisible(true);
        directions(p[1].lat, p[1].lng, 1, 0)
    } else {
        if (b == 2) {
            if (poly) {
                poly.setMap(null)
            }
            RM = remove(RM);
            setFocus(kMid);
            D("route").disabled = true
        }
    }
    var a = new google.maps.LatLng(p[b].lat, p[b].lng);
    var d = splitAddress(c);
    p[b].marker = createMarker(a, formatInfo(d), "", "");
    p[b].marker.setMap(map);
    p[b].html = d;
    if (b == 0) {
        p[b].marker.setVisible(false)
    }
    toggleDivs(["DX", "DE", "DS"], 1);
    calculate();
    addressCount();
    setBounds(1, 0, 1, 1)
}

function calculate() {
    var n = 0;
    var q = 0;
    var k = 0;
    var g = 0;
    var f = 0;
    var a, h, d;
    var c, e;
    var b = p.length;
    for (i = 0; i < p.length; i++) {
        c = rad(p[i].lat);
        e = rad(p[i].lng);
        a = M.cos(c) * M.cos(e);
        h = M.cos(c) * M.sin(e);
        d = M.sin(c);
        k += a;
        g += h;
        f += d
    }
    k = k / b;
    g = g / b;
    f = f / b;
    q = M.atan2(g, k);
    hyp = M.sqrt(k * k + g * g);
    n = M.atan2(f, hyp);
    if (M.abs(k) < 1e-9 && M.abs(g) < 1e-9 && M.abs(f) < 1e-9) {
        displayError("The midpoint is the center of the earth.", 8);
        return false
    } else {
        n = deg(n);
        q = deg(q);
        MM = remove(MM);
        var m = new google.maps.LatLng(n, q);
        if (b == 1) {
            html = formatInfo(p[0].html, null, null, 1);
            MM = createMarker(m, html, "", kMid)
        } else {
            var o = "";
            if (b == 2) {
                o = "  'as the crow flies'"
            }
            html = formatInfo("<b>Midpoint</b>" + o, n, q, 1);
            iconImage = "images/paleblue_MarkerM.png";
            MM = createMarker(m, html, iconImage, kMid)
        }
        MM.setMap(map);
        setFocus(kMid);
        D("route").disabled = true;
        MM.startLatLng = m;
        MM.html = html
    }
}

function formatInfo(e, f, a, d, c) {
    var b = '<div style="width: 17.5em">';
    b += e;
    if (d) {
        b +=
            '<br><a class="bluelink" href="javascript:searchZoom=1; search()">Search near here</a>'
    }
    if (c) {
        b += "<br>" + c
    }
    if (f != undefined && f != null) {
        b += "<br>Latitude: " + roundx(f, 7) + "<br>Longitude: " + roundx(a,
            7)
    }
    if (d) {
        b += "<br><b>Drag me</b> to search other locations"
    }
    b += "</div>";
    return b
}

function remove(a) {
    if (a) {
        a.setMap(null);
        return null
    }
}

function appendOptionLast(d, b) {
    var c = document.createElement("option");
    c.text = b;
    c.value = b;
    var e = D(d);
    try {
        e.add(c, null)
    } catch (a) {
        e.add(c)
    }
}

function displayError(b, a) {
    alert(b);
    D("DEF").innerHTML = b;
    D("DEF").style.margin = a + "px 0";
    toggleDivs(["DE", "DX", "DS"], 1)
}

function addressCount() {
    D("address1").innerHTML = "Address " + (p.length + 1) + ":";
    switch (p.length) {
        case 0:
            D("place1").innerHTML = "Your addresses:";
            break;
        case 1:
            D("place1").innerHTML = "Your 1 address:";
            break;
        default:
            D("place1").innerHTML = "Your " + p.length + " addresses:"
    }
}

function checkKeycode(a) {
    var b = f2.categoryedit.value;
    if (trim(b) != "") {
        f2.category.selectedIndex = -1
    }
}

function rad(a) {
    return (a * M.PI / 180)
}

function deg(a) {
    return (a * 180 / M.PI)
}

function splitAddress(b) {
    var a = b.split(/\s*,\s*/);
    if (b.length > 30 || a.length > 3 || (a.length == 3 && /\d/.test(a[0]))) {
        b = b.replace(/\s*,\s*/, "<br>")
    }
    b = b.replace(", United States", "");
    return b
}

function trim(a) {
    if (a.charCodeAt(0) > 32 && a.charCodeAt(a.length - 1) > 32) {
        return a
    } else {
        return a.replace(/^\s+|\s+$/g, "")
    }
}

function roundx(b, a) {
    return M.round(b * M.pow(10, a)) / M.pow(10, a)
}

function toggleDivs(a, b) {
    for (i = 0; i < a.length; i++) {
        if (i < b) {
            D(a[i]).style.display = "block"
        } else {
            D(a[i]).style.display = "none"
        }
    }
}

function switchMap() {
    if (f2.large.checked) {
        D("map").style.width = "100%";
        D("map").style.height = "29.4em"
    } else {
        D("map").style.width = "31.25em";
        D("map").style.height = "24.69em"
    } if (map) {
        google.maps.event.trigger(map, "resize")
    }
    if (p.length > 0) {
        setBounds(1, 1, 1, 1)
    }
}

function t5() {
    toggleDivs(["DS", "DX", "DE"], 1)
}

function D(a) {
    return document.getElementById(a)
}

function geoTimeout() {
    clearTimeout(T);
    if (!launchState) {
        displayError(M1 + "this address." + M3 + "adding an address.", 0)
    }
}

function launchGeocode() {
    if (!map) {
        displayError(
            "Please be sure you are connected to the Internet and that the page is fully loaded. If necessary, reload the page.",
            0);
        return false
    }
    query = trim(f1.address.value);
    var b = query.length;
    if (b == 0) {
        displayError(
            "You must enter an address, city or other place to search for.",
            8);
        f1.address.focus();
        return false
    }
    var d = query.split(",");
    if (d.length == 2) {
        b = trim(d[0]);
        var a = trim(d[1]);
        if (b == parseFloat(b) && b >= -90 && b <= 90 && a == parseFloat(a) &&
            a >= -180 && a <= 180) {
            var c = f1.results;
            c.length = 1;
            c[0].text = b + ", " + a;
            c[0].lat = b;
            c[0].lng = a;
            appendToList();
            return false
        }
    }
    geocoder.geocode({
        address: query
    }, gCallback);
    toggleDivs(["DS", "DC", "DX", "DE", "DT", "DD"], 2);
    launchState = mapLoaded;
    clearTimeout(T);
    T = window.setTimeout(geoTimeout, 6000)
}

function gCallback(b, a) {
    var c = f1.results;
    c.length = 0;
    clearTimeout(T);
    if (a != "OK") {
        switch (a) {
            case "ZERO_RESULTS":
                displayError("Address not found.", 0);
                break;
            case "QUERY_OVER_LIMIT":
                break;
            case "REQUEST_DENIED":
                break;
            case "INVALID_REQUEST":
        }
        return
    }
    for (i = 0; i < b.length; i++) {
        addr = b[i].formatted_address;
        appendOptionLast("results", addr.replace(", USA", ""));
        c[c.length - 1].lat = b[i].geometry.location.lat();
        c[c.length - 1].lng = b[i].geometry.location.lng()
    }
    setResultsBox(c.length)
}

function setResultsBox(a) {
    if (a == 1) {
        appendToList()
    } else {
        toggleDivs(["DR", "DB2", "DX", "DA", "DB", "DE", "DS"], 3);
        D("resultslabel").innerHTML = "Select from " + a + " results:";
        f1.results.focus()
    }
}

function mail(a) {
    if (!pr.k) {
        pr.name = a.name;
        pr.addr = a.formatted_address;
        pr.url = a.url
    }
    var c = pr.name + "<br>" + splitAddress(pr.addr) + "<br>";
    c = c.replace(/<br>/gi, "\n");
    c = c.replace(/<.*?>/g, "");
    c = c.replace(/<.*?>/g, "");
    var b = "mailto:?subject=" + encodeURI("Let's get together") + "&body=" +
        encodeURIComponent(c + "\nMap and information\n").replace(/&/g,
            "%26") + pr.url.replace(/&/g, "%26");
    window.open(b)
}

function more(b, d) {
    if (pr.k) {
        if (d == 0) {
            window.open(pr.url)
        } else {
            if (d == 1) {
                mail()
            }
        }
        return
    }
    pr.n = d;
    var c = {
        reference: PM[b].reference
    };
    var a = new google.maps.places.PlacesService(map);
    a.getDetails(c, moreCallback)
}

function moreCallback(A, q) {
    if (q != google.maps.places.PlacesServiceStatus.OK) {
        return
    }
    switch (pr.n) {
        case 0:
            window.open(A.url);
            break;
        case 1:
            mail(A);
            break;
        case 2:
            var b, t = "",
                y = "",
                f, c, k = "",
                g = "",
                w = "",
                z = "",
                x = "",
                o = p.length;
            b = A;
            f = "cl=" + roundx(map.getCenter().lat(), 6) + "&cn=" + roundx(
                    map.getCenter().lng(), 6) + "&z=" + map.getZoom() +
                "&x=" + f2.large.checked * 1 + "&c=" + (FS == kRoute) * 1 +
                "&av=" + f1.avoid.checked * 1 + "&cx=" + f2.category.selectedIndex;
            f += "&name=" + encode(b.name) + "&addr=" + encode(b.formatted_address) +
                "&pl=" + b.geometry.location.lat() + "&pn=" + b.geometry.location
                .lng();
            c = "&u=" + encode(b.url.substring(24));
            if (o > 0) {
                if (MM) {
                    y = "ml=" + roundx(MM.getPosition().lat(), 7) + "&mn=" +
                        roundx(MM.getPosition().lng(), 7) + "&"
                }
                if (RM) {
                    y += "rl=" + roundx(RM.getPosition().lat(), 7) + "&rn=" +
                        roundx(RM.getPosition().lng(), 7) + "&"
                }
                var v = "Microsoft Internet Explorer";
                var s = location.href + "?";
                s = s.substring(0, s.indexOf("?"));
                var m = 2083 + 1927 * (navigator.appName != v) - s.length -
                    y.length - f.length - c.length - 10;
                i = 0;
                var d = getLength(i, "");
                while (i < o && k.length + g.length + w.length + d.tot.length <
                    m) {
                    k += d.l;
                    g += d.n;
                    w += d.a;
                    i++;
                    if (i < o) {
                        d = getLength(i, "|")
                    }
                }
                y += "l=" + k + "&n=" + g + "&a=" + w
            }
            if (y.length > 2) {
                y += "&"
            }
            y += f + c;
            if (i < o) {
                x +=
                    " Your browser can save this point of interest, the midpoint for all places, and the first " +
                    i + " place markers."
            }
            z =
                "Click ok to refresh the page. You can then save the page/map in your Bookmarks/Favorites.";
            w = confirm(z + x);
            if (w) {
                window.location.search = "?" + y
            }
    }
}

function getLength(c, b) {
    var a = new Object();
    a.l = b + p[c].marker.getPosition().lat();
    a.n = b + p[c].marker.getPosition().lng();
    a.a = b + encode(p[c].text);
    a.tot = a.l + a.n + a.a;
    return a
}

function encode(a) {
    a = encodeURIComponent(a.replace(/United States/gi, "USA"));
    a = a.replace(/%2c/gi, ",");
    return a.replace(/%20/gi, "+")
}
google.maps.event.addDomListener(window, "load", initialize);