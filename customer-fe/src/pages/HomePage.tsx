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
import PedalBikeIcon from '@mui/icons-material/PedalBike';

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

import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ImageIcon from '@mui/icons-material/Image';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
// import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import Chip from '@mui/material/Chip';

import './HomePage.css'

interface AnyReactProps {
    lat: number,
    lng: number,
    text?: string
}

interface Bike {
  id: string,
  bikeId?: string,
  lat: number,
  lng: number,
  type: number
}

const CurrentLocation = ({ lat, lng } : AnyReactProps) => <div>
    <NavigationTwoToneIcon/>
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
    return bikes.map(b => {
      return {
        type: "Feature",
        properties: { cluster: false, bikeId: b.id, type: b.type },
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

  const renderBikesList = (bikes: Bike[]) => (
    <Box
      sx={{ width: 400, maxWidth: '90%' }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      {bikes.map(b => (
        <Card sx={{ display: 'flex', margin: 1 }} key={b.id} variant="outlined">
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '48%' }}>
            <CardContent sx={{ flex: '1 0 auto' }}>
              <Typography component="div" variant="h6">
                Bike: {b.bikeId}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" component="div">
                <Chip label="Free" size='small' />
              </Typography>
            </CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}>
              <Button variant="contained" size='small'>Rent</Button>
              <Button variant="outlined" size='small'>Book</Button>
            </Box>
          </Box>
          <CardMedia
            component="img"
            sx={{ width: '50%', maxHeight: 150, objectFit: "contain" }}
            image={`./bike_types/${b.type}.png`}
            alt={`Bike type: ${b.type}`}
          />
        </Card>
      ))}
    </Box>
  );

  const iOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  const renderListOfBikes = () => {
    const anchor = 'right';
    if (selectedCluster) {
      try {
        const bikes = supercluster.getChildren(selectedCluster).map((o: any) => o.properties)
        // console.log(bikes)
        return (
          <React.Fragment key={anchor}>
            <SwipeableDrawer
              anchor={anchor}
              open={showBikesList}
              onClose={toggleDrawer(false)}
              onOpen={toggleDrawer(true)}
              disableBackdropTransition={!iOS}
              disableDiscovery={iOS}
            >
              <Box component="section" sx={{ p: 2 }} alignItems="center" display="flex">
                <h1>Available Bikes ({bikes.length})</h1>
              </Box>
              {renderBikesList(bikes)}
            </SwipeableDrawer>
        </React.Fragment>
      );
      } catch (e) {
        return <></>
      }
    }    
    return <></>
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
