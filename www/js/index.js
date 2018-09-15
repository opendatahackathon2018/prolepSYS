$(document).ready(function(){

    navigator.geolocation.watchPosition(geolocationSuccess, geolocationError, {
        enableHighAccuracy: true
    });
    
	$('.settings-btn').click(function(){
		$(this).toggleClass('open');
    });
    
    $('.camera-btn').click(function(){
        navigator.camera.getPicture(cameraSuccess, cameraError, {
            quality: 25,
            destinationType: Camera.DestinationType.DATA_URL
        });
    });
    
    $('.emergency-btn').click(function(){
        emergencyRequest();
    });

    $('.tips-btn').click(function(){

    });
        
    function geolocationSuccess(currentLocation) {
        console.log(currentLocation);
        if(currentLocation!=null){
            localStorage.setItem('currentLocation', JSON.stringify({
                "lat": currentLocation.coords.latitude,
                "lon": currentLocation.coords.longitude,
            }));
        }
    };

    function geolocationError(errorObject) {
        console.log('code: ' + errorObject.code + '\n' + 'message: ' + errorObject.message + '\n');
    }

    function cameraSuccess(imageData){
        var currentLocation = JSON.parse(localStorage.getItem('currentLocation'));
        console.log(currentLocation);

        $.ajax({
            type: "POST",
            url: "http://e2b15771.ngrok.io/events/",
            data: JSON.stringify({
                "lat":currentLocation.lat,
                "lon":currentLocation.lon,
                "image": ""+imageData,
                "input_type": 'mobile'
            }),
            success: function(response){
                console.log(response);
                
            },
            error: function(response){
                console.error(response);
            },
            contentType: "application/json"
        });
    }

    function cameraError(errorMessage){
        console.error(errorMessage);
    }

    function emergencyRequest(){
        var currentLocation = JSON.parse(localStorage.getItem('currentLocation'));
        console.log(currentLocation);

        $.ajax({
            type: "POST",
            url: "http://e2b15771.ngrok.io/events/",
            data: JSON.stringify({
                "lat":currentLocation.lat,
                "lon":currentLocation.lon,
                "input_type": 'panic'
            }),
            success: function(response){
                console.log(response);
            },
            error: function(response){
                console.error(response);
            },
            contentType: "application/json"
        });
    }

});
