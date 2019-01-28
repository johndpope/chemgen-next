## Why

This airflow instance just converts images from the microscope.
Images commands are rendered based on whether or not they are cell or worm images.

## Installation

Bootstrap an environment with the environment.yml of the repo.

```
conda env create -f environment.yml -p $HOME/software/airflow
```

This only installs the default packages, which are not suitable for a production environment. More information on starting a production environment coming soon.

At the time of writing airflow does not work with python 3.7 because of a namespace issue.

## Getting Starting

Once the packages are installed, you must first initialize the airflow database.


```
source activate $HOME/software/airflow
airflow initdb
## The scheduler and the webserver run continuously and will have to be run in different windows / tmux panes
## Ensure the environment is sourced with source activate $HOME/software/airflow
airflow scheduler
airflow webserver
```

If you haven't unset the load_examples from airflow.cfg, you might get some errors about kubernetes. Don't worry about these, or just set load_examples as False in the config.

~/airflow/airflow.cfg (or $AIRFLOW_HOME/airflow.cfg)

```
#load_examples = True
load_examples = False
```

## Dags and Plugins

In order to get airflow to see the dags and plugins here you need to modify the airflow.cfg, which is in ${AIRLFOW_HOME}/airflow.cfg. Default is ~/airflow/airflow.cfg

```
dags_folder = /home/airflow/airflow/dags
plugins_folder = /home/airflow/airflow/plugins
```

To $(pwd)/plugins and $(pwd)/dags
