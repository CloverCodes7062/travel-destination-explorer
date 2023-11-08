import React, { useEffect, useState, useRef } from "react";
import '../css/MainContainer.css';
import { GoogleMap, LoadScript, Autocomplete } from '@react-google-maps/api';
import Background from "./Background";
import { Outlet, Link } from "react-router-dom";
import axios from "axios";

const libraries = ['places'];

async function fetchAllCountries() {
    try {
        const response = await axios.get('/allCountries.json');
        
        return response.data;
    } catch (error) {
        console.error('Error fetching all countries: ', error);
    }
}

const allCountries = await fetchAllCountries();
const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

function MainContainer({ location, setLocation, locationWeather, setLocationWeather, locationImgs, setLocationImgs, locationDesc, setLocationDesc, restOfDescs, setRestOfDescs, setIsLocationLoading, }) {
    const [featuredCountries, setFeaturedCountries] = useState([]);
    const [weatherData, setWeatherData] = useState({});
    const [calledFetchFeaturedCountries, setCalledFetchFeaturedCountries] = useState(false);
    const [activeStates, setActiveStates] = useState({});
    const [autocomplete, setAutocomplete] = useState(null);
    const [featuredCountriesImgs, setFeaturedCountriesImgs] = React.useState({});

    const fetchFeaturedCountries = async () => {
        const apiUrl = 'https://restcountries.com/v3.1/all';
        console.log('Fetching featured countries...');

        try {
            const response = await axios.get(apiUrl);
            const countries = response.data;

            const randomFeaturedCountries = getRandomItems(countries, 3);
            setIsLocationLoading(true);
            setFeaturedCountries(randomFeaturedCountries);
        } catch (error) {
            console.error('Error fetching featured countries: ', error);
        };

        console.log('Fetched featured countries');
    };

    const getRandomItems = (array, count) => {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    };

    if (!calledFetchFeaturedCountries) {
        setCalledFetchFeaturedCountries(true);
        fetchFeaturedCountries();
        console.log('Called Fetch Featured Countries');
    }

    useEffect(() => {
        const fetchWeatherData = async () => {
            const newWeatherData = {};

            for (const country of featuredCountries) {
                const { high, low } = await getWeather(country);
                newWeatherData[country.cca3] = { high, low };
            }

            setWeatherData(newWeatherData);
        };
        console.log('Called Fetch Weather Data');
        fetchWeatherData();

        const fetchFeaturedCountriesImgs = async () => {
            const newFeaturedCountriesImgs = {};

            await Promise.allSettled(featuredCountries.map(async (country) => {
                const imgs = await getImgs(country);
                newFeaturedCountriesImgs[country.cca3] = imgs;
            }));

            setFeaturedCountriesImgs(newFeaturedCountriesImgs);
        };

        console.log('Called Fetch Featured Countries Imgs');
        fetchFeaturedCountriesImgs();

    }, [featuredCountries]);

    const getImgs = async (country) => {
        const capital  = country.capital;
        const fetchURL = `https://travel-destination-explorer-back-end.onrender.com/getFeaturedCountryImgs?capital=${capital}&country=${country.name.common}`;
        console.log(`Fetching photos for ${capital}, ${country.name.common}`);

        try {
            const response = await axios.get(fetchURL);

            return { imgs:response.data };
        } catch (error) {
            console.error(`Error fetching photos: ${capital}, ${country.name.common}`, error);
        }
    };

    const getWeather = async (country) => {
        const capital = country.capital;
        const fetchURL = `https://travel-destination-explorer-back-end.onrender.com/getWeatherFromCity?capital=${capital}&country=${country.name.common}`;
        console.log(`Fetching weather data for ${capital}, ${country.name.common}`);
        
        try {
            const response = await axios.get(fetchURL);

            return { high:response.data[0], low:response.data[1] };
        } catch (error) {
            console.error('Error fetching weather data: ', error);
        }
    };

    const handleHover = (cca3, isActive) => {
        setActiveStates((prevActiveStates) => ({
            ...prevActiveStates,
            [cca3]: isActive,
        }));
    };

    const getWeatherForLocation = async (location) => {
        const locationArray = location.split(', ');
        let fetchURL = null;

        if (locationArray.length == 3) {
            const [part1, part2, part3] = locationArray;
            fetchURL = `https://travel-destination-explorer-back-end.onrender.com/getWeatherFromLocation?city=${part1}&state=${part2}&country=${part3}`;

        } else if (locationArray.length == 2) {
            const [part1, part2] = locationArray;
            fetchURL = `https://travel-destination-explorer-back-end.onrender.com/getWeatherFromLocation?city=${part1}&country=${part2}`;
        
        } else if (locationArray.length == 1) {
            const part1 = locationArray[0];
            fetchURL = `https://travel-destination-explorer-back-end.onrender.com/getWeatherFromLocation?country=${part1}`;
        } else {
            return null;
        }

        console.log(`Fetching weather data for ${location}`);
        
        try {
            const response = await axios.get(fetchURL);

            return { high:response.data[0], low:response.data[1] };
        } catch (error) {
            console.error('Error fetching weather data: ', error);
        }
    };

    useEffect(() => {
        getWeatherForLocation(location)
        .then((data) => {
            setLocationWeather(data);
        })
        .catch ((error) => {
            console.log('Error fetching weather data: ', error);
        });
    }, [location]);

    const onPlaceSelected = async () => {
        const place = autocomplete.getPlace();
        setLocation(place.formatted_address);
        console.log('Place Address', place.formatted_address);
        console.log('Retrieving photos for', place.place_id);

        await setThingsToDO(place);
    };

    async function setThingsToDO (place, viewClick = false, buttonCountryCode = null) {
        try {
            if (viewClick) {
                console.log('old_place.place_id: ', place.place_id);
                place.place_id = (await axios.get(`https://travel-destination-explorer-back-end.onrender.com/getPlaceIdFromLocation?location=${place.formatted_address}`)).data;
                console.log('place.place_id: ', place.place_id);
                setLocation(place.formatted_address);
            }
            const imgs = (await axios.get(`https://travel-destination-explorer-back-end.onrender.com/getLocationImgsFromPlaceId?place_id=${place.place_id}`));
            setLocationImgs(imgs.data);
            console.log('Retrieved photos for', place);
        } catch (error) {
            console.error('Error retrieving photos for', place, ': ', error);
        };

        try {
            const thingsToDo = (await axios.get(`https://travel-destination-explorer-back-end.onrender.com/getLocationThingsToDo?location=${place.formatted_address}`)).data;
            console.log('thingsToDo: ', thingsToDo);
            console.log('thingsToDo: ', thingsToDo);
            try {
                const firstNonNull = thingsToDo.find((thingToDo) => thingToDo.description != null);

                if (firstNonNull) {
                    console.log('firstNonNull: ', firstNonNull.description);
                    setLocationDesc(firstNonNull.description);
                    const restToDo = thingsToDo.slice(thingsToDo.indexOf(firstNonNull) + 1);

                    console.log('restToDo: ', restToDo);

                    setRestOfDescs(restToDo);
                    setIsLocationLoading(false);
                } else {
                    throw new Error('Nothing to Do');
                }
            } catch (error) {
                console.error('Error: Nothing to Do', error);

                const listItem = document.querySelector(`li[key=${buttonCountryCode}]`);
                console.log('listItem: ', listItem);
                if (listItem){
                    const button = listItem.querySelector('button');
                    console.log('button: ', button);
                    if (button){
                        button.textContent = 'Nothing to Do';
                    }
                }

            }
            
        } catch (error) {
            console.error('Error getting thingsToDo, or restOfDescs: ', error);
        };
    }

    return (
        <Background>
            <div className="main-container">
                <h1 className="main-h1">
                    Travel Destination Explorer
                </h1>
                <div className="country-input-container">
                    <LoadScript googleMapsApiKey={googleMapsApiKey} libraries={libraries}>
                        <Autocomplete types={['(cities)']} onLoad={(autocomplete) => setAutocomplete(autocomplete)} onPlaceChanged={onPlaceSelected}>
                            <input 
                                className="country-input form-control" 
                                type="text" 
                                placeholder="Enter a Location"
                            />
                        </Autocomplete>
                    </LoadScript>
                    <Link to="/location">
                        <input className="btn btn-primary" type="submit"/>
                    </Link>
                </div>
                <h2 className="featured-countries-h2">
                    Featured Countries
                </h2>
                <ul className="featured-countries-list list-group">
                    <li className="featured-country-label list-group-item">
                        <p className="featured-country-label-p animate__animated animate__bounceInLeft">Capital</p>
                        <p className="featured-country-label-p animate__animated animate__bounceInRight">Weather</p>
                    </li>
                    {featuredCountries.map((country) => 
                        (
                        <li 
                        onMouseEnter={() => handleHover(country.cca3, true)} 
                        onMouseLeave={() => handleHover(country.cca3, false)} 
                        className={`featured-country list-group-item ${activeStates[country.cca3] ? 'active': ''}`} 
                        key={country.cca3}
                        >   
                            <div className="featured-country-img-name-desc">
                                {featuredCountriesImgs[country.cca3] ?
                                <img 
                                    src={`data:image/jpeg;base64,${featuredCountriesImgs[country.cca3].imgs[0]}`}
                                    className="featured-country-img animate__animated animate__fadeIn"
                                    alt="featured-country-img"
                                />
                                : null}
                                <div className="featured-country-name-desc">
                                    <p className="featured-country-p animate__animated animate__bounceInLeft">
                                        {country.flag} 
                                        {country.capital === 'Washington DC' ? 'Washington D.C, United States' 
                                        : 
                                        `${country.capital}, ${country.name.common}`}
                                    </p>
                                    <p className="featured-country-desc-p animate__animated animate__bounceInLeft">{allCountries[`${country.capital}, ${country.name.common}`]}</p>
                                </div>
                            </div>
                            {
                            weatherData[country.cca3] 
                            ?
                            <p className="featured-country-weather-p animate__animated animate__bounceInRight">
                                ({Math.round(weatherData[country.cca3].high)}°F/
                                {Math.round(weatherData[country.cca3].low)}°F)
                                <Link to="/location">
                                    <button 
                                    className="btn btn-danger view-btn"
                                    onClick={() => setThingsToDO({formatted_address: `${country.capital}, ${country.name.common}`, place_id: null}, true, country.cca3)}
                                    >
                                        View
                                    </button>
                                </Link>
                            </p>
                            :
                            <img src="/loading.svg" height={75} width={75}/>
                            }
                        </li>
                        )
                    )}
                </ul>
            </div>
        </Background>
    );
}

export default MainContainer;