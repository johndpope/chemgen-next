import glob
import os
import random

base_image_dirs = ['2014*', '2015*', '2016*', '2017*', '2018*', '2019*']
file_patterns_to_glob = ['*bmp', '*1080x1080.jpeg', '*1080x675.jpeg', '*150x150.jpeg', '*400x400.jpeg', '*300x300.jpeg',
                         '*400x250.jpeg',
                         '*400x284.jpeg', '*510x384.jpeg', '*600x600.jpeg', '*.tiff']


def get_dirs_by_glob(glob_pattern):
    return glob.glob(glob_pattern)


random.shuffle(base_image_dirs)
for base_image_dir in base_image_dirs:
    image_dir_by_date = '/mnt/image/{}'.format(base_image_dir)
    image_dirs_by_date = get_dirs_by_glob(image_dir_by_date)
    random.shuffle(image_dirs_by_date)
    for image_dir_by_date in image_dirs_by_date:
        if os.path.isdir(image_dir_by_date):
            image_dirs_by_plate_id = get_dirs_by_glob('{}/*'.format(image_dir_by_date))
            random.shuffle(image_dirs_by_plate_id)
            for image_dir_by_plate_id in image_dirs_by_plate_id:
                for file_pattern_to_glob in file_patterns_to_glob:
                    files = get_dirs_by_glob('{}/{}'.format(image_dir_by_plate_id, file_pattern_to_glob))
                    random.shuffle(files)
                    print(files[0:1])
                    for file in files:
                        if os.path.isfile(file):
                            os.remove(file)
