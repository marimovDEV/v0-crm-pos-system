const axios = require('axios');

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
});

async function test() {
    console.log("Testing with leading slash:");
    try {
        const url = api.getUri({ url: '/login/' });
        console.log(`URL: ${url}`);
    } catch (e) {
        console.log(e);
    }

    console.log("\nTesting without leading slash:");
    try {
        const url = api.getUri({ url: 'login/' });
        console.log(`URL: ${url}`);
    } catch (e) {
        console.log(e);
    }
}

test();
