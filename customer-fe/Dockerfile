FROM node:20 as build

WORKDIR /frontend

COPY . ./

RUN npm install

EXPOSE 3000

RUN npm run build

CMD ["npm", "start"]