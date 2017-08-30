



user.prototype.location = function() {
    navigator.geolocation.getCurrentPosition(function (location) {
      console.log(location);
    });
}

function initMap() {
  var uluru = {lat: -25.363, lng: 131.044};
  navigator.geolocation.getCurrentPosition(function (location) {
    var map = new google.maps.Map(document.getElementById('Map'), {
        center:{lat: location.coords.latitude, lng: location.coords.longitude},
        zoom: 10,
    });
  });
  var marker = new google.maps.Marker({
    position: uluru,
    map: map
  });
  var geocoder = new google.maps.Geocoder();

  document.getElementById('submit').addEventListener('click', function() {
    geocodeAddress(geocoder, map);
  });
}
function geocodeAddress(geocoder, map) {
  var address = document.getElementById('address').value;
  geocoder.geocode({'address': address}, function(results, status) {
    if (status === 'OK') {
      var marker = new google.maps.Marker({
        'map': map,
        position: results[0].geometry.location,
      });
      console.log(results[0].geometry.location);
      // resultsMap.panTo(results[0].geometry.location);
      // var marker = new google.maps.Marker({
      //   map: resultsMap,
      //   position: results[0].geometry.location
      // });
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}
