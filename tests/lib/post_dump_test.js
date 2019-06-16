const {expect} = require('chai');

const base = require('../base');
const dumpLib = require('../../lib/dump');
const ItemModel = require('../../models/item');

describe('libDump method', function () {
    afterEach(base.resetMongoose);

    it('should save incoming changes', async function () {
        const dumpFixture = {
            1: { sourceID: 43570, name: 'Malevolent Gladiator\'s Spellblade' }
        }

        await dumpLib(dumpFixture);
        const savedItems = await ItemModel.find({});
        expect(savedItems[0].sourceID).to.equal(dumpFixture[1].sourceID)
    });

    it('should update existing items', async function () {
        await ItemModel.create({
            sourceID: 43570,
            name: 'Malevolent Gladiator\'s Spellblade'
        });

        await dumpLib({
            1: { sourceID: 43570, name: 'Malevolent Gladiator\'s Spellblade', sourceType: 'Boss' }
        });

        const savedItems = await ItemModel.find({});
        expect(savedItems[0].sourceType).to.equal('Boss')
    });

    it('should ignore unchanged items', async function () {
        await ItemModel.create({
            sourceID: 43570,
            name: 'Malevolent Gladiator\'s Spellblade'
        });

        const result = await dumpLib({
            43570: { sourceID: 43570, name: 'Malevolent Gladiator\'s Spellblade' }
        });

        expect(result).to.deep.equal({
            'new': 0,
            'updates': 0
            })
    });
});
