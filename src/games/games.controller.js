const GameService = require('./games.service');

const index = async (req, res) => {
    try{
        const games = await GameService.index(req);
        res.status(200).json(games);
    }catch(error){
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message
        });
    }
}

const show = async (req, res) => {
    try {
        const game = await GameService.show(req.params.slug);
        res.status(200).json(game);
    } catch (error) {   
        res.status(error.statusCode ? error.statusCode : 500).json({
            status: error.status,
            message: error.message
        });
    }
}

const store = async (req, res) => {
    try {
        const game = await GameService.store(req.body, req.user);
        res.status(201).json({
            status: "success",
            slug: game.slug
        });
    } catch (error) {
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message,
        });
    }
}

const update = async (req, res) => {
    try {
        const game = await GameService.update(req.body, req.params.slug, req.user);
        res.status(200).json({
            status: "success"
        });
    } catch (error) {
        res.status(error.statusCode).json({
            status: error.status,
            error: error.message
        });
    }
}

const destroy = async (req, res) => {
    try {
        const game = await GameService.destroy(req.params.slug, req.user);
        res.status(204);
    } catch (error) {   
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message
        });
    }
}

const upload = async (req, res) => {
    await GameService.upload(req, res);
}


module.exports = {
    index,
    show,
    store,
    update,
    destroy,
    upload
}