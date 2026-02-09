# © Copyright IBM Corporation 2025
# SPDX-License-Identifier: Apache-2.0


# Licensed Materials - Property of IBM
# "Restricted Materials of IBM"
# Copyright IBM Corp. 2025 ALL RIGHTS RESERVED


### STAGE 1: Build UI ###
FROM node:20-alpine3.22 AS build

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


### STAGE 2: Run ###
FROM alpine:latest

RUN addgroup -S -g 10001 geostudio && adduser -S -u 10001 -G geostudio geostudio

RUN apk add --no-cache nginx bash gettext

ENV HOME=/home/geostudio

WORKDIR $HOME

# Create necessary directories
RUN mkdir -p /var/log/nginx /var/lib/nginx /home/geostudio/errors && \
    chown -R 10001:10001 /var/log/nginx /var/lib/nginx /home/geostudio/errors

COPY --chown=10001:10001 --from=build /usr/src/app/docker-entrypoint.sh docker-entrypoint.sh
COPY --chown=10001:10001 --from=build /usr/src/app/deploy/start_nginx.sh start_nginx.sh
COPY --chown=10001:10001 --from=build /usr/src/app/deploy/config/nginx.conf nginx.conf
COPY --chown=10001:10001 --from=build /usr/src/app/deploy/config/local_nginx.conf local_nginx.conf
COPY --chown=10001:10001 --from=build /usr/src/app/deploy/config/local_with_ssl_nginx.conf local_with_ssl_nginx.conf
COPY --chown=10001:10001 --from=build /usr/src/app/deploy/config/404.html errors/404.html
COPY --chown=10001:10001 --from=build /usr/src/app/deploy/config/env.json env.json
RUN chown -R 10001:10001 $HOME
RUN chmod -R 777 $HOME
RUN chmod 777 nginx.conf local_nginx.conf local_with_ssl_nginx.conf
RUN chmod 777 env.json
COPY --chown=10001:10001 --from=build /usr/src/app/deploy/output/app/ srv/


EXPOSE 8090

USER 10001:10001

ENTRYPOINT ["/home/geostudio/docker-entrypoint.sh"]

CMD ["/home/geostudio/start_nginx.sh"]
