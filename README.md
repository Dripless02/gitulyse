# Gitulyse

Gitulyse is a comprehensive tool designed to analyse GitHub repositories and user data, providing insights and metrics
essential for effective software development management. With its user-friendly interface and powerful features,
Gitulyse offers a holistic view of project history, facilitating informed decision-making and optimisation of
development workflows.

## How to run (Development)

This project uses docker compose to run the development environment.

### Prerequisites

- [Docker](https://docs.docker.com/engine/install/)
- [Python 3.12](https://www.python.org/downloads/)
- [Node.js 20.12.2 LTS](https://nodejs.org/en/download/)
- [GitHub OAuth App Client ID and Secret](https://github.com/settings/developers)

### Steps

To run the development environment, follow these steps:

1. Clone the repository
2. Navigate to the src directory
3. Create a `src/.env` file from the `src/.env.example` file
4. Run the following command:
    ```sh
    docker compose up -d
    ```

5. To take down the dev environment, run the following command
   ```sh
   docker compose down
   ```