from flask import Flask, request, jsonify
import pika
import json
import logging
import psycopg2
import os
import whois

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)

DB_HOST = os.environ.get("DB_HOST", "db")
DB_NAME = os.environ.get("POSTGRES_DB", "jobs")
DB_USER = os.environ.get("POSTGRES_USER", "user")
DB_PASS = os.environ.get("POSTGRES_PASSWORD", "password")

@app.route('/jobs/run', methods=['POST'])
def run_job():
    job_data = request.get_json()

    try:
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(host='rabbitmq')
        )
        channel = connection.channel()

        channel.queue_declare(queue='job_queue', durable=True)

        channel.basic_publish(
            exchange='',
            routing_key='job_queue',
            body=json.dumps(job_data),
            properties=pika.BasicProperties(
                delivery_mode=2
            )
        )

        logging.info(f"Job sent to queue: {job_data}")
        connection.close()

        return jsonify({"message": "Job added to queue"}), 200

    except Exception as e:
        logging.error(f"Failed to send job: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/results", methods=["GET"])
def get_results():
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASS
        )
        cur = conn.cursor()
        cur.execute("SELECT id, job_type, result, created_at FROM results ORDER BY created_at DESC LIMIT 10")
        rows = cur.fetchall()
        cur.close()
        conn.close()

        results = []
        for row in rows:
            results.append({
                "id": row[0],
                "job_type": row[1],
                "result": row[2],
                "created_at": row[3].isoformat()
            })

        return jsonify(results)

    except Exception as e:
        logging.error(f"Failed to fetch results: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

