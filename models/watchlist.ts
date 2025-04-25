import mongoose from 'mongoose';

const watchlistSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    searchParams: { type: Array },
    tcaRange: { type: [Number] },
    missDistanceValue: { type: Number },
    missDistanceOperator: { type: String, enum: ['lte', 'gte', 'eq'] },
    collisionProbabilityValue: { type: Number },
    collisionProbabilityOperator: { type: String, enum: ['lte', 'gte', 'eq'] },
    operatorOrganization: { type: String },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Watchlist', watchlistSchema);