/****************************
 *        API ROUTES        *
 ****************************/

const express = require('express');
const router = express.Router();
const elasticsearch = require('elasticsearch');

const db_host = process.env.DB_HOST;
const db_port = process.env.DB_PORT;
const db_username = process.env.DB_USERNAME;
const db_password = process.env.DB_PASSWORD;

const db_client = new elasticsearch.Client({
	hosts: [`https://${db_username}:${db_password}@${db_host}:${db_port}`]
});

// API Entry Point
router.get('/', (req, res, next) => {
	res.status(200).json({
		message: "Welcome to the API!"
	});
});

// DB Status
router.get('/db', (req, res, next) => {
	db_client.ping({
		requestTimeout: 30000,
	}, function (error) {
		if (error) {
			res.status(503).json({
				message: "elasticsearch is down"
			});
		} else {
			res.status(200).json({
				message: "elasticsearch is ok"
			});
		}
	});
});

// GET Forst Fires
router.get('/forestfires', (req, res, next) => {
	db_client.search({
		index: 'forestfires',
		body: {
			size: 10000
		}
	}).then(function (resp) {
		res.status(200).json(resp.hits.hits);
	}, function (err) {
		res.status(500).json(err.message);
	});
});

module.exports = router;