from airflow import DAG
from datetime import datetime, timedelta
from airflow.operators.bash_operator import BashOperator
import os
from pprint import pprint
from jinja2 import Environment, BaseLoader
from os import path
import pandas as pd

default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'start_date': datetime(2015, 6, 1),
    'email': ['airflow@example.com'],
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}
dag = DAG('image_conversion_worms', default_args=default_args, schedule_interval=None)


def convert_worm_image_template(instrument_image, converted_image):
    """
    For cell images we just convert the instrument proprietary image to png
    No autolevel correction needed
    :param instrument_image:
    :param converted_image:
    :return:
    """
    make_this_dir = path.dirname(converted_image)
    convert_template = """
if [ -f {{instrument_image}} ]; then
mkdir -p {{make_this_dir}}
    if [ ! -f {{converted_image}} ]; then
        bfconvert -nogroup -overwrite "{{instrument_image}}" "{{converted_image}}"
    fi
fi
    """
    template = Environment(loader=BaseLoader).from_string(convert_template)
    return template.render(
        {'instrument_image': instrument_image, 'make_this_dir': make_this_dir, 'converted_image': converted_image})


def generate_image_convert_task(**kwargs):
    image_convert_command = """
{{ dag_run.conf["image_convert_command"] }}
"""
    image_convert_command_task = BashOperator(
        task_id='image_convert_command',
        dag=dag,
        retries=1,
        bash_command=image_convert_command,
    )
    return image_convert_command_task

