const mongoose = require("mongoose");
const AuthModel = require("../models/AuthModel");;
const updatePermissionByCode = async (username, id) => {
    const objectId = id.map(id => new mongoose.Types.ObjectId(id))
    return await AuthModel.updateOne(
        {username: username},
        {$addToSet: {customPermission: { $each : objectId }}},
    )
}

module.exports = {
    updatePermissionByCode
}