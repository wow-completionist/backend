const logger = require('./logger');
const SourceModel = require('../models/source');

module.exports = async function dataImport (sources) {
    const incomingSourceList = Object.values(sources);
    logger.info(`Received ${incomingSourceList.length} sources to process`);

    const oldItemList = await SourceModel.find({}).lean();
    logger.info(`${oldItemList.length} existing sources`);
    const sourceHash = {};
    oldItemList.forEach(item => {
        sourceHash[item.sourceID] = item;
    })

    const newSources = [];
    const updates = [];
    incomingSourceList.forEach(newSource => {
        if (!sourceHash[newSource.sourceID] && newSource.sourceID) {
            let insertDoc = {
                insertOne: {
                    document: newSource
                }
            };

            newSources.push(insertDoc);
        } else {
            let upsertDoc = {
                updateOne: {
                    filter: { sourceID: newSource.sourceID },
                    update: newSource
                }
            };

            updates.push(upsertDoc);
        }
    });

    if (newSources.length > 0) {
        logger.info(`Saving ${newSources.length} new items`);
        await SourceModel.bulkWrite(newSources);
    }

    if (updates.length > 0) {
        logger.info(`Updating ${updates.length} items`)
        await SourceModel.bulkWrite(updates);
    }

    logger.info('Import processing completed.');
    return {new: newSources.length, updates: updates.length};
}

