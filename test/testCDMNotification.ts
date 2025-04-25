import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Watchlist from '../models/watchlist';
import Account from '../models/account';
import { notifyUsersForMatchingCDM } from '../services/cdmNotifier';

dotenv.config();

(async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.DATABASE_URL as string);
    console.log('✅ Connected to MongoDB');

    // 🔹 Step 1: Fetch a user
    const user = await Account.findOne({});
    if (!user || !user.email) {
      console.error('❌ No user found or user has no email');
      return;
    }

    // 🔹 Step 2: Clean up previous watchlists
    await Watchlist.deleteMany({ user: user._id });

    // 🔹 Step 3: Use a reliable fixed timestamp (TODAY)
    const fixedNow = new Date('2025-04-24T19:30:00.000Z').getTime(); // ✅ replace with current actual time
    const tcaRangeStart = fixedNow - 5000;
    const tcaRangeEnd = fixedNow + 5000;

    console.log('🧠 fixedNow:', fixedNow, new Date(fixedNow).toISOString());

    // 🔹 Step 4: Insert a guaranteed-matching watchlist
    const watchlist = await Watchlist.create({
      user: user._id,
      searchParams: [
        { criteria: 'objectName', value: 'STARLINK' },
        { criteria: 'catalogName', value: 'XYZ-2000' }
      ],
      tcaRange: [tcaRangeStart, tcaRangeEnd],
      missDistanceValue: 500,
      missDistanceOperator: 'lte',
      collisionProbabilityValue: 0.05,
      collisionProbabilityOperator: 'gte',
      operatorOrganization: 'SpaceX'
    });

    console.log('✅ Watchlist created:', watchlist._id);
    console.log('🕒 tcaRange:', new Date(tcaRangeStart).toISOString(), '→', new Date(tcaRangeEnd).toISOString());

    // 🔹 Step 5: Define a matching CDM
    const mockCDM = {
      object1: {
        objectName: 'STARLINK-3050',
        catalogName: 'XYZ-2000',
        operatorOrganization: 'SpaceX'
      },
      object2: {
        objectName: 'COSMOS 2251',
        catalogName: 'INT-201',
        operatorOrganization: 'Russia'
      },
      tca: fixedNow,
      missDistance: 300,
      collisionProbability: 0.06,
      event: 'test-event-id'
    };

    console.log('📨 CDM TCA:', new Date(mockCDM.tca).toISOString());
    console.log('🚀 Running CDM match test...');
    await notifyUsersForMatchingCDM(mockCDM);

    console.log('✅ Test complete. Check logs or inbox.');
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
})();
