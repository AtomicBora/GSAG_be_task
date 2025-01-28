# GSAG Backend task

## Dependencies

Make sure to check .npmrc and .node-version for node.js and pnpm versions that are used for this project.
If you are using some node version manager, there are ways to automatically set the node version to match the one used here. Consult your node version manager instruction manual for further details.

### Package Managers

---

The two most common ones are [NVM](https://github.com/nvm-sh/nvm) and, one newer, [FNM](https://github.com/Schniz/fnm).

> I am currently using fnm. 
> Using the `fnm use` command will do exactly that.

In case it's not able to automatically switch, please check the version in the .node-version file and try using

> `fnm use --install-if-missing 22.13.1`

I am using pnpm version 10.0.0 for this project.
To install pnpm run

> `npm install -g pnpm` **or** `wget -qO- https://get.pnpm.io/install.sh | env PNPM_VERSION=10.0.0 sh -` on **windows machines**
>
> > `For more information on pnpm installation visit their official site:` > > [PNPM installation instructions](https://pnpm.io/installation)

### Database

---

For this project I have used **PostgreSQL 17.2**
[Download PostgreSQL --- Official Webpage](https://www.postgresql.org/download/)

Once the versions are aligned with the project requirements and all of the required dependencies installed clone env-temaplte, and replace the values with your own.

After that, run the following commands to install the dependencies, build the project and run the server:

> `pnpm install --prod && pnpm run prod`

commands to install the necessary dependencies and build the project.

If you want to run the development environment, use the `pnpm dev` command.

### Documentation

---

This project has OpenAPI definitions (Swagger) describing routes, When the project is up and running, you can access `/docs` to see and use Swagger UI.

> I made Postman collection as well. It can be found on this link:
> [Postman Collection](https://mega.nz/file/6tMWQKJB#ioLC0CsLTcKnjmt8_0n8Rh7g0JETxK7UBgrNuJ2TFlE)

Download it, and import in your postman. Register a user, login and retrieve token, create environment variable Bearer and provide the token to it. Now you can access the rest of the routes.

### Docker

---

To run the project in a Docker container, you can run the following commands:

> Since the container is linked to the build from the host machine, we need to build and run the project before creating and running the container.

> add NODE_ENV=production to the .env file if you don't have it already.

```
pnpm prod
```
Once it's running, exit the process and build the Docker image:
```

docker-compose -p <container_name> build --no-cache # replace <container_name> with your desired name for the container, I used gsag_be_task
docker-compose -p gsag_be_task up -d

docker ps # to check if the container is running and get the container ID

docker exec -it <container_ID> psql -U postgres -f /docker-entrypoint-initdb.d/database_schema.sql # replace <container_ID> with the ID of the container you just created to create the database and tables.

```

This will build the Docker image and run the project in a container. The container will expose port 3000, so you can access it on your host machine at `http://localhost:3000`. The database connection details are stored in the `.env` file, so you can modify them as needed.

That's it! You can now access the API on `http://localhost:3000` and use the Swagger UI or Postman collection to interact with the API.