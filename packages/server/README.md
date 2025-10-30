# `@headbase-app/server`
The Headbase server for cloud backups and cross-device synchronisation built using Nest.js.

If you just want to self-host a sever instance, it's recommended to use Docker and follow the [self-hosting instructions](../../docs/self-hosting/index.md) rather than setting up this project from scratch.

## Local development setup

### 0. Prerequisites
- [PostgreSQL](https://www.postgresql.org/download/) is used for the application database.
- [Redis](https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/) is used for caching and token storage.
- S3/S3-compatible object storage is used for storing file chunks, for example [Cloudflare R2](https://www.cloudflare.com/en-gb/developer-platform/products/r2/).
- Emails are sent using SMTP, so an email provider like [Mailgun](https://www.mailgun.com/) is required (local dev can log emails without sending).

### 1. Setup database

The required actions here will depend on how you personally want to run your database, for example using a local postgres install or connecting to a remote development database.
If in doubt, it's recommended to run a local database as E2E tests run constant setup/teardown tasks.

Migrations are ran at runtime by the application, so simply ensure you have a blank database and set your `DATABASE_URL` environment variable correctly.

#### Example local setup steps:

Run `psql postgres` and then:
```bash
create user headbase with password 'password' login;
create database headbase;
\c headbase
grant create on schema public to headbase;
grant create on database headbase to headbase;
create extension if not exists "uuid-ossp";
```

### 2. Install dependencies
```shell
npm install
```

### 3. Setup environment
You will have to configure environment variables, especially `AUTH_*` and `DATABASE_URL` if you edited the `setup.sql` script or created your database a different way.
```shell
cp .env.example .env
```

## Running the app

### Development mode
```bash
# run app in dev mode
$ npm start

# run in watch mode, restarting server on file changes
$ npm run start:watch
```

### Production build

```bash
# build the application, outputting to ./dist/
$ npm run build

# run the production build in ./dist/
$ npm run start:prod
```

## Testing the app

### Run all tests
```bash
# run all tests (e2e and unit)
$ npm run test

# run test coverage
$ npm run test:cov
```

### Run E2E tests
Run E2E tests that use supertest to make API requests against the application like a real user.
This is done by using an E2E test helper `./testing/e2e-helper.ts` which provides setup/teardown of the app and utility functions.

```bash
$ npm run test:e2e
```

### Run unit tests
Run unit tests which focus on testing isolated functionality directly, covering cases E2E tests miss and features which benefit from extra internal testing.
These tests don't spin up the full application or depend on external setup, utilising mocking when required instead.

```bash
$ npm run test:unit
```
