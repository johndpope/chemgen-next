FROM continuumio/miniconda3:4.5.11

RUN apt-get update -y; apt-get upgrade -y
RUN apt-get install -y vim-tiny vim-athena ssh openssh-server mysql-client default-libmysqlclient-dev openjdk-8-jdk build-essential

RUN mkdir -p /home/cellprofiler/cellprofiler
RUN mkdir -p /home/cellprofiler/.ssh
WORKDIR /home/cellprofiler

COPY environment.yml environment.yml

RUN conda env create -f environment.yml && conda clean --all -y
RUN echo "alias l='ls -lah'" >> ~/.bashrc
RUN echo "source activate cellprofiler" >> ~/.bashrc

ENV CONDA_EXE /opt/conda/bin/conda
ENV CONDA_PREFIX /opt/conda/envs/cellprofiler
ENV CONDA_PYTHON_EXE /opt/conda/bin/python
ENV CONDA_PROMPT_MODIFIER (cellprofiler)
ENV CONDA_DEFAULT_ENV cellprofiler
ENV PATH /opt/conda/envs/cellprofiler/bin:/opt/conda/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
ENV JAVA_LD_LIBRARY_PATH /opt/conda/envs/cellprofiler/jre/lib/amd64/server
ENV JAVA_HOME /opt/conda/envs/cellprofiler

#RUN conda install -f -y javabridge numpy
RUN pip install --force centrosome
