const { Schema, model } = require('mongoose');

const ItemSchema = new Schema({
    invType: String,
    visualID: Number,
    isCollected: Boolean,
    sourceID: Number,
    itemID: Number,
    itemModID: String,
    categoryID: String,
    quality: String,
    isHideVisual: Boolean,
    name: String,
    isPrimary: Boolean,
    useError: String,
    sourceType: String
}, {
    timestamps: true
});

const ItemModel = model('Item', ItemSchema);

module.exports = ItemModel;
