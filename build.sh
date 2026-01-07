#!/bin/bash

# © Copyright IBM Corporation 2025
# SPDX-License-Identifier: Apache-2.0




if [ "$1" = "" ]
then
  echo "ENV parameter missing"
  echo "Usage: $0 [ENV] (dev, staging, prod)"
  exit 1
fi

ENV="$1"

ls "deploy/instances/$ENV.env" || exit 1

# pushd deploy
# ./build.sh $ENV || exit 1
# popd

platform=linux/amd64

# set platform correctly if we are building in dev mode on an M1 Mac
if [[ ("$ENV" -eq "dev" || "$ENV" -eq "think-local")  && `uname -m` -eq "arm64" ]];
then
  platform=linux/arm64
fi

DOCKER=`which docker || which podman`
$DOCKER build --platform=$platform --load -t localhost/geostudio-ui .
