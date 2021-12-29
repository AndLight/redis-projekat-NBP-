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
    
///////////////////////////////////////////////////////
// Home Page
    app.get('/', function(req, res){

        // client.rPush('todo', "jedan get");
        // client.rPush('todo', "dva get");
        
        client.lRange('todo', 0, -1, function(err, reply){}
            ).then(reply => {
                res.render('home', {tasks: reply});
            });
    });

    app.post('/task/add', function(req, res){
        let task = req.body.task;
        if (task === null || task.match(/^ *$/) !== null){
            console.log("Prazno polje uneto")
        }
        else{
            client.rPush('todo', task, function(err, reply){});
        }
        res.redirect('/');
    });

    app.post("/task/delete", function(req, res){
        let del = req.body.task;
        console.log("del "+ del)

        // console.log("lrange celo " +
        client.lRange('todo', 0, -1, function(err, todo){
           
            // for(let i=0; i< todo.lenth; i++){
            //     console.log("length: "+ todo.lenth)
            //     if(del.indexOf(todo[i]> -1)){
            //         //tasks[i]> -1 if it is in the list
            //         client.lRem('todo', 0, todo[i], function(){});
            //     }
            // }
            // res.redirect('/');
        }).then((todo) => {
            let todoLenth; 
            // console.log("todo "+todo)

            client.LLEN("todo", function(err, repply){}
                ).then(reply => {
                    todoLenth = reply;
                    // console.log("reply lenth "+reply +" " + todoLenth)

                    // console.log("len "+ todoLenth)
                        for(let i=0; i< todoLenth; i++){
                            console.log("length: "+ todoLenth)
                            if(del.indexOf(todo[i])> -1){
                                console.log("del.indexOf(todo[i])"+del.indexOf(todo[i]))
                                console.log("del.indexOf(todo[i]> -1) "+del.indexOf(todo[i]> -1))
                                console.log("deleting "+ todo[i])
                                //tasks[i]> -1 if it is in the list
                                client.lRem('todo', -2, todo[i], function(){});
                            }
                        }
                })

            // console.log("len "+ todoLenth)
            // for(let i=0; i< todo.lenth; i++){
            //     console.log("length: "+ todo.lenth)
            //     if(del.indexOf(todo[i]> -1)){
            //         //tasks[i]> -1 if it is in the list
            //         client.lRem('todo', 0, todo[i], function(){});
            //     }
            // }
            console.log("end")
            res.redirect('/');
        })
        // )
        // res.redirect('/');
    });
// End Home Page



///////////////////////////////////////////////////////

app.listen(port, function(){
    console.log('Server started on port '+port);
});
  