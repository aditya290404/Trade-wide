# Trade Wide

A production-grade paper trading platform that simulates real-world stock trading with real-time portfolio management, secure authentication, cloud-native deployment, and DevOps automation.

---

## Overview

Trade Wide is a full-stack cloud-native paper trading platform designed to help beginner traders practice stock trading in a realistic environment without risking real money.

The platform replicates the experience of modern brokerage systems through:
- Real-time trade execution
- Live portfolio tracking
- Mark-to-market P&L calculation
- Long & short position management
- Secure authentication workflows
- CI/CD automation
- Cloud deployment and monitoring

The project also demonstrates modern software engineering and DevOps practices using scalable cloud-native technologies.

---

## Features

### Trading Features
- Real-time paper trading simulation
- Buy and sell order execution
- Long and short position management
- Live mark-to-market P&L tracking
- Portfolio dashboard
- Trade history management
- Real-time candlestick charts

### Security Features
- OTP-based email authentication
- JWT access and refresh tokens
- bcrypt password hashing
- Protected REST APIs

### DevOps & Cloud Features
- Docker-ready deployment
- CI/CD automation
- Monitoring and optimization
- Cloud deployment configuration
- Automated testing pipeline

### UI/UX Features
- Responsive design
- Dark/Light mode
- Interactive charts with Recharts
- Accessible UI using Shadcn UI & Radix UI

---

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Shadcn UI
- Radix UI
- Recharts

### Backend
- Node.js
- Express.js
- PostgreSQL

### Testing & Quality
- Playwright
- Vitest
- ESLint

### Deployment & DevOps
- GitHub Actions
- Render
- Monitoring & Optimization Tools

### Security
- JWT Authentication
- bcrypt
- Nodemailer OTP Verification

---

## Project Structure

```bash
TradeWide/
│
├── .github/workflows/        # CI/CD workflow configurations
├── backend/                  # Backend API and server logic
├── public/                   # Static assets
├── src/                      # Frontend source code
├── tests/                    # Testing suites and test utilities
│
├── .gitignore
├── DEPLOYMENT_GUIDE.md       # Deployment documentation
├── OPTIMIZATION_STRATEGY.md  # Performance optimization strategies
├── SECURITY_MITIGATION.md    # Security implementation details
│
├── package.json
├── package-lock.json
├── bun.lock
├── bun.lockb
│
├── components.json           # Shadcn UI configuration
├── eslint.config.js          # ESLint configuration
├── postcss.config.js         # PostCSS configuration
├── tailwind.config.ts        # Tailwind CSS configuration
│
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
├── tsconfig.app.json
├── tsconfig.node.json
│
├── playwright.config.ts      # Playwright testing configuration
├── playwright-fixture.ts     # Playwright fixtures
├── vitest.config.frontend.ts # Vitest frontend testing config
├── test-browser.js           # Browser testing utilities
│
├── render.yaml               # Render deployment configuration
├── index.html
└── README.md
```

---

## Installation

### Clone the Repository

```bash
git clone https://github.com/aditya290404/tradewide.git

cd tradewide
```

---

## Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL=
JWT_SECRET=
REFRESH_TOKEN_SECRET=
SMTP_USER=
SMTP_PASS=
```

---

## Run Locally

### Install Dependencies

```bash
npm install
```

### Start Frontend

```bash
npm run dev
```

### Start Backend

```bash
cd backend

npm install

npm run dev
```

---

## Testing

### Run Frontend Tests

```bash
npm run test
```

### Run Playwright Tests

```bash
npx playwright test
```

---

## Deployment

The project includes deployment configuration for cloud hosting platforms.

### Render Deployment

```bash
render.yaml
```

Deployment documentation is available in:

```bash
DEPLOYMENT_GUIDE.md
```

---

## Monitoring & Optimization

The project includes:
- Performance optimization strategies
- Monitoring configurations
- Security mitigation documentation
- Automated testing setup

Additional documentation:
- `OPTIMIZATION_STRATEGY.md`
- `SECURITY_MITIGATION.md`

---

## Performance Metrics

- Optimized frontend rendering
- Real-time data handling
- Automated testing workflows
- Secure authentication architecture
- Scalable deployment-ready structure

---

## Future Enhancements

- AI-based trade recommendations
- Social trading & leaderboards
- Live financial news integration
- Real-time push notifications
- Mobile application support
- Advanced analytics dashboard

---

## Contributors

- Grisha Sethi
- Aditya Prasad


---

## License

This project is licensed under the MIT License.

---

## Support

If you found this project useful, consider giving it a ⭐ on GitHub.
