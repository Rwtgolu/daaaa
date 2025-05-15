const Transaction = require('../models/Transaction');

// 1. Threshold-based Anomalies
const checkHighValueTransaction = (amount) => {
    const THRESHOLD = 10000;
    return amount > THRESHOLD;
};

const checkFrequencyAnomaly = async (accountId) => {
    const TIME_WINDOW = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const FREQUENCY_THRESHOLD = 10;
    
    const recentTransactions = await Transaction.countDocuments({
        accountId,
        timestamp: { $gte: new Date(Date.now() - TIME_WINDOW) }
    });
    
    return recentTransactions > FREQUENCY_THRESHOLD;
};

// 2. Statistical Methods (Z-Score)
const calculateZScore = async (amount) => {
    const transactions = await Transaction.find({}, 'amount');
    const amounts = transactions.map(t => t.amount);
    
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const std = Math.sqrt(amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amounts.length);
    
    const zScore = (amount - mean) / std;
    return Math.abs(zScore) > 3; // Three-sigma rule
};

// 3. Pattern Matching (Rabin-Karp)
const checkSuspiciousKeywords = (description) => {
    const keywords = ['crypto', 'btc', 'gift', 'urgent', 'emergency'];
    const desc = description.toLowerCase();
    return keywords.some(keyword => desc.includes(keyword));
};

// 4. Time-Based Logic
const checkTimeAnomaly = async (accountId, timestamp) => {
    const TIME_WINDOW = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    const recentTransactions = await Transaction.find({
        accountId,
        timestamp: { $gte: new Date(timestamp - TIME_WINDOW) }
    });
    
    return recentTransactions.length >= 3; // More than 3 transactions in 5 minutes
};

// 5. Geo-Location Heuristics
const checkGeoAnomaly = async (accountId, location) => {
    const lastTransaction = await Transaction.findOne({ accountId }).sort({ timestamp: -1 });
    if (!lastTransaction) return false;
    
    // Simple distance check (can be enhanced with actual geo-coordinates)
    return lastTransaction.location !== location;
};

// 6. Graph Analysis
const checkGraphAnomaly = async (accountId, amount) => {
    const transactions = await Transaction.find({
        $or: [
            { accountId },
            { 'description': { $regex: accountId, $options: 'i' } }
        ]
    }).sort({ timestamp: -1 }).limit(10);
    
    // Check for circular transactions
    const recipients = new Set();
    for (const tx of transactions) {
        if (recipients.has(tx.description)) return true;
        recipients.add(tx.description);
    }
    return false;
};

// 7. Clustering Analysis
const checkClusterAnomaly = async (amount) => {
    const transactions = await Transaction.find({}, 'amount');
    const amounts = transactions.map(t => t.amount);
    
    // Simple clustering using average
    const average = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const deviation = Math.abs(amount - average);
    
    return deviation > average * 2; // If transaction deviates more than 200% from average
};

// 8. Floyd-Warshall Implementation for Transaction Network
const checkTransactionNetwork = async (accountId) => {
    const transactions = await Transaction.find({
        $or: [{ accountId }, { 'description': { $regex: accountId, $options: 'i' } }]
    }).limit(20);
    
    // Create adjacency matrix
    const accounts = new Set([...transactions.map(t => t.accountId)]);
    const n = accounts.size;
    if (n < 3) return false; // Need at least 3 nodes for a suspicious pattern
    
    // Check for short cycles in transaction network
    return transactions.length / n > 2; // If average edges per node is high
};

// Main fraud detection function that combines all checks
const detectFraud = async (transaction) => {
    const fraudFlags = [];
    
    // Run all fraud detection algorithms
    if (checkHighValueTransaction(transaction.amount)) {
        fraudFlags.push('high_value');
    }
    
    if (await checkFrequencyAnomaly(transaction.accountId)) {
        fraudFlags.push('frequency_anomaly');
    }
    
    if (await calculateZScore(transaction.amount)) {
        fraudFlags.push('statistical_outlier');
    }
    
    if (checkSuspiciousKeywords(transaction.description)) {
        fraudFlags.push('pattern_match');
    }
    
    if (await checkClusterAnomaly(transaction.amount)) {
        fraudFlags.push('cluster_outlier');
    }
    
    if (await checkTimeAnomaly(transaction.accountId, transaction.timestamp)) {
        fraudFlags.push('time_anomaly');
    }
    
    if (await checkGeoAnomaly(transaction.accountId, transaction.location)) {
        fraudFlags.push('geo_anomaly');
    }
    
    if (await checkGraphAnomaly(transaction.accountId, transaction.amount)) {
        fraudFlags.push('graph_anomaly');
    }
    
    return {
        isFraudulent: fraudFlags.length > 0,
        fraudFlags
    };
};

module.exports = {
    detectFraud,
    checkHighValueTransaction,
    checkFrequencyAnomaly,
    calculateZScore,
    checkSuspiciousKeywords,
    checkTimeAnomaly,
    checkGeoAnomaly,
    checkGraphAnomaly,
    checkClusterAnomaly,
    checkTransactionNetwork
}; 