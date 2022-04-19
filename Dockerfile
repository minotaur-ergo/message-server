FROM node:16
WORKDIR /project
ADD . .
RUN npm i
RUN npm run build

ENTRYPOINT node build/index.js
