#!/bin/bash

# © Copyright IBM Corporation 2025
# SPDX-License-Identifier: Apache-2.0




echo "Starting nginx"

# Start nginx in foreground mode
exec nginx -c /home/geostudio/nginx.conf -g 'daemon off;'


