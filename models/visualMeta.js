const { Schema, model } = require('mongoose');

const VisualMetaSchema = new Schema({
    visualID: Number,
    categoryID: String,
    isHideVisual: Boolean,
    name: String,
}, {
    timestamps: true
});

const VisualMetaModel = model('VisualMeta', VisualMetaSchema);

module.exports = VisualMetaModel;
