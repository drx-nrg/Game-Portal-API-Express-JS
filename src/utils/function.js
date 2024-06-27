const prisma = require('../database/prisma')


const isUnique = async (value, table, column) => {
    const datas = await prisma[table].findMany({
        where: {
            [column]: value
        }
    });

    if(!datas.length){
        return true;
    }

    return false;
}

const generateSlug = (string) => {
    if(string.split(" ").length === 1){
        return string.toLowerCase();
    }

    return string.toLowerCase().split(" ").join("-");
}

const apiFormatter = () => {

}

module.exports = { isUnique, apiFormatter, generateSlug }