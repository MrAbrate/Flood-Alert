var userInfo;
var GeolocateOptions;
var MAp;
var signUp = document.getElementById('SignInButton');
var logOut = document.getElementById('SignOut');
var mar = 1;


if (signUp) {
  signUp.addEventListener("click", function (){
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function (result){
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;

    }).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
    });
  });
};
if (logOut) {
    logOut.addEventListener("click", function (){
      firebase.auth().signOut().then(function() {
        // Sign-out successful.
      }).catch(function(error) {
        // An error happened.
      });
    });
}
geolocator.config({
  language: "en",
  google: {
    version: "3",
    key: "AIzaSyAF9DOghSXDQqCptcRxrbb1BifRAm77aqo"
  }
});
window.onload = function () {
    GeolocateOptions = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumWait: 10000,     // max wait time for desired accuracy
      maximumAge: 0,          // disable cache
      desiredAccuracy: 10,    // meters
      fallbackToIP: true,     // fallback to IP if Geolocation fails or rejected
      addressLookup: true,    // requires Google API key if true
      timezone: false,         // requires Google API key if true
    };
    Date.prototype.monthNames = [
        "January", "February", "March",
        "April", "May", "June",
        "July", "August", "September",
        "October", "November", "December"
    ];
    Date.prototype.getMonthName = function() {
        return this.monthNames[this.getMonth()];
    };
};


firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    $(document).ready(function (){
      $('#Profile-Info').show(1000);
      $('#SignInButton').hide(1000);
    });

    // For displaying the User's Name and Profile Picture
    userInfo = user;

    this.ProfileName = document.getElementById('Profile-Info-Name');
    this.ProfileName.textContent = userInfo.displayName;



    var ProfilePic;
    ProfilePic = document.getElementById('Profile-Info-Pic');
    ProfilePic.style.backgroundImage = 'url(' + userInfo.photoURL + ')';


    initMap();
    userData();
    // IMPORTANT
    // IMPORTANT
    // IMPORTANT

    // This continusly updates firebases, location of the user.
    // var locate = setInterval(sendUserLocation, 10000);

  }
  else {
    // No user is signed in.
    $(document).ready(function (){
      $('#Profile-Info').hide(1000);
      $('#SignInButton').show(1000);
    });
  }
});

// Geolocation Functions
// Google Maps Api
function initMap () {
  navigator.geolocation.getCurrentPosition(function (location) {
    MAp= new google.maps.Map(document.getElementById('map'), {
      center:{lat: location.coords.latitude, lng: location.coords.longitude},
      zoom: 15,
    });
    var marker = new google.maps.Marker({
      'map': MAp,
      position: {lat: location.coords.latitude, lng: location.coords.longitude},
    });

    var coords = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
    geolocator.reverseGeocode(coords, function (err, location) {
      var formattedAddress = 'You are here: ' + location.formattedAddress;
      var infowindow = new google.maps.InfoWindow({
        content: formattedAddress
      });
      infowindow.open(MAp, marker);
      marker.addListener('click', function() {
        infowindow.open(map, marker);
      });
    });
  });
};

// Firebase Functions

// Creates a Node for the user, to store information inlcuding location
function userData() {
  var name = userInfo.displayName;
  var email = userInfo.email;
  var imageUrl = userInfo.photoURL;
  var ref = firebase.database();

  ref.ref('/users/' + userInfo.uid).set({
    username: name,
    email: email,
    profile_picture : imageUrl,
  });

  // Used the Geolocator Api to calculate the position of the user, and the street address, sent it to Firebase.
  navigator.geolocation.getCurrentPosition(function (location) {

    var ulat   = location.coords.latitude,
        ulng   = location.coords.longitude,
        coords = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    geolocator.reverseGeocode(coords, function (err, location) {
      var formattedAddress = location.formattedAddress;
      ref.ref('/users/' + userInfo.uid + '/location').update({
        lat : ulat,
        lng : ulng,
        address: formattedAddress,
      });
    });
  });
};

// Used to center the map, on the geocoded address from the search bar.
function searchBarGeocode() {
  var inputAddress = document.getElementById('SearchBarInput').value;

  geolocator.geocode(inputAddress, function (err, location) {
    console.log(err);

    // These variables store the different types coordinates we need.
    var entry = {
      lat: location.coords.latitude,
      lng: location.coords.longitude
    }
    var coords = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    // Changes the Map to be center at the submited location, and add a marker to that spot.
    MAp.panTo(entry);
    var marker = new google.maps.Marker({
      'map': MAp,
      position: {lat: location.coords.latitude, lng: location.coords.longitude},
    });

    // Makes a Infor Display Window to show the location
    geolocator.reverseGeocode(coords, function (err, location) {
      var formattedAddress = location.formattedAddress;
      var infowindow = new google.maps.InfoWindow({
        content: formattedAddress
      });
      infowindow.open(MAp, marker);
      marker.addListener('click', function() {
        infowindow.open(map, marker);
      });
    });
  });
}

var createMarker = {
  light : function () {
    var center = MAp.getCenter();
    var marker =  new google.maps.Marker({
      'map'     : MAp,
      position  : center,
      draggable : true,
      icon      : 'Images/Light-Flood-Yellow.svg',
    });
    google.maps.event.addListener(marker,'click',function(){
      $('.testInfo').show(500);

      this.ProfileName = document.getElementById('testInfo-content-person-Name');
      this.ProfileName.textContent = userInfo.displayName;

      var ProfilePic;
      ProfilePic = document.getElementById('testInfo-content-person-Pic');
      ProfilePic.style.backgroundImage = 'url(' + userInfo.photoURL + ')';

      var Lat      = marker.getPosition().lat(),
          Lng      = marker.getPosition().lng(),
          center2  = {
                      lat: Lat,
                      lng: Lng,
                    };
      var map  = new google.maps.Map(document.getElementById('testInfo-content-map'), {
        center:{lat: Lat, lng: Lng},
        zoom: 20,
      });
      var marker2 =  new google.maps.Marker({
        'map'     : map,
        position  : center2,
        draggable : true,
        icon      : 'Images/Light-Flood-Yellow.svg',
      });



      $('.testInfo-content-submit').click(function() {
        var ref = firebase.database(),
            lat2 = marker2.getPosition().lat(),
            lng2 = marker2.getPosition().lng(),
            coords2 = {
              lat: lat2,
              lng: lng2,
            },
            name = userInfo.displayName,
            email = userInfo.email,
            imageUrl = userInfo.photoURL,
            contentComment = document.getElementById('testInfo-content-comment').value,
            dateObj   = new Date(),
            today = dateObj.getMonthName() + ' ' + dateObj.getDate() + ', ' + dateObj.getFullYear();

        ref.ref('/Pins/Light').push({
          username: name,
          email: email,
          profile_picture : imageUrl,
          position_lat : lat2,
          position_lng : lng2,
          comment : contentComment,
          date : today,
        });
      })
    });
  },
  medium : function () {
    var center = MAp.getCenter();
    var marker = new google.maps.Marker({
      'map'     : MAp,
      position  : center,
      draggable : true,
      icon      : 'Images/Medium-Flood-Orange.svg',
    });
    google.maps.event.addListener(marker,'click',function(){
      $('.testInfo').show(500);

      var Lat = marker.getPosition().lat(),
          Lng = marker.getPosition().lng(),
          center2 = {
                      lat: Lat,
                      lng: Lng,
                    };

      var map  = new google.maps.Map(document.getElementById('testInfo-content-map'), {
        center:{lat: Lat, lng: Lng},
        zoom: 20,
      });
      var marker2 =  new google.maps.Marker({
        'map'     : map,
        position  : center2,
        draggable : true,
        icon      : 'Images/Medium-Flood-Orange.svg',
      });

      $('.testInfo-content-submit').click(function() {
        var ref = firebase.database(),
            lat2 = marker2.getPosition().lat(),
            lng2 = marker2.getPosition().lng(),
            coords2 = {
              lat: lat2,
              lng: lng2,
            },
            name = userInfo.displayName,
            email = userInfo.email,
            imageUrl = userInfo.photoURL,
            contentComment = document.getElementById('testInfo-content-comment').value;

        ref.ref('/Pins/Medium').push({
          username: name,
          email: email,
          profile_picture : imageUrl,
          position_lat : lat2,
          position_lng : lng2,
          comment : contentComment,
        });
      })
    });
  },
  heavy : function () {
    var center = MAp.getCenter();
    var marker = new google.maps.Marker({
      'map'     : MAp,
      position  : center,
      draggable : true,
      icon      : 'Images/Heavy-Flood-Red.svg',
    });
    google.maps.event.addListener(marker,'click',function(){
      $('.testInfo').show(500);

      var Lat = marker.getPosition().lat(),
          Lng = marker.getPosition().lng(),
          center2 = {
                      lat: Lat,
                      lng: Lng,
                    };

      var map  = new google.maps.Map(document.getElementById('testInfo-content-map'), {
        center:{lat: Lat, lng: Lng},
        zoom: 20,
      });
      var marker2 =  new google.maps.Marker({
        'map'     : map,
        position  : center2,
        draggable : true,
        icon      : 'Images/Heavy-Flood-Red.svg',
      });

      $('.testInfo-content-submit').click(function() {
        var ref = firebase.database(),
            lat2 = marker2.getPosition().lat(),
            lng2 = marker2.getPosition().lng(),
            coords2 = {
              lat: lat2,
              lng: lng2,
            },
            name = userInfo.displayName,
            email = userInfo.email,
            imageUrl = userInfo.photoURL,
            contentComment = document.getElementById('testInfo-content-comment').value;

        ref.ref('/Pins/Heavy').push({
          username: name,
          email: email,
          profile_picture : imageUrl,
          position_lat : lat2,
          position_lng : lng2,
          comment : contentComment,
        });
      })
    });
  },
}

var displayMarker = {
  light : function () {

    var Ref = firebase.database().ref('Pins/Light/');
    Ref.on('value', function (snapshot) {
      var coords = snapshot.val();

      Object.keys(coords).forEach(function (key, i) {
        var coord       = coords[key],
            lat         = coord.position_lat,
            lng         = coord.position_lng,
            pos         = new google.maps.LatLng(lat, lng),
            userComment = coord.comment,
            index       = 0;
        var marker = new google.maps.Marker({
          position: pos,
          map: MAp,
          icon : 'Images/Light-Flood-Yellow.svg?i='+(index++),
        });
        google.maps.event.addListener(marker,'click',function(){
          $('#testInfo').show(500);
          document.getElementById('displayInfo-content-comment').innerHTML = userComment;
          var Lat = marker.getPosition().lat(),
              Lng = marker.getPosition().lng(),
              center2 = {
                          lat: Lat,
                          lng: Lng,
                        };
          var map  = new google.maps.Map(document.getElementById('testInfo-content-display-map'), {
            center:{lat: Lat, lng: Lng},
            zoom: 20,
          });
          var marker2 =  new google.maps.Marker({
            'map'     : map,
            position  : center2,
            icon      : 'Images/Light-Flood-Yellow.svg',
          });
        });
      });

    })
  },
  medium : function () {
    var Ref = firebase.database().ref('Pins/Medium');

    Ref.on('value', function (snapshot) {

      var coords = snapshot.val();

      Object.keys(coords).forEach(function (key, i) {
        var coord       = coords[key],
            lat         = coord.position_lat,
            lng         = coord.position_lng,
            pos         = new google.maps.LatLng(lat, lng),
            userComment = coord.comment,
            index       = 0;
        var marker = new google.maps.Marker({
          position: pos,
          map: MAp,
          icon : 'Images/Medium-Flood-Orange.svg?i='+(index++),
        });
        google.maps.event.addListener(marker,'click',function(){
          $('#testInfo').show(500);
          document.getElementById('displayInfo-content-comment').innerHTML = userComment;
          var Lat = marker.getPosition().lat(),
              Lng = marker.getPosition().lng(),
              center2 = {
                          lat: Lat,
                          lng: Lng,
                        };
          var map  = new google.maps.Map(document.getElementById('testInfo-content-display-map'), {
            center:{lat: Lat, lng: Lng},
            zoom: 20,
          });
          var marker2 =  new google.maps.Marker({
            'map'     : map,
            position  : center2,
            icon      : 'Images/Medium-Flood-Orange.svg',
          });
        });
      });
    })
  },
  heavy : function () {
    var Ref = firebase.database().ref('Pins/Heavy');

    Ref.on('value', function (snapshot) {

      var coords = snapshot.val();

      Object.keys(coords).forEach(function (key, i) {
        var coord       = coords[key],
            lat         = coord.position_lat,
            lng         = coord.position_lng,
            pos         = new google.maps.LatLng(lat, lng),
            userComment = coord.comment,
            index       = 0;
        var marker = new google.maps.Marker({
          position: pos,
          map: MAp,
          icon : 'Images/Heavy-Flood-Red.svg?i='+(index++),
        });
        google.maps.event.addListener(marker,'click',function(){
          $('#testInfo').show(500);
          document.getElementById('displayInfo-content-comment').innerHTML = userComment;
          var Lat = marker.getPosition().lat(),
              Lng = marker.getPosition().lng(),
              center2 = {
                          lat: Lat,
                          lng: Lng,
                        };
          var map  = new google.maps.Map(document.getElementById('testInfo-content-display-map'), {
            center:{lat: Lat, lng: Lng},
            zoom: 20,
          });
          var marker2 =  new google.maps.Marker({
            'map'     : map,
            position  : center2,
            icon      : 'Images/Heavy-Flood-Red.svg',
          });
        });
      });
    })
  },
}


$('.testInfo-content-exit').click(function() {
  $('#testInfo').hide(500);
});
$('.testInfo-content-exit').click(function() {
  $('.testInfo').hide(500);
});
