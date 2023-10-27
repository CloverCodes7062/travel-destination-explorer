import fs from 'fs';
import axios from 'axios';

const allCountries = {}

const fetchFeaturedCountries = async () => {
    const apiUrl = 'https://restcountries.com/v3.1/all';
    console.log('Fetching featured countries...');

    try {
        const response = await axios.get(apiUrl);
        const countries = response.data;

        for (const country of countries) {
            allCountries[`${country.capital}, ${country.name.common}`] = '';
        }

    } catch (error) {
        console.error('Error fetching featured countries: ', error);
    };

    const json = JSON.stringify(allCountries, null, 2);
    const filePath = 'output.json';

    fs.writeFileSync(filePath, json, (err) => {
        if (err) {
            console.error('Error writing file: ', err);
        } else {
            console.log('Successfully wrote file');
        }
    });
};

fetchFeaturedCountries();