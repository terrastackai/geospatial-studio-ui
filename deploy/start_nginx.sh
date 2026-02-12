#!/bin/bash

# © Copyright IBM Corporation 2025
# SPDX-License-Identifier: Apache-2.0




echo "Starting nginx"

# Start nginx in foreground mode
# Use -e flag to specify error log before config is parsed (OpenShift compatibility)
exec nginx -e /tmp/nginx_error.log -c /home/geostudio/nginx.conf -g 'daemon off;'


