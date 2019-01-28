FROM continuumio/miniconda3:4.5.11

RUN apt-get update -y; apt-get upgrade -y
RUN apt-get install -y vim-tiny vim-athena mysql-client ssh

RUN adduser --home /home/airflow airflow

RUN mkdir -p /home/airflow/airflow
RUN mkdir -p /home/airflow/.ssh
COPY airflow/airflow.cfg /home/airflow/airflow/airflow.cfg
COPY airflow/airflow_cors.patch /home/airflow
RUN chown -R airflow:airflow /home/airflow/airflow
RUN chown -R airflow:airflow /home/airflow/.ssh

USER airflow
WORKDIR /home/airflow

COPY environment.yml environment.yml

RUN conda env create -f environment.yml
RUN echo "alias l='ls -lah'" >> ~/.bashrc
RUN echo "source activate image-conversion" >> ~/.bashrc

ENV CONDA_EXE /opt/conda/bin/conda
ENV CONDA_PREFIX /home/airflow/.conda/envs/image-conversion
ENV CONDA_PYTHON_EXE /opt/conda/bin/python
ENV CONDA_PROMPT_MODIFIER (image-conversion)
ENV CONDA_DEFAULT_ENV image-conversion
ENV PATH /home/airflow/.conda/envs/image-conversion/bin:/opt/conda/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

RUN mv airflow_cors.patch /home/airflow/.conda/envs/image-conversion/lib && \
    cd /home/airflow/.conda/envs/image-conversion/lib && \
    patch python3.6/site-packages/airflow/www/app.py airflow_cors.patch

RUN wget http://downloads.openmicroscopy.org/latest/bio-formats5.6/artifacts/bftools.zip
RUN unzip bftools.zip
RUN mv bftools/* /home/airflow/.conda/envs/image-conversion/bin/
RUN bfconvert --help | grep patterns

## This is kind of terrible
## But because of file mounting issues, we have to actually run airflow as root

USER root

RUN mkdir $HOME/airflow
RUN cp /home/airflow/airflow/airflow.cfg $HOME/airflow/airflow.cfg

ENV C_FORCE_ROOT true
ENV CONDA_EXE /opt/conda/bin/conda
ENV CONDA_PREFIX /home/airflow/.conda/envs/image-conversion
ENV CONDA_PYTHON_EXE /opt/conda/bin/python
ENV CONDA_PROMPT_MODIFIER (image-conversion)
ENV CONDA_DEFAULT_ENV image-conversion
ENV PATH /home/airflow/.conda/envs/image-conversion/bin:/opt/conda/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
