from airflow import DAG
from datetime import datetime, timedelta
from airflow.operators.python_operator import PythonOperator, BranchPythonOperator
import os
from convert_images_bftools_utils import plate_wells_384
import pandas as pd
from pandas import DataFrame
from airflow.operators.subdag_operator import SubDagOperator
import typing
from convert_images_bftools_utils import get_cell_images_df, convert_cell_image_template, run_system_command
from typing import List
from cellprofiler_utils import create_input_csv
import random
import subprocess
from pprint import pprint

"""Test out with Python
import requests
import json
conf = {'barcode': 'SK_U2OS_PanelC1_SentinelSerDil2-2',
 'instrument_plate_id': 14269,
 'channels': ['DNA_DRAQ5', 'ER'],
 'instrument_plate_path': '\\\\aduae120-wap\\CS_DATA_SHARE\\2019Feb11\\ADMIN-PC_190217190001\\'}
data = {'run_id': 'TEST-2', 'conf': json.dumps(conf)}
res = requests.post(uri, json=data)
res.content
res.status_code
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
"""
cell_image_analysis_2channels_dag
:param instrument_plate_id : csPlateId in the arrayscan database
:param instrument_plate_path : \\adu-blahblahbalh\\cx5-things
:param barcode - Human readable barcode SK_Restain_plate1
:param image_channels : list of channels ['DNA-ER', 'NUC']
"""
cell_image_analysis_2channels_dag = DAG('cell_image_analysis_2channels', default_args=default_args,
                                        schedule_interval=None)
NUM_CHANNELS = 2


def cell_image_analysis_image_conversion(ds, **kwargs):
    """Convert image from proprietary format to png"""
    well = kwargs['params']['well']
    ti = kwargs['ti']
    images_df = ti.xcom_pull(key='cell_images_df', task_ids='prepare_cellprofiler_csv',
                             dag_id='cell_image_analysis_2channels')
    images_df: DataFrame = images_df.loc[images_df['well'] == well]
    pprint(images_df)
    for idx, row in images_df.iterrows():
        template = convert_cell_image_template(row['instrument_image'], row['converted_image'])
        run_system_command(template)
    return


def cell_image_analysis_generate_image_conversion_task(dag, well):
    return PythonOperator(
        task_id='cell_image_analysis_image_conversion_task_{}'.format(well),
        dag=dag,
        retries=1,
        python_callable=cell_image_analysis_image_conversion,
        provide_context=True,
        params={'well': '{}'.format(well)}
    )


def cell_image_analysis_cellprofiler(ds, **kwargs):
    """Run cellprofiler"""
    well = kwargs['params']['well']
    csv_file_name = os.path.join(os.path.dirname(kwargs['conf']['converted_image']),
                                 '{}_{}.csv'.format(kwargs['conf']['barcode'], well))
    command = """cd /data/gb77/extract_features/SK_U2OS_PanelC1_SentinelSerDil/; \ 
    docker run \
        -v /mnt/image:/mnt/image:z -v $(pwd):$(pwd):z quay.io/nyuad_cgsb/chemgen-cellprofiler:2.3.1 \
        cellprofiler --run --run-headless \
        -p /data/gb77/extract_features/SK_U2OS_PanelC1_SentinelSerDil/SK_U2OS_PanelC1_SentinelSerDil1-3/DNA_DRAQ5-ER.cppipe \
        --data-file={} -c -r
    """.format(csv_file_name)
    run_system_command(command)
    return


def cell_image_analysis_generate_cellprofiler_task(dag: DAG) -> List[PythonOperator]:
    """
    TODO This actually needs to be changed to a BashOperator
    :param dag: DAG to assign the task to
    :param well: Well to run - A01, A02, etc
    :return:
    """
    ops = []
    for well in plate_wells_384()[50:55]:
        ops.append(PythonOperator(
            task_id='cell_image_analysis_cellprofiler_task_{}'.format(well),
            dag=dag,
            retries=1,
            python_callable=cell_image_analysis_cellprofiler,
            provide_context=True,
            params={'well': '{}'.format(well)}
        ))
    return ops


def cell_image_analysis_combine_csv_task(ds, **kwargs):
    pass


cell_image_analysis_combine_cellprofiler_csvs = PythonOperator(
    task_id='cell_image_analysis_combine_cellprofiler_csvs',
    dag=cell_image_analysis_2channels_dag,
    trigger_rule='one_success',
    retries=1,
    python_callable=cell_image_analysis_combine_csv_task,
    provide_context=True
)


def cell_image_analysis_no_images_to_run(ds, **kwargs):
    return


cell_image_analysis_no_images_to_run_op = PythonOperator(
    task_id='cell_image_analysis_no_images_to_run',
    dag=cell_image_analysis_2channels_dag,
    python_callable=cell_image_analysis_no_images_to_run,
    provide_context=True
)


def cell_image_analysis_decide_run_cellprofiler(ds, **kwargs):
    """
    Not all panels are run with all possible plate images
    Example: Most skip the A column
    Use the DataFrame from the prepare_cellprofiler_csv task and filter it based on the well
     to ensure the images actually exist
     If images exist for that well then RUN IT
    :param ds: Datetime executed
    :param kwargs: kwargs passed in by Airflow params, conf, ti
    :return:
    """
    well = kwargs['params']['well']
    ti = kwargs['ti']
    channels = kwargs['conf']['channels']

    images_df = ti.xcom_pull(key='cell_images_df', task_ids='prepare_cellprofiler_csv')
    images_df: DataFrame = images_df.loc[images_df['well'] == well]
    print('Filtering Based on if image exists')
    pprint(images_df)
    for index, row in images_df.iterrows():
        print('Searching for: {}'.format(row['converted_image']))
        if not os.path.exists(row['converted_image']):
            print('Image {} does not exist'.format(['converted_image']))
            images_df.drop(index, inplace=True)
        else:
            print('Image {} exists'.format(row['converted_image']))
    print('Should only have the images that exist')
    pprint(images_df)
    if images_df.shape[0] >= 1:
        # TODO Right out the cellprofiler csv file
        cellprofiler_input_csv = create_input_csv(channels, images_df)
        csv_file_name = os.path.join(os.path.dirname(kwargs['conf']['converted_image']),
                                     '{}_{}.csv'.format(kwargs['conf']['barcode'], well))
        cellprofiler_input_csv.to_csv(csv_file_name, index=False)
        return 'cell_image_analysis_cellprofiler_task_{}'.format(well)
    else:
        return 'cell_image_analysis_no_images_to_run'


def cell_image_analysis_generate_decide_run_cellprofiler(dag: DAG) -> List[BranchPythonOperator]:
    tasks = []
    for well in plate_wells_384()[50:55]:
        tasks.append(BranchPythonOperator(dag=dag,
                                          task_id='cell_image_analysis_decide_run_cellprofiler_{}'.format(
                                              well),
                                          params={'well': well},
                                          provide_context=True,
                                          python_callable=cell_image_analysis_decide_run_cellprofiler))
    return tasks


def cell_image_analysis_generate_tasks(num_channels: int, dag: DAG):
    """This generates the task graph for first converting the images,
    one per well per field per channels, then running cellprofiler, one per well per field
    :param num_channels:
    :param dag
    :return:
    """
    wells = plate_wells_384()[50:55]
    for well in wells:
        cell_image_analysis_generate_image_conversion_task(
            dag,
            well)


def generate_image_conversion_sub_dag(parent_dag_name, child_dag_name, start_date, schedule_interval):
    """This generates the image_conversion subdag
    A subdag basically acts like an array of tasks, at least in this case"""

    image_conversion = DAG(
        '%s.%s' % (parent_dag_name, child_dag_name),
        schedule_interval=schedule_interval,
        start_date=start_date,
    )
    cell_image_analysis_generate_tasks(NUM_CHANNELS, image_conversion)
    return image_conversion


image_conversion_dag = SubDagOperator(
    subdag=generate_image_conversion_sub_dag('cell_image_analysis_2channels', 'image_conversion', datetime(2019, 1, 1),
                                             cell_image_analysis_2channels_dag.schedule_interval),
    task_id='image_conversion',
    dag=cell_image_analysis_2channels_dag,
)


def prepare_cellprofiler_csv(ds, **kwargs):
    """Prepare the cellprofiler csv based on the args"""
    df = get_cell_images_df(**kwargs)
    kwargs['ti'].xcom_push(key='cell_images_df', value=df)
    return


prepare_cellprofiler_csv_op = PythonOperator(
    task_id='prepare_cellprofiler_csv',
    provide_context=True,
    python_callable=prepare_cellprofiler_csv,
    dag=cell_image_analysis_2channels_dag
)

prepare_cellprofiler_csv_op.set_downstream(image_conversion_dag)
cellprofiler_tasks = cell_image_analysis_generate_cellprofiler_task(cell_image_analysis_2channels_dag)
cellprofiler_branch_tasks = cell_image_analysis_generate_decide_run_cellprofiler(cell_image_analysis_2channels_dag)
image_conversion_dag.set_downstream(cellprofiler_branch_tasks)

cell_image_analysis_no_images_to_run_op.set_upstream(cellprofiler_branch_tasks)

for idx, cellprofiler_branch_task in enumerate(cellprofiler_branch_tasks):
    cellprofiler_branch_task.set_downstream(cellprofiler_tasks[idx])

cell_image_analysis_combine_cellprofiler_csvs.set_upstream(cellprofiler_tasks)
