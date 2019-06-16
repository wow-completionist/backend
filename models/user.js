const { Schema, Model, model } = require('mongoose');
const bcrypt = require('bcryptjs')

const UserSchema = new Schema({
    userId: {
        type: String, //uuid
        required: true
    },
    userName: {
        type: String,
        required: true,
        unique: true
    },
    passwordHash: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    collected: [Number]
}, {
    timestamps: true
})

UserSchema.virtual('password').set(function(password) {
    if (!password) throw new Error('password is a required field')
    this.passwordHash = bcrypt.hashSync(password, 12);
});

UserSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.passwordHash);
};

const UserModel = model('User', UserSchema);

module.exports = UserModel;
