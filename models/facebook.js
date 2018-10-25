const mongoose = require('mongoose');

const facebookSchema = new mongoose.Schema({
    id: String,
    name: String,
    email: String
})

const facebook = mongoose.model('facebook', facebookSchema, 'facebook');
module.exports = facebook