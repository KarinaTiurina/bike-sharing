#!/bin/bash

for i in {1..11}
do
   docker rmi -f emitters-e$i 2>/dev/null
done

docker compose -f docker_compose.yml up -d --wait
