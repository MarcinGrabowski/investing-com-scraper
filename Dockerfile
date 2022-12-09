FROM node:18-buster

RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y vim htop google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

RUN apt-get update -y && apt-get upgrade -y && apt-get install dumb-init -y

RUN mkdir -p /usr/src/app
RUN mkdir -p /usr/src/app/node_modules
RUN mkdir -p /usr/src/app/data
WORKDIR /usr/src/app
# COPY package.json /usr/src/app/
RUN chmod -R 777 /usr/src/app
RUN npm install
RUN npm install -g npm@9.1.3
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /usr/src/app \
    && chown -R pptruser:pptruser /usr/src/app/node_modules

USER pptruser

COPY index.js /usr/src/app/

EXPOSE 3000

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD [ "npm", "start" ]