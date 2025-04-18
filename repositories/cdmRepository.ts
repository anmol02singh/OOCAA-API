import mongoose, { Types } from 'mongoose';
import CDM from '../models/cdm';
import Event from '../models/event';
import Counter from '../models/counter';

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
      return await CDM.insertMany(data);
    } else {
      const cdmData = new CDM(data);
      return await cdmData.save();
    }
  };

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

export {
    getAllCDMData,
    getCDMDataById,
    saveCDMData,
    getOrCreateEvent,
    getCDMsForEvent,
};
