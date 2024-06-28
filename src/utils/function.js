const prisma = require('../database/prisma');
const multer = require('multer');


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

const getCurrentTimestamp = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const date = String(now.getDate()).padStart(2, "0");

    const hour = String(now.getHours()).padStart(2, "0");
    const minute = String(now.getMinutes()).padStart(2, "0");
    const second = String(now.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${date}T${hour}:${minute}:${second}Z`;
}

module.exports = { isUnique, generateSlug, getCurrentTimestamp }