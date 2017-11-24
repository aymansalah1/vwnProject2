const fs = require('fs');
const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');

const router = express.Router();
router.use(bodyParser.json());
const config = JSON.parse(fs.readFileSync('config-secret.json'))
const connection = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    port: config.port,
    database: config.database
});
connection.connect();
const queryPromise = (queryBody, values) => {
    return new Promise((resolve, reject) => {
        connection.query(queryBody, values, (error, results, fields) => {
            if (error) {
                reject({error});
            }
            else {
                resolve(results);
            }
        });
    });
}
router.post('/add', (req, res) => {
    const data = req.body;
    let insertedOrgId;
    queryPromise(`
        INSERT INTO
            org
                (name, description_company, description_person, logo, active, approved)
        VALUES
            (?, ?, ?, ?, ?, ?)
    `, [data.name, data.descriptionCompanies, data.descriptionPersons, data.logo, 1, 0]).then(results => {
        insertedOrgId = results.insertId;
        return queryPromise(`
            INSERT INTO
                org_has_tag
                    (org_id, tag_id)
            VALUES
                ?
        `, [data.tags.map(tagId => [insertedOrgId, tagId])]);
    }).then(results => {
        const valuesArray = [[
            data.contact1.lat, data.contact1.lon, data.contact1.phone, data.contact1.email,
            data.contact1.web, insertedOrgId, data.contact1.code, data.contact1.city,
            data.contact1.house
        ]];
        if (data.contact2) {
            valuesArray.push([
                data.contact2.lat, data.contact2.lon, data.contact2.phone, data.contact2.email,
                data.contact2.web, insertedOrgId, data.contact2.code, data.contact2.city,
                data.contact2.house
            ]);
        }
        if (data.contact3) {
            valuesArray.push([
                data.contact3.lat, data.contact3.lon, data.contact3.phone, data.contact3.email,
                data.contact3.web, insertedOrgId, data.contact3.code, data.contact3.city,
                data.contact3.house
            ]);
        }
        return queryPromise(`
            INSERT INTO
                contact
                    (latitude, longitude, phone, email, web, org_id, post_code, city, house_number)
            VALUES
                ?
        `, [valuesArray]);
    }).then(results => {
        res.status(200).send();
    }).catch(error => {
        res.status(500).send();
    });
});
module.exports = router;