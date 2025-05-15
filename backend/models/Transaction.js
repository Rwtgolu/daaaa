const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    accountId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    location: {
        type: String,
        required: true
    },
    ipAddress: {
        type: String,
        required: true
    },
    isFraudulent: {
        type: Boolean,
        default: false
    },
    fraudFlags: [{
        type: String,
        enum: [
            'high_value',
            'frequency_anomaly',
            'statistical_outlier',
            'pattern_match',
            'cluster_outlier',
            'time_anomaly',
            'geo_anomaly',
            'graph_anomaly'
        ]
    }]
});

module.exports = mongoose.model('Transaction', transactionSchema); 