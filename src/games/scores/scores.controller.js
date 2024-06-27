const ScoreService = require('./scores.service');

const index = async (req, res) => {
    try {
        const scores = await ScoreService.index(req);
        res.status(200).json(scores);
    } catch (error) {
        res.status(error.status).json({
            status: false,
            message: "Internal Server Error",
            error: `${error}`
        });
    }
}

const store = async (req, res) => {
    try {
        const response = await ScoreService.store(req);
        res.status(200).json(response);
    } catch (error) {
        res.status(error.status).json({
            status: false,
            message: "Internal Server Error",
            error: `${error.message}`
        });
    }
}

module.exports = { index, store }