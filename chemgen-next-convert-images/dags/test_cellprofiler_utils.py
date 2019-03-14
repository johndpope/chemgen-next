from io import StringIO
import pandas as pd
import unittest
from test_convert_images_bftools_utils import DummyAirflowConf
from convert_images_bftools_utils import get_cell_images_df
from cellprofiler_utils import create_input_csv

"""
Given Channels DNA_DRAQ5, ER, well B02 fields f01, f02 (there are actually 8 fields) Will produce a CSV as follows 
"""

test_csv = """Metadata_row,Metadata_col,Metadata_well,Metadata_field,Metadata_file_CH0,Metadata_path,Image_FileName_DNA_DRAQ5,Image_FileName_ER
B,2,B02,f01,SK_U2OS_PanelC1_SentinelSerDil2-2_B02f01d0.png,/mnt/image/cells/2019Feb11/14269,/mnt/image/cells/2019Feb11/14269/SK_U2OS_PanelC1_SentinelSerDil2-2_B02f01d0.png,/mnt/image/cells/
2019Feb11/14269/SK_U2OS_PanelC1_SentinelSerDil2-2_B02f01d1.png
B,2,B02,f02,SK_U2OS_PanelC1_SentinelSerDil2-2_B02f02d0.png,/mnt/image/cells/2019Feb11/14269,/mnt/image/cells/2019Feb11/14269/SK_U2OS_PanelC1_SentinelSerDil2-2_B02f02d0.png,/mnt/image/cells/
2019Feb11/14269/SK_U2OS_PanelC1_SentinelSerDil2-2_B02f02d1.png
B,2,B02,f03,SK_U2OS_PanelC1_SentinelSerDil2-2_B02f03d0.png,/mnt/image/cells/2019Feb11/14269,/mnt/image/cells/2019Feb11/14269/SK_U2OS_PanelC1_SentinelSerDil2-2_B02f03d0.png,/mnt/image/cells/
2019Feb11/14269/SK_U2OS_PanelC1_SentinelSerDil2-2_B02f03d1.png
B,2,B02,f04,SK_U2OS_PanelC1_SentinelSerDil2-2_B02f04d0.png,/mnt/image/cells/2019Feb11/14269,/mnt/image/cells/2019Feb11/14269/SK_U2OS_PanelC1_SentinelSerDil2-2_B02f04d0.png,/mnt/image/cells/
2019Feb11/14269/SK_U2OS_PanelC1_SentinelSerDil2-2_B02f04d1.png
B,2,B02,f05,SK_U2OS_PanelC1_SentinelSerDil2-2_B02f05d0.png,/mnt/image/cells/2019Feb11/14269,/mnt/image/cells/2019Feb11/14269/SK_U2OS_PanelC1_SentinelSerDil2-2_B02f05d0.png,/mnt/image/cells/
2019Feb11/14269/SK_U2OS_PanelC1_SentinelSerDil2-2_B02f05d1.png
B,2,B02,f06,SK_U2OS_PanelC1_SentinelSerDil2-2_B02f06d0.png,/mnt/image/cells/2019Feb11/14269,/mnt/image/cells/2019Feb11/14269/SK_U2OS_PanelC1_SentinelSerDil2-2_B02f06d0.png,/mnt/image/cells/
2019Feb11/14269/SK_U2OS_PanelC1_SentinelSerDil2-2_B02f06d1.png
B,2,B02,f07,SK_U2OS_PanelC1_SentinelSerDil2-2_B02f07d0.png,/mnt/image/cells/2019Feb11/14269,/mnt/image/cells/2019Feb11/14269/SK_U2OS_PanelC1_SentinelSerDil2-2_B02f07d0.png,/mnt/image/cells/
2019Feb11/14269/SK_U2OS_PanelC1_SentinelSerDil2-2_B02f07d1.png
B,2,B02,f08,SK_U2OS_PanelC1_SentinelSerDil2-2_B02f08d0.png,/mnt/image/cells/2019Feb11/14269,/mnt/image/cells/2019Feb11/14269/SK_U2OS_PanelC1_SentinelSerDil2-2_B02f08d0.png,/mnt/image/cells/
2019Feb11/14269/SK_U2OS_PanelC1_SentinelSerDil2-2_B02f08d1.png
"""

test_data = StringIO(test_csv)
test_csv_df = pd.read_csv(test_data, sep=",")


class TestCellProfilerAnalysisJobs(unittest.TestCase):
    def test_csv(self):
        conf_args = {'instrument_plate_path': "\\\\aduae120-wap\\CS_DATA_SHARE\\2017Mar13\\MFGTMP-PC_170319090001\\",
                     'barcode': 'SK_C-U2OS_NUC-7AAD-LYSO-EMB_SPECTRUM-Pl22', 'instrumentPlateId': 8195,
                     'channels': ['DNA_DRAQ5', 'ER']}

        conf = DummyAirflowConf(conf_args)
        images_df = get_cell_images_df('', dag_run=conf)
        image_rows = images_df.loc[images_df['well'] == 'B02']
        csv_data = create_input_csv(conf_args['channels'], image_rows)
        self.assertEqual(csv_data.shape[0], 9)
