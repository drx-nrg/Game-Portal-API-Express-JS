const express = require('express');
const multer = require('multer');

const path = require('path')

const { body, validationResult } = require('express-validator')

const router = express.Router();

const GameController = require('./games.controller');
const ScoreController = require('./scores/scores.controller');

const { verifyToken, isAdmin, isUser, handleErrors } = require('../middleware');

router.get('/', verifyToken, GameController.index);
router.get('/:slug', verifyToken, GameController.show);
router.post('/', verifyToken, isUser, 
    body("title").notEmpty().withMessage("Title field cannot be empty").isLength({min: 3, max: 60}).withMessage("Title field length must be more than 3 and max 60 characters"),
    body("description").notEmpty().withMessage("Description field cannot be empty").isLength({min: 0, max: 200}).withMessage("Description field length must be more than 3 and max 60 characters"),
    handleErrors,
GameController.store);
router.put('/:slug', verifyToken, isUser,
    body("title").notEmpty().withMessage("Title field cannot be empty").isLength({min: 3, max: 60}).withMessage("Title field length must be more than 3 and max 60 characters"),
    body("description").notEmpty().withMessage("Description field cannot be empty").isLength({min: 0, max: 200}).withMessage("Description field length must be more than 3 and max 60 characters"),
    handleErrors,
GameController.update);
router.delete('/:slug', verifyToken, isUser, GameController.destroy);

router.post('/:slug/upload', verifyToken, isUser, GameController.upload);

router.get('/:slug/scores', verifyToken, ScoreController.index);
router.post('/:slug/scores', ScoreController.store);


module.exports = router