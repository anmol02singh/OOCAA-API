import { addWatchlistEntry, getWatchlistByUser, repoDeleteFilters, findDuplicateWatchlistEntry } from "../repositories/watchlistRepository";

interface WatchlistEntry {
    user: string;
    searchParams: any[];
    tcaRange: [number, number];
    missDistanceValue?: number;
    missDistanceOperator?: 'lte' | 'gte' | 'eq';
    collisionProbabilityValue?: number;
    collisionProbabilityOperator?: 'lte' | 'gte' | 'eq';
    operatorOrganization?: string;
}

async function addToWatchlist (data: WatchlistEntry) {
    try {
        const existingEntry = await findDuplicateWatchlistEntry(data);
        if (existingEntry) {
            throw new Error('Duplicate subscription: User has already subscribed to these exact criteria'); 
        }
        return await addWatchlistEntry(data);
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

async function serviceDeleteFilters (filterId: string) {  
    try {
        return await repoDeleteFilters(filterId);
    } catch (error) {
        console.error('Error in service (deleteEvent):', error);
        throw error;
    }
};

export {
    addToWatchlist,
    getwatchlist,
    serviceDeleteFilters,
}