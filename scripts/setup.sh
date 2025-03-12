#!/bin/bash
set -e

yay -S curl direnv
curl -fsSL https://get.jetify.com/devbox | bash

devbox install
