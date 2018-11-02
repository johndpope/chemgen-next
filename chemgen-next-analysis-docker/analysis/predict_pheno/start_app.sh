#!/usr/bin/env bash

gunicorn --workers=4 --bind=0.0.0.0:5000 --keep-alive=2000 --timeout=2000 --log-level=debug expset_phenotype_linear_classification_flask_app:app
