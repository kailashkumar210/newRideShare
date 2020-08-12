export default {
    MAP_STYLE_BLUE: [
      {
        featureType: 'administrative',
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#444444',
          },
        ],
      },
      {
        featureType: 'landscape',
        elementType: 'all',
        stylers: [
          {
            color: '#f2f2f2',
          },
        ],
      },
      {
        featureType: 'poi',
        elementType: 'all',
        stylers: [
          {
            visibility: 'off',
          },
        ],
      },
      {
        featureType: 'road',
        elementType: 'all',
        stylers: [
          {
            saturation: -100,
          },
          {
            lightness: 45,
          },
        ],
      },
      {
        featureType: 'road.highway',
        elementType: 'all',
        stylers: [
          {
            visibility: 'simplified',
          },
        ],
      },
      {
        featureType: 'road.arterial',
        elementType: 'labels.icon',
        stylers: [
          {
            visibility: 'off',
          },
        ],
      },
      {
        featureType: 'transit',
        elementType: 'all',
        stylers: [
          {
            visibility: 'off',
          },
        ],
      },
      {
        featureType: 'water',
        elementType: 'all',
        stylers: [
          {
            color: '#46bcec',
          },
          {
            visibility: 'on',
          },
        ],
      },
    ],
    MAP_STYLE_APPLE: [
      { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#f7f1df' }] },
      { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#d0e3b4' }] },
      { featureType: 'landscape.natural.terrain', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
      { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
      { featureType: 'poi.business', elementType: 'all', stylers: [{ visibility: 'off' }] },
      { featureType: 'poi.medical', elementType: 'geometry', stylers: [{ color: '#fbd3da' }] },
      { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#bde6ab' }] },
      { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ visibility: 'off' }] },
      { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'off' }] },
      { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ color: '#ffe15f' }] },
      { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#efd151' }] },
      { featureType: 'road.arterial', elementType: 'geometry.fill', stylers: [{ color: '#ffffff' }] },
      { featureType: 'road.local', elementType: 'geometry.fill', stylers: [{ color: 'black' }] },
      { featureType: 'transit.station.airport', elementType: 'geometry.fill', stylers: [{ color: '#cfb2db' }] },
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#a2daf2' }] },
    ],
    MAP_STYLE_ULTRA_BLUE: [
      { featureType: 'all', elementType: 'all', stylers: [{ hue: '#008eff' }] },
      { featureType: 'transit', elementType: 'all', stylers: [{ visibility: 'on' }] },
      { featureType: 'water', elementType: 'all', stylers: [{ visibility: 'simplified' }, { saturation: '-60' }, { lightness: '-20' }] },
      { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#d0e3b4' }] },
      { featureType: 'landscape.natural.terrain', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
      { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
      { featureType: 'road', elementType: 'all', stylers: [{ saturation: '0' }, { lightness: '0' }] },
      { featureType: 'poi.business', elementType: 'all', stylers: [{ visibility: 'off' }] },
      { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#bde6ab' }] },
      { featureType: 'road', elementType: 'all', stylers: [{ saturation: '0' }, { lightness: '0' }] },
      { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ visibility: 'off' }] },
      { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'off' }] },
      { featureType: 'road.arterial', elementType: 'geometry.fill', stylers: [{ color: '#ffffff' }] },
      { featureType: 'road.local', elementType: 'geometry.fill', stylers: [{ color: 'black' }] },
      { featureType: 'transit.station.airport', elementType: 'geometry.fill', stylers: [{ color: '#cfb2db' }] },
    ],
  };
  