const AdminService = require('./admin.service');

const index = async (req, res) => {
    try {
        const admins = await AdminService.index();
        return res.status(200).json(admins);
    } catch (error) {
        return res.status(error.statusCode ? error.statusCode : 500).json({
            status: error.status,
            message: error.message
        });
    }
}

module.exports = { index }