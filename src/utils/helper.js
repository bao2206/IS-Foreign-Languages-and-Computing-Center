const { Types } = require("mongoose");

const coverIdToObjectId = id => new Types.ObjectId(id);


module.exports = {
    coverIdToObjectId
}