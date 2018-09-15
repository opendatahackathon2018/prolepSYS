/****************************
 *       PUBLIC ROUTES      *
 ****************************/

var express = require('express');
var router = express.Router();

// Home Page
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Home',
    api_entry: process.env.API_ENTRY
  });
});

// About Page
router.get('/about', function (req, res, next) {
  res.render('about', {
    title: 'About'
  });
});

module.exports = router;