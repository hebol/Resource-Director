var timeSocket,
    eventSocket,
    resourceSocket,
    logSocket;


var updateReport = function() {
    if (logSocket && !$('#report').is(":visible")) {
        $('#reportTable').dataTable().fnClearTable();
        console.log('querying for reports', new Date());
        logSocket.emit('queryCaseStatus');
    }
};

var logPrototype = {
    priority:   "-",
    address:    "-",
    caseId:     "-",
    received:   "-",
    assigned:   "-",
    accepted:   "-",
    arrived:    "-",
    loaded:     "-",
    atHospital: "-",
    finished:   "-"
};

var merge = function(o1, o2) {
   for (var key in o1) {
       if (o2.hasOwnProperty(key)) {
           o1[key] = o2[key];
       }
   }
    return o1;
};

$(document).ready(function() {
    // Initialize the map and add it to the map-canvas
    initMap(57.70, 11.95);

    var reportTable =$("#reportTable")
        .dataTable({columns: [
            { data: 'priority'   },
            { data: 'caseId'     },
            { data: 'address'    },
            { data: 'received'   },
            { data: 'assigned'   },
            { data: 'accepted'   },
            { data: 'arrived'    },
            { data: 'loaded'     },
            { data: 'atHospital' },
            { data: 'finished'   }
        ]});

    registerConsumer('log-service', function(service) {
        console.log('will connect to log-service', service.url);
        if (logSocket == null) {
            logSocket = io.connect(service.url);
            logSocket.on('caseStatus', function(cases) {
                console.log('has received cases', cases, 'on', logSocket.id);
                for (var aCase in cases) {
                    if (cases[aCase].hasOwnProperty('received') && cases[aCase].received) {
                        cases[aCase].received = dateUtil.getDateTime(new Date(cases[aCase].received));
                    }
                    reportTable.fnAddData((merge(Object.create(logPrototype), cases[aCase])));
                    console.log(cases[aCase]);
                }
            });
        }
    });

    // Subscribe to time updates
    registerConsumer('time-service', function(service) {
        if (timeSocket == null) {
            timeSocket = io.connect(service.url);
            timeSocket.on('time', function (data, type) {
                var date = new Date(data);
                $("#clock").html(dateUtil.getTime(date));
                $("#day").html(dateUtil.getDate(date));
                if (type == 'set') {
                    $("#newTime").val(date.toJSON().slice(0, 19));
                    clearResourceAndEventData();
                    clearMapMarkers();
                    $('#reportTable').dataTable().fnClearTable();
                }
            });
        }
    });

    // Subscribe to event updates
    registerConsumer('event-service', function(service) {
        if (eventSocket == null) {
            eventSocket = io.connect(service.url);
            eventSocket.on('event', function (data) {
                createOrUpdateMarker(data,  data.index, data.address, "event", EVENT_Z);
            });
        }
    });

    // Subscribe to event updates
    registerConsumer('resource-service', function(service) {
        if (resourceSocket == null) {
            resourceSocket = io.connect(service.url);
            resourceSocket.on('resourcesUpdated', function (data) {
                data.forEach(function(resource) {
                    (function() {
                        if (resource.type === "S") {
                            createOrUpdateMarker(resource, resource.name, resource.area, "station", STATION_Z);
                        } else if (resource.type === "A") {
                            createOrUpdateMarker(resource, resource.name + ' (' + resource.status + ')', resource.homeStation, "ambulance", AMBULANCE_Z);
                        }
                    })();
                });
            });
        }
    });
});
