# 🎯 Policy Prediction Market

A prediction market platform for Chinese public policies, powered by collective intelligence and market mechanisms.

## 🌟 Key Features

### 📊 Prediction Markets
- **100 Policy Markets**: Covering economics, technology, education, healthcare, environment, society, and culture
- **Real-time Probability Charts**: Visualize market sentiment changes
- **Dynamic Odds**: Market-driven pricing mechanism
- **Transparent Settlement**: Objective verification by certified validators

### ⭐ Reputation System
- **5-Tier Ranking**: From Novice to Super Forecaster
- **Brier Score**: Professional prediction accuracy assessment
- **Prediction Score**: Comprehensive ability evaluation (0-100)
- **Automatic Upgrades**: Based on performance and experience

### 💬 Community Features
- **Comment System**: Share analysis and insights (up to 5000 characters)
- **Nested Replies**: Support 3-level reply threads
- **Like System**: One-click appreciation for quality content
- **Real-time Updates**: WebSocket-powered instant refresh

### 🏅 Leaderboard
- **Ranking by Prediction Score**: Scientific ability assessment
- **Comprehensive Stats**: Display accuracy, tier, and prediction count
- **Special Badges**: Gold, silver, bronze medals for top 3

### 📈 Advanced Analytics
- **Prediction Trends**: Historical probability charts with time series
- **Market Statistics**: Total volume, unique predictors, participation data
- **Personal Dashboard**: Complete betting history and performance metrics
- **Reputation Progress**: Track your journey to higher tiers

## 🚀 Quick Start

### For Users

1. **Register**: Sign up to get 1000 initial points
2. **Browse Markets**: Explore 100+ policy prediction markets
3. **Make Predictions**: Bet points on your forecasts
4. **Join Discussions**: Share your analysis in comments
5. **Track Progress**: Monitor your reputation and ranking

### For Developers

```bash
# Clone the repository
git clone https://github.com/freetitan/policy-prediction-market.git

# Install dependencies
cd policy-prediction-market
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
pnpm dev
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **UI**: Tailwind CSS, Radix UI, Shadcn/ui
- **Backend**: Supabase (PostgreSQL, Authentication, Realtime)
- **Charts**: Recharts
- **Deployment**: Vercel

## 📚 Documentation

- [Platform Introduction (Chinese)](./平台介绍.md) - Comprehensive user guide
- [Metaculus Features](./METACULUS_FEATURES.md) - Advanced prediction features
- [Comments System](./COMMENTS_FEATURE.md) - Discussion feature documentation
- [Deployment Guide](./DEPLOY_ADVANCED_FEATURES.md) - How to deploy

## 🎯 User Tiers

| Tier | Badge | Score | Min Predictions | Description |
|------|-------|-------|-----------------|-------------|
| Novice | 🌟 | 0-44 | - | Starting your journey |
| Intermediate | ⚡ | 45+ | 10+ | Some experience |
| Advanced | 🏆 | 60+ | 20+ | Outstanding ability |
| Expert | 🥇 | 75+ | 50+ | Top forecaster |
| Super Forecaster | ✨ | 90+ | 100+ | Legendary |

## 📊 Platform Statistics

- **Markets**: 100 Chinese public policy predictions
- **Categories**: 7 major domains
- **Time Frame**: 2026-2027
- **Features**: Complete prediction, reputation, and social systems


## 🎨 Key Components

### Market Card
- Title and description
- Current probability display
- Category and status badges
- Participation statistics

### Prediction Chart
- Real-time probability trends
- Historical data visualization
- Trend indicators (↑↓→)
- Interactive tooltips

### Reputation Badge
- 5-tier visual badges
- Hover for detailed stats
- Display in comments and leaderboard

### Comments Section
- Post and reply
- Like and edit
- User tier display
- Real-time updates

## 🔐 Security & Privacy

- **Authentication**: Supabase Auth with email verification
- **Row Level Security**: PostgreSQL RLS policies
- **Data Encryption**: Secure transmission and storage
- **Privacy Protection**: Minimal data collection

## 📱 Responsive Design

- Perfect mobile experience
- Touch-friendly interactions
- Adaptive layouts
- Optimized performance

## 🌈 Features in Detail

### Prediction System
- **Initial Points**: 1000 points per user
- **Betting Mechanism**: Points locked on confirmation
- **Odds Calculation**: Dynamic based on pool ratio
- **Settlement**: Verified by authorized validators

### Reputation Calculation
```
Prediction Score = (Accuracy Rate × 50) + ((1 - Brier Score) × 50)
```

**Brier Score Formula**:
```
Brier Score = (Predicted Probability - Actual Outcome)²
```

Lower Brier Score = Better prediction quality

### Comment Features
- Maximum 5000 characters
- 3-level nested replies
- Like system with duplicate prevention
- Soft delete (preserves reply chain)
- Edit tracking (shows "edited" badge)

## 🔧 Database Schema

### Main Tables
- `markets` - Prediction markets
- `profiles` - User profiles with reputation
- `bets` - Betting records
- `prediction_snapshots` - Historical probability data
- `prediction_records` - Detailed prediction tracking
- `comments` - User comments
- `comment_likes` - Like records

### Views
- `market_statistics` - Aggregated market data
- `user_statistics` - User performance metrics
- `comments_with_details` - Comments with user info

### Functions
- `place_bet()` - Handle betting transactions
- `update_prediction_snapshot()` - Record market state
- `update_user_reputation()` - Calculate reputation score
- `calculate_brier_score()` - Compute prediction accuracy

## 🚀 Deployment

### Prerequisites
- Node.js 18+
- Supabase account
- Vercel account (optional)

### Steps

1. **Setup Supabase**
   ```bash
   # Create a new Supabase project
   # Run migrations in SQL Editor
   ```

2. **Configure Environment**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Deploy to Vercel**
   ```bash
   vercel deploy
   ```

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Inspired by [Metaculus](https://www.metaculus.com/)
- Built with [Next.js](https://nextjs.org/)
- Powered by [Supabase](https://supabase.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)

## 📮 Contact

- GitHub Issues: For bug reports and feature requests
- Email: [Your Email]
- Website: [Your Website]

---

**Made with ❤️ for the prediction market community**

*Last Updated: June 3, 2026*
