# Apollo Express GraphQL Server Template

## Features

[] Email authentication (Sign in, Sign up, and Reset password)
[] Google / Facebook authentication
[] Profile (Update profile, Delete profile)
[] PostgreSQL database
[] File Upload

## Setting Up a Database

This template uses PostgreSQL as the default database.

The postgres installation doesn't setup a user for you, so you'll need to follow these steps to create a user with permission to create databases. Feel free to replace `apollo-server-express` with your username and remember to update your `.env` file `DB_USERNAME` key.

```sh
sudo -u postgres createuser apollo-server-express -s

# Create the database
npx sequelize db:create
```
