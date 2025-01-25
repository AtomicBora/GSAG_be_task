# GSAG_be_task

Make sure to check .npmrc and .node-version for node.js and pnpm versions that are used for this project. If you are using some node version manager, there are ways to automatically set the node version to match the one used here. Consult your node version manager instruction manual for further details.

The two most common ones are [NVM](https://github.com/nvm-sh/nvm) and, one newer, [FNM](https://github.com/Schniz/fnm).

>I am currently using fnm. 
Using the `fnm use` command will do exactly that.

In case it's not able to automatically switch, please check the version in the .node-version file and try using 

>`fnm use --install-if-missing 22.13.1`

Once the versions are aligned with the project requirements, run
>`pnpm i && pnpm build`

commands to install the necessary dependencies and build the project.

If you want to run the development environment, use the `pnpm dev` command.
