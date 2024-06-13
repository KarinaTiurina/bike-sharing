import React, { useState, useEffect, useRef }  from 'react'
import GoogleMapReact from 'google-map-react';
import RoomTwoToneIcon from '@mui/icons-material/RoomTwoTone';
import NavigationTwoToneIcon from '@mui/icons-material/NavigationTwoTone';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

import { callNextBikesApi } from '../api/bikes';
import { getBikes } from '../api/customer';

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

// Tabs
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import FestivalTwoToneIcon from '@mui/icons-material/FestivalTwoTone';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import BikeScooterIcon from '@mui/icons-material/BikeScooter';

import Snackbar, { SnackbarOrigin } from '@mui/material/Snackbar';

// import SignIn from '../components/sign-in.component';
import { signInWithGooglePopup, auth } from "../utils/firebase.utils"
import { onAuthStateChanged } from "firebase/auth";

import DirectionsOffIcon from '@mui/icons-material/DirectionsOff';

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

interface State extends SnackbarOrigin {
  open: boolean;
}


const CurrentLocation = ({ lat, lng } : AnyReactProps) => <div>
    <NavigationTwoToneIcon/>
</div>

const Marker = ({ children }: any) => children;

const SimpleMap = () => {
  const mapRef:any = useRef(null);
  const placesServiceRef:any = useRef(null);
  const [mapsObj, setMapsObj] = useState<any>(null);

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
  const [centerLocation, setCenterLocation] = useState({
    center: defaultProps.center,
    isLoaded: false
  });
  const [bikes, setBikes] = useState<Bike[]>([])

  const [bounds, setBounds] = useState<any>(null);
  const [zoom, setZoom] = useState(14);

  const [tabValue, setTabValue] = React.useState(0);
  const [places, setPlaces] = useState<any[]>([]);

  const [selectedCluster, setSelectedCluster] = useState(0);

  const [placeMarkers, setPlaceMarkers] = useState<any[]>([]);

  const [directionsService, setDirectionsService] = useState<any>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<any>(null);
  const [isDirectionShown, setIsDirectionShown] = useState(false);

  const [warningOpen, setWarningOpen] = useState<any>(false);
  const [warningMessage, setWarningMessage] = useState<string>("");

  const [user, setUser] = useState<any>(null);

  const [mapPoints, setMapPoints] = useState<any>([]);

  useEffect(() => {
    onAuthStateChanged(auth, (signedInUser) => {
      if (signedInUser) {
        setUser(signedInUser);
      }
    });
  }, [])

  useEffect(() => {
    setApikey(process.env.REACT_APP_GOOGLE_MAP_API_KEY as string);
      if (navigator.geolocation) {
        navigator.permissions.query({name:'geolocation'}).then(permissionStatus => {
            if (permissionStatus.state === 'granted') {
              navigator.geolocation.getCurrentPosition(pos => {
                setCurrentLocation({
                  center: {
                      lat: pos.coords.latitude,
                      lng: pos.coords.longitude
                  },
                  isLoaded: true
                })
                setCenterLocation({
                  center: {
                      lat: pos.coords.latitude,
                      lng: pos.coords.longitude
                  },
                  isLoaded: true
                })
              });
            } else {
              console.log('Please allow location access.');
            }
        });
      } else {
        console.log("Geolocation is not supported by this browser.")
      } 

  }, []);

  async function fetchPlaces(lat: any, lng: any) {
    if (mapsObj) {
      const location = new mapsObj.LatLng(lat, lng);
      const request = {
        location: location,
        radius: '3000',
        type: ['tourist_attraction']
      };
      try {
        placesServiceRef.current.nearbySearch(request, (response:any, status:any) => {
          if (status === mapsObj.places.PlacesServiceStatus.OK) {
            setPlaces(response);
          } else {
            console.error('Places search failed:', status);
          } 
        })
      } catch(error) {
        console.log(error)
      }
    }
  }

  useEffect(() => {
    if (tabValue == 1 && selectedCluster) {
      try {
        const cluster = supercluster.getChildren(selectedCluster);
        if (cluster.length) {
          const coords = cluster[0].geometry.coordinates;
          fetchPlaces(coords[1], coords[0])
        }
      } catch(e) {
        console.log(e)
      }
    }
  }, [tabValue, selectedCluster])

  async function fetchBikes() {
    const fetched: Bike[] = await callNextBikesApi();
    setBikes(fetched);
  }

  async function fetchCustomerBikes() {
    try {
      if (user) {
        const otherFetched:any = await getBikes(user.accessToken);
        setBikes(otherFetched?.data?.map((b:any) => {
          return {
            id: b.number,
            lat: b.position.lat,
            lng: b.position.lng,
            type: b.bike_type
          } as Bike
        }))
      }
    } catch(e) {
      console.log(e);
    }
  }

  useEffect(() => {
    fetchCustomerBikes();
  }, [user])

  useEffect(() => {
    setMapPoints(bikesToPointsConverter());
  }, [bikes])

  const logGoogleUser = async () => {
    const response = await signInWithGooglePopup();
    setUser(response.user); // response.user.accessToken
  }

  const hideDirections = () => {
    directionsRenderer.set('directions', null);
    setIsDirectionShown(false);
  }

  const bikesToPointsConverter = () => {
    if (bikes?.length) {
      return bikes.map(b => {
        return {
          type: "Feature",
          properties: { cluster: false, bikeId: b.id, type: b.type },
          geometry: { type: "Point", coordinates: [b.lng, b.lat]}
        }
      })
    }
    return [];
  }

  // get clusters
  const { clusters, supercluster } = useSupercluster({
    points: mapPoints,
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
        const markerColor = selectedCluster && selectedCluster == cluster.id ? "secondary" : "action";
        const markerSize = selectedCluster && selectedCluster == cluster.id ? "medium" : "small";
        return (
          <Marker
            key={`cluster-${cluster.id}`}
            lat={latitude}
            lng={longitude}
          >            
            <IconButton onClick={(e) => onBikeMarkerClick(e, cluster.id)}>
              <Badge badgeContent={pointCount} color="warning">
                  <RoomTwoToneIcon color={markerColor} fontSize={markerSize} />
              </Badge>
            </IconButton>
          </Marker>
        );
      }
    })
  }

  const renderPlaceMarkers = () => {
    return placeMarkers.map((m: any) => {
      return (
        <Marker
          key={`place-${m.place_id}`}
          lat={m.geometry.location.lat()}
          lng={m.geometry.location.lng()}
        >            
          <IconButton title={m.name}>
            <FestivalTwoToneIcon color="secondary" />
          </IconButton>
        </Marker>
      );
    })
  }

  const [bnValue, setBnValue] = React.useState('recents');

  const defaultMapOptions:any = {
    fullscreenControl: false,
    zoomControl: false,
    gestureHandling: "greedy",
  };

  const toggleBikesList = () => {
    if (selectedCluster) {
      setShowBikesList(!showBikesList)
    } else {
      setWarningMessage("Please, select bikes point.");
      setWarningOpen(true);
    }
  }

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
          {!user &&
            <BottomNavigationAction label="Log In" onClick={logGoogleUser} icon={<AccountCircleIcon />} />
          }
          {user &&
            <BottomNavigationAction label="Booked" onClick={fetchCustomerBikes} icon={<BookmarksIcon />} />
          }
          <BottomNavigationAction label="Bikes" onClick={toggleBikesList} icon={<BikeScooterIcon />} />
          {isDirectionShown && 
            <BottomNavigationAction label="Hide route" onClick={hideDirections} icon={<DirectionsOffIcon />} />
          }
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
      sx={{ width: 400 }}
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

  const getBikesOfTheCluster = (clusterId:any) => {
    let bikes:any = []
    const clusterItems = supercluster.getChildren(clusterId).map((o: any) => o.properties);
    if (clusterItems.length) {
      clusterItems.forEach((ci:any) => {
        if (ci.cluster) {
          bikes = bikes.concat(getBikesOfTheCluster(ci.cluster_id))
        } else {
          bikes.push(ci);
        }
      })
    }
    return bikes;
  }

  const onPlaceShow = (e: any, place: any) => {
    e.preventDefault();
    setPlaceMarkers([place]);
    setZoom(24)
    setCenterLocation({
      center: {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      },
      isLoaded: true
    });

    const cluster = supercluster.getChildren(selectedCluster);
    if (cluster.length) {
      const coords = cluster[0].geometry.coordinates;
      const origin = { lat: coords[1], lng: coords[0] };
      const destination = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() }; 
      const request = {
        origin,
        destination,
        travelMode: mapsObj.TravelMode.BICYCLING,
      };
      if (directionsService && directionsRenderer) {
        directionsService.route(request, (result:any, status:any) => {
          if (status === mapsObj.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
            setIsDirectionShown(true);
          } else {
            console.error('Directions request failed due to ', status);
          }
        });
      }
    }

  }

  const renderSightseeingList = () => (
    <Box
    sx={{ width: 400 }}
    role="presentation"
    onClick={toggleDrawer(false)}
    onKeyDown={toggleDrawer(false)}
  >
    {places.map(p => (
      <Card sx={{ display: 'flex', margin: 1 }} key={p.place_id} variant="outlined">
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '48%' }}>
          <CardContent sx={{ flex: '1 0 auto' }}>
            <Typography component="div" variant="h6">
              {p.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" component="div">
              <Chip label={p.rating} size='small' />
            </Typography>
          </CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}>
            <Button variant="contained" size='small' onClick={(e) => onPlaceShow(e, p)}>Show</Button>
          </Box>
        </Box>
        {p.photos?.length &&
          <CardMedia
            component="img"
            sx={{ width: '50%', maxHeight: 150, objectFit: "contain" }}
            image={p.photos[0].getUrl()}
            alt={p.name}
          />
        }
        {!p.photos?.length &&
          <CardMedia
            component="img"
            sx={{ width: '50%', maxHeight: 150, objectFit: "contain" }}
            image={`building-photo.png`}
            alt={p.name}
          />
        }
      </Card>
    ))}
    {!places?.length && <p>Sorry, nothing interesting in 1 km...</p>}
  </Box>
  );

  const iOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  const renderListOfBikes = () => {
    const anchor = 'right';
    if (selectedCluster) {
      try {
        const bikes = getBikesOfTheCluster(selectedCluster);
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
              <Box component="section" sx={{ minWidth: 350 }} alignItems="center">
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs value={tabValue} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Bikes" {...a11yProps(0)} />
                    <Tab label="Sightseeing" {...a11yProps(1)} />
                  </Tabs>
                </Box>
                <CustomTabPanel value={tabValue} index={0}>
                  {renderBikesList(bikes)}
                </CustomTabPanel>
                <CustomTabPanel value={tabValue} index={1}>
                  {renderSightseeingList()}
                </CustomTabPanel>
              </Box>              
            </SwipeableDrawer>
        </React.Fragment>
      );
      } catch (e) {
        // console.log(e)
        return <></>
      }
    }    
    return <></>
  }

  interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }

  function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  }

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      {apiKey &&
        <GoogleMapReact
          bootstrapURLKeys={{ 
            key: apiKey, 
            libraries: ['places', 'directions'] 
          }}
          defaultCenter={defaultProps.center}
          defaultZoom={defaultProps.zoom}
          center={centerLocation.center}
          options={defaultMapOptions}
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={({ map, maps }) => {
            mapRef.current = map;
            placesServiceRef.current = new maps.places.PlacesService(map);
            setMapsObj(maps)
            setDirectionsService(new maps.DirectionsService());
            setDirectionsRenderer(new maps.DirectionsRenderer({ 
              map,
              markerOptions: {
                icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png', // Customize the markers
              },
            }));
          }}
          onChange={onMapChange}
        >
          {renderBikeMarkers()}
          {renderPlaceMarkers()}
          
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
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={warningOpen}
        onClose={() => setWarningOpen(false)}
        message={warningMessage}
        key='warning-toast'
      />
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
