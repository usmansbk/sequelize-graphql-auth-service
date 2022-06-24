dev-image:
	docker build . --tag usmansbk/auth-server -f docker/Dockerfile

build:
	docker build . --tag usmansbk/auth-server:prod -f docker/Dockerfile.production

start:
	docker-compose up