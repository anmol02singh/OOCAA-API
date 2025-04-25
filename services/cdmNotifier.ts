import Watchlist from '../models/watchlist';
import Account, { AccountType } from '../models/account';
import { sendEmail } from './mailer';

// 🔹 Interface that reflects your populated watchlist schema
interface WatchlistWithUser {
  user: AccountType;
  searchParams?: Array<{ criteria: string; value: string }>;
  tcaRange?: [number, number];
  missDistanceValue?: number;
  missDistanceOperator?: 'lte' | 'gte' | 'eq';
  collisionProbabilityValue?: number;
  collisionProbabilityOperator?: 'lte' | 'gte' | 'eq';
  operatorOrganization?: string;
}

export const notifyUsersForMatchingCDM = async (cdm: any) => {
  const allWatchlists = await Watchlist.find({}).populate('user') as unknown as WatchlistWithUser[];

  const matchedUsers: string[] = [];

  for (const watch of allWatchlists) {
    const matchedCriteria: string[] = [];

    const {
      user,
      searchParams,
      tcaRange,
      missDistanceOperator,
      missDistanceValue,
      collisionProbabilityOperator,
      collisionProbabilityValue,
      operatorOrganization
    } = watch;

    if (!user?.email) continue;

    const { object1, object2, tca, missDistance, collisionProbability } = cdm;
    const objects = [object1, object2];

    // 1. Match searchParams
    if (Array.isArray(searchParams)) {
      for (const { criteria, value } of searchParams) {
        for (const obj of objects) {
          const objField = obj?.[criteria];
          if (typeof objField === 'string' && objField.toLowerCase().includes(value.toLowerCase())) {
            matchedCriteria.push(`${criteria}: ${value}`);
          }
        }
      }
    }

    // 2. Match TCA range
    const tcaMs = new Date(tca).getTime();
    if (Array.isArray(tcaRange) && tcaRange.length === 2) {
      const [start, end] = tcaRange;
      if (tcaMs >= start && tcaMs <= end) {
        matchedCriteria.push(`TCA between ${new Date(start).toLocaleString()} and ${new Date(end).toLocaleString()}`);
      }
    }

    // 3. Match missDistance
    if (typeof missDistanceValue === 'number' && missDistance !== undefined) {
      const ops = {
        lte: missDistance <= missDistanceValue,
        gte: missDistance >= missDistanceValue,
        eq: missDistance === missDistanceValue
      };
      if (ops[missDistanceOperator!]) {
        matchedCriteria.push(`Miss Distance ${missDistanceOperator} ${missDistanceValue}`);
      }
    }

    // 4. Match collisionProbability
    if (typeof collisionProbabilityValue === 'number' && collisionProbability !== undefined) {
      const ops = {
        lte: collisionProbability <= collisionProbabilityValue,
        gte: collisionProbability >= collisionProbabilityValue,
        eq: collisionProbability === collisionProbabilityValue
      };
      if (ops[collisionProbabilityOperator!]) {
        matchedCriteria.push(`Collision Probability ${collisionProbabilityOperator} ${collisionProbabilityValue}`);
      }
    }

    // 5. Match operatorOrganization
    if (operatorOrganization) {
      for (const obj of objects) {
        if (obj?.operatorOrganization?.toLowerCase().includes(operatorOrganization.toLowerCase())) {
          matchedCriteria.push(`operatorOrganization: ${operatorOrganization}`);
        }
      }
    }

    // 🎯 Send email if there’s at least one match
    if (matchedCriteria.length > 0) {
        const subject = `OOCAA Alert: CDM matched your Watchlist filters`;

        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px; padding: 24px; background-color: #f9f9f9;">
            <h2 style="color: #0057a8;">Hi ${user.name || user.username},</h2>
        
            <p style="font-size: 16px; color: #333;">
              A new conjunction data message (CDM) has been added that <strong>matches one or more of your saved watchlist filters</strong>.
            </p>
        
            <h3 style="color: #0057a8; margin-top: 30px;">MATCHED CRITERIA:</h3>
            <ul style="font-size: 16px; padding-left: 20px; color: #444;">
              ${matchedCriteria.map(c => `<li>${c}</li>`).join('')}
            </ul>
        
            <h3 style="color: #0057a8; margin-top: 30px;">CDM DETAILS:</h3>
            <ul style="font-size: 16px; padding-left: 20px; color: #444;">
            <li><strong>Time of Closest Approach:</strong> <span style="color: #6870fa;"> ${new Date(tca).toLocaleString()}</li>
            <li><strong>Miss Distance:</strong> <span style="color: #6870fa;"> ${missDistance} meters</li>
            <li><strong>Collision Probability:</strong> <span style="color: #6870fa;">${collisionProbability}</span></li>
            <li><strong>Object 1:</strong> <span style="color: #6870fa;">${object1?.objectName}</span></li>
            <li><strong>Object 2:</strong> <span style="color: #6870fa;">${object2?.objectName}</span></li>
            </ul>
        
            <div style="margin-top: 30px;">
              <a href="http://localhost:3001/dashboard" style="background-color: #0057a8; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">
                 View in Dashboard
              </a>
            </div>
        
            <p style="margin-top: 40px; font-size: 14px; color: #888;">
              — The OOCAA Team<br />
              Keeping space safe, one alert at a time.
            </p>
          </div>
        `;
        await sendEmail(user.email, subject, html);
        matchedUsers.push(user.email);
    }
  }

  console.log(`✅ CDM alerts sent to: ${matchedUsers.join(', ')}`);
};
