FROM node:21.0.0

RUN apt-get update && apt-get install -y chromium

WORKDIR /usr/src/app

COPY . .

RUN npm install

EXPOSE 5173