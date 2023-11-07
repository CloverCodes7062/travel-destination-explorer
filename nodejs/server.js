import express from 'express';
import axios from 'axios';
import opencage from 'opencage-api-client';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
const opencageAPIKey = process.env.OPENCAGE_API_KEY;
const googleMapsAPIKey = process.env.GOOGLE_MAPS_API_KEY;
const tripadvisorAPIKey = process.env.TRIPADVISOR_API_KEY;

app.get('/getWeatherFromCity', async (req, res) => {
    const { capital, country } = req.query;
    const location = `${capital}, ${country}`;
    opencage.geocode({ q: location , key: opencageAPIKey })
        .then(async data => {
            try {
                const cords = data.results[0].geometry;
                const lat = cords.lat;
                const lng = cords.lng;
                
                const weatherAPIUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timezone=America%2FChicago`;

                try {
                    const response = await axios.get(weatherAPIUrl);
                    const weather = [
                        response.data.daily.temperature_2m_max[0], 
                        response.data.daily.temperature_2m_min[0]
                    ];
                    res.status(200).json(weather);    
                } catch (error) {
                    console.log('error', error.message);
                }

            } catch (error) {
                res.status(500).json({ error: 'Error Fetching data from the API' });
            }})
        .catch(error => {
            console.log('error', error.message);
        });
});

app.get('/getWeatherFromLocation', async (req, res) => {
    const { city = null, state = null, country = null } = req.query;
    const location = `${city ? city + "," : null} ${state ? state + "," : null} ${country ? country : null}`;

    opencage.geocode({ q: location , key: opencageAPIKey })
        .then(async data => {
            try {
                const cords = data.results[0].geometry;
                const lat = cords.lat;
                const lng = cords.lng;

                const weatherAPIUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timezone=America%2FChicago`;

                try {
                    const response = await axios.get(weatherAPIUrl);
                    const weather = [
                        response.data.daily.temperature_2m_max[0], 
                        response.data.daily.temperature_2m_min[0]
                    ];
                    res.status(200).json(weather);    
                } catch (error) {
                    console.log('error', error.message);
                }

            } catch (error) {
                res.status(500).json({ error: 'Error Fetching data from the API' });
            }
        })
        .catch(error => {
            console.log('error', error.message);
        });

});

app.get('/getDescFromLocation', async (req, res) => {
    const { city } = req.query;
    const DescAPIUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${city}&key=${googleMapsAPIKey}`;

    try {
        const response = await axios.get(DescAPIUrl);
        const desc = response.data.results[0].formatted_address;
        res.status(200).json(desc);    
    } catch (error) {
        console.log('error', error.message);
    }
});

app.get('/getLocationImgsFromPlaceId', async (req, res) => {
    const { place_id } = req.query;
    const getLocationImgDataFromPlaceIdUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=photos&key=${googleMapsAPIKey}`;

    const response = (await axios.get(getLocationImgDataFromPlaceIdUrl)).data;

    if (response.result && response.result.photos) {
        const photoReferences = response.result.photos.map((photo) => photo.photo_reference);
        
        const photos = await Promise.all(photoReferences.map(async (photoReference) => {
            const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=250&maxheight=250&photoreference=${photoReference}&key=${googleMapsAPIKey}`;
            const photoResponse = await axios.get(photoUrl, {responseType: 'arraybuffer'});
            const photoData = Buffer.from(photoResponse.data).toString('base64');

            return photoData;
        }));

        res.status(200).json(photos);

    } else {
        console.log('error', response.error_message || 'Error Fetching Photos From Place ID');
    }
});

app.get('/getFeaturedCountryImgs', async (req, res) => {
    const { capital = null, country = null } = req.query;
    const location = `${capital ? capital + ',' : null} ${country ? country : null}`;
    const googleGetPlaceAPIUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${location}&inputtype=textquery&fields=photos&key=${googleMapsAPIKey}`;

    try{
        const photos = (await axios.get(googleGetPlaceAPIUrl)).data.candidates[0].photos;
        const photoReferences = photos.map((photo) => photo.photo_reference);
        const base64Photos = await Promise.all(photoReferences.map(async (photoReference) => {
            const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&maxheight=400&photoreference=${photoReference}&key=${googleMapsAPIKey}`;
            const photoResponse = await axios.get(photoUrl, {responseType: 'arraybuffer'});
            const photoData = Buffer.from(photoResponse.data).toString('base64');
            return photoData;
        }));

        res.status(200).json(base64Photos);
    } catch (error) {
        console.error('Error Retrieveing data from the API', error.message);
        res.status(500).json({ error: 'Error Retrieveing data from the API' });
    };

});

app.get('/getLocationThingsToDo', async (req, res) => {
    const { location=null } = req.query;
    const headers = {accept: 'application/json'}

    const tripadvisorAPIUrl = `https://api.content.tripadvisor.com/api/v1/location/search?key=${tripadvisorAPIKey}&searchQuery=${location}&category=restaurants&radius=25&radiusUnit=mi&language=en`;
    const locationDetails = (await (axios.get(tripadvisorAPIUrl, { headers }))).data;
    console.log('START OF LOGGING');
    
    const locationAllDetailsPromises = await Promise.allSettled(locationDetails.data.map(async (location, index) => {
        console.log('LOCATION: ', location);
        const getLocationDescUrl = `https://api.content.tripadvisor.com/api/v1/location/${location.location_id}/details?key=${tripadvisorAPIKey}&language=en&currency=USD`;
        const locationDescAndUrl = (await (axios.get(getLocationDescUrl, { headers }))).data;
        const locationDesc = locationDescAndUrl.description;
        const locationUrl = locationDescAndUrl.web_url;

        if (index != 0) {
            try {
                const getAllInfoUrl = `https://api.content.tripadvisor.com/api/v1/location/${location.location_id}/photos?language=en&key=B400D6F22AC54FAFA4CF4F14AEEAC699`; //gets url to tripadvisor and the imgs
                const allInfoUrl = (await axios.get(getAllInfoUrl, { headers })).data.data;
    
                const allImgs = allInfoUrl.map((img) => img.images.original.url);
    
                console.log(`index: ${index}`, `location_id: ${location.location_id}`, 'allImgsObject: ', allImgs, 'web_url: ', locationUrl);
    
                if (location.name && locationDesc && allImgs) {
                    return {name: location.name, description: locationDesc , allImgs: allImgs, webUrl: locationUrl};
                } else {
                    console.error(`Error Fetching Location Details for ${index}`);
                }
            } catch (error) {
                console.error(`Error Fetching Location Images for ${index}`, `Location ID: ${location.location_id}`, error.message);
            }
        } else {
            console.log(`index: ${index}`, `location_id: ${location.location_id}`, 'allImgsObject: ', null);
            if (location.name && locationDesc) {
                return {name: location.name, description: locationDesc, allImgs: null, webUrl: locationUrl};
            } else {
                console.error(`Error Fetching Location Details for ${index}`);
            }
        }
    }));

    const locationAllDetails = locationAllDetailsPromises.map((location) => {
        console.log('location: ', location);
        if (location && location.value && location.value.name && location.value.description && location.value.webUrl) {
            return {name: location.value.name, description: location.value.description , allImgs: location.value.allImgs, webUrl: location.value.webUrl};
        } else {
            return {name: null, description: null, allImgs: null, webUrl: null};
        }
    });

    console.log('locationAllDetails: ', locationAllDetails);
    console.log('END OF LOGGING');
    res.status(200).json(locationAllDetails);
});

app.get('/getPlaceIDFromLocation', async (req, res) => {
    const { location } = req.query;
    const placeAPIUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${googleMapsAPIKey}`;
    const response = (await axios.get(placeAPIUrl)).data;
    console.log('response: ', response);
    const placeID = response.results[0].place_id;
    console.log('placeID: ', placeID);
    res.status(200).json(placeID);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});