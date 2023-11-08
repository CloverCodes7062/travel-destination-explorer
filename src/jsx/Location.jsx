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
                <h1 className="location-h1">{ location }</h1>
                {locationWeather ?
                    <p className="location-weather-p">
                        {Math.round(locationWeather.high)}°F/
                        {Math.round(locationWeather.low)}°F
                    </p>
                    : null}
                <br/>
                <a href="/">
                    <button className="btn btn-primary">Back to Mainpage</button>
                </a>
                <br/>
                <div className="location-div-grid">
                    <img src={firstImg ? `data:image/jpeg;base64,${firstImg}` : '/'} alt="location-img"/>
                    <p className="location-discription-p first-desc-p">
                        {locationDesc ? locationDesc : null}
                    </p>
                </div>
                <br/>
                <ul className="location-ul list-group">
                    <li className="location-name-desc-booknow list-group-item">
                        <p className="booknow-p">Attraction</p>
                        <p className="booknow-p">Description</p>
                        <p className="booknow-p">Book Now</p>
                    </li>
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
            : <img src="/loading.svg" alt="loading-svg"/>}
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
                <img className="location-img animate__animated animate__fadeIn" src={desc.allImgs[currentIndex]} alt='img-not-found' key={currentIndex}/>
                <div className="location-img-btns">
                    <button className="btn btn-primary" onClick={decreaseCurrentIndex}>Back</button>
                    <button className="btn btn-primary" onClick={increaseCurrentIndex}>Next</button>
                </div>
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