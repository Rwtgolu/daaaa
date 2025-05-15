// API Configuration
const API_URL = 'http://localhost:5000/api';

// DOM Elements
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('.section');
const modal = document.getElementById('add-transaction-modal');
const addTransactionBtn = document.getElementById('add-transaction-btn');
const closeModalBtn = document.querySelector('.close');
const transactionForm = document.getElementById('transaction-form');
const transactionSearch = document.getElementById('transaction-search');
const transactionsBody = document.getElementById('transactions-body');
const alertsContainer = document.getElementById('alerts-container');

// Navigation
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSection = link.getAttribute('data-section');
        
        // Update active states
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === targetSection) {
                section.classList.add('active');
            }
        });
        
        // Load section data
        if (targetSection === 'transactions') {
            loadTransactions();
        } else if (targetSection === 'dashboard') {
            loadDashboardStats();
        } else if (targetSection === 'fraud-alerts') {
            loadFraudAlerts();
        }
    });
});

// Modal Handling
addTransactionBtn.addEventListener('click', () => {
    modal.style.display = 'block';
});

closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Form Submission
transactionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        accountId: document.getElementById('accountId').value,
        amount: parseFloat(document.getElementById('amount').value),
        description: document.getElementById('description').value,
        category: document.getElementById('category').value,
        location: document.getElementById('location').value,
        ipAddress: await getIPAddress() // Get user's IP for demo purposes
    };
    
    try {
        const response = await fetch(`${API_URL}/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            modal.style.display = 'none';
            transactionForm.reset();
            loadTransactions();
            showNotification('Transaction added successfully', 'success');
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        showNotification(error.message, 'error');
    }
});

// Load Transactions
async function loadTransactions() {
    try {
        const response = await fetch(`${API_URL}/transactions`);
        const transactions = await response.json();
        
        transactionsBody.innerHTML = transactions.map(transaction => `
            <tr class="${transaction.isFraudulent ? 'fraud' : ''}">
                <td>${transaction.accountId}</td>
                <td>$${transaction.amount.toFixed(2)}</td>
                <td>${transaction.description}</td>
                <td>${transaction.category}</td>
                <td>${transaction.location}</td>
                <td>
                    <span class="status ${transaction.isFraudulent ? 'fraud' : 'safe'}">
                        ${transaction.isFraudulent ? 'Fraudulent' : 'Safe'}
                    </span>
                </td>
                <td>${new Date(transaction.timestamp).toLocaleString()}</td>
            </tr>
        `).join('');
    } catch (error) {
        showNotification('Error loading transactions', 'error');
    }
}

// Update loadDashboardStats function
async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_URL}/transactions/stats`);
        const stats = await response.json();
        
        // Update summary statistics
        document.getElementById('total-transactions').textContent = stats.totalTransactions;
        document.getElementById('fraudulent-transactions').textContent = stats.fraudulentTransactions;
        document.getElementById('fraud-percentage').textContent = `${stats.fraudulentPercentage.toFixed(2)}%`;
        document.getElementById('total-amount').textContent = `$${stats.totalAmount.toLocaleString()}`;
        
        // Update risk distribution
        const highRiskCount = stats.riskDistribution?.high || 0;
        const mediumRiskCount = stats.riskDistribution?.medium || 0;
        const lowRiskCount = stats.riskDistribution?.low || 0;
        const totalRisk = highRiskCount + mediumRiskCount + lowRiskCount;

        document.getElementById('high-risk-bar').style.width = `${(highRiskCount / totalRisk) * 100}%`;
        document.getElementById('medium-risk-bar').style.width = `${(mediumRiskCount / totalRisk) * 100}%`;
        document.getElementById('low-risk-bar').style.width = `${(lowRiskCount / totalRisk) * 100}%`;

        document.getElementById('high-risk-count').textContent = `${highRiskCount} transactions`;
        document.getElementById('medium-risk-count').textContent = `${mediumRiskCount} transactions`;
        document.getElementById('low-risk-count').textContent = `${lowRiskCount} transactions`;

        // Update recent activity
        const recentActivity = document.getElementById('recent-activity');
        recentActivity.innerHTML = stats.recentTransactions?.map(transaction => `
            <div class="activity-item">
                <div class="activity-icon ${transaction.isFraudulent ? 'fraud' : 'safe'}">
                    ${transaction.isFraudulent ? '⚠️' : '✓'}
                </div>
                <div class="activity-details">
                    <div class="activity-amount">$${transaction.amount.toLocaleString()}</div>
                    <div class="activity-info">${transaction.description}</div>
                    <div class="activity-time">${new Date(transaction.timestamp).toLocaleString()}</div>
                </div>
            </div>
        `).join('') || '';

        // Update location stats
        const locationStats = document.getElementById('location-stats');
        locationStats.innerHTML = stats.topLocations?.map(location => `
            <div class="location-item">
                <span class="location-name">${location.name}</span>
                <span class="location-count">${location.count}</span>
            </div>
        `).join('') || '';

        // Update fraud types chart
        updateFraudTypesChart(stats.flagStats);
        
        // Update time chart
        updateTimeChart(stats.timelineData);
    } catch (error) {
        showNotification('Error loading statistics', 'error');
    }
}

// Add function to update time chart
function updateTimeChart(timelineData) {
    const timeChart = document.getElementById('time-chart');
    // Implementation for time-based visualization
    // You can use a library like Chart.js or D3.js here
}

// Function to get fraud reason explanations
function getFraudReasons(fraudFlags) {
    const reasons = {
        high_value: "Transaction amount exceeds normal threshold (>$10,000)",
        frequency_anomaly: "Multiple transactions detected in a short time period",
        statistical_outlier: "Transaction amount significantly deviates from account's normal pattern",
        pattern_match: "Suspicious keywords detected in transaction description",
        cluster_outlier: "Transaction behavior differs from normal patterns",
        time_anomaly: "Unusual transaction timing or frequency",
        geo_anomaly: "Transactions from different locations in short time period",
        graph_anomaly: "Suspicious circular transaction pattern detected"
    };

    return fraudFlags.map(flag => reasons[flag] || flag).join('\n• ');
}

// Load Fraud Alerts with detailed explanations
async function loadFraudAlerts() {
    try {
        const response = await fetch(`${API_URL}/transactions`);
        const transactions = await response.json();
        
        const fraudulentTransactions = transactions.filter(t => t.isFraudulent);
        
        alertsContainer.innerHTML = fraudulentTransactions.map(transaction => `
            <div class="alert danger">
                <h3>Fraud Alert: Transaction #${transaction._id}</h3>
                <div class="alert-content">
                    <div class="alert-details">
                        <p><strong>Account:</strong> ${transaction.accountId}</p>
                        <p><strong>Amount:</strong> $${transaction.amount.toFixed(2)}</p>
                        <p><strong>Description:</strong> ${transaction.description}</p>
                        <p><strong>Location:</strong> ${transaction.location}</p>
                        <p><strong>Time:</strong> ${new Date(transaction.timestamp).toLocaleString()}</p>
                    </div>
                    <div class="fraud-reasons">
                        <h4>Reasons Flagged as Fraudulent:</h4>
                        <ul>
                            <li>• ${getFraudReasons(transaction.fraudFlags)}</li>
                        </ul>
                    </div>
                    <div class="risk-level">
                        <p><strong>Risk Level:</strong> 
                            <span class="risk-badge ${transaction.fraudFlags.length > 2 ? 'high' : 'medium'}">
                                ${transaction.fraudFlags.length > 2 ? 'High Risk' : 'Medium Risk'}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        showNotification('Error loading fraud alerts', 'error');
    }
}

// Search Transactions
transactionSearch.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const rows = transactionsBody.getElementsByTagName('tr');
    
    Array.from(rows).forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
});

// Utility Functions
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

async function getIPAddress() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return '127.0.0.1'; // Fallback IP
    }
}

// Initial Load
loadDashboardStats(); 