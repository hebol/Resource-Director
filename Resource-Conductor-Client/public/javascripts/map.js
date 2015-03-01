var map;
var socket;

function padTime(text) {
    return ("00" + text).slice(-2);
}

$(document).ready(function() {
    var mapOptions = {
        zoom:           13,
        center:         new google.maps.LatLng(57.70, 11.95),
        mapTypeId:      google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style:    google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.BOTTOM_RIGHT
        },
        panControl: true,
        panControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM
        },
        zoomControl: true,
        zoomControlOptions: {
            style:    google.maps.ZoomControlStyle.LARGE,
            position: google.maps.ControlPosition.RIGHT_BOTTOM
        },
        scaleControl:      true,
        streetViewControl: false
    };

    map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

    socket = io.connect('http://localhost:7133');

    socket.on('time', function (data) {
        var date = new Date(data);
        $("#time").html(padTime(date.getHours()) + ':' + padTime(date.getMinutes()) + ':' + padTime(date.getSeconds()));
    });
});
