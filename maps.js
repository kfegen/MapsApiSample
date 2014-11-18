
var zip = '33401';
var map;
var google;
var locations = [
	["1", "", "27.340055", "-80.354004", "Location 1"],
	["2", "", "28.195506", "-81.760254", "Location 2"],
	["3", "", "25.767740", "-80.354004", "Location 3"],
];
var markersArray = [];

var pinColor = "1f6d9b";
var geocoder = {};
var pinImage = {};

function initialize() {
	pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
	new google.maps.Size(21, 34),
	new google.maps.Point(0, 0),
	new google.maps.Point(10, 34));
	
	zip = document.getElementById('zip').value;
	if (zip == 0)
		return;
	geocoder = new google.maps.Geocoder();
	var lat = '';
	var lng = '';

	var mapOptions = {
		zoom: 10,
		center: new google.maps.LatLng(lat, lng),
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		panControl: false,
		mapTypeControl: false,
		scaleControl: false,
		streetViewControl: false,
		overviewMapControl: false,
		rotateControl: false
	};

	map = new google.maps.Map(document.getElementById('map_canvas'),
		mapOptions);
	
	searchZip();
}

function searchZip(){
	zip = document.getElementById('zip').value;
	
	geocoder.geocode({ 'address': zip }, function (results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			map.setCenter(results[0].geometry.location);
			marker = new google.maps.Marker({
				position: results[0].geometry.location,
				map: map,
				title: zip,
				icon: pinImage
			});

			google.maps.event.addListener(marker, 'mouseover', function() {
				return function() {
					infowindow.setContent(contentString);
					infowindow.open(map, this);
				}
			}());

			for (i = 0; i < locations.length; i++) {
				if (locations[i][2] != null || locations[i][2] != '') {
					var latLng = new google.maps.LatLng(locations[i][2], locations[i][3]);
					var marker = new google.maps.Marker({
						position: latLng,
						map: map,
					});
					markersArray.push(marker);

					google.maps.event.addListener(marker, 'click', function (content) {
						return function () {
							infowindow.setContent(content);//set the content
							infowindow.open(map, this);
						}
					}(locations[i][4]));
				}
			}

			var lat = results[0].geometry.location.lat();
			var lng = results[0].geometry.location.lng();
			var R = 6371; // radius of earth in km
			var distances = [];
			var closestLocation = -1;
			var locationDistances = [];
			for (i = 0; i < locations.length; i++) {
				var mlat = locations[i][2];
				var mlng = locations[i][3];
				var dLat = rad(mlat - lat);
				var dLong = rad(mlng - lng);
				var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
					Math.cos(rad(lat)) * Math.cos(rad(lat)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
				var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
				var d = R * c;
				distances[i] = d;
				if (closestLocation == -1 || d < distances[closestLocation]) {
					closestLocation = i;
				}
				
				//This is incorrect and needs to be updated. 
				locationDistances.push({location:locations[i], distance:d});
			}
			if (closestLocation > -1) {
				var latLng = new google.maps.LatLng(locations[closestLocation][2], locations[closestLocation][3]);
				map.panTo(latLng);
			}
			
			var locationsList = document.getElementById("locations");
			locationsList.innerHTML = '';
			
			var orderedLocations = locationDistances.sort(function(a, b){
				if(a.distance < b.distance){
					return -1
				}
				if(a.distance > b.distance){
					return 1;
				}
				return 0;
			});
			
			for(var i=0; i < orderedLocations.length; i++){
				var li = document.createElement('li');
				li.innerHTML = orderedLocations[i].location[4] + ' distance: ' + orderedLocations[i].distance;
				locationsList.appendChild(li);
			}
		}

	});
}

google.maps.event.addDomListener(window, 'load', initialize);

var infowindow = new google.maps.InfoWindow({
	content: ""
});

function rad(x) { return x * Math.PI / 180; }

var contentString = '<h2>Zipcode Entered</h2>';
