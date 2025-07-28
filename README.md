# Flask API Job Queue System

## Project Description
This project is a web scraping and job queue system that allows users to perform various network-related operations, such as:

- **Ping testing** to check the availability of a host
- **Port scanning** for detecting open ports on a server
- **Whois lookup** for domain information
- **OS detection** using nmap
- **Katana URL scraping** to extract links from a given URL
- **HTTP header fetching** for the given URL
- **Command execution** for running custom commands on the server

It leverages **Flask API** to handle requests and **RabbitMQ** for managing asynchronous jobs. The results are stored in a **PostgreSQL** database and can be retrieved via a **REST API**. The system is containerized using **Docker** for easy deployment and scalability.

## Technologies Used
- **Flask**: A micro web framework used for creating the API.

- **RabbitMQ**: A message broker used for managing and distributing jobs.

- **PostgreSQL**: A relational database used to store job results.

- **Docker**: Used for containerization and deployment of services.

- **React**: A JavaScript library for building the frontend.

- **Material UI (MUI)**: A modern React UI framework used for building interactive and responsive components in the frontend

- **Nmap**: Used for OS detection.

- **Katana**: A tool for URL scraping.

- **Requests**: Used for making HTTP requests (for HTTP header fetching).

## Project Structure

```
deneme/
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
```
git clone https://github.com/yourusername/flask_api_egitim.git
cd flask_api_egitim/deneme
```

### 2. Build and start the Docker containers:
```
docker-compose up --build
```
This will build and start the containers for the Flask API, Worker, RabbitMQ, PostgreSQL, and Frontend.


### 3. Install dependencies:

For the API and Worker, dependencies are listed in the requirements.txt file. They will be installed automatically by Docker. If you want to install them manually, use the following:
```
pip install -r requirements.txt
```
#### 3.1. Install Frontend Particles Dependencies
To install the necessary dependencies for the animated background, you must run the following command in the terminal inside the frontend folder:
```
cd deneme/frontend
npm install @tsparticles/react @tsparticles/slim
```

### 4. Set up Environment Variables:
Make sure to set up the following environment variables in your local machine or within the docker-compose.yml file:

- RABBITMQ_HOST

- RABBITMQ_USER

- RABBITMQ_PASS

- DB_HOST

- DB_NAME

- DB_USER

- DB_PASS

### 5. Create the results Table in PostgreSQL

Once your containers are running, the system expects a table named results in your PostgreSQL database to store job results. Run the following commands at terminal to manually create the table:
```
docker exec -it deneme_db psql -U user -d jobs
```
Then, inside the PostgreSQL prompt, execute:
```
CREATE TABLE results (
    id SERIAL PRIMARY KEY,
    job_type TEXT,
    result TEXT,
    job_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Usage
Once the containers are up and running, you can use the system through the provided REST API. The following endpoints are available:

**Endpoint:** 
```
POST /jobs/run
```

**Description:**

Submit a job by sending the job type and necessary parameters as JSON.


**Available Job Types:**
- ping

- port_scan

- whois_lookup

- os_detection

- katana

- http_headers

- command

**Example JSON:**
```
{
  "job_type": "ping",
  "target": "example.com"
}
```
**Get Result by Job ID**
**Endpoint:**
```
GET /results/latest?job_id=<job_id>
```
Returns the result of a specific job using its ID.

**Get the Last 10 Results**
**Endpoint:**
```
GET /results
```

### Frontend Integration
Once the backend is running, the results will be automatically fetched and displayed on the React frontend. You can:

#### Submit a Job via the UI:

- Use the frontend UI to select a job type and enter the required target or parameters.
- Jobs will be sent to the backend via the /jobs/run endpoint.

#### View Job Results:

- The frontend will automatically display the job results as they are completed.
- Results are fetched from the backend and shown on the frontend in real-time.

### Example Flow
1. The user opens the React frontend at `http://localhost:5173`.
2. The user selects a job type (e.g., `ping`, `port_scan`, `katana`, etc.) from the UI.
3. The user enters the required input (such as a domain, IP address, or command).
4. The frontend sends a POST request to the `/jobs/run` endpoint with the job data.
5. The backend receives the job, sends it to RabbitMQ.
6. The worker service picks up the job, processes it (e.g., runs `nmap`, `ping`, etc.).
7. Once the job is done, the worker saves the result to the PostgreSQL database.
8. The frontend polls the backend (e.g., `/results/latest?job_id=...`) to fetch the result.
9. The result is displayed on the UI in real-time, with a download button and status.
