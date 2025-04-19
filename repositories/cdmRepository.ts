import mongoose, { Types } from 'mongoose';
import CDM from '../models/cdm';
import Event from '../models/event';
import Counter from '../models/counter';
import { ObjectTypeCounts } from '../config/types';

const tca_range = 5 * 60 * 1000; //5mins

async function getAllCDMData() {
    return await CDM.find();
};

async function getCDMDataById(id: Types.ObjectId) {
    return await CDM.findById(id);
};

async function getCDMsForEvent(eventId: string) {
    try {
        return await CDM.find({ event: new mongoose.Types.ObjectId(eventId) });
    } catch (error) {
      console.error('Error in repository (getCDMsForEvent):', error);
      throw error;
    }
};

async function saveCDMData(data: any | any[]) {
  if (Array.isArray(data)) {
    try {
      return await CDM.insertMany(data, { ordered: false });
    } catch (err: any) {
      if (err.code === 11000) {
        console.warn('Some CDMs were already in the DB and skipped');
        return err.insertedDocs || [];
      }
      throw err;
    }
  } else {
    return await CDM.findOneAndUpdate(
      { messageId: data.messageId },
      { $setOnInsert: data },
      { upsert: true, new: true }
    );
  }
}

async function getOrCreateEvent(cdmData: any) {
    const primaryDesignator = cdmData.object1.objectDesignator;
    const primaryName = cdmData.object1.objectName;
    const primaryType = cdmData.object1.objectType;
    const primaryOperator = cdmData.object1.operatorOrganization;

    const secondaryDesignator = cdmData.object2.objectDesignator;
    const secondaryName = cdmData.object2.objectName;
    const secondaryType = cdmData.object2.objectType;
    const secondaryoperator = cdmData.object2.operatorOrganization;
    
    const tca = cdmData.tca;

    const startTCA = new Date(tca.getTime() - tca_range);
    const endTCA = new Date(tca.getTime() + tca_range);

    let event = await Event.findOne({
        primaryObjectDesignator: primaryDesignator,
        secondaryObjectDesignator: secondaryDesignator,
        tca: { $gte: startTCA, $lte: endTCA }
    });

    if (!event) {
      const counter = await Counter.findOneAndUpdate(
        { _id: 'eventSequence' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      
      const eventName = `Event_${counter.sequence_value}`;

        event = new Event({
            eventName,
            primaryObjectDesignator: primaryDesignator,
            secondaryObjectDesignator: secondaryDesignator,
            primaryObjectName: primaryName,
            secondaryObjectName: secondaryName,
            primaryObjectType: primaryType,
            secondaryObjectType: secondaryType,
            tca: tca,
            missDistances: [cdmData.missDistance],
            collisionProbabilities: [cdmData.collisionProbability],
            primaryOperatorOrganization: primaryOperator,
            secondaryOperatorOrganization: secondaryoperator,
        });
        await event.save();
    } else {
        event.missDistances.push(cdmData.missDistance);
        event.collisionProbabilities.push(cdmData.collisionProbability);
        await event.save();
    }
    return event;
};

async function getCDMCounts(): Promise<ObjectTypeCounts> {
  const result = await CDM.aggregate([
    {
      $project: {
        objects: [
          { type: '$object1.objectType', designator: '$object1.objectDesignator' },
          { type: '$object2.objectType', designator: '$object2.objectDesignator' }
        ]
      }
    },
    { $unwind: '$objects' },
    {
      $group: {
        _id: { type: '$objects.type', designator: '$objects.designator' }
      }
    },
    {
      $group: {
        _id: '$_id.type',
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: null,
        types: { $push: { objectType: '$_id', count: '$count' } },
        total: { $sum: '$count' }
      }
    },
    {
      $project: {
        _id: 0,
        counts: {
          $arrayToObject: {
            $map: {
              input: '$types',
              as: 't',
              in: ['$$t.objectType', '$$t.count']
            }
          }
        },
        total: 1
      }
    },
    {
      $project: {
        payload:    { $ifNull: ['$counts.PAYLOAD',      0] },
        debris:     { $ifNull: ['$counts.DEBRIS',       0] },
        rocketBody: { $ifNull: ['$counts.ROCKET BODY',  0] },
        unknown:    { $ifNull: ['$counts.UNKNOWN',      0] },
        other:      { $ifNull: ['$counts.OTHER',        0] },
        total:      1
      }
    }
  ]).exec();

  if (!result || result.length === 0) {
    return {
      payload: 0,
      debris: 0,
      rocketBody: 0,
      unknown: 0,
      other: 0,
      total: 0
    };
  }

  return result[0] as ObjectTypeCounts;
}

export {
    getAllCDMData,
    getCDMDataById,
    saveCDMData,
    getOrCreateEvent,
    getCDMsForEvent,
    getCDMCounts,
};