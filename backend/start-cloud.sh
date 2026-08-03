#!/bin/bash
cd "$(dirname "$0")"

export SPRING_PROFILES_ACTIVE=cloud

: "${JWT_SECRET:?JWT_SECRET must be set}"
: "${DB_URL:?DB_URL must be set}"
: "${DB_USERNAME:?DB_USERNAME must be set}"
: "${DB_PASSWORD:?DB_PASSWORD must be set}"

echo "Starting backend server..."
echo "Profile: $SPRING_PROFILES_ACTIVE"
echo "Database: configured cloud datasource"
echo "---------------------------------"

java -Djava.net.preferIPv4Stack=true -Djava.net.preferIPv4Addresses=true -jar target/tiesverse-basecamp-learning-0.0.1-SNAPSHOT.jar
