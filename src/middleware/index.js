require('dotenv').config()

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const prisma = require('../database/prisma');
const { body, validationResult } = require('express-validator');

const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization 
                    ? req.headers.authorization.split(" ")[1] 
                    : null;

    if(!token){
        return res.status(401).json({
            status: "unauthenticated",
            message: "Missing Token"
        });
    }

    const tokens = await prisma.access_tokens.findMany();
    let validToken = null

    for(const data of tokens){
        if(await bcrypt.compare(token, data.token)){
            validToken = token;
            break;
        }
    }

    if(!validToken){
        return res.status(401).json({
            status: "unauthenticated",
            message: "invalid token"
        });
    }

    try{
        const user = jwt.verify(validToken, process.env.JWT_SECRET);
        req.user = user;
        next();
    }catch(error){
        res.status(401).json({
            status: "unauthenticated",
            message: error
        });
    }
}

const checkRole = (role) => {
    return async (req, res, next) => {
        const user = req.user;
        let loggedUserRole = null
    
        if(role === "user"){
            loggedUserRole = await prisma.users.findFirst({
                where: {
                    username: user.username
                }
            });

            if(!loggedUserRole){
                return res.status(403).json({
                    status: "forbidden",
                    message: "You are not the users"
                })
            }
        }else{
            loggedUserRole = await prisma.administrators.findFirst({
                where: {
                    username: user.username
                }
            });

            if(!loggedUserRole){
                return res.status(403).json({
                    status: "forbidden",
                    message: "You are not the administrator"
                })
            }
        }
    
        next();
    }
}

const handleErrors = (req, res, next) => {
    const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({
                status: "invalid",
                message: "Request body is invalid",
                violations: errors.array().map(err => {
                    return {
                        field: err.path,
                        msg: err.msg
                    }
                })
            });
        }
    next();
}


// Closure configuration
const isAdmin = checkRole("administrator");
const isUser = checkRole("user");

module.exports = {
    verifyToken,
    isAdmin,
    isUser,
    handleErrors
}