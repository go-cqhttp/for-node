FROM node:latest

COPY . .

VOLUME [ 'data' ]

RUN npm install

CMD ['npm', 'run', 'start']