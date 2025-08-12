# Camp Management System

A modern web application built with Next.js for managing camp accommodations, employee assignments, and room bookings.

## Features

- **Building Management** - Manage building information and campus details
- **Room Management** - Handle room types and availability
- **Employee Management** - Track employee information and assignments
- **Booking System** - Manage room bookings with start/end dates
- **Camp Management** - Organize camp locations and details
- **City & Nationality Management** - Handle geographical and demographic data

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Components**: React Aria Components
- **Database**: SQL Server (MSSQL)

## Getting Started

### Prerequisites

- Node.js 18+ 
- SQL Server instance
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd nextjs-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your database credentials
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── api/            # API routes
│   ├── booking/        # Booking management
│   ├── building/       # Building management
│   ├── camp/           # Camp management
│   ├── city/           # City management
│   ├── employee/       # Employee management
│   ├── nationality/    # Nationality management
│   ├── room/           # Room management
│   └── roomtype/       # Room type management
├── components/          # Reusable components
│   ├── base/           # Base UI components
│   └── forms/          # Form components
└── lib/                # Utility libraries
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
