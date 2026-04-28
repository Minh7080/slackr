#!/bin/bash

cd "$(dirname "$0")"

for env in *.env; do
    sops --encrypt "$env" > "${env::-3}enc"
done
