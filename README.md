# Overview
This is an incomplete project for the take home given by Town Square.

For purposes of marking, it can be run by running `npm run start` which will spin up a local express server.

Unfortunately due to time constraints I was not able to fix the bug which appended an undefined to my call to the Apollo Server from my local React application, and also as I can't expose the MONGO_URL (it is running in a private EC2 instance), Express will not be able to connect to Mongo via Mongoose.

Thanks for the opportunity for taking on this project even if I didn't get very far, I definitely intend to come back to this when I have more time and experience and build it up to a deployed app.

## Things to do
- Fix bugs such that frontend can query the Express server correctly.
- Properly configure vite to run express (likely using something like vite-express)
- Implement subscriptions on the frontend.
- Implement unit tests for resolvers and components
- Implement infinite scrolling
- Implement proper styling on the frontend.
- Host the project and add a build pipeline to it.
