const { Schema, model } = require('mongoose');

const ItemSchema = new Schema({
    invType: String,
    visualID: Number,
    sourceID: Number,
    isHideVisual: Boolean,
    itemID: Number,
    itemModID: String,
    categoryID: String,
    name: String,
    quality: String,
    useError: String,
    sourceType: String,
    isPrimary: Boolean,

}, {
    timestamps: true
});

const ItemModel = model('Item', ItemSchema);

module.exports = ItemModel;
