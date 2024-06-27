const AdminService = require('./admin.service');

const index = async (req, res) => {
    try {
        const admins = await AdminService.index();
        return res.status(200).json(admins);
    } catch (error) {
        return res.status(error.statusCode).json({
            status: error.status,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

module.exports = { index }