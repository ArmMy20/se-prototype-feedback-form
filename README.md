# To run from github repository
docker run --rm -d -p 8000:8000/tcp ghcr.io/armmy09/act-test:release

# To run from locally generated docker image 
docker run --rm -d -p 8000:8000/tcp <name>:latest

# To run jaeger APM
docker pull jaegertracing/all-in-one
 
docker run --rm --name jaeger \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  -p 5778:5778 \
  -p 9411:9411 \
  jaegertracing/all-in-one:latest
