# Docker Images
The `headbase-app/relay` docker image is automatically created and published via GitHub actions when a tag is created or pushed.

### Manually creating an image
To manually create a docker image locally for testing you can run:

```
docker build . --tag headbase-relay
```

### Run the image
```
docker run -p 8080:8080 -e PORT=8080 -e ACCESS_SECRET="testing" --name hb-relay-1 headbase-relay
```

### List running images
```
docker ps
```

### Kill the running image
```
docker kill hb-relay-1
```

### Create a container to inspect contents
```sh
# create a container from the build image
docker create --name hb-relay-inspect headbase-relay

# export the container contents
docker export hb-relay-inspect > hb-relay-inspect.tar
```
