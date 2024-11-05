// function initMap() {
//     const pickupLocation = {
//         lat: parseFloat(document.getElementById("pickupLat").value),
//         lng: parseFloat(document.getElementById("pickupLng").value)
//     };
//     const driverLocation = {
//         lat: parseFloat(document.getElementById("driverLat").value),
//         lng: parseFloat(document.getElementById("driverLng").value)
//     };
//     const destination = {
//         lat: 22.572790590435996, // Office location latitude
//         lng: 88.43741479531052    // Office location longitude
//     };

//     const map = new google.maps.Map(document.getElementById("map"), {
//         zoom: 12,
//         center: pickupLocation,
//     });

//     // Markers for pickup, driver, and destination
//     new google.maps.Marker({
//         position: pickupLocation,
//         map,
//         title: "Pickup Location",
//     });

//     new google.maps.Marker({
//         position: driverLocation,
//         map,
//         title: "Driver Location",
//     });

//     new google.maps.Marker({
//         position: destination,
//         map,
//         title: "Destination",
//     });

//     // Optional: Draw a route from the driver to the pickup location
//     const directionsService = new google.maps.DirectionsService();
//     const directionsDisplay = new google.maps.DirectionsRenderer({ map });

//     const request = {
//         origin: driverLocation,
//         destination: pickupLocation,
//         travelMode: "DRIVING",
//     };

//     directionsService.route(request, (result, status) => {
//         if (status === "OK") {
//             directionsDisplay.setDirections(result);
//         } else {
//             console.error("Directions request failed due to " + status);
//         }
//     });
// }
// window.initMap = initMap;

// // Call the initMap function when the page loads
// window.onload = initMap;

function initMap() {
    const pickupLocation = {
        lat: parseFloat(document.getElementById("pickupLat").value),
        lng: parseFloat(document.getElementById("pickupLng").value)
    };
    const driverLocation = {
        lat: parseFloat(document.getElementById("driverLat").value),
        lng: parseFloat(document.getElementById("driverLng").value)
    };
    const destination = {
        lat: 22.572790590435996,
        lng: 88.43741479531052
    };

    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: pickupLocation,
    });

    const driverMarker = new google.maps.Marker({
        position: driverLocation,
        map,
        title: "Driver Location",
    });

    const pickupMarker = new google.maps.Marker({
        position: pickupLocation,
        map,
        title: "Pickup Location",
    });

    const directionsService = new google.maps.DirectionsService();
    const directionsDisplay = new google.maps.DirectionsRenderer({ map });

    const request = {
        origin: driverLocation,
        destination: pickupLocation,
        travelMode: "DRIVING",
    };

    directionsService.route(request, (result, status) => {
        if (status === "OK") {
            directionsDisplay.setDirections(result);
        } else {
            console.error("Directions request failed due to " + status);
        }
    });

    // Function to animate the driver's movement
    const updateDriverLocation = async () => {
        // Smoothly move the driver marker to the pickup location
        const step = 0.01; // Small step to animate smoothly
        const interval = 100; // Interval in ms

        let currentLat = driverLocation.lat;
        let currentLng = driverLocation.lng;

        const intervalId = setInterval(() => {
            if (
                Math.abs(currentLat - pickupLocation.lat) < step &&
                Math.abs(currentLng - pickupLocation.lng) < step
            ) {
                clearInterval(intervalId);
                // Send arrival notification to server
                fetch('http://localhost:3018/driver/driver-arrived', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ riderEmail: '<%= rider.eEmail %>' })
                })
                .then(response => response.json())
                .then(data => console.log(data.message))
                .catch(error => console.error('Error sending arrival notification:', error));
            } else {
                currentLat += (pickupLocation.lat - currentLat) * step;
                currentLng += (pickupLocation.lng - currentLng) * step;

                const newPosition = new google.maps.LatLng(currentLat, currentLng);
                driverMarker.setPosition(newPosition);
            }
        }, interval);
    };

    // Start animation
    updateDriverLocation();
}

window.initMap = initMap;

