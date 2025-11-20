# © Copyright IBM Corporation 2025
# SPDX-License-Identifier: Apache-2.0


# Licensed Materials - Property of IBM
# "Restricted Materials of IBM"
# Copyright IBM Corp. 2025 ALL RIGHTS RESERVED


### STAGE 1: Build UI ###
FROM node:20-alpine3.22 as build

WORKDIR /usr/src/app

COPY . .

RUN ./copy-libs.sh

WORKDIR /usr/src/app/deploy

ARG OUTPUT=./output

RUN rm -rf $OUTPUT || exit 1
RUN mkdir -p $OUTPUT || exit 1
RUN cp -r config $OUTPUT
RUN cp -r ../app $OUTPUT
RUN rm -rf $OUTPUT/app/js

# bundle the app for serving
RUN npx esbuild ../app/js/index.js ../app/js/app-loader.js --bundle --sourcemap --minify --outdir=$OUTPUT/app/js || exit 1
RUN cp -r ../app/js/libs $OUTPUT/app/js/

# cleanup
RUN rm -rf $OUTPUT/app/env.json


### STAGE 2: Build Docs ###
FROM registry.access.redhat.com/ubi9/python-312:latest AS build_docs

USER root
WORKDIR /docs

# Install hatch
RUN python -m pip install --upgrade hatch

COPY docs/ .

# Install hatch
RUN python -m pip install .

RUN hatch run build

### STAGE 3: Build SDK Docs ###
FROM registry.access.redhat.com/ubi9/python-312:latest AS build_sdk_docs

USER root
WORKDIR /docs
RUN python -m pip install --upgrade poetry

RUN mkdir -p /docs/geospatial-studio-sdk/
COPY docs/geospatial-studio-docs/docs/geospatial-studio-toolkit/geospatial-studio-sdk/ /docs/geospatial-studio-sdk/

WORKDIR /docs/geospatial-studio-sdk
RUN poetry lock
RUN poetry install  --only docs -v

RUN mkdir -p /docs/examples/
COPY docs/geospatial-studio-docs/docs/geospatial-studio-toolkit/examples/ /docs/examples/
RUN poetry run docs-build


### STAGE 4: Run ###
FROM alpine:latest

RUN addgroup -S -g 1001 geostudio && adduser -S -u 1001 -G geostudio geostudio

RUN apk add --no-cache haproxy althttpd bash gettext

ENV HOME /home/geostudio

WORKDIR $HOME

COPY --chown=1001:1001 --from=build /usr/src/app/docker-entrypoint.sh docker-entrypoint.sh
COPY --chown=1001:1001 --from=build /usr/src/app/deploy/start_haproxy_althttpd.sh start_haproxy_althttpd.sh
COPY --chown=1001:1001 --from=build /usr/src/app/deploy/config/haproxy.conf haproxy.cfg
COPY --chown=1001:1001 --from=build /usr/src/app/deploy/config/local_haproxy.conf local_haproxy.cfg
COPY --chown=1001:1001 --from=build /usr/src/app/deploy/config/local_with_ssl_haproxy.conf local_with_ssl_haproxy.cfg
COPY --chown=1001:1001 --from=build /usr/src/app/deploy/config/404.http /etc/haproxy/errors/404.http
COPY --chown=1001:1001 --from=build /usr/src/app/deploy/config/env.json env.json
RUN chown -R 1001:1001 $HOME
RUN chmod -R 777 $HOME
RUN chmod 777 haproxy.cfg local_haproxy.cfg local_with_ssl_haproxy.cfg
RUN chmod 777 env.json
COPY --chown=1001:1001 --from=build /usr/src/app/deploy/output/app/ srv/
COPY --chown=1001:1001 --from=build_docs /docs/geospatial-studio-docs/site/ srv/docs/
RUN mkdir -p srv/sdk/
COPY --chown=1001:1001 --from=build_sdk_docs /docs/geospatial-studio-sdk/sdk-docs-site/ srv/sdk/


EXPOSE 8090

USER 1001:1001

ENTRYPOINT ["/home/geostudio/docker-entrypoint.sh"]

CMD /home/geostudio/start_haproxy_althttpd.sh
