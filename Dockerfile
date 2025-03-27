FROM node:18-slim

# Install necessary dependencies for Puppeteer
RUN apt-get update && apt-get install -y   wget   ca-certificates   fonts-liberation   libappindicator3-1   libasound2   libatk-bridge2.0-0   libatk1.0-0   libcups2   libdbus-1-3   libgdk-pixbuf2.0-0   libnspr4   libnss3   libx11-xcb1   libxcomposite1   libxdamage1   libxrandr2   xdg-utils   chromium   --no-install-recommends &&   rm -rf /var/lib/apt/lists/*

# Install Google Chrome Stable
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - && \
  sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list' && \
  apt-get update && apt-get install -y google-chrome-stable && \
  rm -rf /var/lib/apt/lists/*
  
# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json .
COPY .env.example .env
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
RUN npm install

# Copy the rest of the app
COPY . .

# Expose the port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
