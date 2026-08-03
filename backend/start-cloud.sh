#!/bin/bash
cd "$(dirname "$0")"

export SPRING_PROFILES_ACTIVE=cloud

export JWT_SECRET="VGhpcy1pcy1hLWJhc2VjYW1wLWNsb3VkLWRldi1zZWNyZXQta2V5LTMyLWJ5dGVzLWxvbmc="

export DB_URL="jdbc:postgresql://ep-wispy-wind-az0pqand-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channelBinding=require"
export DB_USERNAME="neondb_owner"
export DB_PASSWORD="npg_BeEZX7syJdK6"

echo "Starting backend server..."
echo "Profile: $SPRING_PROFILES_ACTIVE"
echo "Database: Neon PostgreSQL (cloud)"
echo "---------------------------------"

java -Djava.net.preferIPv4Stack=true -Djava.net.preferIPv4Addresses=true -jar target/tiesverse-basecamp-learning-0.0.1-SNAPSHOT.jar
