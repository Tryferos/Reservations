import express from 'express'
import path from 'path';
import session from 'express-session';
import {UserSession, UserCredentials, UserQuery, UserQuerySingle} from './types/user'
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mysql from 'mysql2';

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
const admin = path.join(__dirname, '../public/html/user.html')

app.post('/login', (req: UserSession, res) => {
    const {username, password} = req.body;
    con.query(`select * from mydb.users where username = '${username}' and password = '${password}'`, [username, password], (err, result: UserQuery) => {
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
            con.query(`insert into mydb.users (username, password) values ('${username}', '${password}')`, [username, password], (err, result: UserQuerySingle) => {
                if(err) throw err;
                req.session.userid = result.id;
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


app.get('/', (req: UserSession, res) => {
    const sezzion = req.session;
    if(sezzion.userid){
        res.sendFile(admin);
        return;
    }else{
        res.sendFile(index);
        return;
    }
})

app.get('/logout', (req: UserSession, res) => {
    req.session.userid = null;
    req.session.destroy((err) => {
        console.log('destory');
        res.redirect('/');
    });
})

const con = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: 'root',
    password: 'mysql_password_trifer_123_!',
});


app.listen(port, () => {
    con.query(
        'CREATE TABLE IF NOT EXISTS mydb.users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255), password VARCHAR(255))', (res, err) => {
            console.log('Table created');
        }
    )
    return console.log('Express is listening in '+port);
})