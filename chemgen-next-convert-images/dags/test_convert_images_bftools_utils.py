import unittest

from convert_images_bftools_utils import get_cell_images_df, convert_cell_image_template, split_well_to_row_col


class DummyAirflowConf(object):
    def __init__(self, conf):
        self.conf = conf


class TestCellProfilerJobs(unittest.TestCase):
    def test_convert_cell_images_bftools_channel_length(self):
        """
        Given the instrument_plate_path, the barcode, plate id, and channels, produce an image set dataframe
        """
        conf_args = {'instrument_plate_path': "\\\\aduae120-wap\\CS_DATA_SHARE\\2017Mar13\\MFGTMP-PC_170319090001\\",
                     'barcode': 'SK_C-U2OS_NUC-7AAD-LYSO-EMB_SPECTRUM-Pl22', 'instrument_plate_id': 8195,
                     'channels': ['DNA_DRAQ5', 'ER']}

        conf = DummyAirflowConf(conf_args)
        images_df = get_cell_images_df(dag_run=conf)
        self.assertEqual(images_df.shape[0], 6912)
        conf_args = {'instrument_plate_path': "\\\\aduae120-wap\\CS_DATA_SHARE\\2017Mar13\\MFGTMP-PC_170319090001\\",
                     'barcode': 'SK_C-U2OS_NUC-7AAD-LYSO-EMB_SPECTRUM-Pl22', 'instrument_plate_id': 8195,
                     'channels': ['DNA_DRAQ5', 'ER', 'SOME_OTHER_CHANNEL']}

        conf = DummyAirflowConf(conf_args)
        images_df = get_cell_images_df(dag_run=conf)
        self.assertEqual(images_df.shape[0], 10368)
    
    def test_convert_image_template(self):
        """
        This is a very finicky test, because it tests the exact template
        But bash is a finicky language, and images are finicky things
        So here we are
        :return:
        """
        converted_image = '/mnt/image/cells/2017Mar13/8195/SK_C-U2OS_NUC-7AAD-LYSO-EMB_SPECTRUM-Pl22_A01f00d0.png'
        instrument_image = '/mnt/Plate_Data/2017Mar13/MFGTMP-PC_170319090001/MFGTMP-PC_170319090001_A01f00d0.C01'
        template = convert_cell_image_template(instrument_image, converted_image)
        expected_template = """
if [ -f /mnt/Plate_Data/2017Mar13/MFGTMP-PC_170319090001/MFGTMP-PC_170319090001_A01f00d0.C01 ]; then
mkdir -p /mnt/image/cells/2017Mar13/8195
    if [ ! -f /mnt/image/cells/2017Mar13/8195/SK_C-U2OS_NUC-7AAD-LYSO-EMB_SPECTRUM-Pl22_A01f00d0.png ]; then
        bfconvert -nogroup -overwrite "/mnt/Plate_Data/2017Mar13/MFGTMP-PC_170319090001/MFGTMP-PC_170319090001_A01f00d0.C01" "/mnt/image/cells/2017Mar13/8195/SK_C-U2OS_NUC-7AAD-LYSO-EMB_SPECTRUM-Pl22_A01f00d0.png"
    fi
fi
    """
        self.assertEqual(template, expected_template)

    def test_split_well_to_row_col(self):
        split = split_well_to_row_col('A01')
        self.assertEqual(split, ('A', '1'))
        split = split_well_to_row_col('A11')
        self.assertEqual(split, ('A', '11'))


if __name__ == '__main__':
    unittest.main()
