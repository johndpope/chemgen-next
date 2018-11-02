from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import json
import copy

import pandas as pd
import tensorflow as tf
import os
from sklearn.model_selection import train_test_split
from pprint import pprint
import types

tf.logging.set_verbosity(tf.logging.INFO)

"""
WIP - Build a TF model for predicting emb_leth and enh_ste scores
Right now there is a problem with the enh ste manual scores, so this needs to wait
TODO Throw an argparse wrapper in front of this
"""

"""
    "timestamp": "2018-02-13T10:42:29.000Z",
    "treatment_group_id": 1393,
    "manualscore_group": "M_EMB_LETH",
    "max_manualscore_value": 3,
    "min_manualscore_value": 3,
    "avg_manualscore_value": 3,
    "reagentWormCountR0": 16,
    "reagentLarvaCountR0": 1,
    "reagentEggCountR0": 799,
    "reagentWormCountR1": 15,
    "reagentLarvaCountR1": 10,
    "reagentEggCountR1": 487,
    "ctrlWormCountR0": 16,
    "ctrlLarvaCountR0": 63,
    "ctrlEggCountR0": 131,
    "ctrlWormCountR1": 14,
    "ctrlLarvaCountR1": 61,
    "ctrlEggCountR1": 110,
    "ctrlWormCountR2": 13,
    "ctrlLarvaCountR2": 70,
    "ctrlEggCountR2": 161,
    "ctrlWormCountR3": 8,
    "ctrlLarvaCountR3": 111,
    "ctrlEggCountR3": 77,
    "predictedScore": 3
"""


class TFLinearClassifier:
    def __init__(self, screen_stage, phenotype):
        self.phenotype = str(phenotype)
        self.screen_stage = str(screen_stage)
        self.label = 'predictedScore'
        # if screen_stage is not 'primary' or screen_stage is not 'secondary':
        #     raise ValueError('Screen Stage must be one of primary or secondary. Invalid: {}'.format(screen_stage))

    @property
    def model_path(self):
        dirname, filename = os.path.split(os.path.abspath(__file__))
        return os.path.join(dirname, '{}_{}_model'.format(self.phenotype, self.screen_stage))

    @property
    def columns(self):
        if 'primary' in self.screen_stage:
            return [
                "reagentWormCountR0",
                "reagentWormCountR1",
                "reagentLarvaCountR0",
                "reagentLarvaCountR1",
                "reagentEggCountR0",
                "reagentEggCountR1",
                "ctrlWormCountR0",
                "ctrlLarvaCountR0",
                "ctrlEggCountR0",
                "ctrlWormCountR1",
                "ctrlLarvaCountR1",
                "ctrlEggCountR1",
                "ctrlWormCountR2",
                "ctrlLarvaCountR2",
                "ctrlEggCountR2",
                "ctrlWormCountR3",
                "ctrlLarvaCountR3",
                "ctrlEggCountR3",
                "predictedScore"]
        elif 'secondary' in self.screen_stage:
            return [
                "reagentWormCountR0",
                "reagentLarvaCountR0",
                "reagentEggCountR0",
                "reagentWormCountR1",
                "reagentLarvaCountR1",
                "reagentEggCountR1",
                "reagentWormCountR2",
                "reagentLarvaCountR2",
                "reagentEggCountR2",
                "reagentWormCountR3",
                "reagentLarvaCountR3",
                "reagentEggCountR3",
                "reagentWormCountR4",
                "reagentLarvaCountR4",
                "reagentEggCountR4",
                "reagentWormCountR5",
                "reagentLarvaCountR5",
                "reagentEggCountR5",
                "reagentWormCountR6",
                "reagentLarvaCountR6",
                "reagentEggCountR6",
                "reagentWormCountR7",
                "reagentLarvaCountR7",
                "reagentEggCountR7",
                "ctrlWormCountR0",
                "ctrlLarvaCountR0",
                "ctrlEggCountR0",
                "ctrlWormCountR1",
                "ctrlLarvaCountR1",
                "ctrlEggCountR1",
                "ctrlWormCountR2",
                "ctrlLarvaCountR2",
                "ctrlEggCountR2",
                "ctrlWormCountR3",
                "ctrlLarvaCountR3",
                "ctrlEggCountR3",
                "predictedScore"]

    @property
    def features(self):
        f = copy.deepcopy(self.columns)
        f.pop()
        return f

    @property
    def treat_replicates(self):
        if self.screen_stage is 'primary':
            return 2
        elif self.screen_stage is 'secondary':
            return 8

    def build_model_columns(self):
        # TODO This can be refactored to be programatic based on the number of replicates
        reagentWormCountR0 = tf.feature_column.numeric_column('reagentWormCountR0')
        reagentLarvaCountR0 = tf.feature_column.numeric_column('reagentLarvaCountR0')
        reagentEggCountR0 = tf.feature_column.numeric_column('reagentEggCountR0')

        reagentWormCountR1 = tf.feature_column.numeric_column('reagentWormCountR1')
        reagentLarvaCountR1 = tf.feature_column.numeric_column('reagentLarvaCountR1')
        reagentEggCountR1 = tf.feature_column.numeric_column('reagentEggCountR1')

        ctrlWormCountR0 = tf.feature_column.numeric_column('ctrlWormCountR0')
        ctrlLarvaCountR0 = tf.feature_column.numeric_column('ctrlLarvaCountR0')
        ctrlEggCountR0 = tf.feature_column.numeric_column('ctrlEggCountR0')

        ctrlWormCountR1 = tf.feature_column.numeric_column('ctrlWormCountR1')
        ctrlLarvaCountR1 = tf.feature_column.numeric_column('ctrlLarvaCountR1')
        ctrlEggCountR1 = tf.feature_column.numeric_column('ctrlEggCountR1')

        ctrlWormCountR2 = tf.feature_column.numeric_column('ctrlWormCountR2')
        ctrlLarvaCountR2 = tf.feature_column.numeric_column('ctrlLarvaCountR2')
        ctrlEggCountR2 = tf.feature_column.numeric_column('ctrlEggCountR2')

        ctrlWormCountR3 = tf.feature_column.numeric_column('ctrlWormCountR3')
        ctrlLarvaCountR3 = tf.feature_column.numeric_column('ctrlLarvaCountR3')
        ctrlEggCountR3 = tf.feature_column.numeric_column('ctrlEggCountR3')

        ##For some reason when this gets passed in through the flask framework a simple
        ## if self.screen_stage is 'primary' doesn't work
        if 'primary' in str(self.screen_stage):
            base_columns = [
                reagentWormCountR0,
                reagentWormCountR1,
                reagentLarvaCountR0,
                reagentLarvaCountR1,
                reagentEggCountR0,
                reagentEggCountR1,
                ctrlWormCountR0,
                ctrlLarvaCountR0,
                ctrlEggCountR0,
                ctrlWormCountR1,
                ctrlLarvaCountR1,
                ctrlEggCountR1,
                ctrlWormCountR2,
                ctrlLarvaCountR2,
                ctrlEggCountR2,
                ctrlWormCountR3,
                ctrlLarvaCountR3,
                ctrlEggCountR3,
            ]

            crossed_columns = [
                tf.feature_column.crossed_column(
                    ['ctrlWormCountR0', 'ctrlWormCountR1', 'ctrlWormCountR2', 'ctrlWormCountR3'], hash_bucket_size=1),
                tf.feature_column.crossed_column(
                    ['ctrlLarvaCountR0', 'ctrlLarvaCountR1', 'ctrlLarvaCountR2', 'ctrlLarvaCountR3'],
                    hash_bucket_size=1),
                tf.feature_column.crossed_column(
                    ['ctrlEggCountR0', 'ctrlEggCountR1', 'ctrlEggCountR2', 'ctrlEggCountR3'], hash_bucket_size=1),
                tf.feature_column.crossed_column(
                    ['reagentWormCountR0', 'reagentWormCountR1'], hash_bucket_size=1),
                tf.feature_column.crossed_column(
                    ['reagentLarvaCountR0', 'reagentLarvaCountR1'], hash_bucket_size=1),
                tf.feature_column.crossed_column(
                    ['reagentEggCountR0', 'reagentEggCountR1'], hash_bucket_size=1),
            ]

            wide_columns = base_columns + crossed_columns

            return wide_columns, base_columns
        elif self.screen_stage is 'secondary':
            raise ValueError('Model is not yet build for secondary!')

    def return_train_data(self):
        dirname, filename = os.path.split(os.path.abspath(__file__))
        path = os.path.join(dirname, 'data', '{}_{}_train.json'.format(self.phenotype, self.screen_stage))
        return self.return_json_as_df(path)

    def return_predict_data(self):
        dirname, filename = os.path.split(os.path.abspath(__file__))
        path = os.path.join(dirname, 'data', '{}_{}_predict.json'.format(self.phenotype, self.screen_stage))
        return self.return_json_as_df(path)

    def return_json_as_df(self, path):
        with open(path) as f:
            data = json.load(f)
        df = pd.DataFrame(data)
        return df.dropna()

    def build_estimator(self):
        """Build an estimator appropriate for the given model type."""
        wide_columns, deep_columns = self.build_model_columns()
        hidden_units = [100, 75, 50, 25]

        # Create a tf.estimator.RunConfig to ensure the model is run on CPU, which
        # trains faster than GPU for this model.
        run_config = tf.estimator.RunConfig().replace(
            session_config=tf.ConfigProto(device_count={'GPU': 0})
        )

        return tf.estimator.DNNLinearCombinedClassifier(
            n_classes=4,
            model_dir=self.model_path,
            linear_feature_columns=wide_columns,
            dnn_feature_columns=deep_columns,
            dnn_hidden_units=hidden_units,
            config=run_config)

    def get_input_fn(self, data_set, num_epochs=None, shuffle=True):
        return tf.estimator.inputs.pandas_input_fn(
            x=pd.DataFrame({k: data_set[k].values for k in self.features}),
            y=pd.Series(data_set[self.label].values),
            num_epochs=num_epochs,
            shuffle=shuffle)

    def get_predict_fn(self, data_set, num_epochs=None, shuffle=True):
        return tf.estimator.inputs.pandas_input_fn(
            x=pd.DataFrame({k: data_set[k].values for k in self.features}),
            num_epochs=num_epochs,
            shuffle=shuffle)

    def run_train(self, df, steps):
        training_set, test_set = train_test_split(df, test_size=0.15)
        regressor = self.build_estimator()
        # Train
        regressor.train(input_fn=self.get_input_fn(training_set), steps=steps)
        # Evaluate loss over one epoch of test_set.
        ev = regressor.evaluate(
            input_fn=self.get_input_fn(test_set, num_epochs=1, shuffle=False))
        loss_score = ev["loss"]
        print("Loss: {0:f}".format(loss_score))

        # Predict_df has an actual score
        predict_df = self.return_predict_data()
        predict = regressor.predict(
            input_fn=self.get_predict_fn(predict_df, num_epochs=1, shuffle=False))

        for i, p in enumerate(predict):
            actual_score = df.iloc[i]['predictedScore']
            print('Predicted Score: {} Actual Score: {}'.format(p['class_ids'][0], actual_score))
            pprint(json.dumps(p['probabilities'].tolist()))

    def run_predict_expset(self, df):
        regressor = self.build_estimator()
        predict = regressor.predict(
            input_fn=self.get_predict_fn(df, num_epochs=1, shuffle=False))

        predicted_scores = []
        for i, p in enumerate(predict):
            print('Predicted Score: {}'.format(p['class_ids'][0]))
            pprint(json.dumps(p['probabilities'].tolist()))
            predicted_scores.append(p['class_ids'][0])

        df = df.assign(predictedScore=pd.Series(predicted_scores))
        return df


def build_model_primary_emb_leth():
    # Load datasets
    tfLinearClassifier = TFLinearClassifier('primary', 'emb_leth')
    train_model(tfLinearClassifier)


def build_model_primary_enh_ste():
    # Load datasets
    tfLinearClassifier = TFLinearClassifier('primary', 'enh_ste')
    train_model(tfLinearClassifier)


def train_model(tfLinearClassifier):
    df = tfLinearClassifier.return_train_data()
    tfLinearClassifier.run_train(df, 3000)


def main(unused_argv):
    # Load datasets
    # build_model_primary_emb_leth()
    tfLinearClassifier = TFLinearClassifier('primary', 'emb_leth')
    # tfLinearClassifier = TFLinearClassifier('primary', 'enh_ste')
    # train_model(tfLinearClassifier)
    # df = tfLinearClassifier.return_predict_data()
    # tfLinearClassifier.run_predict_expset(df)


if __name__ == "__main__":
    tf.app.run()
