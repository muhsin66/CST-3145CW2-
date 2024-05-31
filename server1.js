const express = require('express')

const app = express()

app.use(express.json())
app.set('port', 3000)
app.use ((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
})

const MongoClient = require('mongodb').MongoClient;

let db;

MongoClient.connect('mongodb+srv://abdubash04:Family01234@cluster0.datjqek.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', (err, Client)=>{
    db = Client.db('webstore');
})

app.get('/', (req, res, next) => {
    res.send('Select a collection, e.g., /collection/messages')
})

app.post("/search/collection/:collectionName/", (req, res, next) => {
    var search = req.body.search;
    var sort = req.body.sort || "title";
    var order = req.body.order == "desc" ? -1 : 1;
  
    if (search) {
      search = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { subject: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
        ],
      };
    } else {
      search = {};
    }
  
    db.collection(req.params.collectionName)
      .find(search)
      .sort({ [sort]: order })
      .toArray((e, results) => {
        if (e) return next(e);
        res.send(results);
      });
  });
  

app.post('/collection/:collectionName', (req, res, next) => {
    req.collection.insert(req.body, (e, results) => {
        if (e) return next(e)
            res.send(results.ops);
        
    })
})

app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName)
    console.log(req);
        return next()
    })

app.get('/collection/:collectionName', (req, res, next) =>{
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e)
            res.send(results)
        
    })
})

app.put('/collection/:collectionName/:id', (req, res, next)=>{
    req.collection.update(
        {_id: new objectID(req.params.id)},
        {$set: req.body},
        {safe: true, multi: false},
        (e, result) => {
            if (e) return next (e)
                res.send((result.result.n === 1) ? {msg: 'success'} : {msg : 'error'})
        }
    )
})

app.delete('collection/:collectionName/:id', (req, res, next) => {
    req.collection.deleteOne(
        {_id: objectID(req.params.id)},(e, result) => {
            if (e) return next (e)
                res.send((result.result.n === 1)?
            {msg: 'success'} : {msg: 'error'})
        } )
})
app.listen(3000, ()=>{
    console.log('express.js server running at localhost:3000');
})