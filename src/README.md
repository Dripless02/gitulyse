# How to Run

## Prerequisites

- [Python](https://www.python.org/downloads/)
- [Node.js](https://nodejs.org/en/download/)
- [Docker](https://docs.docker.com/engine/install/)

## Steps

1. Go to the frontend directory and create a `.env` file from the `.env.example` file and input your GitHub App client
   ID and secret and a random string for the [NEXTAUTH_SECRET](https://next-auth.js.org/configuration/options#secret)
2. Return to the src directory and run the following docker compose command to start the database, backend and frontend
   server

```sh
docker-compose up -d --build
```

3. To stop the servers, run the following docker compose command

```sh
docker-compose down
```