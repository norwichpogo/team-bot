# Lapras requires node 8 or above
FROM node:8

# Use /usr/src/app as the working directory
WORKDIR /usr/src/app

# Install package dependencies
COPY package.json /usr/src/app
RUN npm install

# Copy source files
COPY . /usr/src/app

# Run app.py when the container launches
CMD ["node", "index"]
