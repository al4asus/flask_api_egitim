import pika
import json
import time
import logging
import os
import subprocess
import psycopg2
import whois

logging.basicConfig(level=logging.INFO)

RABBITMQ_HOST = os.environ.get("RABBITMQ_HOST", "rabbitmq")
RABBITMQ_USER = os.environ.get("RABBITMQ_USER", "guest")
RABBITMQ_PASS = os.environ.get("RABBITMQ_PASS", "guest")

DB_HOST = os.environ.get("DB_HOST", "db")
DB_NAME = os.environ.get("POSTGRES_DB", "jobs")
DB_USER = os.environ.get("POSTGRES_USER", "user")
DB_PASS = os.environ.get("POSTGRES_PASSWORD", "password")

def save_result_to_db(job_type, result):
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASS
        )
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO results (job_type, result, created_at) VALUES (%s, %s, NOW())",
            (job_type, result)
        )
        conn.commit()
        cur.close()
        conn.close()
        logging.info("Result saved to database.")
    except Exception as e:
        logging.error(f"Database error: {e}")

def execute_command_job(job):
    command = job.get("command")
    if not command:
        logging.warning("No command provided.")
        return

    try:
        logging.info(f"Running command: {command}")
        result = subprocess.run(command, shell=True, check=True,
                                stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        output = result.stdout.decode()
        logging.info(f"Command output:\n{output}")
        save_result_to_db("command", output)
    except subprocess.CalledProcessError as e:
        error_output = e.stderr.decode()
        logging.error(f"Command failed:\n{error_output}")
        save_result_to_db("command", f"Error: {error_output}")

def execute_katana_job(job):
    url = job.get("url")
    if not url:
        logging.warning("No URL provided for katana job.")
        return

    try:
        logging.info(f"Running katana on URL: {url}")
        result = subprocess.run(
            ["katana", "-u", url, "-silent"],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        output = result.stdout.decode()
        url_list = output.strip().split("\n") if output.strip() else []
        url_count = len(url_list)
        summary = f"{url_count} URLs found for {url}"

        logging.info(summary)
        if url_count > 0:
            preview = "\n".join(url_list[:5])  
            save_result_to_db("katana", f"{summary}\nSample URLs:\n{preview}")
        else:
            save_result_to_db("katana", summary)
    except subprocess.CalledProcessError as e:
        error_output = e.stderr.decode()
        logging.error(f"Katana failed:\n{error_output}")
        save_result_to_db("katana", f"Error: {error_output}")

def execute_ping_job(job):
    target = job.get("target")
    if not target:
        logging.warning("No target provided for ping job.")
        return

    try:
        logging.info(f"Pinging target: {target}")
        result = subprocess.run(f"ping -c 4 {target}", shell=True, check=True,
                                stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        output = result.stdout.decode()
        logging.info(f"Ping output:\n{output}")
        save_result_to_db("ping", output)
    except subprocess.CalledProcessError as e:
        error_output = e.stderr.decode()
        logging.error(f"Ping failed:\n{error_output}")
        save_result_to_db("ping", f"Error: {error_output}")

def execute_port_scan_job(job):
    import socket

    target = job.get("target")
    ports = job.get("ports", [22, 80, 443, 3306, 5432])  

    if not target:
        logging.warning("No target provided for port_scan job.")
        return

    logging.info(f"Scanning ports on {target}...")
    open_ports = []

    for port in ports:
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(1)
                result = s.connect_ex((target, port))
                if result == 0:
                    open_ports.append(port)
        except Exception as e:
            logging.error(f"Error scanning port {port}: {e}")

    result_text = f"Open ports on {target}: {open_ports}" if open_ports else f"No open ports found on {target}."
    logging.info(result_text)
    save_result_to_db("port_scan", result_text)

def execute_whois_lookup_job(job):
    domain = job.get("domain")
    if not domain:
        logging.warning("No domain provided for whois_lookup job.")
        return

    try:
        logging.info(f"Performing whois lookup for: {domain}")
        result = whois.whois(domain)
        save_result_to_db("whois_lookup", str(result))
    except Exception as e:
        logging.error(f"Whois lookup failed: {e}")
        save_result_to_db("whois_lookup", f"Error: {e}")

def execute_os_detection_job(job):
    target = job.get("target")
    if not target:
        logging.warning("No target provided for OS detection.")
        return

    try:
        logging.info(f"Running OS detection on: {target}")
        result = subprocess.run(f"nmap -O {target}", shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        output = result.stdout.decode()
        logging.info(f"OS detection result:\n{output}")
        save_result_to_db("os_detection", output)
    except subprocess.CalledProcessError as e:
        error_output = e.stderr.decode()
        logging.error(f"OS detection failed:\n{error_output}")
        save_result_to_db("os_detection", f"Error: {error_output}")

def check_http_headers(url):
    import requests
    try:
        response = requests.get(url, timeout=5)
        headers = dict(response.headers)
        return json.dumps(headers, indent=2)
    except Exception as e:
        return f"Error fetching headers: {e}"


def callback(ch, method, properties, body):
    job = json.loads(body)
    logging.info(f"Job received: {job}")

    job_type = job.get("job_type")

    if job_type == "command":
        execute_command_job(job)
    elif job_type == "katana":
        execute_katana_job(job)
    elif job_type == "ping":
        execute_ping_job(job)
    elif job_type == "port_scan":
        execute_port_scan_job(job)
    elif job_type == "whois_lookup":
        execute_whois_lookup_job(job)
    elif job_type == "os_detection":
        execute_os_detection_job(job)
    elif job_type == "http_headers":
        url = job.get("url")
        logging.info(f"Checking HTTP headers for: {url}")
        result = check_http_headers(url)
        save_result_to_db("http_headers", result)
    else:
        logging.warning(f"Unknown job type: {job_type}")

    logging.info("Job done.")
    ch.basic_ack(delivery_tag=method.delivery_tag)

while True:
    try:
        logging.info(f"Connecting to RabbitMQ at {RABBITMQ_HOST}...")
        credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
        parameters = pika.ConnectionParameters(host=RABBITMQ_HOST, credentials=credentials)
        connection = pika.BlockingConnection(parameters)
        channel = connection.channel()

        channel.queue_declare(queue='job_queue', durable=True)
        channel.basic_qos(prefetch_count=1)
        channel.basic_consume(queue='job_queue', on_message_callback=callback)

        logging.info("Worker is waiting for jobs...")
        channel.start_consuming()

    except pika.exceptions.AMQPConnectionError as e:
        logging.warning(f"Connection failed: {e}. Retrying in 5 seconds")
        time.sleep(5)
    except KeyboardInterrupt:
        logging.info("Shutting down worker")
        try:
            channel.stop_consuming()
            connection.close()
        except:
            pass
        break

