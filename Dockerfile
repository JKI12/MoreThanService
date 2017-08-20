FROM node:8

RUN npm install -g pm2

EXPOSE 3000

WORKDIR /opt/app/more_than

COPY node_modules node_modules

COPY dist ./dist
COPY package.json .

WORKDIR /opt/app/more_than/dist

CMD ["pm2-docker", "index.js"]