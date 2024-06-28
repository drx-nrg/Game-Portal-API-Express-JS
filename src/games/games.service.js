const prisma = require('../database/prisma');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ResponseError = require('../error/ResponseError');
const { generateSlug } = require('../utils/function');

const index = async (req) => {
    // Initialization paginate data requirement
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 10;
    let sortDir = req.query.sortDir || "asc";
    let sortBy = req.query.sortBy || "title";

    // Change the sortBy value match to game attribute
    if(sortBy){
        if(sortBy === "popular"){
            sortBy = "scoreCount"
        }else if(sortBy === "uploaddate"){
            sortBy = "uploadTimestamp";
        }else{
            sortBy = "title";
        }
    }else{
        sortBy ="title";
    }

    // Get all the game from database
    let games = await prisma.games.findMany({
        select: {
            id: false,
            title: true,
            slug: true,
            description: true,
            created_at: true,
            users: {
                select: {
                    id: false,
                    username: true
                }
            },
            game_versions: {
                select: {
                    scores: {
                        select: {
                            id: false,
                            score: true
                        }
                    }
                }
            }
        }
    });

    // Count page total
    const totalPage = Math.ceil(games.length / size);

    if(page > totalPage){
        page = 0;
    }

    if(size > games.length){
        size = games.length;
    }

    // Add and modify required attributes (scoreCount, author, uploadTimestamp)
    games = games.map((game) => {
        let scores = 0;

        game.game_versions.map((version, index) => {
            version.scores.map((s, i) => {
                scores += s.score
            })
        });

        return {
            slug: game.slug,
            title: game.title,
            description: game.description,
            uploadTimestamp: game.created_at,
            author: game.users.username,
            scoreCount: scores,
        }
    });

    // Sort the game list based on Sort Direction on query params
    if(sortDir === "asc"){
        games.sort((a,b) => a[sortBy] - b[sortBy]);
    }else if(sortDir === "desc"){
        games.sort((a,b) => b[sortBy] - a[sortBy]);
    }

    // Pagination logic, take only requested page and size 
    const content = games.slice(page * size, (page * size) + size);

    return {
        page,
        size,
        totalElements: games.length,
        content: content
    };
}

const show = async (slug) => {
    console.log(slug)
    let game = await prisma.games.findFirst({
        where: {
            slug: slug
        },
        select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            created_at: true,
            users: true,
            game_versions: {
                include: {
                    scores: true
                }
            }
        }
    });

    if(!game){
        throw new ResponseError("Game not found", 404, "not-found");
    }

    const data = {
        slug: game.slug,
        title: game.title,
        description: game.description,
        thumbnail: `/games/${game.slug}/${game.game_versions[game.game_versions.length - 1].version}/thumbnail.png`,
        uploadTimestamp: game.created_at,
        author: game.users.username,
        scoreCount: 0,
        gamePath: `/games/${game.slug}/${game.id}`
    }

    game.game_versions.forEach((v) => {
        v.scores.forEach((s) => {
            data.scoreCount += s.score
        });
    });

    return data;
}

const store = async (body, user) => {
    const { title, description } = body;
    
    const titleExists = await prisma.games.findMany({
        where: {
            title: title
        }
    });

    if(titleExists.length){
        throw new ResponseError("Game title already exists", 400, "invalid");
    }

    const slug = generateSlug(title);

    return await prisma.games.create({
        data: {
            title,
            description,
            slug,
            created_by: user.id
        }
    });
}

const update = async (body, slug, user) => {
    const { title, description } = body;

    const game = await prisma.games.findFirst({
        where: {
            slug: slug
        }
    });

    if(!game){
        throw new ResponseError("Game not found", 404);
    }

    if(game.created_by !== user.id){
        throw new ResponseError("you are not the game author", 403);
    }

    return await prisma.games.update({
        where: {
            slug: slug
        },
        data: {
            title,
            description
        }
    });
}

const destroy = async (slug, user) => {
    const game = await prisma.games.findFirst({
        where: {
            slug
        }
    });

    if(!game){
        throw new ResponseError("Game not found", 404, "not-found");
    }

    if(user.id !== game.created_by){
        throw new ResponseError("You are not the game author", 403, "forbidden");
    }

    return await prisma.games.delete({
        where: {
            slug
        }
    });
}

const upload = async (req, res) => {
    const { slug } = req.params;
    const user = req.user;

    try {
        const game = await prisma.games.findFirst({
            where: {
                slug
            },
            include: {
                game_versions: {
                    orderBy: {
                        version: "desc"
                    }
                }
            }
        });

        if (!game) {
            return res.status(404).json({ error: "Game not found" });
        }

        if(game.created_by !== user.id){
            return res.status(403).json({
                status: "forbidden",
                message: "You are not the game author"
            });
        }

        const latestVer = game.game_versions[0].version;
        const filePath = path.join(__dirname, `../../public/games/${game.slug}/${parseInt(latestVer.split("")[1]) + 1}`);

        if(!fs.existsSync(filePath)){
            fs.mkdirSync(filePath, { recursive: true });
        }

        const storage = multer.diskStorage({
            destination: function(req, file, cb) {
                cb(null, filePath);
            },
            filename: function(req, file, cb) {
                cb(null, file.originalname);
            }
        });

        const uploadFile = multer({ storage: storage }).fields([
            { name: 'zipfile', maxCount: 1 },
            { name: 'thumbnail', maxCount: 1 },
        ]);

        uploadFile(req, res, async (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            const newVersionData = {
                game_id: game.id,
                version: `v${parseInt(latestVer.split("")[1]) + 1}`,
                storage_path: `games/${game.id}/v${parseInt(latestVer.split("")[1]) + 1}`
            }

            await prisma.game_versions.create({
                data: { ...newVersionData }
            })

            res.status(200).json({ status: "success" });
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = {
    index,
    show,
    store,
    update,
    destroy,
    upload
}