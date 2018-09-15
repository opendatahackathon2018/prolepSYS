/****************************
 *   ADMINISTRATOR ROUTES   *
 ****************************/

var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});


// Login Page
router.get('/login', function (req, res, next) {
  res.render('admin/login', {
    title: 'Login'
  });
});

// Dashboard Page
router.get('/dashboard', function (req, res, next) {
  res.render('admin/dashboard', {
    title: 'Dashboard'
  });
});

// Statistics Page
router.get('/statistics', function (req, res, next) {
  res.render('admin/statistics', {
    title: 'Statistics'
  });
});

module.exports = router;