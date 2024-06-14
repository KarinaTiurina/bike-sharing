# syntax=docker/dockerfile:1

FROM python:3.12.3-alpine

WORKDIR /emitter

COPY requirements.txt ./
RUN pip3 install -r requirements.txt

COPY bikes/ bikes
COPY main.py ./
COPY parser.py ./

ARG seconds_delay
ENV SECONDS_DELAY=${seconds_delay}
ENTRYPOINT python3 -m main $SECONDS_DELAY