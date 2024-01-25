# Backend How To

Before starting, ensure [Python](https://www.python.org/downloads/) is installed

1. Navigate to the backend folder
2. Optionally create a Python virtual environment
    ```sh
    python -m venv venv
    ```

3. Install the dependencies by running 
    ```sh
    pip install -r requirements.txt
    ```

4. Create a `.env` file from the `.env.example` file and input your GitHub App client ID and secret

5. Run the backend.
    ```sh
    flask run --debug
    ```

The backend will be running on [http://localhost:5000](http://localhost:5000)