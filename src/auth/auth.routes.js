const express = require('express');
const { body, validationResult } = require('express-validator');
const { verifyToken, handleErrors } = require('../middleware');
const AuthController = require('./auth.controller');

const router = express.Router();

router.post('/signup',
    body('username').notEmpty().withMessage("Username field must be filled").isLength({min: 4, max: 60}).withMessage("Username length must be more than 4 and below 60"),
    body('password').notEmpty().withMessage("Password field must be filled").isLength({min: 5, max: 15}).withMessage("Password length must be more than 5 and below 10"),
    handleErrors,
AuthController.signup);
router.post('/signin',
    body('username').notEmpty().withMessage("Username field must be filled").isLength({min: 4, max: 60}).withMessage("Username length must be more than 4 and below 60"),
    body('password').notEmpty().withMessage("Password field must be filled").isLength({min: 5, max: 15}).withMessage("Password length must be more than 5 and below 10"),
    handleErrors,
AuthController.signin);
router.post('/signout', verifyToken, AuthController.signout);

module.exports = router