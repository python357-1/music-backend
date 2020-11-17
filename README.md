# DEPENDENCIES

## deploy dependencies (always required)
better-sqlite3
dotenv
express
sqlite3

install all of these by using `npm install --production or by setting the node variable`

## dev dependencies (not required, nice to have)
nodemon

install these along with deploy dependencies by using `npm install --production=false or by unsetting the production node variable`

# Song API
## guide on song API

# Retrieve Song Information:

### GET `/song`
#### Displays all songs with full information

### GET `/song/:id, /song/:title`
#### Displays entire song information
```
{
    id: ???
    title: String,
    album: String,
    artist: String,
    track_num: Int,
    length: Int,
    song_source: Blob
}
```

### GET `/album/:id, /album/:title`
#### Displays entire album information
```
{
    id: ???
    title: String,
    artist: String,
    length: Int,
    song_num: Int,
    songs: [
        {
            id: ???,
            source_id: ???,
        }...
    ]
}
```

### GET `/song/:id?param, /song/:title?param, /album/:id?param, /album/:title?param`
#### Displays any number of parameters from any object
```
GET http://url/song/examplesong?return=title

{
    "title": "examplesong"
}
```

```
GET http://url/album/examplealbum?return=artist,title

{
    "artist": "exampleartist",
    "title": "exampletitle"
}
```

# Upload New Song

### POST /song/
#### Create new song with json object

## If successful:
```
{
    "success": {
        // song object you sent 
    }
}
```
## If failed:
```
{
    "err": err
}
```

### POST /album/
#### Create new album with json object

## If successful:
```
{
    "success": {
        // album object you sent
    }
}
```

## If failed:
```
{
    "err": err
}
````
