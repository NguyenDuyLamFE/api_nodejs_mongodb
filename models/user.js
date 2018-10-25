const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config.json');
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    username: { type: String, unique: true, required: true },
    hash: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    createdDate: { type: Date, default: Date.now }
});

userSchema.set('toJSON', { virtuals: true });

const User = module.exports = mongoose.model('User', userSchema);

module.exports.authenticate = async function({ username, password }) {
    console.log(username + password);
    const user = await User.findOne({ username });
    if (user && bcrypt.compareSync(password, user.hash)) {
        const { hash, ...userWithoutHash } = user.toObject();
        const token = jwt.sign({ sub: user.id }, 'lamsecretkey', { expiresIn: '30s'});
        return {
            ...userWithoutHash,
            token
        };
    }
}

module.exports.create = async function(userParam) {
    // validate
    if (await User.findOne({ username: userParam.username })) {
        throw 'Username "' + userParam.username + '" is already taken';
    }

    const user = new User(userParam);

    // hash password
    if (userParam.password) {
        user.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // save user
    await user.save();
}

module.exports.removeUser = async function(id) {
    await User.findByIdAndRemove(id);
}
