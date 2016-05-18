'use strict';

function NavalMap(canvasId, imageMapUrl, imageCompassUrl, config) {
    this.canvas = document.getElementById(canvasId);
    this.imageMap = new Image();
    this.imageCompass = new Image();
    this.config = config;
    this.itemsLoaded = false;
    this.nationsLoaded = false;
    this.shopsLoaded = false;
    this.portsLoaded = false;
    this.imageMapLoaded = false;
    this.imageCompassLoaded = false;
    this.init(imageMapUrl, imageCompassUrl);
}

NavalMap.prototype.init = function init(imageMapUrl, imageCompassUrl) {
    var self = this;
    this.loadEverything(imageMapUrl, imageCompassUrl, function () {
        var stage = new createjs.Stage(self.canvas);
        createjs.Touch.enable(stage);
        stage.enableMouseOver(5);
        stage.tickEnabled = false;
        //createjs.Ticker.framerate = 60;
        createjs.Ticker.timingMode = createjs.Ticker.RAF;
        self.map = new Map(self.canvas, stage, self.imageMap, self.imageCompass, self.config);
    });
};

NavalMap.prototype.loadImageMap = function loadImageMap(url, cb) {
    this.imageMap.src = url;
    var self = this;
    this.imageMap.onload = function () {
        self.imageMapLoaded = true;
        if (self.checkEverethingIsLoaded()) {
            if(cb) {
                cb();
            }
        }
    };
};

NavalMap.prototype.loadImageCompass = function loadImageCompass(url, cb) {
    this.imageCompass.src = url;
    var self = this;
    this.imageCompass.onload = function () {
        self.imageCompassLoaded = true;
        if (self.checkEverethingIsLoaded()) {
            if(cb) {
                cb();
            }
        }
    };
};

NavalMap.prototype.checkEverethingIsLoaded = function () {
    return this.itemsLoaded && this.nationsLoaded && this.shopsLoaded && this.portsLoaded && this.imageMapLoaded && this.imageCompassLoaded;
};

NavalMap.prototype.loadItems = function(cb) {
    var self = this;
    $.getScript("items.php").done(function(){
        self.itemsLoaded = true;
        if (self.checkEverethingIsLoaded()) {
            if(cb) {
                cb();
            }
        }
    });
};

NavalMap.prototype.loadNations = function(cb) {
    var self = this;
    $.getScript("nations.php").done(function(){
        self.nationsLoaded = true;
        if (self.checkEverethingIsLoaded()) {
            if(cb) {
                cb();
            }
        }
    });
};

NavalMap.prototype.loadShops = function(cb) {
    var self = this;
    $.getScript("shops.php").done(function(){
        self.shopsLoaded = true;
        if (self.checkEverethingIsLoaded()) {
            if(cb) {
                cb();
            }
        }
    });
};

NavalMap.prototype.loadPorts = function(cb) {
    var self = this;
    $.getScript("ports.php").done(function(){
        self.portsLoaded = true;
        if (self.checkEverethingIsLoaded()) {
            if(cb) {
                cb();
            }
        }
    });
};


NavalMap.prototype.loadEverything = function loadEverything(urlMap, urlCompass, cb) {
    this.loadImageMap(urlMap, cb);
    this.loadImageCompass(urlCompass, cb);
    this.loadShops(cb);
    this.loadItems(cb);
    this.loadPorts(cb);
    this.loadNations(cb);
};

function Map(canvas, stage, imageMap, imageCompass, config) {
    this.canvas = canvas;
    this.config = config;
    this.stage = stage;
    this.globalContainer = new createjs.Container();
    this.mapContainer = new createjs.Container();
    this.unmodifiedMapContainer = {};
    this.compass = new Compass(imageCompass, config);
    this.update = false;
    this.alreadyZooming = false;
    this.gpsCursor = undefined;
    this.statistics = {};
    this.fpsLabel = new createjs.Text("-- fps", "bold 18px Arial", "black");
    this.init(imageMap);
}

Map.prototype.init = function (imageMap) {
    this.stage.addChild(this.globalContainer);
    this.stage.addChild(this.fpsLabel);
    this.fpsLabel.x = 240;
    this.fpsLabel.y = 10;
    this.globalContainer.addChild(this.mapContainer);
    this.globalContainer.addChild(this.compass);
    this.mapContainer.addChild(new createjs.Bitmap(imageMap));
    this.mapContainer.hasBeenDblClicked = false;
    this.initContainerMap();
    this.resizeCanvas(this);
    this.createAllEvents();
    var self = this;
    Nations.Nations.forEach(function(nation) {
        self.statistics[nation.Name] = 0;
    });
    this.addPorts();
    this.stage.update();
    self.tickEvent();
    setTimeout(function() {
        $("#progress-bar-load").hide();
        $(".top-nav").removeClass('hide');
        $("#port-information").removeClass('hide');
        $("#how-to-use").removeClass('hide');
    },600);
    //this.update = true;
};

Map.prototype.initContainerMap = function () {
    this.setScale(this.config.map.scale);
    this.centerTo(this.config.map.x, this.config.map.y);
    var self = this;
    this.mapContainer.addLine = function (x, y) {
        var shape = new createjs.Shape();
        self.mapContainer.lineIndex = self.mapContainer.children.length;
        self.mapContainer.addChild(shape);
        shape.graphics.setStrokeStyle(3, "round").beginStroke('#3d3d3d').moveTo((self.compass.x - self.mapContainer.x) / self.mapContainer.scale, (self.compass.y - self.mapContainer.y) / self.mapContainer.scale).lineTo(x, y);
    };

    this.mapContainer.removeLine = function () {
        if (self.mapContainer.lineIndex) {
            self.mapContainer.removeChildAt(self.mapContainer.lineIndex);
        }
    };
    //this.globalContainer.cursor = "default";
};

Map.prototype.populateStatistics = function () {
    var stats = $("#ports-number");
    $.each(this.statistics, function(name, number) {
        stats.append('<strong>' + name + ' : </strong>' + number + '<br>');
    })
};

Map.prototype.setScale = function (scale) {
    this.mapContainer.scale = this.mapContainer.scaleX = this.mapContainer.scaleY = scale;
};

Map.prototype.zoom = function (increment) {
    this.setScale(this.mapContainer.scale + increment);
};

Map.prototype.addPorts = function () {
    var self = this;
    setTimeout(function() {
        Ports.forEach(function (port, idx) {
            var circle = new createjs.Shape();
            circle.graphics.beginFill(self.config.color[port.Nation]).drawCircle(0, 0, 5);
            circle.x = (port.sourcePosition.x + self.config.portsOffset.x) * self.config.portsOffset.ratio;
            circle.y = (port.sourcePosition.y + self.config.portsOffset.y) * self.config.portsOffset.ratio;
            circle.cursor = "pointer";
            circle.idx = idx;
            self.statistics[getNationFromIdx(port.Nation).Name] += 1;
            circle.on("click", function () {
                var currPort = Ports[this.idx];
                $('#port-title').text(currPort.Name);
                $('#nation').text(getNationFromIdx(currPort.Nation).Name);
                var timer = currPort.ConquestFlagTimeSlot + 'h - ' + (currPort.ConquestFlagTimeSlot + 2) + "h";
                $('#timer').text(currPort.ConquestFlagTimeSlot == -1?'No Timer':timer);
                $('#capital').text(currPort.Capital?'yes':'no');
                $('#regional').text(currPort.Regional?'yes':'no');
                $('#shallow').text(currPort.Depth == 1?'yes':'no');
                $('#capturer').text(currPort.Capturer);
                var produces = Shops[this.idx].ResourcesProduced;
                var consumes = Shops[this.idx].ResourcesConsumed;
                $('#produces-list').html('');
                $('#consumes-list').html('');
                produces.forEach(function (produce) {
                    var item = getItemTemplateFromId(produce.Key);
                    $('#produces-list').append('<li class="list-group-item">'+item.Name+' : '+ produce.Value+'</li>');
                });
                consumes.forEach(function (consume) {
                    var item = getItemTemplateFromId(consume.Key);
                    $('#consumes-list').append('<li class="list-group-item">'+item.Name+' : '+ consume.Value+'</li>');
                });
            });
            circle.cache(-5, -5, 10, 10);
            self.mapContainer.addChild(circle);
        });
        self.update = true;
        self.stage.tick();
        self.populateStatistics();
    },200);
};

Map.prototype.keepMapUnderPos = function (x, y) {
    var mapPos = this.getMapPosFromWindowPos(x, y);
    this.globalContainer.x = x - this.mapContainer.scale * mapPos.x;
    this.globalContainer.y = y - this.mapContainer.scale * mapPos.y;
};

Map.prototype.keepCompassUnderCurrentPos = function () {
    var mapPos = this.getMapPosFromWindowPos(this.compass.x + this.unmodifiedMapContainer.x, this.compass.y + this.unmodifiedMapContainer.y);
    this.compass.x = mapPos.x * this.mapContainer.scale;
    this.compass.y = mapPos.y * this.mapContainer.scale;
};

Map.prototype.centerTo = function (x, y) {
    this.globalContainer.x = this.canvas.width / 2 - this.mapContainer.scale * x;
    this.globalContainer.y = this.canvas.height / 2 - this.mapContainer.scale * y;
};

Map.prototype.getNewWindowPosFromMapPos = function (x, y) {
    return {
        x: x * this.mapContainer.scale + this.mapContainer.x - this.globalContainer.x,
        y: y * this.mapContainer.scale + this.mapContainer.y - this.globalContainer.y
    }
};

Map.prototype.getMapPosFromGpsPos = function(x , y) {
    return {
        x: Math.round(x * this.config.gps.ratio + this.config.gps.x),
        y: Math.round(-(y * this.config.gps.ratio - this.config.gps.y))
    }
};

Map.prototype.getMapPosFromWindowPos = function (x, y) {
    return {
        x: (x - this.unmodifiedMapContainer.x) / this.unmodifiedMapContainer.scale,
        y: (y - this.unmodifiedMapContainer.y) / this.unmodifiedMapContainer.scale
    };
};


Map.prototype.gps = function (x, y) {
    if (this.gpsCursor) {
        this.mapContainer.removeChild(this.gpsCursor);
    }
    this.gpsCursor = new createjs.Shape();
    this.gpsCursor.graphics.setStrokeStyle(2).beginStroke("OrangeRed").drawCircle(0,0,30);
    var mapPos = this.getMapPosFromGpsPos(x, y);
    this.gpsCursor.x = mapPos.x + (Math.random() > 0.5 ? Math.floor((Math.random() * 10 * 13 / 10)) : - Math.floor((Math.random() * 10 * 13 / 10)));
    this.gpsCursor.y = mapPos.y + (Math.random() > 0.5 ? Math.floor((Math.random() * 10 * 13 / 10)) : - Math.floor((Math.random() * 10 * 13 / 10)));
    this.mapContainer.addChild(this.gpsCursor);
    this.centerTo(mapPos.x, mapPos.y);
    this.update = true;
};

Map.prototype.gpsSubmitEvent = function () {
    var self = this;
    $("#gpsForm").submit(function (event) {
        event.preventDefault();
        self.gps($('#xGps').val(), $('#yGps').val());
    });
};

Map.prototype.createAllEvents = function () {
    this.resizeCanvasEvent();
    this.gpsSubmitEvent();
    this.mouseDownEvent();
    this.clickEvent();
    this.pressMoveEvent();
    //this.pressUpEvent();
    this.dblClickEvent();
    this.mouseWheelEvent();
};

Map.prototype.dblClickEvent = function () {
    var self = this;
    this.globalContainer.on("dblclick", function (evt) {
        if (this.hasBeenDblClicked) {
            self.mapContainer.addLine((evt.stageX - self.globalContainer.x) / self.mapContainer.scale, (evt.stageY - self.globalContainer.y) / self.mapContainer.scale);
            this.hasBeenDblClicked = false;
        } else {
            self.mapContainer.removeLine();
            self.compass.x = (evt.stageX - self.globalContainer.x);
            self.compass.y = (evt.stageY - self.globalContainer.y);
            this.hasBeenDblClicked = true;
        }
        self.update = true;
    });
};

Map.prototype.clickEvent = function () {
    var self = this;
    this.globalContainer.on("click", function (evt) {
        var mapPos = self.getMapPosFromWindowPos(evt.stageX, evt.stageY);
        var gpsPos = {
            x: Math.round((mapPos.x - self.config.gps.x) / self.config.gps.ratio),
            y: Math.round(-(mapPos.y - self.config.gps.y) / self.config.gps.ratio)
        };
        $('#cursorX').text(gpsPos.x);
        $('#cursorY').text(gpsPos.y);
    });
};

Map.prototype.mouseDownEvent = function () {
    this.globalContainer.on("mousedown", function (evt) {
        this.offset = {x: this.x - evt.stageX, y: this.y - evt.stageY};
        //this.cursor = "move";
    });
};

Map.prototype.pressMoveEvent = function () {
    var self = this;
    this.globalContainer.on("pressmove", function (evt) {
        this.x = evt.stageX + this.offset.x;
        this.y = evt.stageY + this.offset.y;
        //this.cursor = "move";
        self.update = true;
    });
};

Map.prototype.pressUpEvent = function () {
    var self = this;
    this.globalContainer.on("pressup", function (evt) {
        this.cursor = "default";
        //self.update = true;
    });
};

Map.prototype.mouseWheelEvent = function () {
    var self = this;
    $('#canvas').mousewheel(function (event) {
        if (!self.alreadyZooming) {
            self.alreadyZooming = true;
            setTimeout(function () {
                self.alreadyZooming = false;
            }, 45);
            if (event.deltaY == 1) {
                if (self.mapContainer.scale < 1.8) {
                    self.zoom(0.1);
                    self.keepMapUnderPos(event.pageX, event.pageY);
                    self.keepCompassUnderCurrentPos();
                }
            } else if (event.deltaY == -1) {
                if (self.mapContainer.scale > 0.4) {
                    self.zoom(-0.1);
                    self.keepMapUnderPos(event.pageX, event.pageY);
                    self.keepCompassUnderCurrentPos();
                }
            }
            self.update = true;
        }
    });

};

Map.prototype.resizeCanvasEvent = function () {
    var self = this;
    window.addEventListener('resize', function(){self.resizeCanvas(self)}, false);
};

Map.prototype.resizeCanvas = function (self) {
    self.canvas.width = window.innerWidth;
    self.canvas.height = window.innerHeight;
    self.update = true;
};

Map.prototype.tickEvent = function () {
    var self = this;
    createjs.Ticker.addEventListener("tick", function (event) {
        self.fpsLabel.text = Math.round(createjs.Ticker.getMeasuredFPS()) + " fps";
        if (self.update) {
            self.copyMapContainer();
            self.update = false; // only update once
            self.stage.update(event);
        }
    });
};

Map.prototype.copyMapContainer = function () {
    this.unmodifiedMapContainer = {
        x: this.globalContainer.x,
        y: this.globalContainer.y,
        scale: this.mapContainer.scale
    }
};

function Compass(imageCompass, config) {
    this.addChild(new createjs.Bitmap(imageCompass).setTransform(-imageCompass.width / 2, -imageCompass.height / 2));
    this.setScale(config.compass.scale);
    this.x = config.compass.x;
    this.y = config.compass.y;
}
Compass.prototype = new createjs.Container();
Compass.prototype.constructor = Compass;

Compass.prototype.setScale = function (scale) {
    this.scale = this.scaleX = this.scaleY = scale;
};