# Frontend Development How To

Before starting, ensure [Node.js](https://nodejs.org/en) is installed.

1. Install the dependencies by running
    ```sh
    npm i
    ```
2. Create a `.env` file from the `.env.example` file and input your GitHub App client ID and secret and backend url.
    1. `NEXTAUTH_URL` can be left as its default value
    2. For dev `NEXTAUTH_SECRET` can be left as its default value, for prod it should be changed to a random string

3. Run the frontend dev server with the following command
    ```sh
    npm run dev
    ```

The frontend will be running on [http://localhost:3000](http://localhost:3000)