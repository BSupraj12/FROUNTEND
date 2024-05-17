const express = require('express');
const router = express.Router();

const controller = require('../controllers/mainController');
const userController = require('../controllers/userController');

//GET /: redirects to the home page
router.get('/', controller.index);

//GET /contact: redirects to the contact page
router.get('/contact', controller.contact);

//POST /about: redirects to the about page
router.get('/about', controller.about);

// login page
router.get('/login', userController.login);

// register new user page
router.get('/register', userController.register);

// container detail common page
router.get('/user-detail', controller.container);

module.exports=router;