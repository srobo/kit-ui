# kit-ui

A browser based interface for [Astoria](https://github.com/srobo/astoria) based systems.

## Local Setup

### Requirements

- Node
- npm
- Docker (recommended)

### Astoria Docker Setup

1. Clone [Astoria](https://github.com/srobo/astoria) and follow their docs on running in [Docker](https://srobo.github.io/astoria/development/index.html#running-in-docker).

2. Create a `robot.py` and place it in astoria's `docker/usb` directory.

   Some example code you could use can be found below

   ```python
    from time import sleep

    while True:
        print("Hello World!")
        sleep(1)
   ```

### Developing locally with a brain board

The Kit UI can be used to connect to a different MQTT broker, such as one running on a brain board.
This can be set by running `localStorage.setItem('brokerHost', '<brain board IP here>');` in the browser console.

### kit-ui Setup

Run `npm install`

Run `git config blame.ignorerevsfile .git-blame-ignore-revs` to get a better experience using git blame.

### Development

Run `npm start` to start the development server. You will then be able to navigate to [http://localhost:5173](http://localhost:5173) to see the UI.
