const express = require('express');
const app = express();
const redis = require('redis');
const client = redis.createClient();

client.mset('header',0,'left',0,'article',0,'right',0,'footer',0);
client.mget(['article','header','left','right','footer'],
    function(err, value) {
        console.log(value)
});

function data() {
    return new Promise((res,rej) => {
        client.mget(['article','header','left','right','footer'],
        function(err,value) {
            const data = {
                'article': Number(value[0]),
                'header': Number(value[1]),
                'left': Number(value[2]),
                'right': Number(value[3]),
                'footer': Number(value[4])
            };
            err ? rej(null) : res(data)
        })
    })
}

app.use(express.static('public'));
app.get('/data', function (req, res) {
    data()
        .then(data => {
            console.log(data)
            res.send(data);
        });
});

app.get('/update/:key/:value', function (req, res) {
    const key = req.params.key;
    let value = Number(req.params.value);
    client.get(key, function(err,reply) {
        value = Number(reply) + value;
        client.set(key, value);
        data()
        .then(data => {
            console.log(data)
            res.send(data);
        });
    
    })
    

});

app.listen(3000, function () {

    console.log('Running on port: 3000');

});
