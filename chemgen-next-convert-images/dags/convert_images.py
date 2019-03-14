from airflow import DAG
from datetime import datetime, timedelta
from airflow.operators.bash_operator import BashOperator
import os
from pprint import pprint

"""Curl:
localhost:8080/api/dags/image_conversion/dag_runs
{image_conversion_command: 'echo hello'}

 curl -X POST \
    http://localhost:8080/api/experimental/dags/image_conversion/dag_runs \
    -H 'Cache-Control: no-cache' \
    -H 'Content-Type: application/json' \
    -d '{"conf":"{\"image_convert_command\":\"echo hello\"}"}'
"""

this_env = os.environ.copy()

this_dir = os.path.dirname(os.path.realpath(__file__))

default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'start_date': datetime(2019, 1, 1),
    'email': ['airflow@example.com'],
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

dag = DAG('image_conversion', default_args=default_args, schedule_interval=None)

image_convert_command = """
{{ dag_run.conf["image_convert_command"] }}
"""

image_convert_command_task = BashOperator(
    task_id='image_convert_command',
    dag=dag,
    retries=1,
    bash_command=image_convert_command,
)

