# FraudShield - Financial Fraud Detection System

FraudShield is a comprehensive financial fraud detection system that uses multiple algorithms and techniques to identify potentially fraudulent transactions. The system provides a user-friendly dashboard for monitoring transactions and fraud alerts in real-time.

## Features

- Real-time transaction monitoring
- Multiple fraud detection algorithms:
  - Threshold-based anomaly detection
  - Statistical analysis (Z-Score)
  - Pattern matching
  - Time-based analysis
  - Geo-location heuristics
  - Graph analysis
  - Clustering analysis
  - Network analysis
- Interactive dashboard with statistics
- Transaction management system
- Fraud alerts and notifications
- Responsive design

## Tech Stack

- Frontend:
  - HTML5
  - CSS3
  - Vanilla JavaScript
- Backend:
  - Node.js
  - Express.js
  - MongoDB
- Additional Tools:
  - CORS for cross-origin requests
  - Body-parser for request parsing
  - Mongoose for MongoDB object modeling

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Web browser (Chrome, Firefox, Safari, or Edge)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/fraudshield.git
cd fraudshield
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Create a `.env` file in the backend directory with the following content:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fraudDetection
```

4. Start MongoDB service on your system

5. Start the backend server:
```bash
npm start
```

6. Open the frontend:
- Navigate to the `frontend` directory
- Open `index.html` in your web browser
- Or use a local server like `live-server`:
  ```bash
  npx live-server frontend
  ```

## Usage

1. Dashboard:
   - View overall statistics
   - Monitor fraud detection rates
   - Analyze fraud patterns

2. Transactions:
   - Add new transactions
   - View transaction history
   - Search and filter transactions
   - Check transaction status

3. Fraud Alerts:
   - View detected fraudulent transactions
   - Check fraud detection flags
   - Monitor suspicious patterns

## Fraud Detection Algorithms

1. Threshold-based Anomalies:
   - Detects high-value transactions
   - Monitors transaction frequency

2. Statistical Methods:
   - Z-Score analysis for outlier detection
   - Moving average analysis

3. Pattern Matching:
   - Keyword-based detection
   - Rabin-Karp algorithm implementation

4. Time-based Analysis:
   - Detects rapid successive transactions
   - Analyzes transaction timing patterns

5. Geo-location Analysis:
   - Checks for geographical anomalies
   - Monitors location-based patterns

6. Graph Analysis:
   - Detects circular transaction patterns
   - Analyzes transaction networks

7. Clustering:
   - Groups similar transactions
   - Identifies outlier behavior

8. Network Analysis:
   - Floyd-Warshall algorithm implementation
   - Analyzes transaction connectivity

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with modern web technologies
- Implements industry-standard fraud detection techniques
- Uses efficient algorithms for real-time analysis 