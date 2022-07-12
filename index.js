import express from "express";
import session from "express-session";
import fs from "fs";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bodyParser from "body-parser";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static("public"));

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(session({
    secret: "Hello World",
    saveUninitialized: true
}));

app.set('views', path.join(__dirname, '/views'));
app.set("view engine", "pug");

app.get("/todo/app.js", (req, res) =>{
    if(req.session.isLogin)
        res.sendFile(__dirname + "/todo/app.js");
})

app.get("/todo/style.css", (req, res) =>{
    if(req.session.isLogin)
        res.sendFile(__dirname + "/todo/style.css");
})

app.get("/", (req, res) =>{
    if(req.session.isLogin)
    {
        // res.render(__dirname + "/todo/todo.pug", {user: req.session.username});
        res.render("todo", {user: req.session.username});
    }
    else
    {
        res.redirect("/login-signup.html");
    }
});

app.post("/login", (req, res) =>{
    let username = req.body.username;
    let password = req.body.password;

    readUserData((err, users) =>{
        if(err)
        {
            res.status(201);
            res.end("Error in finding user.");            
        }
        else
        {
            let ourUser  =  users.filter((user) =>{
                return user.username === username;
            });

           if(ourUser.length != 0)
           {
                if(ourUser[0].password === password)
                {                    
                    req.session.username = username;
                    req.session.isLogin = true;
                    res.status(200);
                    res.end("http://localhost:3000/");
                }
                else
                {
                    res.status(201);
                    res.end("Invaild username or password.");
                }
           }
           else
           {
                res.status(201);
                res.end("You must sign up first.")    ;
           }


        }
    });
});


app.post("/sign-up", (req, res) =>{
    let username = req.body.username;
    
    console.log(req.body);
    readUserData((err, users) =>{
        if(err)
        {
            res.end("Error in finding user.");
        }
        else
        {
            let ourUser = users.filter((user) =>{
                return username === user.username;
            });

            console.log(ourUser);
            if(ourUser.length === 0)
            {
                users.push(req.body);

                fs.writeFile("user-data.txt", JSON.stringify(users), err =>{
                    if(err)
                        console.log(err);
                });

                // res.sendFile(__dirname + "/public/login-signup.html");
                res.status(200);
                res.end("");
            }
            else
            {                
                res.end("user already exists.");
            }
        }
    })
});

app.get("/logout", (req, res) =>{
    req.session.destroy();
    res.end();
})

app.post("/save", (req, res)=>{
	if(req.session.isLogin)
    {
        console.log(req.body);
        readUserData((err, users) =>{
            if(err)
            {

            }
            else
            {
                users.forEach(user =>{
                    if(user.username === req.session.username)
                        user.todos = req.body;
                })
                

                fs.writeFile("user-data.txt", JSON.stringify(users), (err)=>{
                    if(err)
                    {
                        res.end("error");
                    }
                    else
                    {			
                        res.send();
                    }
                });
        
            }
        })
    }
})


app.get('/todo', (req, res)=>{
    if(req.session.isLogin)
    {
        readUserData((err, users)=>{
            if(err)
            {
                res.end("error");

            }
            else
            {                
                let ourUser = users.filter(user =>{
                    return user.username === req.session.username;
                });

                res.end(JSON.stringify(ourUser[0].todos));		    
            }
        });
    }
})




function readUserData(callback)
{
    fs.readFile("user-data.txt", "utf-8", (err, data) =>{
        if(err)
        {
            callback(err, null);
        }
        else
        {
            let users = [];
            if(data !== "")
                users = JSON.parse(data);

            callback(null, users);
        }
    });
}

app.listen(port, () =>{
    console.log(`server listen at http://localhost:${port}`);
})

