import { addWatchlistEntry, getWatchlistByUser, repoDeleteEvent } from "../repositories/watchlistRepository";

async function addToWatchlist (userId: string, eventId: string) {
    try {
        return await addWatchlistEntry(userId, eventId);
    } catch (error) {
        console.error('Error in service (addToWatchlist):', error);
        throw error;
    }
};

async function getwatchlist (userId: string) {
    try {
        return await getWatchlistByUser(userId);
    } catch (error) {
        console.error('Error in service (getWatchlist):', error);
        throw error;
    }
};

async function serviceDeleteEvent (eventId: string) {  
    try {
        return await repoDeleteEvent(eventId);
    } catch (error) {
        console.error('Error in service (deleteEvent):', error);
        throw error;
    }
};

export {
    addToWatchlist,
    getwatchlist,
    serviceDeleteEvent,
}