import Background from "./Background";
import React, { useEffect } from 'react'
import axios from 'axios';
import '../css/Location.css';

function Location({ location, locationWeather, locationImgs, locationDesc, restOfDescs, isLocationLoading, }) {
    const [firstImg, setFirstImg] = React.useState(null);

    useEffect(() => {
        if (locationImgs) {
            setFirstImg(locationImgs[0]);
        }
    }, [locationImgs]);

    return (
        <Background>
            {!isLocationLoading ?
            <div className="location-container">
                <h1 className="location-h1"/>
                <h2>{ location }</h2>
                {locationWeather ?
                    <p className="location-weather-p">
                        {Math.round(locationWeather.high)}°F/
                        {Math.round(locationWeather.low)}°F
                    </p>
                    : null}
                <br/>
                <a href="http://localhost:5173/">
                    <button className="btn btn-primary">Back to Mainpage</button>
                </a>
                <div className="location-div-grid">
                    <img src={firstImg ? `data:image/jpeg;base64,${firstImg}` : '/'} alt="location-img"/>
                    <p className="location-discription-p">
                        {locationDesc ? locationDesc : null}
                    </p>
                </div>
                <br/>
                <ul className="location-ul list-group">
                    {restOfDescs ? restOfDescs.map((desc, index) => { 
                        if (desc.name && desc.description) {
                            return (
                                <LocationItem desc={desc} key={index}/>
                            );
                        }
                    }) 
                    : null}
                </ul>
            </div>
            : <img src="../svg/loading.svg" alt="loading-svg"/>}
        </Background>
    );
};

function LocationItem({ desc }) {
    const [currentIndex, setCurrentIndex] = React.useState(0);

    const increaseCurrentIndex = () => {
        setCurrentIndex((currentIndex + 1) % desc.allImgs.length);
    };

    const decreaseCurrentIndex = () => {
        setCurrentIndex((currentIndex - 1 + desc.allImgs.length) % desc.allImgs.length);
    };

    return (
        <li className="location-img-name-desc list-group-item">
            <div className="location-img-div">
                <img className="location-img" src={desc.allImgs[currentIndex]} alt='img-not-found'/>
                <button className="btn btn-primary" onClick={decreaseCurrentIndex}>Back</button>
                <button className="btn btn-primary" onClick={increaseCurrentIndex}>Next</button>
            </div>
            <p className="location-name-p">
                {desc.name}
            </p>
            <p className="location-discription-p">
                {desc.description}
            </p>
            <p className="web-url">
                <a href={desc.webUrl} target="_blank" rel="noreferrer">
                    <button className="btn btn-primary">Book Now</button>
                </a>
            </p>
        </li>
    );

};

export default Location;