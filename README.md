# Web Scraper and Job Queue System

## Project Description
This project is a web scraping and job queue system that allows users to perform various network-related operations, such as:

- **Ping testing** to check the availability of a host
- **Port scanning** for detecting open ports on a server
- **Whois lookup** for domain information
- **OS detection** using nmap
- **Katana URL scraping** to extract links from a given URL
- **HTTP header fetching** for the given URL

It leverages **Flask API** to handle requests and **RabbitMQ** for managing asynchronous jobs. The results are stored in a **PostgreSQL** database and can be retrieved via a **REST API**. The system is containerized using **Docker** for easy deployment and scalability.

## Project Structure

```
project_name/
│
├── docker-compose.yml       # Docker Compose configuration file to spin up services
├── Dockerfile.api           # Dockerfile for the Flask API service
├── Dockerfile.worker        # Dockerfile for the worker service
├── Dockerfile.frontend      # Dockerfile for the React frontend
├── requirements.txt         # Python dependencies for API and worker
│
├── /frontend                # React frontend
│   ├── /src                 # Source code for the frontend
│   └── /public              # Static assets (index.html, etc.)
│
├── worker.py               # Python worker handling the job execution
├── main.py                 # Flask API handling incoming requests
└── vite.config.js          # Vite configuration for frontend development
```

## Environment Variables
The application requires several environment variables to be set up for proper configuration:

- `RABBITMQ_HOST`: The hostname of the RabbitMQ server (default: `rabbitmq`)
- `RABBITMQ_USER`: The RabbitMQ username (default: `guest`)
- `RABBITMQ_PASS`: The RabbitMQ password (default: `guest`)
- `DB_HOST`: The hostname of the PostgreSQL database (default: `db`)
- `DB_NAME`: The name of the PostgreSQL database (default: `jobs`)
- `DB_USER`: The PostgreSQL username (default: `user`)
- `DB_PASS`: The PostgreSQL password (default: `password`)

## Setup
Follow the steps below to get the project up and running.

### 1. Clone the repository:
```bash
git clone https://github.com/yourusername/project-name.git
cd project-name

2. Build and start the Docker containers:
docker-compose up --build
This will build and start the containers for the Flask API, Worker, RabbitMQ, PostgreSQL, and Frontend.

3. Install dependencies:
For the API and Worker, dependencies are listed in the requirements.txt file. They will be installed automatically by Docker. If you want to install them manually, use the following:
pip install -r requirements.txt

