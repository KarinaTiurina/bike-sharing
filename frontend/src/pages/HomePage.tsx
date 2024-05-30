import React, { useState, useEffect, useRef }  from 'react'
import GoogleMapReact from 'google-map-react';
import RoomTwoToneIcon from '@mui/icons-material/RoomTwoTone';
import NavigationTwoToneIcon from '@mui/icons-material/NavigationTwoTone';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { callNextBikesApi } from '../api/bikes';
import IconButton from '@mui/material/IconButton';
import useSupercluster from 'use-supercluster';
import Badge, { BadgeProps } from '@mui/material/Badge';

// Bottom Navigation
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import FolderIcon from '@mui/icons-material/Folder';
import RestoreIcon from '@mui/icons-material/Restore';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Paper from '@mui/material/Paper';

// Bikes list on the right
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';

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
  const { clusters, supercluster } = useSupercluster({
    points: bikesToPointsConverter(),
    bounds,
    zoom,
    options: { radius: 75, maxZoom: 20 }
  });


  const onMapChange = (event:any) => {
    setZoom(event.zoom);
    setBounds([
      event.bounds.nw.lng,
      event.bounds.se.lat,
      event.bounds.se.lng,
      event.bounds.nw.lat
    ]);
  }

  const [selectedCluster, setSelectedCluster] = useState(0);

  const onBikeMarkerClick = (e: React.MouseEvent<HTMLButtonElement>, clusterId: number) => {
    setSelectedCluster(clusterId);
    setShowBikesList(true)
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
            <IconButton onClick={(e) => onBikeMarkerClick(e, cluster.id)}>
              <Badge badgeContent={pointCount} color="warning">
                  <RoomTwoToneIcon />
              </Badge>
            </IconButton>
          </Marker>
        );
      }
    })
  }

  const [bnValue, setBnValue] = React.useState('recents');

  const defaultMapOptions:any = {
    fullscreenControl: false,
    zoomControl: false,
    gestureHandling: "greedy",
  };

  const renderBottomNavigation = () => {
    return (
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
        <BottomNavigation
          showLabels
          value={bnValue}
          onChange={(event, newValue) => {
            setBnValue(newValue);
          }}
        >
          <BottomNavigationAction label="Recents" icon={<RestoreIcon />} />
          <BottomNavigationAction label="Favorites" icon={<FavoriteIcon />} />
          <BottomNavigationAction label="Folder" icon={<FolderIcon />} />
        </BottomNavigation>
      </Paper>
    );
  }

  const [showBikesList, setShowBikesList] = useState(false);

  const toggleDrawer = (open: boolean) =>
    (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event &&
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        console.log('return')
        return;
      }
      setShowBikesList(open);
  };

  const list = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
              </ListItemIcon>
              <ListItemText primary={selectedCluster} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {['All mail', 'Trash', 'Spam'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const iOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  const renderListOfBikes = () => {
    const anchor = 'right';
    return (
      <React.Fragment key={anchor}>
        {/* <Button onClick={toggleDrawer(true)}>{anchor}</Button> */}
        <SwipeableDrawer
          anchor={anchor}
          open={showBikesList}
          onClose={toggleDrawer(false)}
          onOpen={toggleDrawer(true)}
          disableBackdropTransition={!iOS}
          disableDiscovery={iOS}
        >
          {list()}
        </SwipeableDrawer>
    </React.Fragment>
    );
  }

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      {apiKey &&
        <GoogleMapReact
          bootstrapURLKeys={{ key: apiKey }}
          defaultCenter={defaultProps.center}
          defaultZoom={defaultProps.zoom}
          center={currentLocation.center}
          options={defaultMapOptions}
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={({ map }) => {
            mapRef.current = map;
          }}
          onChange={onMapChange}
        >
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

      {renderListOfBikes()}

      {renderBottomNavigation()}
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
