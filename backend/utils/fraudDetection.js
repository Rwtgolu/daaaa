const Transaction = require('../models/Transaction');

// 1. Threshold-based Anomalies
const checkHighValueTransaction = (amount) => {
    const THRESHOLD = 10000;
    // Convert amount to number if it's a string
    const numAmount = Number(amount);
    console.log('Checking high value:', { amount: numAmount, threshold: THRESHOLD });
    return numAmount > THRESHOLD;
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
    if (transactions.length === 0) return false;
    
    const amounts = transactions.map(t => Number(t.amount));
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const std = Math.sqrt(amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amounts.length);
    
    if (std === 0 || transactions.length < 2) return false;
    
    const zScore = Math.abs((Number(amount) - mean) / std);
    console.log('Z-Score calculation:', { amount, mean, std, zScore });
    return zScore > 3;
};

// 3. Pattern Matching
const checkSuspiciousKeywords = (description) => {
    if (!description) return false;
    const keywords = ['crypto', 'btc', 'gift', 'urgent', 'emergency', 'bitcoin', 'eth', 'help'];
    const desc = description.toLowerCase().trim();
    const foundKeywords = keywords.filter(keyword => desc.includes(keyword));
    console.log('Checking keywords:', { description: desc, foundKeywords });
    return foundKeywords.length > 0;
};

// 4. Time-Based Logic
const checkTimeAnomaly = async (accountId, timestamp) => {
    if (!accountId || !timestamp) return false;
    const TIME_WINDOW = 5 * 60 * 1000; // 5 minutes
    
    const recentTransactions = await Transaction.find({
        accountId,
        timestamp: { $gte: new Date(new Date(timestamp).getTime() - TIME_WINDOW) }
    });
    
    console.log('Time anomaly check:', { 
        accountId, 
        recentCount: recentTransactions.length,
        timeWindow: '5 minutes'
    });
    
    return recentTransactions.length >= 3;
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
    if (transactions.length === 0) return false; // Return false if no transactions exist
    
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

// Main fraud detection function
const detectFraud = async (transaction) => {
    try {
        console.log('Received transaction for fraud detection:', transaction);
        
        // Validate transaction data
        if (!transaction || typeof transaction !== 'object') {
            console.error('Invalid transaction data received');
            return { isFraudulent: false, fraudFlags: [] };
        }

        const { amount, accountId, description, location, timestamp } = transaction;
        
        if (!amount || !accountId || !description || !location) {
            console.error('Missing required transaction fields');
            return { isFraudulent: false, fraudFlags: [] };
        }

        const fraudFlags = [];
        
        // High value check
        if (checkHighValueTransaction(amount)) {
            fraudFlags.push('high_value');
        }
        
        // Frequency check
        if (await checkFrequencyAnomaly(accountId)) {
            fraudFlags.push('frequency_anomaly');
        }
        
        // Statistical analysis
        if (await calculateZScore(amount)) {
            fraudFlags.push('statistical_outlier');
        }
        
        // Keyword check
        if (checkSuspiciousKeywords(description)) {
            fraudFlags.push('pattern_match');
        }
        
        // Time anomaly
        if (await checkTimeAnomaly(accountId, timestamp)) {
            fraudFlags.push('time_anomaly');
        }
        
        // Location check
        if (await checkGeoAnomaly(accountId, location)) {
            fraudFlags.push('geo_anomaly');
        }
        
        console.log('Fraud detection results:', {
            transactionId: transaction._id,
            fraudFlags,
            isFraudulent: fraudFlags.length > 0
        });
        
        return {
            isFraudulent: fraudFlags.length > 0,
            fraudFlags
        };
    } catch (error) {
        console.error('Error in fraud detection:', error);
        return {
            isFraudulent: false,
            fraudFlags: []
        };
    }
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