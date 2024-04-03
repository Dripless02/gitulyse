FROM python:3.12.1-alpine
WORKDIR /app
ENV FLASK_APP=gitulyse_api
ENV FLASK_RUN_HOST=0.0.0.0
RUN apk add --no-cache gcc musl-dev linux-headers
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt
EXPOSE 5000
COPY . .
RUN pip install -e .
CMD flask run