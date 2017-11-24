const fs = require('fs');
const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');
const exportsJWY = require('express-jwt');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const router = express.Router();
router.use(bodyParser.json());
const config = JSON.parse(fs.readFileSync('config-secret.json'))
const mySecret = config.mySecret;
router.use(exportsJWY({secret: mySecret}).unless({path: ['/login']}));
const connection = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    port: config.port,
    database: config.database
});
connection.connect();
const queryPromise = (queryBody) => {
    return new Promise((resolve, reject) => {
        connection.query(queryBody, (error, results, fields) => {
            if (error) {
                reject({error});
            }
            else {
                resolve(results);
            }
        });
    });
}
router.delete('/remove', (req, res) => {
    queryPromise(`
        DELETE FROM
            org_has_tag
        WHERE
            org_id = ${parseInt(req.body.orgId, 10)}
    `).then(results => {
        return queryPromise(`
            DELETE FROM
                contact
            WHERE
                org_id = ${parseInt(req.body.orgId, 10)}
        `);
    }).then(results => {
        return queryPromise(`
            DELETE FROM
                org
            WHERE
                id = ${parseInt(req.body.orgId, 10)}
        `);
    }).then(results => {
        res.status(200).send();
    }).catch(error => {
        res.status(500).send();
    });
})
router.put('/approve', (req, res) => {
    queryPromise(`
        UPDATE
            org
        SET
            approved = 1
        WHERE
            id = ${parseInt(req.body.orgId, 10)}
    `).then(results => {
        res.status(200).send();
    }).catch(error => {
        res.status(500).send();
    });
})
router.post('/login', (req, res) => {
    const tags = {};
    const orgs = {};
    connection.query('SELECT username, password FROM admin', (error, results, fields) => {
        if (error) {
            res.status(500).send();
        }
        else {
            let isAdmin = false;
            results.forEach(result => {
                if(req.body.username === result.username) {
                    if(bcrypt.compareSync(req.body.password, result.password)) {
                        isAdmin = true;
                    }
                }
            });
            if (!isAdmin) {
                res.status(401).send();
            }
            else {
                queryPromise(`
                    SELECT
                        id, name
                    FROM
                        tag
                `).then(results => {
                    results.forEach(result => {
                        tags[result.id] = result.name;
                    });
                    return queryPromise(`
                        SELECT
                            id, name, description_company, description_person, logo
                        FROM
                            org
                        WHERE
                            approved = 0
                    `);            
                }).then(results => {
                    results.forEach(result => {
                        orgs[result.id] = {
                            name: result.name,
                            logo: result.logo,
                            description_company: result.description_company,
                            description_person: result.description_person,
                            approved: result.approved,
                            tags: [],
                            contacts: []
                        };
                    });
                    return queryPromise(`
                        SELECT
                            org_id, tag_id
                        FROM
                                org_has_tag
                            INNER JOIN
                                org
                        ON
                            org_id = id
                        WHERE
                            approved = 0
                    `);
                }).then(results => {
                    results.forEach(result => {
                        orgs[result.org_id].tags.push(result.tag_id);
                    });
                    return queryPromise(`
                        SELECT
                            org_id, phone, email, web, latitude, longitude, post_code, city, house_number,
                            contact.id AS contact_id
                        FROM
                                contact
                            INNER JOIN
                                org
                        ON
                            org_id = org.id
                        WHERE
                            approved = 0
                    `);
                }).then(results => {
                    results.forEach(result => {
                        orgs[result.org_id].contacts.push({
                            id: result.contact_id,
                            phone: result.phone,
                            email: result.email,
                            web: result.web,
                            latitude: result.latitude,
                            longitude: result.longitude,
                            post_code: result.post_code,
                            city: result.city,
                            house_number: result.house_number
                        });
                    });
                    const myToken = jwt.sign({username: req.body.username}, mySecret);
                    res.json({tags, orgs, myToken});
                }).catch(error => {
                    res.status(500).send();
                });
            }
        }
    });
});
module.exports = router;