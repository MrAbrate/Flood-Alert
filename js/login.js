var userInfo;
var GeolocateOptions;
var MAp
var signUp = document.getElementById('SignInButton');
var logOut = document.getElementById('SignOut');
var mar = 1;








/*Global: firebase */
var map;
var $signIn = $("#SignInButton");
var $signOut = $("#SignOut");
var $profileInfo = $("#Profile-Info");
var $searchInput = $("#SearchBarInput");

var createMarker, displayMarker;

$signIn.on("click", function (){
  var provider = new firebase.auth.GoogleAuthProvider();

  firebase.auth().signInWithPopup(provider).then(function (result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
  }).catch(function (error) {
    console.log(error);
      // Handle Errors here.
  });
});

$signOut.on("click", function (){
  firebase.auth().signOut().then(function() {
    // Sign-out successful.
  }).catch(function(error) {
    // An error happened.
  });
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
    Date.prototype.monthNames = Date.prototype.monthNames || [
        "January", "February", "March",
        "April", "May", "June",
        "July", "August", "September",
        "October", "November", "December"
    ];
    Date.prototype.getMonthName = Date.prototype.getMonthName || function() {
        return this.monthNames[this.getMonth()];
    };
};


firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    $profileInfo.show(1000);
    $signIn.hide(1000);

    // Dispaly Profile Information
    $("#Profile-Info-Name").text(user.displayName);
    $("#Profile-Info-Pic").css("background-image", "url('" + user.photoURL + "')");

    updateUserData(user);

    $("#testInfo-content-person-Name").text(user.displayName);
    $("#testInfo-content-person-Pic").css(
      "background-image",
      "url('" + user.photoURL + "')"
    );

    initMap();
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

  initializeMarkerFunctions(user);
});

// Geolocation Functions
// Google Maps Api

function addMarker(location) {
  var marker = new google.maps.Marker({
    'map': map,
    position: {
      lat: location.coords.latitude,
      lng: location.coords.longitude
    }
  });

  var center = {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude
  }

  geolocator.reverseGeocode(center, function (err, location) {
    var formattedAddress = 'You are here: ' + location.formattedAddress;
    var infowindow = new google.maps.InfoWindow({
      content: formattedAddress
    });

    infowindow.open(map, marker);

    marker.addListener('click', function() {
      infowindow.open(map, marker);
    });
  });
}

function initMap () {
  navigator.geolocation.getCurrentPosition(function (location) {
    map = new google.maps.Map(document.getElementById('map'), {
      center:{
        lat: location.coords.latitude,
        lng: location.coords.longitude
      },
      zoom: 15,
    });

    addMarker(location);
  });
};

// Firebase Functions

// Creates a Node for the user, to store information inlcuding location
function updateUserData(user) {
  var db = firebase.database();

  // Add user to database
    // Note: this is redundant for existing users. Is there a way to do this
    // when they sign up?
  db.ref('/users/' + userInfo.uid).set({
    username: user.displayName,
    email: user.email,
    profile_picture : user.photoURL,
  });

  // Used the Geolocator Api to calculate the position of the user, and the street address, sent it to Firebase.
  navigator.geolocation.getCurrentPosition(function (location) {
    var center = {
      lat : location.coords.latitude,
      lng : location.coords.longitude
    };
    geolocator.reverseGeocode(center, function (err, location) {
      var formattedAddress = location.formattedAddress;

      db.ref('/users/' + userInfo.uid + '/location').update({
        lat : location.coords.latitude,
        lng : location.coords.longitude,
        address: formattedAddress,
      });
    });
  });
};

// Used to center the map, on the geocoded address from the search bar.
function searchBarGeocode() {
  var inputAddress = $searchInput.val();

  geolocator.geocode(inputAddress, function (err, location) {
    if (err) {
      console.log(err);
    }

    // Changes the Map to be center at the submited location, and add a marker to that spot.
    var center = {
      lat : location.coords.latitude,
      lng : location.coords.longitude
    }
    map.panTo(center);
    addMarker(location);
  });
}


// Needs user obj;
function initializeMarkerFunctions(user) {
  function showModalMap(marker, comment) {
    if (comment) {
      $('#displayInfo-content-comment').html(comment);
    } else {
      $('#displayInfo-content-comment').html('');
    }

    $('#testInfo').show();

    var popupMap = new google.maps.Map(document.getElementById('testInfo-content-display-map'), {
      center:{
        lat: marker.getPosition().lat(),
        lng: marker.getPosition().lng()
      },
      zoom: 20,
    });

    var popupMarker = new google.maps.Marker({
      'map'     : map,
      position  : {
        lat: marker.getPosition().lat(),
        lng: marker.getPosition().lng()
      },
      icon: marker.icon,
    });
  }


  function markerCreatorFactory(user, imgPath, dbPath) {
    return function () {
      var center = map.getCenter();
      var marker =  new google.maps.Marker({
        'map'     : map,
        position  : center,
        draggable : true,
        icon      : imgPath,
      });

      google.maps.event.addListener(marker, 'click', function () {
        showModalMap(marker);

        $('.testInfo-content-submit').off().on("click", function() {
          var db = firebase.database()
          var comment = $("#testInfo-content-comment").val();
          var date = new Date();
          var today = date.getMonthName() + ' ' + date.getDate() + ', ' + date.getFullYear();

          db.ref(dbPath).push({
            username: user.displayName,
            email: user.email,
            profile_picture : user.photoURL,
            position_lat : marker.getPosition().lat(),
            position_lng : marker.getPosition().lng(),
            comment : comment,
            date : today,
          });
        })
      });
    }
  }

  function displayMarkerFactory(imgPath, dbPath) {
    return function () {
      var ref = firebase.database().ref(dbPath);
      ref.on('value', function (snapshot) {
        var coords = snapshot.val();
        console.log(coords);

        Object.keys(coords).forEach(function (key, i) {
          var coord = coords[key];
          var lat = coord.position_lat;
          var lng = coord.position_lng;
          var pos = new google.maps.LatLng(lat, lng);
          var userComment = coord.comment;

          var marker = new google.maps.Marker({
            position: pos,
            map: map,
            icon : imgPath
          });

          google.maps.event.addListener(marker, 'click', function(){
            showModalMap(marker, userComment);
          });
        });
      })
    }
  }
  if (user) {
    createMarker = {
      light: markerCreatorFactory(user, 'Images/Light-Flood-Yellow.svg', '/Pins/Light'),
      medium : markerCreatorFactory(user, 'Images/Medium-Flood-Orange.svg', '/Pins/Medium'),
      heavy : markerCreatorFactory(user, 'Images/Heavy-Flood-Red.svg', '/Pins/Heavy')
    }
  }

  displayMarker = {
    light: displayMarkerFactory('Images/Light-Flood-Yellow.svg', 'Pins/Light'),
    medium: displayMarkerFactory('Images/Medium-Flood-Orange.svg', 'Pins/Medium'),
    heavy : displayMarkerFactory('Images/Heavy-Flood-Red.svg', 'Pins/Heavy')
  }
}

$('.testInfo-content-exit').click(function() {
  $('#testInfo').hide(500);
});
