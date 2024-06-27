const express = require('express');
const { body, validationResult } = require('express-validator');
const UserController = require('./users.controller');

// Middleware
const { verifyToken, isAdmin, isUser, handleErrors } = require('../middleware');

const router = express.Router();

router.get('/', verifyToken, isAdmin, UserController.index);
router.get('/:username', verifyToken, UserController.show);
router.post('/',
    verifyToken, isAdmin,
    body('username').notEmpty().withMessage("Username field must be filled").isLength({min: 4, max: 60}).withMessage("Username length must be more than 4 and below 60"),
    body('password').notEmpty().withMessage("Password field must be filled").isLength({min: 5, max: 10}).withMessage("Password length must be more than 5 and below 10"),
    handleErrors,
UserController.store);
router.put('/:id', verifyToken, isAdmin, UserController.update);
router.delete('/:id', verifyToken, isAdmin, UserController.destroy);


module.exports = router;