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

            /*
            $.ajax({
                type: "PUT",
                url: "http://e2b15771.ngrok.io/users/update/" + localStorage.getItem("uuid"),
                data: {
                    "phonenumber":localStorage.getItem("phonenumber"),
                    "lon":currentLocation.lon,
                    "lat":currentLocation.lat
                },
                contentType: "application/json"
            });
            */
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
            url: "http://206.189.1.214:5000/events/",
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
            url: "http://206.189.1.214:5000/events/",
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

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() { 
    localStorage.setItem("uuid", device.uuid);
 }

 console.log(localStorage.getItem("isRegistered"));
if(localStorage.getItem("isRegistered") == null){
    swal({
        title: 'Welcome to ProlepSYS',
        text: "In order for us to inform you for a near danger we require your phone number. Would you be kind enough to provide it to us?",
        type: 'question',
        showCancelButton: true,
        confirmButtonClass: 'btn btn--stripe btn--radius blue',
        cancelButtonClass: 'btn btn--stripe btn--radius black',
        confirmButtonText: 'Of course',
        cancelButtonText: 'Maybe later'
    }).then((result) => {
        if (result.value) {
            swal({
                title: 'Fill it in.',
                text: 'Type your phone number in order to receive near danger notifications',
                input: 'tel',
                showCancelButton: true,
                inputPlaceholder: 'e.g +35799556677',
                confirmButtonClass: 'btn btn--stripe btn--radius blue',
                cancelButtonClass: 'btn btn--stripe btn--radius black',
                allowOutsideClick: false
        }).then((result) => {
            localStorage.setItem("phonenumber",result.value);

            console.log("Phonenumber: " + localStorage.getItem("phonenumber"));
            console.log("UUID: " + localStorage.getItem("uuid"));
            console.log("GeoLocation: " + localStorage.getItem("currentLocation"));

            var currentLocation = JSON.parse(localStorage.getItem('currentLocation'));

            $.ajax({
                type: "POST",
                url: "http://206.189.1.214:5000/users/",
                data: {
                    "telephone":localStorage.getItem("phonenumber"),
                    "lon":currentLocation.lon,
                    "lat":currentLocation.lat,
                    "mobile_id": localStorage.getItem("uuid")
                },
                success: function(response){
                    console.log(response);
                    swal({
                        title: 'Success',
                        text: 'You have been successfuly registered.',
                        confirmButtonClass: 'btn btn--stripe btn--radius blue',
                        type: 'success',
                    });

                    localStorage.setItem("isRegistered", "true");
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

         });
        }
    });         
}
  