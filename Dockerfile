# Use a slim Node image
FROM node:18-slim

# Install Chrome + Puppeteer dependencies
RUN apt-get update && apt-get install -y \
  wget \
  gnupg \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgdk-pixbuf2.0-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils \
  && wget -q -O chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
  && apt install -y ./chrome.deb \
  && rm chrome.deb

# Set working directory
WORKDIR /app

# Copy and install dependencies
COPY package.json . 
COPY .env.example .env

# Let Puppeteer know we already have Chrome
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

RUN npm install

# Copy the rest of the app
COPY . .

# Expose the port your service runs on
EXPOSE 3000

# Run the app
CMD ["npm", "start"]
