const { Schema, model } = require('mongoose');

const ItemSchema = new Schema({
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

const ItemModel = model('Item', ItemSchema);

module.exports = ItemModel;
