const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs')

const UserSchema = new Schema({
    id: {
        type: String, // from battle.net
        required: true
    },
    battletag: String, // from battle.net
    characterData: [ Schema.Types.Mixed ], // from battle.net
    collected: [ Number ],
    role: String,
    token: String
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
