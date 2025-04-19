import mongoose, { Types } from 'mongoose';
import CDM from '../models/cdm';
import Event from '../models/event';
<<<<<<< HEAD
=======
import Counter from '../models/counter';
>>>>>>> main

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
<<<<<<< HEAD
=======
    const primaryOperator = cdmData.object1.operatorOrganization;
>>>>>>> main

    const secondaryDesignator = cdmData.object2.objectDesignator;
    const secondaryName = cdmData.object2.objectName;
    const secondaryType = cdmData.object2.objectType;
<<<<<<< HEAD
=======
    const secondaryoperator = cdmData.object2.operatorOrganization;
>>>>>>> main
    
    const tca = cdmData.tca;

    const startTCA = new Date(tca.getTime() - tca_range);
    const endTCA = new Date(tca.getTime() + tca_range);

    let event = await Event.findOne({
        primaryObjectDesignator: primaryDesignator,
        secondaryObjectDesignator: secondaryDesignator,
        tca: { $gte: startTCA, $lte: endTCA }
    });

    if (!event) {
<<<<<<< HEAD
        const count = await Event.countDocuments({});
        const eventName = `event_${count + 1}`;
=======
      const counter = await Counter.findOneAndUpdate(
        { _id: 'eventSequence' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      
      const eventName = `Event_${counter.sequence_value}`;
>>>>>>> main

        event = new Event({
            eventName,
            primaryObjectDesignator: primaryDesignator,
            secondaryObjectDesignator: secondaryDesignator,
            primaryObjectName: primaryName,
            secondaryObjectName: secondaryName,
            primaryObjectType: primaryType,
            secondaryObjectType: secondaryType,
            tca: tca,
<<<<<<< HEAD
        });
    await event.save();
  }
  return event;
}
=======
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
>>>>>>> main

export {
    getAllCDMData,
    getCDMDataById,
    saveCDMData,
    getOrCreateEvent,
<<<<<<< HEAD
    getCDMsForEvent
=======
    getCDMsForEvent,
>>>>>>> main
};
