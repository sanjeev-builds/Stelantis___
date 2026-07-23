# Docker Prompts

## Diagnose a compose failure
```
`docker compose up` fails with: [paste error]. Here's docker-compose.yml
and the Dockerfile for [service]: [paste or point to file]. Find the root
cause (build vs runtime vs networking) before changing anything.
```

## Add a new service
```
Add a [service name] service to docker-compose.yml that [does what],
following the existing pattern used for backend/frontend (env_file,
depends_on, volumes). It needs to talk to [other service] via [protocol/port].
```

## Speed up rebuild loops
```
Rebuilding [service] after every code change takes too long during dev.
Here's the Dockerfile: [paste]. Suggest layer-caching or volume-mount
changes to make local iteration faster without breaking the prod build.
```
