#!/bin/bash

set -ex

# https://dotnet.microsoft.com/download/linux-package-manager/ubuntu16-04/sdk-current

wget -q https://packages.microsoft.com/config/ubuntu/16.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb

sudo apt-get install apt-transport-https
sudo apt-get update
sudo apt-get install -y dotnet-sdk-2.2
