const express = require('express');
const bodyParser = require('body-parser');
const path = require('path')
const bcrypt = require('bcrypt');
const prisma = require('./database/prisma');

require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 6666


app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
// app.use(express.urlencoded({ extended: true }));

// Main Routes
const AuthRoutes = require('./auth/auth.routes');
const AdminRoutes = require('./administrators/admin.routes');
const UsersRoutes = require('./users/users.routes');
const GameRoutes = require('./games/games.routes');

app.use('/api/v1/auth', AuthRoutes);
app.use('/api/v1/admins', AdminRoutes);
app.use('/api/v1/users', UsersRoutes);
app.use('/api/v1/games', GameRoutes);

// Unprovided route handling
app.use((req, res) => {
    res.status(404).json({
        status: "not-found",
        message: "Not Found"
    });
});

// Start the server
app.listen(PORT, () => {
    console.log("Server is listening in port " + PORT);
});