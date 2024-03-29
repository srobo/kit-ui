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

### kit-ui Setup

Run `npm install`

Run `git config blame.ignorerevsfile .git-blame-ignore-revs` to get a better experience using git blame.

### Development

Run `npm start` to start the development server. You will then be able to navigate to [http://localhost:1234](http://localhost:1234) to see the UI.
