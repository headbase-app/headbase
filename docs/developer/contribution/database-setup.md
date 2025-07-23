# Database

1. Ensure postgres 15 is installed and set up locally.
```bash
# Install postgres 15
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo tee /etc/apt/trusted.gpg.d/pgdg.asc &>/dev/null
sudo apt update
sudo apt install postgresql-15 postgresql-client-15 -y
sudo systemctl start postgresql.service

# Create a new user (use your username)
sudo -u postgres createuser --interactive
```

2. Create the database & user that will be used.
```bash
# This will create a db & user.
npm run db:init
```

4. Copy the `.env.example` file and edit as required.
```bash
cp .env.example .env
```

5. Rather than setting up a fresh database, you could also restore an existing local backup:
```bash
# This will restore an existing backup done with `npm run db:dump`.
npm run db:restore
```
