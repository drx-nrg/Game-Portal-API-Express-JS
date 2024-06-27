const prisma = require('../database/prisma');
const ResponseError = require('../error/ResponseError');

const index = async () => {
    const users = await prisma.users.findMany({
        select: {
            username: true,
            last_login_at: true,
            created_at: true,
            updated_at: true,
        }
    });

    if(!users.length){
        throw new ResponseError("Users not found!", 404, "not-found");
    }

    return users;
}

const store = async (body) => {
    const {username, password} = body;

    const usernameExists = await prisma.users.findMany({
        where:{
            username: username
        }
    });

    if(usernameExists.length){
        throw new ResponseError("Username already exists", 400, "invalid");
    }

    const user = await prisma.users.create({
        data: {
            username: username,
            password: password
        }
    });

    return user;
}

const destroy = async (id) => {
    const user = await prisma.users.findFirst({
        where: {
            id: parseInt(id)
        }
    });

    if(!user){
        throw new ResponseError("User not found", 404, "not-found");
    }

    return await prisma.users.delete({
        where: {
            id: parseInt(id)
        }
    });
}

const update = async (id, body) => {
    const { username, password } = body;

    const user = await prisma.users.findFirst({
        where: {
            id: parseInt(id)
        }
    });

    if(!user){
        throw new ResponseError("User not found", 404, "not-found");
    }

    const usernameExists = await prisma.users.findMany({
        where: {
            username: username
        }
    });

    if(user.username !== username && usernameExists.length){
        throw new ResponseError("Username already exists", 400, "invalid");
    }

    return await prisma.users.update({
        where: {
            id: parseInt(id),
        },
        data: {
            username,
            password
        }
    });
}

const show = async (username) => {
    const user = await prisma.users.findFirst({
        where: {
            username
        },
        select: {
            username: true,
            created_at: true,
            games: true,
            scores: {
                select: {
                    game_version: {
                        select: {
                            game: {
                                select: {
                                    slug: true,
                                    title: true,
                                    description: true
                                }
                            }
                        }
                    },
                    created_at: true,
                    score: true
                }
            }
        }
    });

    if(!user){
        throw new ResponseError("User not found", 404, "not-found");
    }

    const response = {
        username: user.username,
        registeredTimestamp: user.created_at,
        authoredGames: user.games,
        highscores: []
    }

    user.scores.forEach((data) => {
        const payload = {
            game: data.game_version.game,
            score: Math.floor(data.score),
            timestamp: data.created_at
        }
        response.highscores.push(payload);
    });

    return response;
}
module.exports = {
    index,
    show,
    store,
    update,
    destroy
}