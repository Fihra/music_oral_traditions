const express = require("express");
const fs = require('fs');
const app = express();

app.use(express.json());

const PORT = 3000;

app.get("/", (req, res) => {
    res.send("backend running");
});

app.post('/update-json', (req, res) => {
    const newData = req.body;

    fs.writeFile("melodies.json", JSON.stringify(newData, null, 2), (err) => {
        if(err) return res.status(500).send("error writing file");
        res.send("File updated");
    })
})

app.listen(PORT, () => {
    console.log(`listening on port: ${PORT}`);
})