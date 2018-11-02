FROM continuumio/anaconda3

RUN apt-get update
RUN apt-get install -y curl
RUN conda install -y numpy pandas opencv scipy pip setuptools ipython tensorflow=1.8
RUN pip install flask flask-restful pandas opencv-python matplotlib celery request jsonify gunicorn celery matplotlib jsonify gunicorn

RUN useradd -ms /bin/bash webuser
USER webuser
WORKDIR /home/webuser

RUN mkdir -p /home/webuser/scripts

ADD *.py /home/webuser/scripts/
ADD emb_leth_primary_model /home/webuser/scripts/emb_leth_primary_model
ADD data /home/webuser/scripts/data

WORKDIR /home/webuser/scripts
EXPOSE 5000

##TODO Change this user - celery complains
USER root

ADD start_app.sh /home/webuser/scripts/start_app.sh
ENV FLASK_APP expset_phenotype_linear_classification_flask_app.py

CMD ["/bin/bash", "-c", "./start_app.sh"]
