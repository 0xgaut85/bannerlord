# Bannerlord Community List

A community-driven ranking system for Mount & Blade II: Bannerlord players.

## Features

- **Community Rankings**: View top-rated Infantry, Cavalry, and Archer players
- **Player Search**: Find users and view their complete rating lists
- **Rating System**: Rate players from 50-99 with weighted calculations
- **Discord Auth**: Sign in with Discord to participate
- **Division Weighting**: Votes are weighted by player division (A=100%, B=75%, C/D=50%, E/F=25%)

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- NextAuth.js (Discord OAuth)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file with:

```env
# Database - Your PostgreSQL connection string
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Discord OAuth - from https://discord.com/developers/applications
DISCORD_CLIENT_ID="your-client-id"
DISCORD_CLIENT_SECRET="your-client-secret"
```

### 3. Discord Application Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to OAuth2 > General
4. Add redirect URL: `http://localhost:3000/api/auth/callback/discord`
5. Copy Client ID and Client Secret to your `.env`

### 4. Database Setup

```bash
# Push schema to database
npm run db:push

# Add players (edit prisma/seed.ts first)
npm run db:seed
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Adding Players

Edit `prisma/seed.ts` and add players in this format:

```typescript
const players = [
  { name: "PlayerName", category: "INFANTRY", nationality: "FR" },
  { name: "AnotherPlayer", category: "CAVALRY", nationality: "DE" },
  // ...
]
```

Then run:

```bash
npm run db:seed
```

## Deployment (Railway)

1. Push code to GitHub
2. Create new project on [Railway](https://railway.app)
3. Add PostgreSQL addon
4. Set environment variables in Railway dashboard
5. Deploy!

## Rating Rules

- Ratings must be between 50-99
- Users must rate at least 20 Infantry, 20 Cavalry, and 10 Archers for their list to count
- Lists can only be edited once every 24 hours
- Vote weight depends on user division

---

Made by Obelix
