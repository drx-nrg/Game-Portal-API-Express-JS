const express = require('express');
const path = require('path')
const bcrypt = require('bcrypt');
const prisma = require('./database/prisma');

require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 6666

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Main Routes
const AuthRoutes = require('./auth/auth.routes');
const AdminRoutes = require('./administrators/admin.routes');
const UsersRoutes = require('./users/users.routes');
const GameRoutes = require('./games/games.routes');

app.get('/user', async (req, res) => {
    const users = await prisma.users.findMany();
    for(let i = 0; i < users.length; i++){
        const password = await bcrypt.hash(`helloworld${i+1}!`, 10);
        await prisma.users.update({
            where: {
                NOT: {
                    id: 41
                }
            },
            data: {
                password
            }
        });
    }

    res.status(200).json({
        status: "success"
    })
});

app.get('/dev', async (req, res) => {
    const devs = await prisma.users.findMany({
        where: {
            username: {
                contains: "dev"
            }
        }
    });
    for(let i = 0; i < devs.length; i++){
        const password = await bcrypt.hash(`hellobyte${i+1}!`, 10);
        await prisma.users.update({
            where: {
                id: devs[i].id
            },
            data: {
                password
            },
        });
    }

    res.status(200).json({
        status: "success"
    })
});

app.get('/admin', async (req, res) => {
    const admins = await prisma.administrators.findMany();
    for(let i = 0; i < admins.length; i++){
        const password = await bcrypt.hash(`hellouniverse${i+1}!`, 10);
        await prisma.administrators.update({
            where: {
                id:i+1
            },
            data: {
                password
            }
        });
    }

    res.status(200).json({
        status: "success"
    })
});


app.use('/api/v1/auth', AuthRoutes);
app.use('/api/v1/admins', AdminRoutes);
app.use('/api/v1/users', UsersRoutes);
app.use('/api/v1/games', GameRoutes);

// Unprovided route handling
app.use((req, res) => {
    res.status(404).json({
        status: false,
        message: "Not Found"
    });
});

// Start the server
app.listen(PORT, () => {
    console.log("Server is listening in port " + PORT);
});