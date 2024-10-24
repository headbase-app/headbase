# Headbase Server
The Headbase server is developed using Express.js and provides an HTTP API and Websocket
server for syncing content between devices, backing up content to the server and managing user accounts.

## Before you begin
- [PostgreSQL](https://www.postgresql.org/) is required to run the database. You must also set up the database as per the example in `scripts/example.setup.sql`.
- Redis


## Setting up the app


### 1. Setup database

1.1. This script will create a `headbase` user & database, alternatively create your own database and set the env vars accordingly.
```shell
psql postgres < ./scripts/setup.sql
```

1.2. Run database migrations to set up the required tables in your database
```shell
psql -d headbase < ./migrations/000-v1-schema.sql
```

1.3. You may have to ensure that you user has permissions to access the new tables
```shell
psql postgres < ./scripts/permissions.sql
```

### 2. Install dependencies
```shell
npm install
```

### 3. Setup environment
You will have to configure environment variables such as `AUTH_*` and `DATABASE_URL` if you edited the `setup.sql` script 
or created your database a different way.
```shell
cp .env.example .env
```

## Running the app

### Development mode
Run the app via `tsx` and restart on changes

```shell
npm run start
```

### Production build
Build the app using `tsc` then `tsc-alias` (which fixes alias/path imports in the build)

```shell
npm run build
```

### Running production build
Run a production build directly using node

```shell
npm run start:prod
```

## Testing the app

### Run all tests
```shell
npm run test
```

### Run E2E tests
Run tests that load the full application (via a test helper which provides setup/teardown and utility functions),
make requests using supertest like a real API user, and assert on the results

```shell
npm run test:e2e
```

### Run unit tests
Run tests which focus on isolated functionality directly, covering cases E2E tests miss and features which benefit from internal testing

```shell
npm run test:unit
```

