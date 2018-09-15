$(document).ready(function(){

    navigator.geolocation.watchPosition(geolocationSuccess, geolocationError, {
        enableHighAccuracy: true
    });
    
    $('.camera-btn').click(function(){
        navigator.camera.getPicture(cameraSuccess, cameraError, {
            quality: 25,
            destinationType: Camera.DestinationType.DATA_URL
        });
    });
    
    $('.emergency-btn').click(function(){
        swal({
            title: 'Are you in danger?',
            text: "By confirming this message an emergency help request will be made for you.",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'I\'m in danger!'
          }).then((result) => {
            if (result.value) {
                emergencyRequest();
            }
          })
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
                swal(
                    'Success',
                    'Your report was succesfully sent and is currently being evaluated.',
                    'success'
                  )
            },
            error: function(response){
                console.error(response);
                swal(
                    'Error',
                    'Something went wrong! Could you please try again?',
                    'error'
                );
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
                swal(
                    'Success',
                    'Now hang in there! Emergency responders are on their way.',
                    'success'
                );
                console.log(response);
            },
            error: function(response){
                swal(
                    'Error',
                    'Something went wrong! Could you please try again?',
                    'error'
                );
                console.error(response);
            },
            contentType: "application/json"
        });
    }
    
});

$(document).ajaxStart(function(){
    $(".loading").removeClass("hidden");
}).ajaxComplete(function(){
    $(".loading").addClass("hidden");
});