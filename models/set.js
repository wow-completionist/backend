const { Schema, model } = require('mongoose');

const SetSchema = new Schema({
    setId: String,
    name: String,
    group: String,
    expansion: String,
    '1': Number,
    '2': Number,
    '3': Number,
    '4': Number,
    '7': Number,
    '8': Number,
    '9': Number,
    '10': Number,
    '11': Number
}, {
    timestamps: true
});

const SetModel = model('Set', SetSchema);

module.exports = SetModel;
