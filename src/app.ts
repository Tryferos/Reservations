import express from 'express'
import path from 'path';
import session from 'express-session';
import {UserSession, UserCredentials, UserQuery, UserQuerySingle, StadiumQuery, MySQLInsert} from './types/user'
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mysql from 'mysql2';
import dotenv from 'dotenv';
import {insertUser, retrieveUser, retrieveUserById, verifyUser} from './db/queries'

dotenv.config({path: path.join(__dirname, '../.env.local')});

const app = express()
const port = 3000;

app.use(express.static('public'));
app.use(cors());
app.use(session({
    secret: 'apotinathinathapigenwstinpatra',
    cookie: {
        sameSite: 'strict',
        maxAge: 86400000,
    },
    resave: false,
    saveUninitialized: true,
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());


const index = path.join(__dirname, '../public/html/index.html')
const user = path.join(__dirname, '../public/html/user.html')

app.post('/login', (req: UserSession, res) => {
    const {username, password} = req.body;
    retrieveUser(con, username, password, (err, result: UserQuery) => {
        if(err) throw err;
       if(result.length > 0){
           req.session.userid = result[0].id;
           res.redirect('/');   
           return;
        }
        
        con.query(`select * from mydb.users where username = '${username}'`, (err, result: UserQuery) => {
            if(err) throw err;
            if(result.length > 0){
                res.redirect('/?error=wrong_password');
                return;
            }
            insertUser(con, username, password, (err, result) => {
                if(err) throw err;
                req.session.userid = `${result.insertId}`;
                res.redirect('/');   
            });
       });
    });
})

app.get('/create', (req, res) => {
    const sezzion = req.session;
    console.log(sezzion);
    res.sendFile(index);
})

app.get('/stadiums', (req: UserSession, res) => {

    verifyUser(req, res, () => {
        con.query('select * from mydb.stadiums', (err, result: StadiumQuery) => { 
            if(err) throw err;
            res.json(result);
        });
    });

});

app.get('/username', (req: UserSession, res) => {
    verifyUser(req, res, () => retrieveUserById(con, req.session.userid, (err, result: UserQuery) => {
        if(err || result.length==0) throw err;
        res.json(result.at(0));
    }));
})


app.get('/', (req: UserSession, res) => {
    const sezzion = req.session;
    if(sezzion.userid){
        res.sendFile(user);
        return;
    }else{
        res.sendFile(index);
        return;
    }
})

app.get('/logout', (req: UserSession, res) => {
    req.session.userid = null;
    req.session.destroy((err) => {
        res.redirect('/');
    });
})

const con = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT as unknown as number,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});


app.listen(port, () => {
    console.log("runing in: "+`http://localhost:${port}`);
    con.query(
        'CREATE TABLE IF NOT EXISTS mydb.users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255), password VARCHAR(255))', (res, err) => {
        }
    )
    con.query(
        'CREATE TABLE IF NOT EXISTS mydb.stadiums (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), type VARCHAR(255), sport VARCHAR(255), date BIGINT(255), photo_url VARCHAR(255)'+
            ', price_total FLOAT(255,2), available_from TINYINT(255), available_to TINYINT(255))', (res, err) => {
        }
    )
    return console.log('Express is listening in '+port);
})