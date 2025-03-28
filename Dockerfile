FROM browserless/chrome:latest

WORKDIR /app

COPY package.json .
COPY .env.example .env

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
