# Self Hosting

Docker is currently the recommended and only supported way of running the relay server in production.

## Docker

The docker image is published to the [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry#about-the-container-registry)
and can be pulled like so:

```
docker pull ghcr.io/headbase-app/relay
```

You can then run the image, for example by using a service like [Fly.io](https://fly.io/), [Railway](https://railway.com/), [Portainer CE](https://docs.portainer.io/start/install-ce) etc. Just remember:
- You must supply all required environment variables as defined in `.env.example`, at minimum this will include `PORT` and `ADMIN_SECRET` if you don't want the relay to be publicly usable.
- You will need to make sure you or your provider are exposing the port which matches the `PORT` environment variable you define.
