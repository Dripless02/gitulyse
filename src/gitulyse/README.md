# Frontend How To

Before starting, ensure [Node.js](https://nodejs.org/en) is installed

1. Navigate to the frontend folder
2. Install the dependencies by running
    ```sh
    npm i
    ```
3. Create a `.env` file from the `.env.example` file and input your GitHub App client ID and secret and backend url.
   1. For now `NEXTAUTH_SECRET` and `NEXTAUTH_URL` can be left as their default values

4. Run the frontend
    ```sh
    npm run dev
    ```

The frontend will be running on [http://localhost:3000](http://localhost:3000)