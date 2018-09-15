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
            confirmButtonClass: 'btn btn--stripe btn--radius blue',
            cancelButtonClass: 'btn btn--stripe btn--radius red',
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
                swal({
                    title: 'Success',
                    text: 'Your report was succesfully sent and is currently being evaluated.',
                    confirmButtonClass: 'btn btn--stripe btn--radius blue',
                    type: 'success',
                });
            },
            error: function(response){
                console.error(response);
                swal({
                    title: 'Error',
                    text: 'Something went wrong! Could you please try again?',
                    confirmButtonClass: 'btn btn--stripe btn--radius blue',
                    type: 'error',
                });
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
                swal({
                    title: 'Hang in there!',
                    text: 'Emergency responders are on their way.',
                    confirmButtonClass: 'btn btn--stripe btn--radius blue',
                    type: 'success',
                });
            },
            error: function(response){
                console.error(response);
                swal({
                    title: 'Error',
                    text: 'Something went wrong! Could you please try again?',
                    confirmButtonClass: 'btn btn--stripe btn--radius blue',
                    type: 'error',
                });
            },
            contentType: "application/json"
        });
    }

});

$(document).ajaxStart(function(){
}).ajaxComplete(function(){
});