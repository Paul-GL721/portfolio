#1. From the nodejs base image
FROM mongo-express:latest

#2. Create a work directory
WORKDIR /mongodbUI

#3. Script to wait for the database service before starting the app
#RUN apt-get -q update && apt-get -qy install netcat
COPY wait-for /mongodbUI/
RUN chmod +x /mongodbUI/wait-for

ENTRYPOINT ["/mongodbUI/wait-for", "mongo:27017", "--timeout=90", "--", "docker-entrypoint.sh"]
