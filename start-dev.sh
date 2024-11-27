#!/bin/bash

# Start the API server
npm run start:server &

# Start the Electron app
npm run dev:electron &

# Wait for both processes
wait
