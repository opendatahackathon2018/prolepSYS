
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
    
$('.register-btn').click(function(){
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
                registerUser(result.value);
            });
            }
        });         
    }
  
});

function geolocationSuccess(currentLocation) {
    console.log(currentLocation);
    if(currentLocation!=null){
        updateCurrentLocation(currentLocation);
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

function updateCurrentLocation(currentLocation){
    
    var previousLocation = JSON.parse(localStorage.getItem('currentLocation'));

    if(
        previousLocation.lat != currentLocation.coords.latitude ||
        previousLocation.lon != currentLocation.coords.longitude
    ){
        localStorage.setItem('currentLocation', JSON.stringify({
            "lat": currentLocation.coords.latitude,
            "lon": currentLocation.coords.longitude,
        }));
    
        
        if(localStorage.getItem("isRegistered") != null){

            $.ajax({
                type: "PUT",
                url: "http://206.189.1.214:5000/users/" + localStorage.getItem("uuid"),
                data: {
                    "lon":currentLocation.lon,
                    "lat":currentLocation.lat
                },
                success: function(response){
                    console.log(response);
                },
                error: function(response){
                    console.error(response);
                },
                contentType: "application/json"
            });
        }
    }
    
}

function registerUser(phonenumber){
    localStorage.setItem("phonenumber", phonenumber);

    console.log("Phonenumber: " + localStorage.getItem("phonenumber"));
    console.log("UUID: " + localStorage.getItem("uuid"));
    console.log("GeoLocation: " + localStorage.getItem("currentLocation"));

    var currentLocation = JSON.parse(localStorage.getItem('currentLocation'));

    $.ajax({
        type: "POST",
        url: "http://206.189.1.214:5000/users/",
        data: JSON.stringify({
            "telephone":localStorage.getItem("phonenumber"),
            "lon":currentLocation.lon,
            "lat":currentLocation.lat,
            "mobile_id": localStorage.getItem("uuid")
        }),
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
}

$(document).ajaxStart(function(){
}).ajaxComplete(function(){
});

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() { 

    localStorage.setItem('currentLocation', JSON.stringify({
        "lat": 34.6807039,
        "lon": 33.0430062,
    }));

    navigator.geolocation.watchPosition(geolocationSuccess, geolocationError, {
        enableHighAccuracy: true
    });

    localStorage.setItem("uuid", device.uuid);

    cordova.plugins.diagnostic.isGpsLocationEnabled(function(enabled){
        console.log("GPS location is " + (enabled ? "enabled" : "disabled"));
        if(!enabled){
            swal({
                title: 'GPS not found',
                text: "ProlepSYS requires your geolocation in order to operate. Could you please enable your GPS?",
                type: 'question',
                showCancelButton: true,
                confirmButtonClass: 'btn btn--stripe btn--radius blue',
                cancelButtonClass: 'btn btn--stripe btn--radius black',
                confirmButtonText: 'Of course',
                cancelButtonText: 'Maybe later'
            }).then((result) => {
                cordova.plugins.diagnostic.switchToLocationSettings();
            });
        }
    }, function(error){
        console.error("The following error occurred: " + error);
    }); 
}

