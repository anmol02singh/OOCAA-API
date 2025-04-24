import Account from '../models/account';
import Subscription from '../models/watchlist'; // or Watchlist
import { sendEmail } from './mailer';

export const notifyUsersForCDM = async (cdm: any) => {
  const subscriptions = await Subscription.find({});
  const usersMap = new Map<string, Set<string>>();

  // Check against both objects involved in the CDM
  const cdmObjects = [cdm.object1, cdm.object2];

  for (const sub of subscriptions) {
    for (const obj of cdmObjects) {
      const fieldValue = obj[sub.criteria];
      if (fieldValue && fieldValue.toLowerCase().includes(sub.value.toLowerCase())) {
        const userId = sub.userId.toString();
        if (!usersMap.has(userId)) {
          usersMap.set(userId, new Set());
        }
        usersMap.get(userId)?.add(`${sub.criteria}: ${sub.value}`);
      }
    }
  }

  for (const [userId, criteriaMatched] of usersMap.entries()) {
    const user = await Account.findById(userId);
    if (!user?.email) continue;

    const subject = `🛰️ OOCAA Alert: New Event Matches Your Watchlist`;
    const html = `
      <p>Hi ${user.username || 'there'},</p>
      <p>A new conjunction data message (CDM) was added that matches your watchlist filters:</p>
      <ul>
        ${Array.from(criteriaMatched).map(c => `<li>${c}</li>`).join('')}
      </ul>
      <p>Event Time: ${new Date(cdm.tca).toLocaleString()}</p>
      <p>Visit your dashboard for more details.</p>
      <p>— OOCAA Team</p>
    `;

    await sendEmail(user.email, subject, html);
  }
};
