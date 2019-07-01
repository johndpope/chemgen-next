import requests
import json
import glob
import re
import os
import pydash

"""
This is meant to be a self contained script to hand over to Glenn.
So he doesn't have to wait around for me to have my act together.
It is kept in this github repo for record keeping purposes 
"""

barcodes_s = """
SK_U2OS_PanA_Sent108_1-3
SK_U2OS_PanA_Sent108_2-2
SK_U2OS_PanA_Sent108_2-4
SK_U2OS_PanA_Sent108_3-3
SK_U2OS_PanA_Sent108_3-4  
SK_U2OS_LAT_Sentinel_Live_20x
"""


def parse_barcodes(barcodes_s):
    barcodes = barcodes_s.split("\n")

    for i in range(0, len(barcodes)):
        barcodes[i] = barcodes[i].strip()

    return list(filter(None, barcodes))


def convert_images(images):
    for image in images:
        if not os.path.exists(image['converted_image']):
            exit_code = convert_image(image)
            image['exit_code'] = exit_code


def convert_image(image):
    print(image)
    exit_code = os.system(image['bftools_command'])
    if exit_code:
        print('Problem converting image: Command: {}'.format(image['bftools_command']))
    return exit_code


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

        out_dir = '/mnt/image/cells/'
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
            assay_name = barcode + '_' + well + ext
            # instrument_image = image_path + '_' + well + ext + '.C01'
            base_image = make_dir + '/' + assay_name + '.png'
            # This is where the actual bftools command is generated
            bftools_command = 'bfconvert -nogroup -overwrite "{}" "{}"'.format(file, base_image)
            images.append({'instrument_image': file, 'converted_image': base_image,
                           'cellprofiler_image_base': make_dir + '/' + barcode + '_' + well + ext,
                           'group': '{}{}'.format(well, ext), 'well': well, 'field': ext,
                           "bftools_command": bftools_command})

    return images


def alert_for_missing_barcodes(barcodes, plates):
    """
    This searches what was returned from the database against the user supplied list of barcodes
    NOTE TO GLENN - Two lists, found and missing are generated
    I don't do anything with these as I assume they will require detective work if anything is missing
    :param barcodes:
    :param plates:
    :return:
    """
    found = []
    missing = []
    for barcode in barcodes:
        if not pydash.find(plates, {'name': barcode}):
            print('Barcode: {} not found!'.format(barcode))
            missing.append(barcode)
        else:
            found.append(barcode)

    if not len(missing):
        print('Found all the barcodes')


def create_filter_object(barcodes, limit=100):
    filter_object = {}
    filter_object['fields'] = {'csPlateid': True, 'imagepath': True, 'id': True, 'name': True}
    filter_object['where'] = {'name': {'inq': barcodes}}
    filter_object['limit'] = limit
    return filter_object


def get_plates(filter_object):
    r = requests.get('http://onyx.abudhabi.nyu.edu:3000/api/Plates', params={'filter': json.dumps(filter_object)})
    plates = r.json()
    for plate in plates:
        print('Found plate: {}'.format(plate['name']))
    return plates


barcodes = parse_barcodes(barcodes_s)
filter_object = create_filter_object(barcodes)
plates = get_plates(filter_object)

print('Checking for missing barcodes...')
alert_for_missing_barcodes(barcodes, plates)

print('Generating image conversion commands... this may take some time')
images = generate_convert_images_commands(plates)
convert_images(images)

