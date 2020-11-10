const express = require('express')
const sqlite = require('sqlite3');
const bodyParser = require('body-parser')
require('dotenv').config()

const db = new sqlite.Database('./db/songsAPI');

const app = express()
const port = process.env.PORT || 5001

const jsonParser = bodyParser.json();

app.get('/songs', (req, res) => {
    db.serialize(function () {
        if (req.query.order_by) {
            db.all("SELECT * FROM songs ORDER BY " + req.query.order_by, function(err, rows) {
                if (err) {
                    console.log(err)
                }
                res.json(rows)
            })
        } else {
            db.all("SELECT * FROM songs", function(err, rows) {
                if (err) {
                    console.log(err)
                }
                res.json(rows)
            })
        }

        function handler(err, rows) {
            if (err) {
                console.log(err)
            }
            res.json(rows)
        }
    })
})

app.get('/song/', (req, res) => {
    if (req.query.id) {
        db.serialize(function () {
            db.get('SELECT * FROM SONGS WHERE id = ' + req.query.id, function (err, row) {
                if (err) {
                    res.json({ err: err })
                } else {
                    res.json({ row })
                }
            })
        })
    } else {
        res.json({ err: "no id found" })
    }
})

app.post('/song/', (req, res) => {
    if (typeof req.query.title == "undefined" || typeof req.query.album == "undefined" || typeof req.query.artist == "undefined") {
        res.json({ err: "missing a required field" });
    } else {
        db.serialize(function () {
            function parseArray(arr, quote = false) {
                if (quote) {
                    let tempArr = [];
                    arr.forEach(e => tempArr.push(`'${e}'`))

                    if (arr.length > 2) {
                        let tempArr = [];
                        arr.forEach(e => tempArr.push(`'${e}'`))
                        return tempArr.join(', ');
                    } else {
                        let tempArr = [];
                        arr.forEach(e => tempArr.push(`'${e}'`))
                        return tempArr.join(' ');
                    }
                } else {
                    if (arr.length > 2) {
                        return arr.join(', ')
                    } else {
                        return arr.join(' ')
                    }
                }
            }

            let keysArr = [];
            let valuesArr = [];
            Object.keys(req.query).forEach(e => {
                if (e != "id") {
                    keysArr.push(e)
                    valuesArr.push(req.query[e])
                }
            })
            db.run("INSERT INTO songs (" + parseArray(keysArr) + ") VALUES (" + parseArray(valuesArr, true) + ")", function (err) {
                if (err) {
                    console.log(err)
                    res.json(err)
                }
            });
        });
        res.json(req.query)
    }
})

app.put('/song/', (req, res) => {
    if (req.query.id) {
        db.serialize(function () {
            db.get("SELECT * FROM songs WHERE id = " + req.query.id.toString(), function (err, row) {
                if (err) {
                    console.log(err)
                } else {
                    function splitAndJoin(arr1, arr2) {
                        // assumes arrays are of the same length
                        let tempArr = [];
                        let x = 0;
                        while (x < arr1.length) {
                            if (typeof arr2[x] == 'number') {
                                tempArr.push(`${arr1[x]} = ${arr2[x]}`)
                            } else {
                                tempArr.push(`${arr1[x]} = '${arr2[x]}'`)
                            }
                            x++;
                        }

                        if (tempArr.length < 2) {
                            return tempArr.join(' ')
                        } else {
                            return tempArr.join(', ')
                        }
                    }

                    let keysArr = [];
                    let valuesArr = [];
                    Object.keys(req.query).forEach(e => {
                        if (e != "id") {
                            keysArr.push(e)
                            valuesArr.push(req.query[e])
                        }
                    })

                    db.run("UPDATE songs SET " + splitAndJoin(keysArr, valuesArr) + " WHERE id = " + req.query.id, function (err) {
                        if (err) {
                            res.json(err)
                        } else {
                            res.json({ success: 'row updated' })
                        }
                    })
                }
            });
        });
    }
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

app.listen(port, (req, res) => {
    console.log(`listening on ${port}`);
})