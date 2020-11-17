const express = require('express')
const sqlite = require('sqlite3');
require('dotenv').config()
const { Sequelize, DataTypes } = require('sequelize')
const multer = require('multer')

const storage = multer.diskStorage({
    destination: __dirname + '/files/',
    filename: function (req, file, cb) {
        cb(null, req.body.title + '.' + file.mimetype.split('/')[1])
    }
})

const upload = multer({ storage })

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './db/songsAPI'
})

const Album = sequelize.define('Album', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        require: true
    },
    artist: {
        type: DataTypes.STRING,
        require: true
    },
    source_file: DataTypes.STRING,
    songs: {
        type: DataTypes.ARRAY(DataTypes.STRING)
    }
}, {
    timestamps: false
});

const Song = sequelize.define('Song', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    title: DataTypes.STRING,
    album: {
        type: DataTypes.STRING,
        require: true
    },
    artist: {
        type: DataTypes.STRING,
        require: true
    },
    track_num: DataTypes.INTEGER,
    length: DataTypes.INTEGER,
    source: DataTypes.STRING
}, {
    timestamps: false
})

const app = express()
const port = process.env.PORT || 5001

app.get('/songs', (req, res) => {
    Song.findAll()
        .then(function (rows) {
            res.json(rows)
        })
})

app.get('/song/:song', (req, res) => {
    Song.findOne({
        where: {
            title: req.params.song
        }
    })
        .then(function (song) {
            console.log(song)
            res.sendFile(__dirname + '/' + song.source)
        })
        .catch(err => {
            console.log(err)
        })
})

app.post('/song/', upload.single('source'), (req, res) => {
    Song.create({
        title: req.body.title,
        album: req.body.album,
        artist: req.body.artist,
        track_num: req.body.tracknum,
        length: req.body.length,
        source: '/files/' + req.file.filename
    })

    res.json({ success: 'uploaded song' })
})

app.post('/song/update', upload.single('source'), (req, res) => {
    function splitAndJoin(arr1, arr2) {
        tempObj = {};
        let x = 0;
        while (x < arr1.length) {
            tempObj[arr1[x]] = arr2[x];
            x++;
        }
        return tempObj;
    }

    let valuesArr = [];
    let keysArr = (Object.keys(req.body).filter(function (key) {
        if (req.body[key] != '') {
            valuesArr.push(req.body[key].toLowerCase())
            return key
        }
    }))

    Song.update(
        splitAndJoin(keysArr, valuesArr)
        , {
            where: {
                title: req.body.title
            }
        })
        .then(function (data) {
            res.json({ success: "song updated" })
        })
        .catch(function (err) {
            res.json(err)
        })
})

app.delete('/song/', (req, res) => {
    db.get('SELECT * FROM SONGS WHERE id = ' + req.query.id, function (err, row) {
        if (row) {
            db.run("DELETE FROM songs WHERE id = " + req.query.id, function (err, row) {
                res.json({ success: "row deleted" })
            })
        } else {
            res.json({ err: "row not found" })
        }
    });
});

app.get('/albums', (req, res) => {
    function render(albums) {
        res.json(albums)
    }
    Album.findAll()
        .then(function (rows) {
            albums = [];
            if (rows.length == 0) {
                res.json({ err: "no albums found" })
            }
            rows.forEach((album, index, array) => {
                Song.findAll({
                    where: {
                        album: album.title
                    }
                })
                    .then(function (songs) {
                        if (songs.length == 0) {
                            album.dataValues.songs = 'no songs found'
                        }
                        album.dataValues.songs = songs
                        albums.push(album)

                        if (index + 1 == array.length) {
                            console.log(array)
                            res.json(albums)
                        }
                    })
            })
        })
})

app.get('/album/:title/', async (req, res) => {
    Album.findOne({
        where: {
            title: req.params.title
        }
    })
        .then(function (album) {
            album.dataValues.songs = [];
            Song.findAll({
                where: {
                    album: album
                }
            })
                .then((songs) => {
                    let songArr = [];
                    songs.forEach((song, arr, index) => {
                        songArr.push(song.dataValues)
                        console.log("%c NO ERROR", "color: black; background-color: white;")
                    })
                    album.dataValues.songs.concat(songArr);
                    res.json(album)
                })
                .catch(function(err) {
                    console.log("%c ERROR: " + err, "color: red; background-color: white;")
                    res.send(err)
                })

            .catch((err) => {
                console.log("%c ERROR", "color: red; background-color: white;")
                res.send(err)
            })
        })
})

app.get('/album/:title/src', (req, res) => {
    let album;
    let songs = [];

    Album.findOne({
        where: {
            title: req.params.title
        }
    })
        .then(function (album) {
            res.sendFile('/' + album.source_file)
        })
        .catch(function (err) {
            console.log(err)
        })
})

app.post('/album', upload.single('source'), (req, res) => {
    if (req.body.title == undefined || req.body.artist == undefined) {
        if (req.body.title == undefined) {
            res.json({ err: 'missing title' })
        } else if (req.body.artist == undefined) {
            res.json({ err: 'missing artist' })
        }
        res.json({ err: "missing a required parameter" })
    } else {
        Album.create({
            title: req.body.title.toLowerCase(),
            artist: req.body.artist.toLowerCase(),
            source_file: req.file.destination.substr(1) + req.file.originalname
        })
        res.json({ success: "album uploaded" })
    }
})

app.listen(port, (req, res) => {
    console.log(`listening on ${port}`);
})