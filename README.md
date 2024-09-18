<img width="64px" src="liberator.png">

# Liberator

## Description

Frustrated with your data being held hostage by TV Time? This script will liberate your data and allow you to do whatever you want with it.

## Usage

### CLI

1. Clone the repository
1. Run `bun install` to restore dependencies
1. Configure the `.env` file with your TV Time username and password:
    ```env
    TV_TIME_USERNAME=your_username
    TV_TIME_PASSWORD=your_password
    ```
1. Run `bun cli` or `npm run cli` to start the CLI

### Extension

1. Download the extension from the latest build [here](https://github.com/Hobo-Ware/tv-time-liberator/actions/workflows/build.yml)
1. Install the extension in your browser (read more about unpacked extensions [here](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked))
1. Login to TV Time
1. Click on the extension icon
1. Liberate your data

## Output

### Shows
```json
[
    {
        "uuid": "c4199ff4-2055-4dc9-ab33-ecf7ffcec6e3",
        "id": {
            "tvdb": 366529,
            "imdb": "tt10574236"
        },
        "created_at": "1989-12-25 00:00:00",
        "title": "Station Eleven",
        "status": "stopped",
        "seasons": [
            {
                "number": 1,
                "episodes": [
                    {
                        "id": {
                            "tvdb": 8815687,
                            "imdb": "tt10579918"
                        },
                        "number": 1,
                        "special": false,
                        "is_watched": true,
                        "watched_at": "1989-12-25 00:00:00",
                    },
                    ...
                ]
            }
        ]
    },
    ...
]
```

### Movies
```json
[
    {
       "uuid": "978899c4-5194-4568-b922-0bd2874c4c1a",
       "id": {
            "tvdb": 169,
            "imdb": "tt0133093"
        },
        "created_at": "2024-09-13T10:49:58Z",
        "title": "The Matrix",
        "is_watched": false
    },
    ...
]
```