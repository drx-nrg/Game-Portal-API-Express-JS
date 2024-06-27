const prisma = require('../database/prisma');
const ResponseError = require('../error/ResponseError');

const index = async () => {
    const administrators = await prisma.administrators.findMany({
        select: {
            username: true,
            last_login_at: true,
            created_at: true,
            updated_at: true,
        }
    });

    if(!administrators.length){
        throw new ResponseError("Admin not found", 404, "not-found");
    }

    return {
        totalElement: administrators.length,
        content: administrators
    }
}

module.exports = {
    index
}