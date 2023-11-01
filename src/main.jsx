import React from 'react'
import ReactDOM from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.css';
import './index.css'
import Background from './jsx/Background'
import MainContainer from './jsx/MainContainer'
import Location from './jsx/Location'
import 'animate.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

function App() {
  const [location, setLocation] = React.useState('');
  const [locationWeather, setLocationWeather] = React.useState({});
  const [locationImgs, setLocationImgs] = React.useState([]);
  const [locationDesc, setLocationDesc] = React.useState('');
  const [restOfDescs, setRestOfDescs] = React.useState([]);
  const [isLocationLoading, setIsLocationLoading] = React.useState(true);

  const mainConainerProps = { 
    location, 
    setLocation, 
    locationWeather, 
    setLocationWeather,
    locationImgs,
    setLocationImgs,
    locationDesc, 
    setLocationDesc,
    restOfDescs, 
    setRestOfDescs,
    setIsLocationLoading,
  };

  const locationProps = {
    location,
    locationWeather,
    locationImgs,
    locationDesc,
    restOfDescs,
    isLocationLoading,
  };

  return (
    <Router>
      <Routes>
        <Route index element={<MainContainer {...mainConainerProps}/>}/>
        <Route path="location" element={<Location {...locationProps}/>}/>
      </Routes>
    </Router>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
