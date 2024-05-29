import React, { useState, useEffect, useRef }  from 'react'
import GoogleMapReact from 'google-map-react';
import RoomTwoToneIcon from '@mui/icons-material/RoomTwoTone';
import NavigationTwoToneIcon from '@mui/icons-material/NavigationTwoTone';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { callNextBikesApi } from '../api/bikes';
import IconButton from '@mui/material/IconButton';
import useSupercluster from 'use-supercluster';

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

const Marker = ({ children }: any) => children;

const SimpleMap = () => {
  const mapRef:any = useRef(null);

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

  const [bounds, setBounds] = useState<any>(null);
  const [zoom, setZoom] = useState(14);
  // const [clusters, setClusters] = useState<any>([]);
  // const [supercluster, setSupercluster] = useState<any>(null);
  // const [mapRef, setMapRef] = useState<any>(null);

  // useEffect(() => {
  //   const mapReference:any = useRef();
  //   setMapRef(mapReference);
  // }, [])
  

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

  const bikesToPointsConverter = () => {
    [
      {
        "type": "Feature",
        "properties": {
          "cluster": false,
          "crimeId": 78212911,
          "category": "anti-social-behaviour"
        },
        "geometry": { "type": "Point", "coordinates": [-1.135171, 52.6376] }
      }
    ]
    return bikes.map(b => {
      return {
        type: "Feature",
        properties: { cluster: false, bikeId: b.number },
        geometry: { type: "Point", coordinates: [b.lng, b.lat]}
      }
    })
  }

  // get clusters
  // useEffect(() => {
  //   const { clusters, supercluster } = useSupercluster({
  //     points: bikesToPointsConverter(),
  //     bounds,
  //     zoom,
  //     options: { radius: 75, maxZoom: 20 }
  //   });
  //   setClusters(clusters);
  //   setSupercluster(supercluster);
  // }, [zoom, bounds, bikes])
  const { clusters, supercluster } = useSupercluster({
    points: bikesToPointsConverter(),
    bounds,
    zoom,
    options: { radius: 75, maxZoom: 20 }
  });
  // setClusters(clusters);
  // setSupercluster(supercluster);


  const onMapChange = (event:any) => {
    setZoom(event.zoom);
    setBounds([
      event.bounds.nw.lng,
      event.bounds.se.lat,
      event.bounds.se.lng,
      event.bounds.nw.lat
    ]);
  }

  const renderBikeMarkers = () => {
    return clusters.map((cluster: any) => {
      const [longitude, latitude] = cluster.geometry.coordinates;
      const {
        cluster: isCluster,
        point_count: pointCount
      } = cluster.properties;

      if (isCluster) {
        return (
          <Marker
            key={`cluster-${cluster.id}`}
            lat={latitude}
            lng={longitude}
          >
            <div
              className="cluster-marker"
              style={{
                width: `${10 + (pointCount / bikes.length) * 20}px`,
                height: `${10 + (pointCount / bikes.length) * 20}px`
              }}
              onClick={() => {
                const expansionZoom = Math.min(
                  supercluster.getClusterExpansionZoom(cluster.id),
                  20
                );
                mapRef.current.setZoom(expansionZoom);
                mapRef.current.panTo({ lat: latitude, lng: longitude });
              }}
            >
              {pointCount}
            </div>
          </Marker>
        );
      } else {
        // return (
        //   <Marker
        //     key={`crime-${cluster.properties.crimeId}`}
        //     lat={latitude}
        //     lng={longitude}
        //   >
        //     {/* <button className="crime-marker">
        //       <img src="/custody.svg" alt="crime doesn't pay" />
        //     </button> */}
        //     <IconButton>
        //       <RoomTwoToneIcon color="warning" />
        //     </IconButton>
  
        //   </Marker>
        // );
      }
    })
  }

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      {apiKey &&
        <GoogleMapReact
          bootstrapURLKeys={{ key: apiKey }}
          defaultCenter={defaultProps.center}
          defaultZoom={defaultProps.zoom}
          center={currentLocation.center}
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={({ map }) => {
            mapRef.current = map;
          }}
          onChange={onMapChange}
        >
          {/* {bikes.map(bike => {
            return (<BikeMarker
              lat={bike.lat}
              lng={bike.lng}
              key={bike.number}
              text={bike.number}
            />);
          })} */}
          {renderBikeMarkers()}
          
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
