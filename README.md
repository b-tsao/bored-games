This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Environment Dependencies
Ubuntu 20.04
Node: v18.4.0<br />
npm: 8.12.1

Ubuntu 18.04
Node: v17.9.1 (Since Node v18.4.0 requires GLIBC_2.28)<br />
npm: 8.11.0

## Available Scripts

In the project directory, you can run:

### `npm run start:app`

Runs the app in development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm run start:server`

Runs the server in development mode.<br />

### `npm run start:server:watch`

Runs the server in development mode.<br />

The server will reload if you make edits.<br />

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />

The build includes both React and server files.<br />
The React bundle is located under `build/public`.

Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm start`

Runs the app in production mode.<br />
Open [http://localhost:8080](http://localhost:8080) to view it in the browser.

### `npm test:app`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run lint`

Runs tslint against the server.<br />

### `npm pack`

Builds the app for production if the `build` folder does not exist.<br />
See the section `npm run build` for more details.

Packages the minimal necessities for production deployment.<br />
The npm package is ready for publishing!

The package can be deployed after unpacking and running `npm install --only=production` and `npm start`.

Alternatively, the Docker directory contains build and update scripts for docker deployment.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
