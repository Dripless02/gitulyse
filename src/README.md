# How to Run

## Prerequisites

- [Python](https://www.python.org/downloads/)
- [Node.js](https://nodejs.org/en/download/)
- [Docker](https://docs.docker.com/engine/install/)
- [GitHub OAuth App Client ID and Secret](https://github.com/settings/developers)

## Steps

To run the development environment, follow these steps:

1. Create a `.env` file from the `.env.example` file
2. Run the following command:
    ```sh
    docker compose up -d
    ```
3. To take down the dev environment, run the following command
   ```sh
   docker compose down
   ```