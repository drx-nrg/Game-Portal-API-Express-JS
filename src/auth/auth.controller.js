require('dotenv').config();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const prisma = require('../database/prisma');

const { getCurrentTimestamp } = require('../utils/function');

const signup = async (req, res) => {
    let { username, password } = req.body;
    
    password = await bcrypt.hash(password, 10);

    const userExists = await prisma.users.findMany({
        where: {
            username: username
        }
    });

    if(userExists.length){
        return res.status(400).json({
            status: "invalid",
            message: "Username already exists"
        });
    }

    const user = await prisma.users.create({
        data: {
            username,
            password
        }
    });
    
    const config = {
        expiresIn: process.env.TOKEN_EXPIRES_IN
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: "users" }, process.env.JWT_SECRET, config);

    await prisma.access_tokens.create({
        data: {
            user_id: parseInt(user.id),
            token: await bcrypt.hash(token, 10),
            expires_at: Math.floor((new Date().getTime() + (config.expiresIn * 1000)) / 1000) + "",
        }
    });

    res.status(200).json({
        status: "success",
        token: token
    });
}      

const signin = async (req, res) => {
    const { username, password } = req.body;
    let role = "user"

    let user = await prisma.users.findFirst({
        where: {
            username
        }
    });

    if(!user){
        const admin = await prisma.administrators.findFirst({
            where: {
                username
            }
        });

        if(!admin){
            return res.status(401).json({
                status: "invalid",
                message: "Wrong username or password"
            });
        }

        const isMatch = await bcrypt.compare(password, admin.password);

        if(!isMatch){
            return res.status(401).json({
                status: "invalid",
                message: "Wrong username or password"
            });
        }

        await prisma.administrators.update({
            where: {
                id: admin.id
            },
            data: {
                last_login_at: getCurrentTimestamp()
            }
        });

        role = "administrator";
        user = admin
    }else{
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(401).json({
                status: "invalid",
                message: "Wrong username or password"
            });
        }

        await prisma.users.update({
            where: {
                id: user.id
            },
            data: {
                last_login_at: getCurrentTimestamp()
            }
        });
    }

    const config = {
        expiresIn: process.env.TOKEN_EXPIRES_IN
    }

    const token = jwt.sign({id: user.id, username: user.username, role}, process.env.JWT_SECRET, config);
    
    await prisma.access_tokens.create({
        data: {
            user_id: parseInt(user.id),
            token: await bcrypt.hash(token, 10),
            expires_at: Math.floor((new Date().getTime() + (config.expiresIn * 1000)) / 1000) + "",
        }
    });

    res.status(200).json({
        status: "success",
        role: role,
        token: token
    });
}

const signout = async (req, res) => {
    const user = req.user;

    await prisma.access_tokens.deleteMany({
        where: {
            user_id: parseInt(user.id)
        }
    });

    res.status(200).json({
        status: "success"
    });

}

module.exports = {
    signin,
    signup,
    signout,
}