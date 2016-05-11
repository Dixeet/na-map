var getShopFromId = function (id) {
    for (i = 0; i < Shops.length; i++) {
        if (Shops[i].Id == id) {
            return Shops[i];
        }
    }
    return null;
};

// get port by id
var getPortFromId = function (id) {
    for (i = 0; i < Ports.length; i++) {
        if (Ports[i].Id == id) {
            return Ports[i];
        }
    }
    return "PORT NOT FOUND";
};

// get nation from index
var getNationFromIdx = function (idx) {
    return Nations.Nations[idx];
};

var getNationFromName = function (name) {
    for (var i = 0; i < Nations.Nations.length; i++) {
        if (Nations.Nations[i].Name == name) {
            return Nations.Nations[i];
        }
    }
    return null;
};

var getNationIdxFromName = function (name) {
    for (var i = 0; i < Nations.Nations.length; i++) {
        if (Nations.Nations[i].Name == name) {
            return i;
        }
    }
    return 0;
};

var getPortFromName = function (name) {
    for (var i = 0; i < Ports.length; i++) {
        if (Ports[i].Name == name) {
            return Ports[i];
        }
    }
    return null;
};

// get item template from id
var getItemTemplateFromId = function (id) {
    for (var itemTemplateIdx = 0; itemTemplateIdx < ItemTemplates.length; itemTemplateIdx++) {
        if (ItemTemplates[itemTemplateIdx].Id == id) {
            return ItemTemplates[itemTemplateIdx];
        }
    }
    return null;
};

// get item template from name
var getItemTemplateFromName = function (name, ignoreClasses) {
    for (var itemTemplateIdx = 0; itemTemplateIdx < ItemTemplates.length; itemTemplateIdx++) {
        if (ignoreClasses != null && ItemTemplates[itemTemplateIdx].ItemType.indexOf(ignoreClasses) != -1)
        {
            continue;
        }
        if (ItemTemplates[itemTemplateIdx].Name == name) {
            return ItemTemplates[itemTemplateIdx];
        }
    }
    return null;
};

var distance_XZ = function (p0, p1) {
    return (p0.x - p1.x) * (p0.x - p1.x) + (p0.z - p1.z) * (p0.z - p1.z);
};

var distance_XY = function (p0, p1) {
    return (p0.x - p1.x) * (p0.x - p1.x) + (p0.y - p1.y) * (p0.y - p1.y);
};