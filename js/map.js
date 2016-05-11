'use strict';

function NavalMap(canvasId, imageMapUrl, imageCompassUrl, config) {
    this.canvas = document.getElementById(canvasId);
    this.imageMap = new Image();
    this.imageCompass = new Image();
    this.config = config;
    this.init(imageMapUrl, imageCompassUrl);
}

NavalMap.prototype.init = function init(imageMapUrl, imageCompassUrl) {
    var self = this;
    this.loadDataUrl(function () {
        self.loadImageMap(imageMapUrl, function () {
                self.loadImageCompass(imageCompassUrl, function () {
                    var stage = new createjs.Stage(canvas);
                    createjs.Touch.enable(stage);
                    stage.enableMouseOver(10);
                    self.map = new Map(self.canvas, stage, self.imageMap, self.imageCompass, self.config);

                })
            }
        )
    });
};

NavalMap.prototype.loadImageMap = function loadImageMap(url, cb) {
    this.imageMap.src = url;
    this.imageMap.onload = function () {
        if (cb) {
            cb();
        }
    };
};

NavalMap.prototype.loadImageCompass = function loadImageCompass(url, cb) {
    this.imageCompass.src = url;
    this.imageCompass.onload = function () {
        if (cb) {
            cb();
        }
    };
};

NavalMap.prototype.loadDataUrl = function loadDataUrl(cb) {
    $.getScript("http://storage.googleapis.com/nacleanopenworldprodshards/ItemTemplates_cleanopenworldprodeu1.json").done(
        $.getScript("http://storage.googleapis.com/nacleanopenworldprodshards/Nations_cleanopenworldprodeu1.json").done(
            $.getScript("http://storage.googleapis.com/nacleanopenworldprodshards/Shops_cleanopenworldprodeu1.json").done(
                $.getScript("http://storage.googleapis.com/nacleanopenworldprodshards/Ports_cleanopenworldprodeu1.json").done(function () {
                        if (cb) {
                            cb();
                        }
                    }
                ))))
    ;
};

function Map(canvas, stage, imageMap, imageCompass, config) {
    this.canvas = canvas;
    this.config = config;
    this.stage = stage;
    this.globalContainer = new createjs.Container();
    this.mapContainer = new createjs.Container();
    this.portsContainer = new createjs.Container();
    this.unmodifiedMapContainer = {};
    this.compass = new Compass(imageCompass, config);
    this.update = false;
    this.alreadyZooming = false;
    this.init(imageMap);
}

Map.prototype.init = function (imageMap) {
    this.stage.addChild(this.globalContainer);
    this.globalContainer.addChild(this.mapContainer);
    this.globalContainer.addChild(this.compass);
    this.mapContainer.addChild(new createjs.Bitmap(imageMap));
    this.mapContainer.addChild(this.portsContainer);
    this.mapContainer.hasBeenDblClicked = false;
    this.createAllEvents();
    this.resizeCanvas();
    this.initContainerMap();
    this.addPorts();
    this.update = true;
};

Map.prototype.initContainerMap = function () {
    this.setScale(this.config.map.scale);
    this.centerTo(this.config.map.x, this.config.map.y);
    var self = this;
    this.mapContainer.addLine = function (x, y) {
        var shape = new createjs.Shape();
        self.mapContainer.lineIndex = self.mapContainer.children.length;
        self.mapContainer.addChild(shape);
        shape.graphics.setStrokeStyle(5, "round").beginStroke('#3d3d3d').moveTo((self.compass.x - self.mapContainer.x) / self.mapContainer.scale, (self.compass.y - self.mapContainer.y) / self.mapContainer.scale).lineTo(x, y);
    };

    this.mapContainer.removeLine = function () {
        if (self.mapContainer.lineIndex) {
            self.mapContainer.removeChildAt(self.mapContainer.lineIndex);
        }
    };
    this.globalContainer.cursor = "default";
};

Map.prototype.setScale = function (scale) {
    this.mapContainer.scale = this.mapContainer.scaleX = this.mapContainer.scaleY = scale;
};

Map.prototype.zoom = function (increment) {
    this.setScale(this.mapContainer.scale + increment);
};

Map.prototype.addPorts = function () {
    var self = this;
    Ports.forEach(function (port, idx) {
        var circle = new createjs.Shape();
        circle.graphics.beginFill(self.config.color[port.Nation]).drawCircle(0, 0, 10);
        circle.x = (port.sourcePosition.x + self.config.portsOffset.x);
        circle.y = (port.sourcePosition.y + self.config.portsOffset.y);
        circle.cursor = "pointer";
        circle.idx = idx;
        circle.on("click", function (evt) {
            console.log('toto');
        });
        self.portsContainer.addChild(circle);
    });
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

Map.prototype.getMapPosFromWindowPos = function (x, y) {
    return {
        x: (x - this.unmodifiedMapContainer.x) / this.unmodifiedMapContainer.scale,
        y: (y - this.unmodifiedMapContainer.y) / this.unmodifiedMapContainer.scale
    };
};

Map.prototype.createAllEvents = function () {
    this.resizeCanvasEvent();
    this.mouseDownEvent();
    this.clickEvent();
    this.pressMoveEvent();
    this.pressUpEvent();
    this.dblClickEvent();
    this.mouseWheelEvent();
    this.tickEvent();
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
            x: Math.round((mapPos.x - 4301) / 5),
            y: Math.round(-(mapPos.y - 4151) / 5)
        };
        $('#cursorX').text(gpsPos.x);
        $('#cursorY').text(gpsPos.y);
    });
};

Map.prototype.mouseDownEvent = function () {
    this.globalContainer.on("mousedown", function (evt) {
        this.offset = {x: this.x - evt.stageX, y: this.y - evt.stageY};
        this.cursor = "move";
    });
};

Map.prototype.pressMoveEvent = function () {
    var self = this;
    this.globalContainer.on("pressmove", function (evt) {
        this.x = evt.stageX + this.offset.x;
        this.y = evt.stageY + this.offset.y;
        this.cursor = "move";
        self.update = true;
    });
};

Map.prototype.pressUpEvent = function () {
    var self = this;
    this.globalContainer.on("pressup", function (evt) {
        this.cursor = "default";
        self.update = true;
    });
};

Map.prototype.mouseWheelEvent = function () {
    var self = this;
    $('#canvas').mousewheel(function (event) {
        if (!self.alreadyZooming) {
            self.alreadyZooming = true;
            setTimeout(function () {
                self.alreadyZooming = false;
            }, 40);
            if (event.deltaY == 1) {
                if (self.mapContainer.scale < 1) {
                    self.zoom(0.1);
                    self.keepMapUnderPos(event.pageX, event.pageY);
                    self.keepCompassUnderCurrentPos();
                }
            } else if (event.deltaY == -1) {
                if (self.mapContainer.scale > 0.2) {
                    self.zoom(-0.1);
                    self.keepMapUnderPos(event.pageX, event.pageY);
                    self.keepCompassUnderCurrentPos();
                }
            }
            //self.compass.x += self.mapContainer.x - self.unmodifiedMapContainer.x;
            //self.compass.y += self.mapContainer.y - self.unmodifiedMapContainer.y;
            //self.compass.keepSizeAndPos(self.unmodifiedMapContainer.scale, self.mapContainer.scale);
            self.update = true;
        }
    });

};

Map.prototype.resizeCanvasEvent = function () {
    window.addEventListener('resize', this.resizeCanvas, false);
};

Map.prototype.resizeCanvas = function () {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.update = true;
};

Map.prototype.tickEvent = function () {
    var self = this;
    createjs.Ticker.addEventListener("tick", function (event) {
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
}
Compass.prototype = new createjs.Container();
Compass.prototype.constructor = Compass;

Compass.prototype.setScale = function (scale) {
    this.scale = this.scaleX = this.scaleY = scale;
};