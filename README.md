# shopping-api

### Description

This is the 'shopping-api' backend for assignment 3 for the oriental world frontend application

### How to run the backend

##### Prerequisites

- You need to have [Node.js](https://nodejs.org/en/) installed

##### Instructions

- Open terminal
- Navigate to `webtech-lab96/shopping-api`
- Run the command: `npm install`
- Finally, run the command: `npm run start`

#### Additional information

It can happen that you close the terminal in which the backend runs in wrongfully, which causes the
backend to run in the background while you have already closed it's terminal instance / process.

This will disallow you to easily close it from terminal.

This is why there is another command stated in the `package.json` named `kill-port` which you can run
to close the port the backend is running on, so you can restart the backend.

You can run it by the command: `npm run kill-port`
