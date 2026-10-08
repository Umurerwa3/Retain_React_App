# Retain – Personal Expense & Budget Manager

Retain helps people record their everyday expenses, set a monthly budget and see where their money goes. Admins manage the expense categories everyone uses and see insights across the whole platform.

## Live demo

| | URL |
|---|---|
| **Web app** | _coming soon – deployment link will be added here_ |
| **API** | _coming soon_ |

| Account | Email | Password |
|---|---|---|
| Admin | `admin@retain.app` | set with `ADMIN_PASSWORD` (`admin123` locally) |
| Demo user | `demo@retain.app` | `demo1234` |

The demo user has about three months of expenses and budgets: one month within budget, one over, and the current month approaching the limit. Load this data with `npm run seed:demo` (see below).

## Features

### Users
- **Authentication**: sign up, sign in and sign out. Sessions are restored on reload and expired tokens sign the user out automatically.
- **Expense CRUD**: record expenses with a title, amount, category, date, payment method and optional notes. View, edit and delete them.
- **Search, filters and sorting**: search titles and notes; filter by category, payment method, date range and amount range; sort by date or amount; paginate through results.
- **Monthly budget**: set or update a budget for any month and see the amount spent, the remaining amount and a status:
  - *Within budget*: under 80% used
  - *Approaching limit*: 80–100% used
  - *Over budget*: more than 100% used
- **Dashboard**: total spending for the selected month, remaining budget, highest single expense, spending by category (donut and bars), a daily spending chart and recent expenses.
- **Responsive UI**: sidebar navigation on desktop, slide-out drawer and card lists on mobile.

### Admins
- **Category management**: create, edit and delete expense categories. Deleting a category moves its expenses to the default **Uncategorized** category, which can't be deleted.
- **Platform insights**: total registered users, total number and value of expenses, expenses recorded this month, spending per category, the top 5 and bottom 5 categories by usage, recently added expenses and recently registered users.

## Tech stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, TypeScript, Vite, Material UI, React Router, Redux Toolkit, Recharts, Axios |
| Backend | Node.js, Express 5, Mongoose, JSON Web Tokens, bcrypt, Helmet, express-rate-limit |
| Database | MongoDB (MongoDB Atlas in production) |
| Hosting | Render (API and static site) |

## Architecture

```
Retain_React_App/
├── client/                 React + TypeScript frontend
│   └── src/
│       ├── api/            Typed API services (axios)
│       ├── components/     Reusable UI (layout, expenses, budget, dashboard, admin, common)
│       ├── context/        AuthContext (auth, roles) and notifications
│       ├── hooks/          useAuth, useFetch, useCategories, useDebouncedValue, useNotify
│       ├── pages/          Route pages, including admin/
│       ├── routes/         AppRoutes, ProtectedRoute, GuestRoute
│       ├── store/          Redux store and filtersSlice (search / filter / sort / paging)
│       ├── types/          Shared domain and API types
│       └── utils/          Formatting helpers
└── server/                 Express REST API
    └── src/
        ├── config/         MongoDB connection
        ├── controllers/    Route handlers
        ├── middleware/     protect / authorize, error handling
        ├── models/         User, Expense, Category, Budget
        ├── routes/         Express routers
        ├── services/       Budget summary and seeding logic
        ├── scripts/        Seed script
        └── utils/          Query building, errors, helpers
```

### State management
- **Authentication (React Context)**: `AuthProvider` keeps the current user and exposes `signIn`, `signUp`, `signOut`, `isAdmin` and `hasRole`. `ProtectedRoute` uses it to guard signed-in pages, and `ProtectedRoute roles={['admin']}` guards the admin pages. `GuestRoute` keeps signed-in users away from the sign in and sign up pages.
- **Filtering (Redux Toolkit)**: `filtersSlice` holds search, category and payment method filters, date and amount ranges, sorting and pagination. The `selectExpenseQueryParams` memoized selector turns this state into API query parameters, and the expense list refetches whenever they change.

### Security
- Passwords are hashed with bcrypt and never returned by the API.
- Every expense and budget query is scoped to the signed-in user, so other users' records come back as `404`.
- Category writes and insights require the `admin` role. The role is never taken from the sign-up request.
- Helmet security headers, rate limiting on auth routes, and a request body size limit.

## Getting started

### Prerequisites
- Node.js 18 or newer
- A MongoDB database: a local `mongod`, Docker (`docker run -d -p 27017:27017 mongo:7`) or a free MongoDB Atlas cluster

### 1. Clone
```bash
git clone https://github.com/Umurerwa3/Retain_React_App.git
cd Retain_React_App
```

### 2. Backend
```bash
cd server
cp .env.example .env      # then edit MONGO_URI and JWT_SECRET
npm install
npm run seed              # optional: the server also seeds on startup
npm run dev               # http://localhost:5000
```

| Variable | Description | Default |
|---|---|---|
| `PORT` | API port | `5000` |
| `MONGO_URI` | MongoDB connection string | – |
| `JWT_SECRET` | Secret used to sign tokens | – |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `CLIENT_URL` | Allowed CORS origin(s), comma separated | `*` |
| `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Admin account created by the seed | `Retain Admin` / `admin@retain.app` / `admin123` |

### 3. Frontend
```bash
cd client
cp .env.example .env      # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev               # http://localhost:5173
```

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Base URL of the API | `http://localhost:5000/api` |
| `VITE_CURRENCY` | ISO currency code used to display amounts | `USD` |

### Scripts

| Location | Command | Purpose |
|---|---|---|
| `server` | `npm run dev` | Start the API with auto reload |
| `server` | `npm start` | Start the API |
| `server` | `npm run seed` | Create default categories and the admin account |
| `server` | `npm run seed:demo` | Reset and load the demo users, expenses and budgets |
| `client` | `npm run dev` | Start the Vite dev server |
| `client` | `npm run build` | Type-check and build for production |
| `client` | `npm run lint` | Lint with oxlint |

## API

Base URL: `/api`. Protected endpoints need an `Authorization: Bearer <token>` header. The full reference, with request and response examples, is in [docs/API.md](docs/API.md).

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Create an account |
| POST | `/auth/login` | Public | Sign in |
| GET | `/auth/me` | User | Current user |
| GET | `/expenses` | User | List own expenses (search, filters, sort, pagination) |
| POST | `/expenses` | User | Create an expense |
| GET | `/expenses/:id` | Owner | Get one expense |
| PUT | `/expenses/:id` | Owner | Update an expense |
| DELETE | `/expenses/:id` | Owner | Delete an expense |
| GET | `/budgets` | User | List own budgets |
| GET | `/budgets/:month` | User | Budget summary for `YYYY-MM` |
| PUT | `/budgets/:month` | User | Set or update a monthly budget |
| DELETE | `/budgets/:month` | User | Remove a monthly budget |
| GET | `/dashboard?month=YYYY-MM` | User | Dashboard summary |
| GET | `/categories` | User | List categories |
| POST | `/categories` | Admin | Create a category |
| PUT | `/categories/:id` | Admin | Update a category |
| DELETE | `/categories/:id` | Admin | Delete a category (expenses move to Uncategorized) |
| GET | `/admin/insights` | Admin | Platform insights |

## Deployment

The repo includes a [Render Blueprint](render.yaml) that deploys both services:

1. Create a free MongoDB Atlas cluster and copy its connection string.
2. On Render, choose **New → Blueprint** and select this repository.
3. Fill in the secrets:
   - `retain-api`: set `MONGO_URI`, `CLIENT_URL` (the client URL), `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
   - `retain-client`: set `VITE_API_URL` to `https://<retain-api>.onrender.com/api`.
4. Deploy. The API seeds the categories and the admin account on first start.
5. Optional: load demo data into the production database from your machine with `MONGO_URI="<atlas uri>" npm run seed:demo` in `server/`.

`client/vercel.json` is included if you'd rather host the frontend on Vercel.

## Error handling and UX
- The API returns consistent JSON errors (`{ message, details? }`) with proper status codes for validation errors, bad IDs, duplicates, `401`, `403` and `404`.
- The client shows inline form validation, toast notifications for actions, retry buttons when loading fails, loading skeletons, empty states and confirmation dialogs before deleting.
