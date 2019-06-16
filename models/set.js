const { Schema, model } = require('mongoose');

const SetSchema = new Schema({
    setId: String,
    name: String,
    group: String,
    expansion: String,
    visuals:[Number]
}, {
    timestamps: true
});

const SetModel = model('Set', SetSchema);

module.exports = SetModel;
