from jinja2 import Environment, BaseLoader
import subprocess
from builtins import bytes
import os
import signal
from subprocess import Popen, STDOUT, PIPE
import tempfile
from tempfile import gettempdir, NamedTemporaryFile
from os import path
import pandas as pd


def split_well_to_row_col(well):
    """Split a well to row, col
    A01 -> (A, 1)
    A11 -> (A, 11)
    """
    t = list(well)
    row = t[0]
    if str(well[1]) is '0':
        col = t[2]
    else:
        col = t[1] + t[2]
    return row, col


def plate_wells_384():
    rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P']
    cols = ['01', '02', '03', '04', '05',
            '06', '07', '08', '09', '10', '11', '12',
            '13', '14', '15', '16', '17', '18', '19',
            '20', '21', '22', '23', '24'
            ]
    wells = []
    for row in rows:
        for col in cols:
            wells.append('{}{}'.format(row, col))
    return wells


def plate_wells_96():
    rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    cols = ['01', '02', '03', '04', '05',
            '06', '07', '08', '09', '10', '11', '12',
            ]
    wells = []
    for row in rows:
        for col in cols:
            wells.append('{}{}'.format(row, col))
    return wells


def get_field_channel_extensions(channels: list):
    image_channels = []

    for image_field in range(0, 9):
        for channel in range(0, len(channels)):
            image_channels.append(['f0{}'.format(image_field), 'd{}'.format(channel)])

    return image_channels


def get_well_field():
    wells = plate_wells_384()
    groups = []
    for well in wells:
        for field in range(0, 9):
            groups.append('{}f0{}'.format(well, field))
    return groups


def convert_cell_image_template(instrument_image, converted_image):
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


def get_cell_images_df(**kwargs):
    instrument_image_dir = kwargs['dag_run'].conf['instrument_plate_path']
    instrument_plate_id = str(kwargs['dag_run'].conf['instrument_plate_id'])
    barcode = kwargs['dag_run'].conf['barcode']
    channels = kwargs['dag_run'].conf['channels']
    parsed_image_path = instrument_image_dir.split('\\')
    folder = parsed_image_path[4]
    image_id = parsed_image_path[5]
    plate_id = instrument_plate_id
    image_path = ''.join([
        '/mnt/Plate_Data/',
        folder, '/',
        image_id, '/',
        image_id
    ])

    out_dir = '/mnt/image/cells/'
    make_dir = out_dir + folder + '/' + plate_id
    image_channels = get_field_channel_extensions(channels)

    images = []
    for well in plate_wells_384():
        for ext in image_channels:
            image_field = ext[0]
            channel = ext[1]
            ext = '{}{}'.format(image_field, channel)
            assay_name = barcode + '_' + well + ext
            instrument_image = image_path + '_' + well + ext + '.C01'
            base_image = make_dir + '/' + assay_name + '.png'
            # The group is later to group images by Well and Field so that it can be analyzed by cellprofiler
            images.append({'instrument_image': instrument_image, 'converted_image': base_image,
                           'cellprofiler_image_base': make_dir + '/' + barcode + '_' + well + image_field,
                           'group': '{}{}'.format(well, image_field), 'well': well, 'field': image_field})

    return pd.DataFrame.from_records(images)


# WIP

def convert_worm_image_template(instrument_image, converted_image, base_image):
    """
    For wormm images we  convert the instrument proprietary image to png
    And add in some autolevel correction
    As well as jpegs for web
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
        convert -auto-level -quality 100 "{{converted_image}}" "{{base_image}}-autolevel.png"
        convert -strip -layers flatten -quality 50 "{{base_image}}-autolevel.png" "{{base_image}}-autolevel.jpeg"
    fi
fi
    """
    template = Environment(loader=BaseLoader).from_string(convert_template)
    return template.render(
        {'instrument_image': instrument_image, 'base_image': base_image, 'make_this_dir': make_this_dir,
         'converted_image': converted_image})


def get_worm_images_df(**kwargs):
    instrument_image_dir = kwargs['dag_run'].conf['instrument_plate_path']
    instrument_plate_id = str(kwargs['dag_run'].conf['instrument_plate_id'])
    barcode = kwargs['dag_run'].conf['barcode']
    channels = kwargs['dag_run'].conf['channels']
    wells = plate_wells_384()
    parsed_image_path = instrument_image_dir.split('\\')
    folder = parsed_image_path[4]
    image_id = parsed_image_path[5]
    plate_id = instrument_plate_id
    image_path = ''.join([
        '/mnt/Plate_Data/',
        folder, '/',
        image_id, '/',
        image_id
    ])

    out_dir = '/mnt/image/cells/'
    make_dir = out_dir + folder + '/' + plate_id
    images = []
    image_channels = get_field_channel_extensions(channels)

    # TODO Need to do some manner of filtering to ensure the image actually exists
    for well in wells:
        ext = 'f00d0'
        assay_name = barcode + '_' + well
        instrument_image = image_path + '_' + well + ext + '.C01'
        base_image = make_dir + '/' + assay_name + '.png'
        images.append({'instrument_image': instrument_image, 'converted_image': base_image,
                       'converted_image_base': make_dir + '/' + assay_name,
                       'well': well, 'field': ext})

    return pd.DataFrame.from_records(images)


def run_system_command(bash_command: str):
    print('================================================')
    print('Executing command:')
    print(bash_command)
    print('================================================')
    with NamedTemporaryFile(dir=tempfile.tempdir) as f:

        f.write(bytes(bash_command, 'utf_8'))
        f.flush()
        fname = f.name
        script_location = os.path.abspath(fname)
        print(
            "Temporary script location: %s",
            script_location
        )

        def pre_exec():
            # Restore default signal disposition and invoke setsid
            for sig in ('SIGPIPE', 'SIGXFZ', 'SIGXFSZ'):
                if hasattr(signal, sig):
                    signal.signal(getattr(signal, sig), signal.SIG_DFL)
            os.setsid()

        print("Running command: %s", bash_command)
        sp = Popen(
            ['bash', fname],
            stdout=PIPE, stderr=STDOUT,
            cwd=tempfile.tempdir, env=os.environ.copy(),
            preexec_fn=pre_exec)

        print("Output:")
        line = ''
        for line in iter(sp.stdout.readline, b''):
            line = line.decode('utf-8').rstrip()
            print(line)
        sp.wait()
        print(
            "Command exited with return code %s",
            sp.returncode
        )

        if sp.returncode:
            print("Bash command failed {}".format(sp.returncode))
        else:
            print('Command succeeded.')
