const logger = require('./logger');
const ItemModel = require('../models/item');
const assert = require('assert');

module.exports = async function dump (itemDump) {
    const incomingItemList = Object.values(itemDump);
    logger.info(`Received ${incomingItemList.length} items to process`);

    const oldItemList = await ItemModel.find({}).lean();
    const itemHash = {};
    oldItemList.forEach(item => {
        itemHash[item.sourceID] = item;
    })

    logger.info('Detecting changes')
    const newItems = [];
    const updates = [];
    incomingItemList.forEach(newItem => {
        if (!itemHash[newItem.sourceID]) {
            newItems.push(newItem);
        } else {
            let _key;
            let _newProp;
            let _oldProp;

            try {
                const existingItem = itemHash[newItem.sourceID];
                Object.keys(newItem).forEach(key => {
                    if (['invType','visualID','isCollected','sourceID','itemID','itemModID',
                        'categoryID','quality','isHideVisual','name','useError','sourceType',
                        'isPrimary'].includes(key)) {
                        _key = key;
                        _newProp = newItem[key];
                        _oldProp = existingItem[key];
                        assert(`${newItem[key]}` === `${existingItem[key]}`)
                    }
                })
            } catch(err) {
                updates.push(newItem);
            }
        }
    });

    if (newItems.length > 0) {
        logger.info(`Saving ${newItems.length} new items`);
        await ItemModel.create(newItems);
    }

    if (updates.length > 0) {
        logger.info(`Saving ${updates.length} changes`)
        const updatePromises = updates.map(item => {
            return ItemModel.findOneAndUpdate({sourceID: item.sourceID}, item, {upsert:true})
        })
        await Promise.all(updatePromises);
    }

    logger.info('Dump processing completed.');
    return {new: newItems.length, updates: updates.length};
}

