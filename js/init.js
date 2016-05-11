function initMap() {
    var config = {
        color: {
            1: 'Black', //Pirate
            2: 'Gold', //Spanish
            3: 'DarkBlue', //French
            4: 'Red', //English
            5: 'DarkOrange', // Hollande
            6: 'Maroon', //Danish
            7: 'Cyan', //Sweden
            8: 'Lime', //Us
            9: 'DimGrey'//Neutral
        },
        map: {
            x: 4409,
            y: 4376,
            scale: 0.30
        },
        compass: {
            x: 0,
            y: 0,
            scale: 0.7
        },
        portsOffset: {
            x: 208,
            y: 55
        }
    };
    new NavalMap('canvas', 'img/old_map.jpg', 'img/compass.png', config);
}