const express = require("express");

const router = express.Router();
const AdminController = require('./admin.controller');

const { verifyToken, isAdmin } = require('../middleware');

router.get('/', verifyToken, isAdmin, AdminController.index);

module.exports = router;