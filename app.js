/**
 * SERVICE
 * 
 * passed with the request
 * 
 * https://my-dev.cura-fundraising.ch/api/latest/contact/?&membership_number=1945587
 */

/**
 * WordPress REST API
 * 
 * hard-coded
 * 
 * /wp-json/teamsuisse/cura/details
 */
const express = require('express');
const axios = require('axios');

//local
const WP_URL = 'http://teamsuisse.local/wp-json/teamsuisse/cura/details';

//staging
// const WP_URL = 'https://afc-team-suisse.ch/wp-json/teamsuisse/cura/details';

//production
// const WP_URL = 'https://teamsuisse.ch/wp-json/teamsuisse/cura/details';

const app = express();
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

const dvcPort = process.env.PORT || 3000;
// const PORT = 7883;

async function talkToCura(url, key) {

    try {
        let response = await axios.get(url, {
                headers: {
                'Authorization': `token ${key}`
                }
            });
        return Promise.resolve(response.data);
    } catch (error) {
        throw new Error(error);
    }
}

async function talkToWP(userID, details, key) {
    try {
        const data = {
            userID: userID,
            userDetails: details
        };
        const config = {
            headers: {
                'Authorization': `${key}`
            }
        }
        let response = await axios.post(WP_URL, data, config);
        return Promise.resolve(response.data);
    } catch (error) {
        throw new Error(error);
    }
}

app.post('/dvc/cura-get/', async function(req, res) {

    const memberID = req.body.memberID
    const url = req.body.url + memberID;
    const wpUserID = req.body.wpUserID;

    /**
     * Send an instant response to WordPress
     * so that user can continue to use the site
     */
    res.status(200).json('Cura request is being processed');
    
    /**
     * Make request to CURA and wait for respond
     */
    const details = await talkToCura(url, req.body.key);
    console.log(details.members[memberID]);

    /**
     * When data from CURA is received send it back
     * to wordpress using REST API
     */
    const sendToWordpress = await talkToWP(wpUserID, details.members[memberID], req.body.key);
    console.log(sendToWordpress);

});

app.listen(dvcPort, function() {
    console.log(`Server started on port ${dvcPort}`);
});