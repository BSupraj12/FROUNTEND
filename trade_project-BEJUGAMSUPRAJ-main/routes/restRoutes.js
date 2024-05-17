const express = require('express');
const { check } = require('express-validator');

// Validation rules.
var signInValidation = [
    check('username', 'Username must be an email address').trim().isEmail().normalizeEmail(),
    check('password').isLength({ min: 8 }).trim()
        .withMessage('Password must be at least 8 Characters')
        .matches('[0-9]').withMessage('Password must contain a Number')
        .matches('[A-Z]').withMessage('Password must contain an uppercase Letter')
];
var signUpValidation = [
    check('first_name').isLength({ min: 1, max: 25 }).trim().escape()
        .withMessage('First name length must be minimum 1 and maximum 25')
        .matches('[A-Za-z]').withMessage('First name can only contain alphabets'),
    check('last_name').isLength({ min: 1, max: 25 }).trim().escape()
        .withMessage('Last name length must be minimum 1 and maximum 25')
        .matches('[A-Za-z]').withMessage('Last name can only contain alphabets'),
    check('email', 'Email must be a valid one').trim().isEmail().normalizeEmail(),
    check('password').isLength({ min: 8 }).trim()
        .withMessage('Password must be at least 8 Characters')
        .matches('[0-9]').withMessage('Password must contain a Number')
        .matches('[A-Z]').withMessage('Password must contain an uppercase Letter')
];

var tradeInfoValidation = [
    check('topic').isLength({ min: 3, max: 20 }).trim().escape()
        .withMessage('Category length must be minimum 3 and maximum 20'),
    check('name').isLength({ min: 3, max: 20 }).trim().escape()
        .withMessage('Name length must be minimum 3 and maximum 20'),
    check('details').isLength({ min: 3 }).trim().escape()
        .withMessage('Details must be atlease 3 characters'),
];

const router = express.Router();

const { ensureAuthenticated } = require('../utils/auth');
const userController = require('../controllers/userController');
const tradeController = require('../controllers/tradeController');

router.post('/signin', signInValidation, userController.signin);

router.post('/signup', signUpValidation, userController.signup);

router.post('/authorized', userController.get);

router.get('/trades', tradeController.tradeList);

router.get('/trades/new', ensureAuthenticated, tradeController.tradeNew);

router.get('/trades/:id', tradeController.tradeDetail);

router.get('/trades/:id/edit', ensureAuthenticated, tradeController.tradeEdit);

router.get('/user-detail', ensureAuthenticated, userController.detail);

// create new trade
router.post('/trade', [ensureAuthenticated, tradeInfoValidation], tradeController.create);

// update trade
router.put('/trade/:id', ensureAuthenticated, tradeController.update);

// delete trade
router.delete('/trade/:id', ensureAuthenticated, tradeController.delete);

router.post('/trade/watch', ensureAuthenticated, tradeController.watch);

router.post('/trade/offer', ensureAuthenticated, tradeController.offerTrade);

router.post('/trade/offer/accept', ensureAuthenticated, tradeController.acceptOffer);

router.post('/trade/offer/reject', ensureAuthenticated, tradeController.rejectOffer);

module.exports = router;
