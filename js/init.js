var navalMap;
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
            x: 1800,
            y: 1800,
            scale: 1
        },
        compass: {
            x: 1800,
            y: 1800,
            scale: 0.55
        },
        portsOffset: {
            x: 208,
            y: 55,
            ratio: 4000/8600
        },
        gps:{
            x: 2000,
            y: 1931,
            ratio: 2.33
        }
    };
    navalMap = new NavalMap('canvas', 'img/map-lighter.jpg', 'img/compass.png', config);
}