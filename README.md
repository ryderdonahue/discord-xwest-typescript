# XWest Discord Bot

XWest bot is a Discord bot created to expand server functionality as well as add quality of life features and user management tools.

## Licenses

If you wish to fork this bot for your own server please note the two licenses included in this repo

### Prerequisites

```Node v10.14.2 or above required
npm
typescript
```

### Installing

```
npm install
```

### Running

First you must provide an api key for your bot you are developing with:
* Copy the sample in `botkey.sample.ts` and insert your own API key

Since this project utilizes Typescript for type safety and code readability, its recommended to run the following command in order to have the Typescript compiler constantly watching for code changes and compiling them:
```
npm run build:watch
```

After this command is run any saved changes with automagically be compiled.

To run the bot simply run:
```
npm run start
```

Visual Studio Code debug configurations are also included so you can launch bot directly from there as well

## Deployment

There are no automated deployment included at this time

## Built With

* [DiscordJS](https://discord.js.org/#/)
* [Typescript](https://www.typescriptlang.org/)

## Contributing

While contributions are not intended, they are welcome. Please create a PR for this project and it will be reviewed on a set of secret criteria.

## Authors

* **Ryder Donahue** - sole proprieter 

## License

This project is licensed under:

[No Harm License](https://github.com/ryderdonahue/no-harm-license)

[MIT License](https://opensource.org/licenses/MIT)
