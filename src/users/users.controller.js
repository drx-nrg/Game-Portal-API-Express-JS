const prisma = require('../database/prisma');
const UserService = require('./users.service');

async function index(req, res){
    try{
        const users = await UserService.index();
        res.status(200).json({
            totalElements: users.length,
            content: users
        });
    }catch(error){
        res.status(error.statusCode ? error.statusCode : 500).json({
            status: error.status,
            message: error.message
        });
    }
}

async function show(req, res){
    try {
        const user = await UserService.show(req.params.username);
        res.status(200).json(user)
    } catch (error) {
        res.status(error.statusCode ? error.statusCode : 500).json({
            status: error.status === 404 ? "not-found" : "invalid",
            message: error.message
        });
    }
}

async function store(req, res){
    try{
        const user = await UserService.store(req.body);
        res.status(201).json({
            status: "success",
            username: user.username
        })
    }catch(error){
        res.status(error.statusCode ? error.statusCode : 500).json({
            status: error.status === 404 ? "not-found" : "invalid",
            message: error.message
        });
    }
}

async function update(req, res){
    try{
        const user = await UserService.update(req.params.id, req.body);
        res.status(200).json({
            status: "success",
            username: user.username
        });
    }catch(error){
        res.status(error.statusCode ? error.statusCode : 500).json({
            status: error.status === 404 ? "not-found" : "invalid",
            message: error.message
        });
    }
}

async function destroy(req, res){
    try{
        await UserService.destroy(req.params.id);
        res.status(204);
    }catch(error){
        res.status(error.status ? error.status : 500).json({
            status: error.status,
            message: error.message
        });
    }
}

module.exports = { index, show, store, update, destroy } 