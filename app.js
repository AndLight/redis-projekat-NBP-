const express = require('express');
const bodyParser = require('body-parser');
const redis = require('redis');
const methodOverride = require('method-override');
const exphbs = require('express-handlebars');
const path = require('path');
const e = require('express');

// Create Redis Client
const client = redis.createClient({
    host: "redis-server",
    port: 6379
    });
    
    client.on('error', (err) => console.log('Redis server Error', err));
    client.on('connect', ()=>console.log('Redis server povezan'));  
    client.connect();
    client.on('ping',() =>ping());
    
// Set Port
	const port = 3000;
		
// Init app
	const app = express();
		
// Sets our app to use the handlebars engine
app.engine('handlebars', exphbs.engine({defaultLayout:'index'})); // layout je index.handlebars u views
app.set('view engine', 'handlebars');
app.use(express.static(path.join(__dirname, '/public')));
	

// body-parser
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended:false}));
		
// methodOverride
    app.use(methodOverride('_method')); //delete request na formi koristi _method parametar

// Home Page
    // app.get('/', function(req, res){
    //     res.render('home');            
    //         //homepage is going to render homepage
    //         //handlebar in views
    // });
    
///////////////////////////////////////////////////////

const obrisi = () =>{
    return [
        {
            name: "jedan"
        },
        {
            name: "dva"
        }
    ]
};


// app.get('/', function(req, res){
//     res.render('home', {lista: obrisi});
// });

// //SET

//     app.get('/', function(req, res){
//         client.rPush('todo', "get vrednost")
//     });

//GET

    //  (async () =>{
    //     lista =  await client.lrange('todo', 0, -1);
    //     console.log(lista)
    //  })
    
    app.get('/', function(req, res){

        client.rPush('todo', "jedan get");
        client.rPush('todo', "dva get");

        client.lRange('todo', 0, -1, function(err, reply){ 
                console.log("REPLY ******* "+reply)          
                res.render('home', {tasks: reply})
        })
        // res.render('home', {obrisia: obrisi});
    });

///////////////////////////////////////////////////////

app.listen(port, function(){
    console.log('Server started on port '+port);
});
  