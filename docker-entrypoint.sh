#!/bin/bash

# © Copyright IBM Corporation 2025
# SPDX-License-Identifier: Apache-2.0




set -e

HAPROXY_CONFIG_PATH="/home/geostudio/haproxy.cfg"
LOCAL_HAPROXY_CONFIG_PATH="/home/geostudio/local_haproxy.cfg"
LOCAL_WITH_SSL_HAPROXY_CONFIG_PATH="/home/geostudio/local_with_ssl_haproxy.cfg"

# Determine which haproxy to use
if [[ -v LOCAL_DEPLOYMENT && "$LOCAL_DEPLOYMENT" == "true" ]]; then
  mv $LOCAL_HAPROXY_CONFIG_PATH $HAPROXY_CONFIG_PATH
  rm $LOCAL_WITH_SSL_HAPROXY_CONFIG_PATH
elif [[ -v LOCAL_DEPLOYMENT && "$LOCAL_DEPLOYMENT" == "true_with_ssl" ]]; then
  mv $LOCAL_WITH_SSL_HAPROXY_CONFIG_PATH $HAPROXY_CONFIG_PATH
  rm $LOCAL_HAPROXY_CONFIG_PATH
else
  rm $LOCAL_HAPROXY_CONFIG_PATH $LOCAL_WITH_SSL_HAPROXY_CONFIG_PATH
fi

configPaths=("$HAPROXY_CONFIG_PATH" "/home/geostudio/env.json")

auto_envsubst() {

  for configPath in "${configPaths[@]}"
  do
    echo "Replacing variables in file $configPath"
    whoami
    ls -lah $configPath
    tmpfile=$(mktemp)
    cp $configPath $tmpfile
    cat $configPath | envsubst > $tmpfile && cat $tmpfile > $configPath
  done
  
}

auto_envsubst

# hand off to CMD
exec "$@"
