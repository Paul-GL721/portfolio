#Allow external connections to mongodb
#change the bind_ip and enable authentication

FROM mongo:6

COPY mongod.conf.orig /etc
# MongoDB configuration
#COPY ./mongod.conf.orig /etc/mongod.conf

#Add new user
#COPY MongoUser.js /docker-entrypoint-initdb.d

# Volume for MongoDB data
#VOLUME /data/db

# Expose the MongoDB port
#EXPOSE 27017

# Copy the MongoDB setup script to the container
#COPY setup-mongodb.sh /docker-entrypoint-initdb.d/

# Start MongoDB when the container runs
#CMD ["mongod", "--config", "/etc/mongod.conf"]
