const express = require('express');
const router = express.Router();

const controller = require('../controllers/mainController');

// trade list page
router.get('/list', controller.container);

// trade create page
router.get('/new', controller.container);

// trade detail page
router.get('/view/:id', controller.container);

// trade edit page
router.get('/edit/:id', controller.container);

module.exports=router;  