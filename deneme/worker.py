import pika
import json
import time
import logging
import os
import subprocess
import psycopg2
import whois
import socket
import requests

logging.basicConfig(level=logging.INFO)

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "rabbitmq")
RABBITMQ_USER = os.getenv("RABBITMQ_USER", "guest")
RABBITMQ_PASS = os.getenv("RABBITMQ_PASS", "guest")
DB_HOST = os.getenv("DB_HOST", "db")
DB_NAME = os.getenv("POSTGRES_DB", "jobs")
DB_USER = os.getenv("POSTGRES_USER", "user")
DB_PASS = os.getenv("POSTGRES_PASSWORD", "password")


def save_result_to_db(job_type, result, job_id):
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASS
        )
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO results (job_type, result, job_id, created_at) VALUES (%s, %s, %s, NOW())",
            (job_type, result, job_id)
        )
        conn.commit()
        cur.close()
        conn.close()
        logging.info(f"Sonuç veritabanına kaydedildi: job_id={job_id}")
    except Exception as e:
        logging.error(f"Sonuç kaydedilemedi: {e}")


def execute_command_job(job):
    command = job.get("command")
    job_id = job.get("job_id")
    if not command or not job_id:
        logging.warning("Eksik command veya job_id.")
        return
    try:
        logging.info(f"Running command: {command}")
        result = subprocess.run(command, shell=True, check=True,
                                stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        output = result.stdout.decode()
        save_result_to_db("command", output, job_id)
    except subprocess.CalledProcessError as e:
        save_result_to_db("command", f"Error: {e.stderr.decode()}", job_id)


def execute_katana_job(job):
    url = job.get("url")
    job_id = job.get("job_id")
    if not url or not job_id:
        logging.warning("Eksik url veya job_id.")
        return
    try:
        logging.info(f"Running katana on: {url}")
        result = subprocess.run(["katana", "-u", url, "-silent"], check=True,
                                stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        output = result.stdout.decode().strip()
        urls = output.split("\n") if output else []
        summary = f"{len(urls)} URLs found for {url}"
        preview = "\n".join(urls[:5])
        final_result = f"{summary}\nSample URLs:\n{preview}" if urls else summary
        save_result_to_db("katana", final_result, job_id)
    except subprocess.CalledProcessError as e:
        save_result_to_db("katana", f"Error: {e.stderr.decode()}", job_id)


def execute_ping_job(job):
    target = job.get("target")
    job_id = job.get("job_id")
    if not target or not job_id:
        logging.warning("Eksik target veya job_id.")
        return
    try:
        logging.info(f"Pinging: {target}")
        result = subprocess.run(f"ping -c 4 {target}", shell=True, check=True,
                                stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        save_result_to_db("ping", result.stdout.decode(), job_id)
    except subprocess.CalledProcessError as e:
        save_result_to_db("ping", f"Error: {e.stderr.decode()}", job_id)


def execute_port_scan_job(job):
    target = job.get("target")
    job_id = job.get("job_id")
    ports = job.get("ports", [22, 80, 443, 3306, 5432])
    if not target or not job_id:
        logging.warning("Eksik target veya job_id.")
        return
    open_ports = []
    for port in ports:
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(1)
                if s.connect_ex((target, port)) == 0:
                    open_ports.append(port)
        except Exception as e:
            logging.error(f"Port scan error: {e}")
    result_text = f"Open ports on {target}: {open_ports}" if open_ports else f"No open ports found on {target}."
    save_result_to_db("port_scan", result_text, job_id)


def execute_whois_lookup_job(job):
    domain = job.get("domain")
    job_id = job.get("job_id")
    if not domain or not job_id:
        logging.warning("Eksik domain veya job_id.")
        return
    try:
        result = whois.whois(domain)
        save_result_to_db("whois_lookup", str(result), job_id)
    except Exception as e:
        save_result_to_db("whois_lookup", f"Error: {e}", job_id)


def execute_os_detection_job(job):
    target = job.get("target")
    job_id = job.get("job_id")
    if not target:
        logging.warning("No target provided.")
        return
    try:
        logging.info(f"Running OS detection: {target}")
        result = subprocess.run(
            f"nmap -O {target}",
            shell=True,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=180
        )
        save_result_to_db("os_detection", result.stdout.decode(), job_id)
    except subprocess.TimeoutExpired:
        save_result_to_db("os_detection", f"Error: OS detection timed out after 3 minutes", job_id)
    except subprocess.CalledProcessError as e:
        save_result_to_db("os_detection", f"Error: {e.stderr.decode()}", job_id)


def execute_http_headers_job(job):
    url = job.get("url")
    job_id = job.get("job_id")
    if not url or not job_id:
        logging.warning("Eksik url veya job_id.")
        return
    try:
        headers = requests.get(url, timeout=5).headers
        save_result_to_db("http_headers", json.dumps(dict(headers), indent=2), job_id)
    except Exception as e:
        save_result_to_db("http_headers", f"Error: {e}", job_id)


def callback(ch, method, properties, body):
    job = json.loads(body)
    job_type = job.get("job_type")

    logging.info(f"New job received: {job_type}")

    job_func_map = {
        "command": execute_command_job,
        "katana": execute_katana_job,
        "ping": execute_ping_job,
        "port_scan": execute_port_scan_job,
        "whois_lookup": execute_whois_lookup_job,
        "os_detection": execute_os_detection_job,
        "http_headers": execute_http_headers_job,
    }

    func = job_func_map.get(job_type)
    if func:
        func(job)
    else:
        logging.warning(f"Unknown job type: {job_type}")

    logging.info("Job finished.")
    ch.basic_ack(delivery_tag=method.delivery_tag)


while True:
    try:
        credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
        connection = pika.BlockingConnection(pika.ConnectionParameters(
            host=RABBITMQ_HOST, credentials=credentials))
        channel = connection.channel()
        channel.queue_declare(queue="job_queue", durable=True)
        channel.basic_qos(prefetch_count=1)
        channel.basic_consume(queue="job_queue", on_message_callback=callback)

        logging.info("Worker is ready for jobs...")
        channel.start_consuming()
    except pika.exceptions.AMQPConnectionError as e:
        logging.warning(f"RabbitMQ not ready. Retrying in 5s: {e}")
        time.sleep(5)
    except KeyboardInterrupt:
        logging.info("Worker shutting down.")
        try:
            channel.stop_consuming()
            connection.close()
        except:
            pass
        break

