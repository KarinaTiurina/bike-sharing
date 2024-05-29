import React, { useState, useEffect }  from 'react'
import GoogleMapReact from 'google-map-react';
import RoomTwoToneIcon from '@mui/icons-material/RoomTwoTone';
import NavigationTwoToneIcon from '@mui/icons-material/NavigationTwoTone';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { callNextBikesApi } from '../api/bikes';
import IconButton from '@mui/material/IconButton';

import './HomePage.css'

interface AnyReactProps {
    lat: number,
    lng: number,
    text?: string
}

interface Bike {
  number: string,
  lat: number,
  lng: number
}

const BikeMarker = ({ lat, lng, text }: AnyReactProps) => <div>
    <IconButton>
      <RoomTwoToneIcon color="warning" />
    </IconButton>
</div>;

const CurrentLocation = ({ lat, lng } : AnyReactProps) => <div>
    <NavigationTwoToneIcon color="success"/>
</div>

function SimpleMap(){
  const defaultProps = {
    center: {
      lat: 52.229693400606145, 
      lng: 21.012135623830392
    },
    zoom: 14
  };

  const [apiKey, setApikey] = useState("");
  const [currentLocation, setCurrentLocation] = useState({
    center: defaultProps.center,
    isLoaded: false
  });
  const [bikes, setBikes] = useState<Bike[]>([])
  

  useEffect(() => {
    setApikey(process.env.REACT_APP_GOOGLE_MAP_API_KEY as string);
      if (navigator.geolocation) {
        navigator.permissions.query({name:'geolocation'}).then(permissionStatus => {
            if (permissionStatus.state === 'granted') {
              navigator.geolocation.getCurrentPosition(pos => setCurrentLocation({
                center: {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                },
                isLoaded: true
              }));
            } else {
              alert('Please allow location access.');
            }
        });
      } else {
        console.log("Geolocation is not supported by this browser.")
      } 

  }, []);

  async function fetchBikes() {
    const fetched: Bike[] = await callNextBikesApi();
    setBikes(fetched);
  }

  useEffect(() => {
    fetchBikes();
  }, [])

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      {apiKey &&
        <GoogleMapReact
          bootstrapURLKeys={{ key: apiKey }}
          defaultCenter={defaultProps.center}
          defaultZoom={defaultProps.zoom}
          center={currentLocation.center}
        >
          {bikes.map(bike => {
            return (<BikeMarker
              lat={bike.lat}
              lng={bike.lng}
              key={bike.number}
              text={bike.number}
            />);
          })}
          
          {currentLocation.isLoaded &&
            <CurrentLocation
              lat={currentLocation.center.lat}
              lng={currentLocation.center.lng}
          />}
        </GoogleMapReact>
      }
      {!apiKey && <Box sx={{ display: 'flex' }}>
        <CircularProgress color='warning' className='loader' />
      </Box>}
    </div>
  );
}

const HomePage: React.FC = () => {
    return (
        <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <SimpleMap />
        </div>
    )
}

export default HomePage
