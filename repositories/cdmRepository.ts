import { Types } from 'mongoose';
import CDM from '../models/cdm';
import Event from '../models/event';

const tca_range = 5 * 60 * 1000; //5mins

async function getAllCDMData() {
    return await CDM.find();
};

async function getCDMDataById(id: Types.ObjectId) {
    return await CDM.findById(id);
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

    const secondaryDesignator = cdmData.object2.objectDesignator;
    const secondaryName = cdmData.object2.objectName;
    const secondaryType = cdmData.object2.objectType;
    
    const tca = cdmData.tca;

    const startTCA = new Date(tca.getTime() - tca_range);
    const endTCA = new Date(tca.getTime() + tca_range);

    let event = await Event.findOne({
        primaryObjectDesignator: primaryDesignator,
        secondaryObjectDesignator: secondaryDesignator,
        tca: { $gte: startTCA, $lte: endTCA }
    });

    if (!event) {
        const count = await Event.countDocuments({});
        const eventName = `event_${count + 1}`;

        event = new Event({
            eventName,
            primaryObjectDesignator: primaryDesignator,
            secondaryObjectDesignator: secondaryDesignator,
            primaryObjectName: primaryName,
            secondaryObjectName: secondaryName,
            primaryObjectType: primaryType,
            secondaryObjectType: secondaryType,
            tca: tca,
        });
    await event.save();
  }
  return event;
}

export {
    getAllCDMData,
    getCDMDataById,
    saveCDMData,
    getOrCreateEvent
};
