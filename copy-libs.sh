#!/bin/sh

# © Copyright IBM Corporation 2025
# SPDX-License-Identifier: Apache-2.0




npm config set fetch-retry-mintimeout 200000
npm config set fetch-retry-maxtimeout 1200000

npm install

# Carbon web components
rm -rfv ./app/js/libs/carbon-web-components/*
mkdir -p ./app/js/libs/carbon-web-components/ && cp -R ./node_modules/@carbon/web-components/dist/* ./app/js/libs/carbon-web-components/

# Apexcharts
rm -rfv ./app/js/libs/apexcharts/*
mkdir -p ./app/js/libs/apexcharts/ && cp -R ./node_modules/apexcharts/dist/apexcharts.min.js ./app/js/libs/apexcharts/

# D3
rm -rfv ./app/js/libs/d3/*
mkdir -p ./app/js/libs/d3/ && cp -R ./node_modules/d3/dist/* ./app/js/libs/d3/

# Leaflet
rm -rfv ./app/js/libs/leaflet/*
mkdir -p ./app/js/libs/leaflet/ && cp -R ./node_modules/leaflet/dist/* ./app/js/libs/leaflet/

# chroma
rm -rfv ./app/js/libs/chroma/*
mkdir -p ./app/js/libs/chroma/ && cp -R ./node_modules/chroma-js/chroma.min.js ./app/js/libs/chroma/ \
    && cp -R ./node_modules/chroma-js/LICENSE ./app/js/libs/chroma/

# geoblaze
rm -rfv ./app/js/libs/geoblaze/*
mkdir -p ./app/js/libs/geoblaze/ && cp -R ./node_modules/geoblaze/dist/geoblaze.web.min.js ./app/js/libs/geoblaze/ \
    && cp -R ./node_modules/geoblaze/dist/geoblaze.web.min.js.map ./app/js/libs/geoblaze/ \
    && cp -R ./node_modules/geoblaze/LICENSE ./app/js/libs/geoblaze/ \
    && cp -R ./node_modules/georaster-layer-for-leaflet/dist/georaster-layer-for-leaflet.min.js ./app/js/libs/geoblaze/ \
    && cp -R ./node_modules/georaster-layer-for-leaflet/dist/georaster-layer-for-leaflet.min.js.LICENSE.txt ./app/js/libs/geoblaze/

# Leaflet Geosearch
rm -rfv ./app/js/libs/leaflet-geosearch/*
mkdir -p ./app/js/libs/leaflet-geosearch/ && cp -R ./node_modules/leaflet-geosearch/dist/geosearch.umd.js ./app/js/libs/leaflet-geosearch/ \
    && cp -R ./node_modules/leaflet-geosearch/dist/geosearch.umd.js.map ./app/js/libs/leaflet-geosearch/

# js-yaml
rm -rfv ./app/js/libs/yaml/*
mkdir -p ./app/js/libs/yaml/ && cp -R ./node_modules/js-yaml/dist/js-yaml.mjs ./app/js/libs/yaml/

# eventsource
rm -rfv ./app/js/libs/eventsource/*
mkdir -p ./app/js/libs/eventsource/ && cp -R ./node_modules/eventsource/example/eventsource-polyfill.js ./app/js/libs/eventsource/

# cesium
# -- NOTE - custom changes have been made to cesium so copying from node_moduels will overwrite those changes -- #
# rm -rfv ./app/js/libs/cesium/*
# mkdir -p ./app/js/libs/cesium/ && cp -R ./node_modules/cesium/Build/Cesium/* ./app/js/libs/cesium/
