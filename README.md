# Social Media Manager

A full-stack workspace for planning, publishing, and analyzing social media content across Facebook, Instagram, LinkedIn, and X (Twitter).

The application combines a React dashboard with an Express API and PostgreSQL. Teams can connect social accounts, organize them into groups, prepare posts with media and tags, schedule publishing, and review engagement analytics from one place.

## Features

- Connect Facebook, Instagram, LinkedIn, and X accounts through OAuth
- Publish immediately or schedule content for later
- Save drafts and send posts through an editor-to-publisher approval flow
- Preview posts in platform-specific layouts before publishing
- Organize accounts into groups and posts with workspace tags
- View posts in calendar and list views
- Compare account performance, trends, top posts, and top tags
- Manage team members with `owner`, `admin`, `publisher`, and `editor` roles
- Refresh social insights daily with a background scheduler
- Upload and attach media through Cloudinary

## Tech stack

| Layer | Technology |
| --- | --- |
| Client | React 19, React Router, Ant Design, Recharts, React Big Calendar |
| API | Node.js 20, Express 4, Sequelize 6 |
| Database | PostgreSQL 15 |
| Authentication | JWT stored in an HTTP-only cookie |
| Integrations | Facebook/Instagram Graph APIs, LinkedIn, X, Cloudinary |
| Local orchestration | Docker Compose |

## Project structure

```text
.
|-- client/                 React application
|   `-- src/
|       |-- apis/           API clients
|       |-- components/     Shared UI, calendar, and post previews
|       |-- pages/          Dashboard, analytics, teams, groups, and tags
|       `-- utils/          Routing, dates, and media upload helpers
|-- server/                 Express application
|   |-- config/             Database and Cloudinary configuration
|   |-- controllers/        HTTP request handlers
|   |-- jobs/               Daily analytics collection
|   |-- middleware/         Authentication and workspace authorization
|   |-- models/             Sequelize models and associations
|   |-- routes/             REST API routes
|   |-- services/           Social platform and publishing logic
|   `-- utils/              Scheduling, retry, and rate-limit helpers
`-- docker-compose.yml      Client, API, and PostgreSQL services
```

## Prerequisites

Choose either Docker Desktop, or install these tools locally:

- Node.js 20 and npm
- PostgreSQL 15
- OAuth application credentials for each social platform you want to connect
- A Cloudinary account and an unsigned upload preset named `Social` for media uploads

## Configuration

Environment files are intentionally excluded from Git. Create both files before starting the application.

### `server/.env`

```dotenv
PORT=5000
CLIENT_APP_URL=http://localhost:3000
JWT_SECRET=replace-with-a-long-random-secret

# Use DB_HOST=db with Docker Compose; use localhost for a local PostgreSQL install.
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=admin
DB_DATABASE=social_media_manager

# Alternatively, provide a hosted PostgreSQL connection string.
# DATABASE_URL=postgresql://user:password@host:5432/database

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_CALLBACK_URI=http://localhost:5000/api/auth/facebook/callback
INSTAGRAM_CALLBACK_URI=http://localhost:5000/api/auth/instagram/callback

LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
LINKEDIN_CALLBACK_URI=http://localhost:5000/api/auth/linkedin/callback

TWITTER_CONSUMER_KEY=
TWITTER_CONSUMER_SECRET=
TWITTER_BEARER_TOKEN=
TWITTER_CALLBACK_URL=http://localhost:5000/api/auth/twitter/callback
```

When `DATABASE_URL` is set, it takes precedence over the individual `DB_*` values and enables SSL for the database connection.

### `client/.env`

```dotenv
REACT_APP_BACKEND_API_URL=http://localhost:5000
REACT_APP_CLOUDINARY_CLOUD_URL=https://api.cloudinary.com/v1_1/<cloud-name>/upload
```

Register the callback URLs with the corresponding OAuth providers. Replace localhost URLs with the public HTTPS API URL when deploying.

## Run with Docker Compose

The Compose configuration starts PostgreSQL, the API, and the React development server.

```bash
docker compose up --build
```

After the containers start:

- Client: <http://localhost:3000>
- API: <http://localhost:5000>
- PostgreSQL: `localhost:5432`

The database container uses the credentials shown in the example configuration. Data is retained in the `postgres_data` Docker volume. Stop the services with:

```bash
docker compose down
```

## Run locally

Create the `social_media_manager` PostgreSQL database, set `DB_HOST=localhost` in `server/.env`, and install dependencies in both applications.

Start the API:

```bash
cd server
npm ci
npm start
```

In another terminal, start the client:

```bash
cd client
npm ci
npm start
```

Sequelize authenticates the database connection and synchronizes the schema when the API starts.

## Available scripts

### Client

```bash
cd client
npm start       # Start the development server
npm test        # Run the Create React App test runner
npm run build   # Create a production build
```

### Server

```bash
cd server
npm start       # Start the Express API
npm run lint    # Run ESLint
```

## Roles and publishing workflow

| Role | Main capabilities |
| --- | --- |
| Owner | Full workspace, member, account, and publishing access |
| Admin | Manage members, accounts, groups, tags, and publishing |
| Publisher | Publish or schedule drafts and pending posts |
| Editor | Create drafts and submit posts for publishing |

All roles can view workspace analytics. Publishing records move through draft, pending, scheduled, posting, posted, or failed states depending on the selected action and its outcome.

## Operational notes

- The insights job runs every day at midnight in the `Asia/Ho_Chi_Minh` timezone and retries failed provider requests.
- Scheduled posts are held by the running Node.js process. Restarting the API clears those in-memory jobs, so production deployments should restore pending schedules on startup or use a durable job queue.
- The current cookie configuration uses `secure: true` and `sameSite: "none"`. Browsers therefore require HTTPS for authenticated sessions. For local HTTP development, make the `secure` option conditional on the environment before testing login.
- The API currently calls `sequelize.sync({ alter: true })` at startup. Use migrations instead before operating the application in a production environment.

## Production checklist

- Serve both applications over HTTPS
- Use a strong `JWT_SECRET` and production database credentials
- Set `CLIENT_APP_URL` and all OAuth callbacks to deployed URLs
- Restrict Cloudinary upload settings and keep server credentials private
- Replace the default in-memory Express session store
- Add database migrations and a durable scheduler/queue
- Run `npm run build` in `client/` and `npm run lint` in `server/`
