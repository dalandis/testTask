const express = require('express');
const app = express();
const appTracker = express();
const path = require('path');
const { validationResult, body } = require('express-validator');
const {MongoClient} = require('mongodb-legacy');

const client = new MongoClient("mongodb://localhost:27017/");
const db = client.db();
const collection = db.collection('tracks');

// можно использовать npm cors
appTracker.use((req, res, next) => {
    const origin = Array.isArray(req.headers.origin) ? req.headers.origin[0] : req.headers.origin;

    if (/localhost:8000/.test(origin)) {
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    }

    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    next();
});

appTracker.use(express.json()); 

//валидатор
function eventValidator () {
    return [
        body().isArray(),
        body('*.event', 'must be string').exists().isString(),
        body('*.tags', 'must be array').exists().isArray(),
        body('*.url', 'must be a url').exists().isURL({ require_tld: false }),
        body('*.title', 'must be string').exists().isString(),
        body('*.ts', 'must be a URL').exists().isString(),
    ];
}

app.use('/static', express.static('public'));

app.get(['/', '/1.html', '/2.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
})

appTracker.post('/tracker', eventValidator(), async (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    collection.insertMany(req.body);

    res.sendStatus(200);
})

app.listen(8000, () => {
    console.log('Example app listening on port 8000');
})

appTracker.listen(8001, () => {
    console.log('Example app listening on port 8001');   
});
