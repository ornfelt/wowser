#!/bin/bash

# Start processes in background
npm run gulp &
npm run proxy 8086 127.0.0.1:8085 &
npm run proxy 3725 127.0.0.1:3724 &

# Wait for all background jobs to finish
wait

# Now also do:
# npm run serve
# npm run web-dev
