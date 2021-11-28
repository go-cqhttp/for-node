FROM node:17-alpine

WORKDIR /app

RUN cd /app

COPY . .

VOLUME [ "/app/data" ]

RUN npm install

CMD ["npm", "run", "start"]