from airflow import DAG
from datetime import datetime, timedelta
from airflow.operators.bash_operator import BashOperator
import os
from pprint import pprint
from jinja2 import Environment, BaseLoader
from os import path
import pandas as pd
import glob
import re
import pydash

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


def generate_convert_images_commands(plates):
    """ Plates should be a list of objects that look like this -
     {'csPlateid': 14480,
      'id': 'ADMIN-PC_190425220001',
      'name': 'SK_U2OS_PanA_Sent108_3-4',
      'imagepath': '\\\\aduae120-wap\\CS_DATA_SHARE\\2019Apr22\\ADMIN-PC_190425220001\\'}
    """
    images = []
    for plate in plates:
        instrument_image_dir = plate['imagepath']
        barcode = plate['name']
        parsed_image_path = instrument_image_dir.split('\\')
        folder = parsed_image_path[4]
        image_id = parsed_image_path[5]
        plate_id = plate['id']
        image_path = ''.join([
            '/mnt/Plate_Data/',
            folder, '/',
            image_id, '/',
            image_id
        ])

        out_dir = '/mnt/image/'
        make_dir = out_dir + folder + '/' + plate_id
        os.makedirs(make_dir, exist_ok=True)

        files = glob.glob('{}*.C01'.format(image_path))
        for file in files:
            # This gets the channel/field
            # This could be split further if necessary
            # The first \w{3} is the well
            # Second \w{3} is the field
            # \w{2} is the channel ( i think )
            # m = re.search('(\w{3})(\w{3})(\w{2}).C01', file)
            m = re.search('(\w{3})(\w{5}).C01', file)
            well = m.group(1)
            ext = m.group(2)
            assay_name = barcode + '_' + well
            # instrument_image = image_path + '_' + well + ext + '.C01'
            base_image = make_dir + '/' + assay_name + '.png'
            autolevel_image = make_dir + '/' + assay_name + '-autolevel.png'
            # This is where the actual bftools command is generated
            bftools_command = 'bfconvert -nogroup -overwrite "{}" "{}"'.format(file, base_image)
            imagemagick_command = 'convert -auto-level "{}" "{}"'.format(base_image, autolevel_image)
            images.append({'instrument_image': file, 'converted_image': base_image,
                           'group': '{}{}'.format(well, ext), 'well': well, 'field': ext,
                           "imagemagick_command": imagemagick_command,
                           "bftools_command": bftools_command})

    return images


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

