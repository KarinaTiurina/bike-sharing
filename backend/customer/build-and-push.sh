REPO=europe-central2-docker.pkg.dev
IMAGE="${REPO}/bikesharing-420214/bike-sharing/customer_api:latest"

gcloud auth configure-docker $REPO
docker build -t $IMAGE .
docker push $IMAGE
