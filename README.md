# Flow

Flow is a CLI for monitoring working time and synchronizing worklogs with the Tempo plugin for Jira.

## Getting Started

### Prerequisites

- Node.js 12 or higher

### Authentication

- Generate a Jira API token by [following these instructions](https://confluence.atlassian.com/cloud/api-tokens-938839638.html)
- Generate a Tempo API token by going to **Tempo > Settings** and selecting **API integration**

### Installing

Install dependencies and compile:

```
yarn && yarn run build
```

Copy the sample `.env` file in the project directory:

```
cp sample.env .env
```

Configure the `.env` file with your Jira and Tempo API endpoints and credentials, as well as your preferred directory for the worklog database.

Create a global symlink:

```
yarn link
```

### Running

See the available commands:

```
flow --help
```

#### Special features

`flow start` without an argument will start a worklog corresponding to the Jira issue number in the checked out Git branch.

`flow push` will round your outstanding worklogs to the nearest 15-minute interval and open a text editor for you to add worklog descriptions and make adjustments before pushing to Tempo.

## License

This project is licensed under the MIT License.

Copyright (c) 2020 Igor Sadikov

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Acknowledgments

- Partly inspired by [Watson](https://tailordev.github.io/Watson/)
