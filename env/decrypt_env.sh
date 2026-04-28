#!/bin/bash
cd "$(dirname "$0")"

for enc in *.enc; do
    sops --decrypt --input-type dotenv --output-type dotenv "${enc}" > "${enc::-3}env"
done
