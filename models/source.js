const { Schema, model } = require('mongoose');

const SourceSchema = new Schema({
    invType: Number,
    visualID: Number,
    sourceID: Number,
    isHideVisual: Boolean,
    itemID: Number,
    itemModID: Number,
    categoryID: Number,
    name: String,
    quality: Number,
    useError: String,
    sourceType: Number,
}, {
    timestamps: true
});

const SourceModel = model('Source', SourceSchema);

module.exports = SourceModel;
