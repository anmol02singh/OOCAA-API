import watchlist from "../models/watchlist";

export const addWatchlistEntry = async (userId: string, eventId: string) => {
    try {
        const newEntry = new watchlist({
            user: userId,
            event: eventId,
        });
        return await newEntry.save();
    } catch (error) {
        console.error('Error in repository (addWatchlistEntry):', error);
        throw error;
    }
};

export const getWatchlistByUser = async (userId: string) => {
    try {
        return await watchlist.find({ user: userId }).populate('event');
    } catch (error) {
        console.error('Error in repository (getWatchlistByUser):', error);
        throw error;
    }
};

export const repoDeleteEvent = async (eventId: string) => {
    try {
        return await watchlist.deleteOne({ event: eventId });
    } catch (error) {
        console.error('Error in repository (repoDeleteEvent):', error);
        throw error;
    }
};