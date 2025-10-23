#!/bin/bash

gh --version
whoami
echo usr=$USER

# Switch user and login and push image to docker hub 
#(credentials are in the pass credsStore) 
sudo su root <<HERE
whoami
echo usr=$USER
					
echo \$GH_TOKENCRED_PSW|gh auth login --with-token
gh auth status
gh pr create --title "Staging branch successful" --body "Staging branch version1.0 needs to be merged into production" --base production
gh auth logout
HERE

