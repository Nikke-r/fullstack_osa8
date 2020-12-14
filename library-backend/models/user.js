const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        minlength: 3,
        required: true
    },
    favoriteGenre: {
        type: String,
        required: true,
        minlength: 5
    }
}) 

module.exports = mongoose.model('User', schema)