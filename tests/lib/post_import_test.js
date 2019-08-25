const {expect} = require('chai');

const base = require('../base');
const importLib = require('../../lib/import');
const SourceModel = require('../../models/item');

describe('importLib method', function () {
    afterEach(base.resetMongoose);

    it('should save incoming changes', async function () {
        const importFixture = {
            1: { sourceID: 43570, name: 'Malevolent Gladiator\'s Spellblade' }
        }

        await importLib(importFixture);
        const savedItems = await SourceModel.find({});
        expect(savedItems[0].sourceID).to.equal(importFixture[1].sourceID)
    });

    it('should update existing items', async function () {
        await SourceModel.create({
            sourceID: 43570,
            name: 'Malevolent Gladiator\'s Spellblade'
        });

        await importLib({
            1: { sourceID: 43570, name: 'Malevolent Gladiator\'s Spellblade', sourceType: 'Boss' }
        });

        const savedItems = await SourceModel.find({});
        expect(savedItems[0].sourceType).to.equal('Boss')
    });

    it('should ignore unchanged items', async function () {
        await SourceModel.create({
            sourceID: 43570,
            name: 'Malevolent Gladiator\'s Spellblade'
        });

        const result = await importLib({
            43570: { sourceID: 43570, name: 'Malevolent Gladiator\'s Spellblade' }
        });

        expect(result).to.deep.equal({
            'new': 0,
            'updates': 0
            })
    });
});
