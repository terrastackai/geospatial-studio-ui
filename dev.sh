#!/bin/sh

# © Copyright IBM Corporation 2025
# SPDX-License-Identifier: Apache-2.0




ENV="$1"
if test "$ENV" == ""; then
  ENV="dev"
fi

ls "deploy/instances/$ENV.env" || exit 1

DOCKER=`which docker || which podman`
TIMESTAMP=$(date +%FT%T)
COMMIT=$(git rev-parse HEAD)
IMAGE=$($DOCKER image inspect localhost/geostudio-ui | jq '.[0].Id' |  tr -d '"') 

jq -n \
--arg timestamp $TIMESTAMP \
--arg version $COMMIT \
--arg image $IMAGE \
--arg commit $COMMIT \
--arg environment $ENV \
'{"version": $version, "timestamp": $timestamp, "image": $image, "commit": $commit, "environment": $environment }' \
> ./app/version.json

# see: https://github.com/containers/podman/issues/6592
MOUNT_PARAMS=""
if which getenforce; then
  if test "`getenforce`" == "Enforcing"; then
    echo SELinux enforcing mode, applying workaround...
    MOUNT_PARAMS=":Z"
  fi
fi

# Apply MacOS fix, see https://github.com/ansible/vscode-ansible/wiki/macos
if [[ $DOCKER == *"podman"* ]]; then
  sed -i '' 's/security_model=mapped-xattr/security_model=none/' $(podman machine inspect | jq --raw-output '.[0].ConfigPath.Path') || echo ""
fi

# Starting temp-cont for persisting docs
echo Copy docs!
$DOCKER \
  create --name temp-cont \
  localhost/geostudio-ui

$DOCKER \
  cp temp-cont:/home/geostudio/srv/docs "`pwd`/app"

$DOCKER \
 cp temp-cont:/home/geostudio/srv/sdk "`pwd`/app"


$DOCKER \
  rm temp-cont

echo temp-cont removed!

# Starting container
echo Starting container on http://localhost:9090 in mode $ENV
$DOCKER \
  run --rm -it --init \
  -e "ENV=$ENV" \
  --volume "`pwd`/app":/home/geostudio/srv$MOUNT_PARAMS \
  -p 9090:8090 \
  --name geostudio-ui-dev \
  --env-file ./deploy/instances/$ENV.env \
  localhost/geostudio-ui

