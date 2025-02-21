import { useState, useRef, useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Autocomplete,
  DirectionsRenderer,
} from "@react-google-maps/api";
import "./App.css";

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const mapContainerStyle = {
  width: "100%",
  height: "300px",
};

const defaultCenter = { lat: 37.7749, lng: -122.4194 }; // Default to San Francisco

function App() {
  const [pickup, setPickup] = useState(""); // Pickup location input
  const [destination, setDestination] = useState(""); // Destination input
  const [currentLocation, setCurrentLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [showPrices, setShowPrices] = useState(false);
  const autocompletePickupRef = useRef(null);
  const autocompleteDestinationRef = useRef(null);

  // Get user's current location on load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(location);
          setPickup("Current Location");
        },
        () => alert("Could not get your location"),
        { timeout: 10000 }
      );
    }
  }, []);

  // Handle pickup selection from Autocomplete
  const handlePickupSelect = () => {
    const place = autocompletePickupRef.current.getPlace();
    if (place && place.geometry) {
      setPickup(place.formatted_address);
    }
  };

  // Handle destination selection from Autocomplete
  const handleDestinationSelect = () => {
    const place = autocompleteDestinationRef.current.getPlace();
    if (place && place.geometry) {
      setDestination(place.formatted_address);
    }
  };

  // Handle trip submission
  const handleSubmit = () => {
    if (!destination || !pickup) return;

    setShowPrices(true); // Show prices and ride options

    // Google Maps Directions API to show route
    const service = new window.google.maps.DirectionsService();
    service.route(
      {
        origin: pickup === "Current Location" ? currentLocation : pickup,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK") {
          setDirections(result);
        } else {
          alert("Could not get route.");
        }
      }
    );
  };

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}>
      <div className="app-container">
        <div className="card">
          <h1 className="title">RideWise Price Comparison</h1>

          {/* Pickup Location Input */}
          <h2 className="subtitle">Pickup Location</h2>
          <Autocomplete
            onLoad={(ref) => (autocompletePickupRef.current = ref)}
            onPlaceChanged={handlePickupSelect}
          >
            <input
              type="text"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              placeholder="Enter pickup location..."
              className="input-field"
            />
          </Autocomplete>

          {/* Destination Input */}
          <h2 className="subtitle">Where to?</h2>
          <Autocomplete
            onLoad={(ref) => (autocompleteDestinationRef.current = ref)}
            onPlaceChanged={handleDestinationSelect}
          >
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Enter your destination..."
              className="input-field"
            />
          </Autocomplete>

          {/* Submit Button */}
          <button onClick={handleSubmit} className="submit-button">
            Submit
          </button>

          {/* Map Section */}
          <div className="map-container">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={currentLocation || defaultCenter}
              zoom={currentLocation ? 14 : 10}
            >
              {currentLocation && <Marker position={currentLocation} />}
              {directions && <DirectionsRenderer directions={directions} />}
            </GoogleMap>
          </div>

          {/* Price Comparison Section */}
          {showPrices && (
            <div className="comparison-container">
              <div className="ride-option lyft">
                <span className="ride-price">$15.00</span>{" "}
                {/* Mocked Lyft price */}
                <button className="ride-button">View on Lyft</button>
              </div>
              <div className="ride-option uber">
                <span className="ride-price">$17.00</span>{" "}
                {/* Mocked Uber price */}
                <button className="ride-button">View on Uber</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </LoadScript>
  );
}

export default App;
