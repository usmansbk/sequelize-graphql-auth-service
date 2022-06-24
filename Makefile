dev-image:
	docker build . --tag usmansbk/auth-server -f docker/Dockerfile

start:
	docker-compose up