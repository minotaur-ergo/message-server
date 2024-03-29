FROM node:20
WORKDIR /project
ADD . .
RUN npm i
RUN npm run build

ENTRYPOINT node build/index.js
