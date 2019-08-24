const logger = require('./logger');
const ItemModel = require('../models/item');
const assert = require('assert');

module.exports = async function dump (itemDump) {
    const incomingItemList = Object.values(itemDump);
    logger.info(`Received ${incomingItemList.length} items to process`);

    const oldItemList = await ItemModel.find({}).lean();
    logger.info(`${oldItemList.length} existing items`);
    const itemHash = {};
    oldItemList.forEach(item => {
        itemHash[item.sourceID] = item;
    })

    const newItems = [];
    const updates = [];
    incomingItemList.forEach(newItem => {
        if (!itemHash[newItem.sourceID] && newItem.sourceID) {
            let insertDoc = {
                insertOne: {
                    document: newItem
                }
            };

            newItems.push(insertDoc);
        } else {
            let upsertDoc = {
                updateOne: {
                    filter: { sourceID: newItem.sourceID },
                    update: newItem
                }
            };

            updates.push(upsertDoc);
        }
    });

    if (newItems.length > 0) {
        logger.info(`Saving ${newItems.length} new items`);
        await ItemModel.bulkWrite(newItems);
    }

    if (updates.length > 0) {
        logger.info(`Updating ${updates.length} items`)
        await ItemModel.bulkWrite(updates);
    }

    logger.info('Dump processing completed.');
    return {new: newItems.length, updates: updates.length};
}

