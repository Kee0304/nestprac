FROM node:20 AS builder
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "run", "start:dev"]