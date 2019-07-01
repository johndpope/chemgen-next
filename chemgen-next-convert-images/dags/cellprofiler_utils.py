import pandas as pd
from convert_images_bftools_utils import split_well_to_row_col
from os import path
import typing
from typing import List
import os


def create_cellprofiler_input_csv_column_names(channels):
    header_line = ['Metadata_row', 'Metadata_col', 'Metadata_well', 'Metadata_field', 'Metadata_file_CH0',
                   'Metadata_path']
    for channel in channels:
        header_line.append('Image_FileName_{}'.format(channel))
    return header_line


def create_input_csv_data_line(channels, image, image_row):
    """Given a list of channels and an image name like with just the field
    we can generate the necessary csv: SK_U2OS_PanelC1_SentinelSerDil2-2_B02f01"""
    (row, col) = split_well_to_row_col(image_row['well'])
    row = {
        'Metadata_row': row, 'Metadata_col': col, 'Metadata_field': image_row['field'],
        'Metadata_file_CH0': '{}d0.png'.format(image), 'Metadata_path': path.dirname(image_row['converted_image']),
        'Metadata_well': image_row['well'],
    }
    for idx, channel in enumerate(channels):
        row['Image_FileName_{}'.format(channel)] = '{}/{}d{}.png'.format(
            path.dirname(image_row['converted_image']), image, idx)
    return row


def create_input_csv(channels, image_df):
    """
    Given the channels and the image_df from the bftools image_conversion
    We should generate a csv file with 1 field per row
    In the following format:
    Metadata_row,Metadata_col,Metadata_well,Metadata_field,Metadata_file_CH0,Metadata_path,Image_FileName_DNA_DRAQ5,Image_FileName_ER
B,2,B02,f01,SK_U2OS_PanelC1_SentinelSerDil2-2_B02f01d0.png,/mnt/image/cells/2019Feb11/14269,/mnt/image/cells/2019Feb11/14269/SK_U2OS_PanelC1_SentinelSerDil2-2_B02f01d0.png,/mnt/image/cells/
2019Feb11/14269/SK_U2OS_PanelC1_SentinelSerDil2-2_B02f01d1.png
B,2,B02,f02,SK_U2OS_PanelC1_SentinelSerDil2-2_B02f02d0.png,/mnt/image/cells/2019Feb11/14269,/mnt/image/cells/2019Feb11/14269/SK_U2OS_PanelC1_SentinelSerDil2-2_B02f02d0.png,/mnt/image/cells/
2019Feb11/14269/SK_U2OS_PanelC1_SentinelSerDil2-2_B02f02d1.png
    :return:
    """
    columns = create_cellprofiler_input_csv_column_names(channels)
    images = image_df['cellprofiler_image_base'].unique().tolist()
    csv_data = []
    for image in images:
        image_rows = image_df.loc[image_df['cellprofiler_image_base'] == image]
        row = create_input_csv_data_line(channels, image, image_rows.iloc[0])
        csv_data.append(row)

    return pd.DataFrame.from_records(csv_data, columns=columns)


def create_cellprofiler_task(cellprofiler_input_csv):
    """
    Create the cellprofiler task

    :param cellprofiler_input_csv:
    :return:
    """
    pass


def combine_cellprofiler_csvs(files: List):
    """
    We run one cellprofiler instance per well
    Which is normally 8 fields and however many channels
    :param files: List of str filepaths pointing to output csvs
    :return:
    """
    if not len(files):
        return
    else:
        with open(files[0]) as myfile:
            head = [next(myfile) for x in range(2)]

        # Write head out to new combined cellprofiler file

        combined_csv_f = open("combined.csv", "w")
        combined_csv_f.writelines(head)

        with open(files[0], 'r') as f:
            line_counter = 0
            for line in f:
                if line_counter <= 1:
                    line_counter = line_counter + 1
                else:
                    print('add line to file')
                    combined_csv_f.write(line)

        # After this remove the piecemeal csvs
        # for file in files:
        #     os.remove(file)
