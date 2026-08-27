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

# Determine the DNS resolver nginx should use at runtime.
# In Kubernetes/OpenShift the pod's /etc/resolv.conf points at the
# cluster DNS (CoreDNS/kube-dns). We read the first nameserver from it
# unless DNS_RESOLVER was already provided as an env var.
if [[ -z "${DNS_RESOLVER}" ]]; then
  DNS_RESOLVER=$(awk '/^nameserver/ {print $2; exit}' /etc/resolv.conf)
fi
# Fall back to the common kube-dns ClusterIP if resolv.conf had nothing.
DNS_RESOLVER=${DNS_RESOLVER:-10.96.0.10}
export DNS_RESOLVER
echo "Using DNS resolver: $DNS_RESOLVER"

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
