import mongoose from 'mongoose';

const watchlistSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    createdAt: { type: Date, default: Date.now },
});

watchlistSchema.index({ user: 1, event: 1 }, { unique: true });

export default mongoose.model('Watchlist', watchlistSchema);