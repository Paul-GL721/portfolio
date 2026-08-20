#!/usr/bin/env bash

set -euo pipefail

COMPOSE_FILE="./paulgobero_com/testdocker-compose.yml"

cleanup() {
    docker-compose -f "${COMPOSE_FILE}" down --volumes --remove-orphans
}

trap cleanup EXIT

echo "Checking Docker and Docker Compose"
docker-compose --version
docker version

echo "Building the test images"
docker-compose -f "${COMPOSE_FILE}" build

echo "Starting the test database"
docker-compose -f "${COMPOSE_FILE}" up -d testmongodb

echo "Running focused portfolio content tests"
docker-compose -f "${COMPOSE_FILE}" run --rm testapp npm run test:portfolio-content

echo "Running the full unit test suite"
docker-compose -f "${COMPOSE_FILE}" run --rm testapp \
    bash -c './wait-for testmongodb:27017 --timeout=600 -- npm run test:unit-inside-docker'

echo "All tests passed"
