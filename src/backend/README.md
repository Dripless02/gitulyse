# Backend Development How To

## How to run dev server

Before starting, ensure [Python](https://www.python.org/downloads/) is installed and that you have a MongoDB instance
you can connect to.

1. Optionally create a Python virtual environment
    ```sh
    python -m venv venv
    ```

2. Install the dependencies by running
    ```sh
    pip install -r requirements.txt
    ```

3. Install the project to the virtual environment
    ```sh
    pip install -e .
    ```

4. Create a `.env` file from the `.env.example` file and input your MongoDB URI

5. Run the backend.
    ```sh
    flask run --debug
    ```

The API will be running on [http://localhost:5000](http://localhost:5000)

## How to run tests

1. Optionally create a Python virtual environment
    ```sh
    python -m venv venv
    ```

2. Install the dependencies by running
    ```sh
    pip install -r requirements.txt
    ```
3. Install the project to the virtual environment
    ```sh
    pip install -e .
    ```
4. Run the tests
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