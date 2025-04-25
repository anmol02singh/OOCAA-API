import watchlist from "../models/watchlist";

interface WatchlistEntry {
    user: string;
    searchParams?: any[];
    tcaRange?: [number, number];
    missDistanceValue?: number;
    missDistanceOperator?: 'lte' | 'gte' | 'eq';
    collisionProbabilityValue?: number;
    collisionProbabilityOperator?: 'lte' | 'gte' | 'eq';
    operatorOrganization?: string;
}

export const findDuplicateWatchlistEntry = async (criteria: WatchlistEntry) => {
    try {
        return await watchlist.findOne({
            user: criteria.user,
            searchParams: criteria.searchParams,
            tcaRange: criteria.tcaRange,
            missDistanceValue: criteria.missDistanceValue,
            missDistanceOperator: criteria.missDistanceOperator,
            collisionProbabilityValue: criteria.collisionProbabilityValue,
            collisionProbabilityOperator: criteria.collisionProbabilityOperator,
            operatorOrganization: criteria.operatorOrganization
        });
    } catch (error) {
        console.error('Error in repository (findDuplicateWatchlistEntry):', error);
        throw error;
    }
};

export const addWatchlistEntry = async (data: WatchlistEntry) => {
    try {
        const newEntry = new watchlist(data);
        return await newEntry.save();
    } catch (error) {
        console.error('Error in repository (addWatchlistEntry):', error);
        throw error;
    }
};

export const getWatchlistByUser = async (userId: string) => {
    try {
        return await watchlist.find({ user: userId });
    } catch (error) {
        console.error('Error in repository (getWatchlistByUser):', error);
        throw error;
    }
};

export const repoDeleteFilters = async (filterId: string) => {
    try {
        return await watchlist.deleteOne({ _id: filterId });
    } catch (error) {
        console.error('Error in repository (repoDeleteEvent):', error);
        throw error;
    }
};