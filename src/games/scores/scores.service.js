const prisma = require('../../database/prisma');
const ResponseError = require('../../error/ResponseError');

const index = async (req) => {
    const { slug } = req.params;
    const game = await prisma.games.findFirst({
        where: {
            slug
        },
        select: {
            game_versions: {
                select: {
                    scores: {
                        select: {
                            user: {
                                select: {
                                    username: true
                                }
                            },
                            score: true,
                            created_at: true,
                        }
                    }
                }
            }
        }
    });

    const scores = [];

    game.game_versions.forEach((version) => {
        version.scores.forEach((data) => {
            const payload = {
                username: data.user.username,
                score: data.score,
                timestamp: data.created_at
            }
            scores.push(payload);
        });
    });

    return { scores };
}

const store = async (req) => {
    const { id } = req.user;
    const { score } = req.body
    const game = await prisma.games.findFirst({
        where: {
            slug: req.params.slug
        },
        select: {
            id: true,
            game_versions: true
        }
    });

    if(!game){
        throw new ResponseError("Game not found", 404, "not-found");
    }

    const gameVersion = await prisma.game_versions.findMany({ where: { game_id: game.id } })

    const data = {
        user_id: id,
        game_version_id: gameVersion[gameVersion.length - 1].id,
        score: score
    }

    await prisma.scores.create({ data });

    return {
        status: "success"
    }
}

module.exports = {
    index,
    store
}