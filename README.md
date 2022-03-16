# kit-ui

A browser based interface for [Astoria](https://github.com/srobo/astoria) based systems.

## Local Setup

### Requirements

- Node
- npm
- Docker (recommended)

### Astoria Docker Setup

1. Clone [Astoria](https://github.com/srobo/astoria) and follow their docs on running in [Docker](https://srobo.github.io/astoria/development/index.html#running-in-docker).

2. Create a `robot.zip` and place it in astoria's `docker/usb` directory.

   To create a `robot.zip` zip up a `robot.py` file. Some exmaple code you could use can be found below

   ```python
    from time import sleep

    while True:
        print("Hello World!")
        sleep(1)
   ```

### kit-ui Setup

Run `npm install`

### Development

Run `npm dev` to start the development server. You will then be able to navigate to [http://localhost:4060](http://localhost:4060) to see the UI.
