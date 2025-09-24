# Use a Cypress base image that includes Node.js and a browser.
FROM cypress/browsers:latest

# Set the working directory inside the container.
WORKDIR /e2e

# Copy the package.json and package-lock.json files to install dependencies.
# Using these files first leverages Docker's layer caching for faster builds.
COPY package*.json ./

# Install project dependencies.
RUN npm install

# Copy the entire project into the container.
COPY . .

# Set the default command to run Cypress tests in headless mode.
CMD ["npx", "cypress", "run"]