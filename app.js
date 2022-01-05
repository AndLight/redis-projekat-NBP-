const express = require('express');
const bodyParser = require('body-parser');
const redis = require('redis');
const methodOverride = require('method-override');
const exphbs = require('express-handlebars');
const path = require('path');
const { response } = require('express');

//#region [rgba (0,128,128, 0.1)] SETUP
// Create Redis Client
const client = redis.createClient({
    host: "redis-server",
    port: 6379
    });
    
    client.on('error', (err) => console.log('Redis server Error', err));
    client.on('connect', ()=>console.log('Redis server conected'));  
    client.connect();
    
// Set Port
	const port = 3000;
		
// Init app
	const app = express();
	    
// Sets our app to use the handlebars engine
app.engine('handlebars', exphbs.engine({defaultLayout:'index'})); // layout je index.handlebars u views
app.set('view engine', 'handlebars');
app.use(express.static(path.join(__dirname, '/public/style.css')));
// app.use(express.static(path.join('/public')));
// app.use(express.static('public'));

// body-parser
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended:false}));
		
// methodOverride
    app.use(methodOverride('_method')); //delete request na formi koristi _method parametar

//#endregion
///////////////////////////////////////////////////////
//#region [rgba (255 ,0 ,0 , 0.1)] HOME
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

    //Render home page
        app.get('/', function(req, res, next){
            res.render('/');
        });

    //Add user 
        app.get('/user/add', function(req, res, next){
            res.render('adduser');
        });

    //Game
        app.get('/user/game', function(req, res, next){  
            
            let names= [];   
            let value = [];
            client.hGetAll("scores", function(err, obj){}
                ).then((reply)=>{
                    
                    
                        for(i in reply){
                            // names.push(i);
                            value.push(reply[i]);
                            
                        }

                        //sort
                        value=value.sort(function(a,b){return(+a)-(+b)});
                        value.reverse();
                        console.log('sorted value ' + value)

                        for(let a=0; a<value.length; a++){
                            for (b in reply){
                                if(value[a]== reply[b]){
                                    if(!names.includes(b)){
                                        names.push(b); 
                                    }
                                }
                            }
                        }
                        console.log(names)
                        
                })
                res.render('game', {name: names, value: value});
            // res.render('game');
        });


// End Home Page
//#endregion
///////////////////////////////////////////////////////
//#region [rgba (0,0,255, 0.1)] GAME
//Game page

const PI = "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989";
function countPI(pi_value){
    let br=0;
    for(let i=0; i<pi_value.length;i++){
        if(PI[i]===pi_value[i]){
            br++;
        }
        else{
            return br;
        }
    }
    return br;
};

app.post('/user/game', function(req, res, next){
    
    let player_name = req.body.player_name;
    let pi_value = req.body.pi_value;
   
    let score= countPI(pi_value);
    
    // client.zAdd("scores", ""+score, ""+player_name, function (err, reply) {});
    // client.zRevRank("scores", player_name, function(err, reply){}
    //     ).then(reply => {
    //         res.render('/user/game', {rank: reply});
    //     });

    if(player_name === "" || pi_value === ""){
        res.render('game', {
                            
            resultInputForGame: 'Please fill in all the fields'
            }) 
    }
    else{
        client.hExists('scores', player_name, function(err, r){}).then (repy => {
                
            if(repy){
                    // console.log('postoji')
                    let scoreFile;
                    
                    client.hGet('scores', player_name, function(err, result){}
                    ).then( res =>{
                        
                        scoreFile = res;
                        // console.log("scoreFile: "+ scoreFile)
                        // console.log("score: "+ score)
                        if(score  > scoreFile){
                            client.hSet('scores', player_name, score, function(err, res){}
                            ).then(()=> {
                                //console.log('Value is set for player '+ player_name+" to "+ score)
                                })
                                
                            }
                        });
                    }
                    else{
                        // console.log('ne postoji')
                        
                        client.hSet('scores', player_name, score, function(err, res){}
                        ).then(()=> {//console.log('New player added '+ player_name+" with score "+ score)
                        })
                    }
                    
                    // res.render('game', {
                            
                    //     resultInputForGame: 'Score for player: '+ player_name+" is "+ score
                    //     }) 
                    
                })
    }
    res.redirect('/user/game');
});

//End game page
//#endregion
///////////////////////////////////////////////////////
//#region [rgba(0, 205, 30, 0.1)] USER PAGE
//user page
app.post('/user/add', function(req, res, next){
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let email = req.body.email;
    let phone = req.body.phone;
  
    client.hSet(email, [
      'first_name', first_name,
      'last_name', last_name,
      'email', email,
      'phone', phone
    ], function(err, reply){
      if(err){
        console.log(err);
      }
      console.log(reply);
      
    });
    //nazad na homepage
    res.redirect('/user/add');
  });

  //Search user
  app.post('/user/search', function(req, res, next){
    let id = req.body.id;

    client.hGetAll(id, function(err, obj){}
    ).then((obj) => {

        if(!obj.email){
            res.render('adduser', {
            errorSearch: 'User does not exist'
            });
        } else {
            obj.email = id;
            res.render('details', {
            user: obj
            });
        }
    });

    // Delete User
    app.delete('/user/delete/:email', function(req, res, next){
        client.del(req.params.email);
        res.redirect('/');
    });


  });

  app.post("/task/delete", function(req, res){
    let del = req.body.task;
    client.lRange('todo', 0, -1, function(err, todo){
    }).then((todo) => {
        let todoLenth; 
        client.LLEN("todo", function(err, repply){}
            ).then(reply => {
                todoLenth = reply;
                    for(let i=0; i< todoLenth; i++){
                        if(del.indexOf(todo[i])> -1){
                            client.lRem('todo', -2, todo[i], function(){});
                        }
                    }
            })
        res.redirect('/');
    })
});
//end user page
//#endregion
//////////////////////////////////////////////////////

app.listen(port, function(){
    console.log('Server started on port '+port);
});
  