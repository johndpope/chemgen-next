from flask import Flask
import sys
from flask_restful import Resource, Api, reqparse
import pandas as pd
import json
# When running with gunicorn this needs to be a regular import for reasons I don't understand
try:
    from .expset_phenotype_linear_classification import TFLinearClassifier
except:
    from expset_phenotype_linear_classification import TFLinearClassifier

app = Flask(__name__)
api = Api(app)

parser = reqparse.RequestParser()


class ClassifyExpSet(Resource):
    """
    Api to count worms
        ## Its kind of stupid to just get a single expset, it would be much faster to return a list of them
        ## But for some strange reason adding in a list of dicts does not work 'out of the box', so here we are

    Here is an example post request:
            {
              "expSet": {
                "reagentWormCountR0": 16,
                "reagentLarvaCountR0": 1,
                "reagentEggCountR0": 799,
                "reagentWormCountR1": 15,
                "reagentLarvaCountR1": 10,
                "reagentEggCountR1": 500,
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
              },
              "screenStage": "primary",
              "phenotype": "emb_leth"
            }
    For now this can accomodate a single expset, along with a screenStage and phenotype
    """
    def post(self):
        parser.add_argument('expSet', type=dict, required=True)
        parser.add_argument('screenStage', type=str, required=True)
        parser.add_argument('phenotype', type=str, required=True)
        args = parser.parse_args()

        print('Processing Request: classify_expset', file=sys.stderr)
        print(args, file=sys.stderr)

        df = pd.DataFrame([args.expSet])
        # print(df.head())
        tfLinearClassifier = TFLinearClassifier(args.screenStage, args.phenotype)
        print('TF: ScreenStage: {} Pheno: {}'.format(tfLinearClassifier.screen_stage, tfLinearClassifier.phenotype))
        try:
            df = tfLinearClassifier.run_predict_expset(df)
            # This is completely stupid, but depending on the versioning of python and whatnot
            # Just trying to dump directly may get error about numpy things
            classification_json = df.to_json(orient='records')
            classification_data = json.loads(classification_json)
            return {'results': classification_data}
        except:
            return {'results': [], 'error': 1}



api.add_resource(ClassifyExpSet, '/tf_linear_classification/1.0/api/classify_expset')


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, Threaded=True)
