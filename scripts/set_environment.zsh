#!/bin/zsh

ENVIRONMENT_FILE=".devcontainer/.zshenv"

rm -rf $ENVIRONMENT_FILE
touch $ENVIRONMENT_FILE

echo "export LC_ALL=C" >> $ENVIRONMENT_FILE
echo "export USER=$USER" >> $ENVIRONMENT_FILE
