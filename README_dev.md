# Developer Guide

## Prerequisites

-   Docker
-   [Taskfile](https://taskfile.dev/installation/)
-   [httpie cli](https://httpie.io/cli)
-   Node.js / npm

## Taskfile tasks

The `Taskfile.yml` in this repository defines various tasks to help with the development and management of the custom Connector module. Here are the tasks defined:

-   **prepare**: Prepares the environment by installing necessary npm packages.
-   **build**: Builds the custom module after preparing the environment.
-   **watch**: Watches the custom module and rebuilds it on changes.
-   **up**: Starts the Connector using Docker Compose.
-   **restart**: Restarts the Connector.
-   **logs**: Shows the logs of the Connector.
-   **2fa-errors**: Calls the 2FA endpoint with error scenarios for testing.
-   **2fa**: Calls the 2FA endpoint with a valid request.
-   **dog**: Calls the dog endpoint to get a random dog name.

These tasks can be run using the `task` command followed by the task name, for example, `task build` to build the custom module.

## Development

To get started with development, follow these steps:

1.  Clone the repository:

    ```bash
    git clone https://github.com/nmshd/custom-connector-modules.git
    ```

2.  Change into the repository directory:

    ```bash
    cd custom-connector-modules
    ```

3.  Prepare the environment:

    ```bash
    task prepare
    ```

4.  Start the Connector:

    ```bash
    task up
    ```

5.  Watch the custom module for changes:

    ```bash
    task watch
    ```

6.  Make changes to the custom module and see the changes reflected in the Connector. Make sure to restart the Connector when finished:

    ```bash
    task restart
    ```

## Repository Structure

The repository is structured as follows:

-   `./`: Contains the main configuration files like `Taskfile.yml`, `compose.yml`, configuration for formatter etc. and the dependencies `tsc` needs to build the custom module. See [package.json](./package.json) to see which dependencies are needed to build the module. It's important that those dependencies are not installed in the custom module directory to avoid conflicts when mounting the custom module inside the Connector container.
-   `./custom-module`: Contains the custom module's code and its dependencies.
