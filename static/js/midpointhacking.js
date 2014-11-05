var Bx = Math.cos(lat2) * Math.cos(dLon);
var By = Math.cos(lat2) * Math.sin(dLon);
var lat3 = Math.atan2(Math.sin(lat1)+Math.sin(lat2),
                      Math.sqrt( (Math.cos(lat1)+Bx)*(Math.cos(lat1)+Bx) + By*By ) );
var lon3 = lon1 + Math.atan2(By, Math.cos(lat1) + Bx);