# Backend How To

## How to run dev server

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

## How to run tests

1. Navigate to the backend folder
2. Optionally create a Python virtual environment
    ```sh
    python -m venv venv
    ```

3. Install the dependencies by running
    ```sh
    pip install -r requirements.txt
    ```
4. Install the project to the virtual environment
    ```sh
    pip install -e .
    ```
5. Run the tests
    ```sh
    pytest
    ```

### Coverage reports

1. Follow steps 1-4 from the previous section
2. Run the tests with coverage
    ```sh
    coverage run -m pytest
    ```
3. Generate the coverage report
   ```sh
    coverage report
   ```
4. (Optional) Generate an HTML report
    ```sh
    coverage html
    ```
   The HTML report will be generated in the `htmlcov` folder