FROM browserless/chrome:latest

WORKDIR /app

COPY package.json .
COPY .env.example .env

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
ENV PUPPETEER_SKIP_DOWNLOAD=true

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
