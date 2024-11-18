#!/bin/bash

export GIT_REPOSITORY__URL="$GIT_REPOSITORY__URL"

git clone "$GIT_REPOSITORY__URL" /home/app/output || { echo "Git clone failed"; exit 1; }

exec node script.js