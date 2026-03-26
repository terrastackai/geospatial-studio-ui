#!/bin/bash

# © Copyright IBM Corporation 2025
# SPDX-License-Identifier: Apache-2.0




set -e

NGINX_CONFIG_PATH="/home/geostudio/nginx.conf"
LOCAL_NGINX_CONFIG_PATH="/home/geostudio/local_nginx.conf"
LOCAL_WITH_SSL_NGINX_CONFIG_PATH="/home/geostudio/local_with_ssl_nginx.conf"

# Determine which nginx config to use
if [[ -v LOCAL_DEPLOYMENT && "$LOCAL_DEPLOYMENT" == "true" ]]; then
  mv $LOCAL_NGINX_CONFIG_PATH $NGINX_CONFIG_PATH
  rm $LOCAL_WITH_SSL_NGINX_CONFIG_PATH
elif [[ -v LOCAL_DEPLOYMENT && "$LOCAL_DEPLOYMENT" == "true_with_ssl" ]]; then
  mv $LOCAL_WITH_SSL_NGINX_CONFIG_PATH $NGINX_CONFIG_PATH
  rm $LOCAL_NGINX_CONFIG_PATH
else
  rm $LOCAL_NGINX_CONFIG_PATH $LOCAL_WITH_SSL_NGINX_CONFIG_PATH
fi

configPaths=("$NGINX_CONFIG_PATH" "/home/geostudio/env.json")

auto_envsubst() {
  # Get all environment variables that are actually used in the config files
  ENVSUBST_VARS=$(env | grep -E '^[A-Z_]+=' | cut -d= -f1 | sed 's/^/${/' | sed 's/$/}/' | tr '\n' ' ')
  
  for configPath in "${configPaths[@]}"
  do
    echo "Replacing variables in file $configPath"
    whoami
    ls -lah $configPath
    tmpfile=$(mktemp)
    cp $configPath $tmpfile
    cat $configPath | envsubst "$ENVSUBST_VARS" > $tmpfile && cat $tmpfile > $configPath
  done
  
}

auto_envsubst

# hand off to CMD
exec "$@"
