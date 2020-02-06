#Image
FROM node:alpine3.10

#Create directory
WORKDIR /usr/src/core

#Copy dependencies
COPY package*.json ./

#Install MongoDB
RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.10/main' >> /etc/apk/repositories
RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.10/community' >> /etc/apk/repositories
RUN apk update
RUN apk add mongodb

#Create MongoDB data directory
RUN mkdir /data/db -p

#Install dependencies
RUN npm install

#Create directories
RUN mkdir crypto files

#Generate salt
RUN openssl rand -out ./crypto/secret.txt -base64 512

#Bundle source code
COPY . .

#Expose port 443
EXPOSE 443

#Run server
CMD ["node", "app.js"]