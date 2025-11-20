#!/bin/bash

# © Copyright IBM Corporation 2025
# SPDX-License-Identifier: Apache-2.0




echo "Starting haproxy"

# Start the first process
haproxy -db -f haproxy.cfg &
  
echo "Starting althttpd"

# Start the second process
althttpd --port 8003 --root /home/geostudio/srv &

echo Server started.
  
# Wait for any process to exit
wait -n
  
# Exit with status of process that exited first
exit $?
