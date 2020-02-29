# Smart Screen

An application to show, in a minimal way, the primary information you need:

- Time
- Weather
- Date
- Spotify
- News
- Notifications (only Android)
- Calls

# Smart Screen Mobile App

To make it work properly, you'll need the [Smart Screen mobile application]()

# Run

To run it, you'll need [Node.js](https://nodejs.org/) for NPM and Node itself.

You need to install all the packages first:

`npm install`

And after that, you'll need to run it:

`node .`

It will run on your localhost:

`localhost:3000`

(if you want to change the PORT, go to index.js:142)

----------------

The local IP is on the top-right corner.  
You need to put it in the mobile application (look at **Smart Screen Mobile App** section), and click Connect. You'll hear a double fast vibration on your device, in case of successful connection.  
You must connect your devices on the same network, in order to let your device find the local IP associated to the Smart Screen application.  

# Sorry

The Front-end part was made pretty quickly, in order to make it work on 1024x768 resolution, because my objective was to use [this display](https://www.amazon.it/gp/product/B07K32M4LJ/ref=ppx_yo_dt_b_asin_title_o02_s00?ie=UTF8&psc=1) with a [Raspberry Pi 3B+](https://www.raspberrypi.org/products/raspberry-pi-3-model-b-plus/).

It works on a 1920x1080 monitor, but perhaps with some flaws.