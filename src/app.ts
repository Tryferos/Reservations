import express from 'express'
import path from 'path';
import session from 'express-session';
import {UserSession, UserCredentials, UserQuery, UserQuerySingle,  MySQLInsert, UserType} from './types/user'
import {StadiumBody, StadiumQuery} from './types/stadium';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mysql from 'mysql2';
import dotenv from 'dotenv';
import multer from 'multer';
import {insertStadium, insertUser, retrieveStadiums, retrieveUser, retrieveUserFieldById, verifyUser} from './db/queries'

dotenv.config({path: path.join(__dirname, '../.env.local')});

const app = express()
const port = 3000;

app.use(express.static('public'));
app.use('/stadiums', express.static('stadiums'));
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
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.urlencoded({limit: '50mb', extended: true}));

const imagesDirectory = 'stadiums/'
const index = path.join(__dirname, '../public/html/index.html')
const merchant = path.join(__dirname, '../public/html/merchant.html')
const stadiumCreation = path.join(__dirname, '../public/html/stadium-creation.html')
const user = path.join(__dirname, '../public/html/user.html')

app.post('/login', (req: UserSession, res) => {
    const {username, password, normal, merchant} = req.body as UserCredentials;
    if(!normal && !merchant){
        res.redirect('/?error=invalid_login_method');
    }
    const type = merchant ? UserType.Merchant : UserType.Normal;
    retrieveUser(con, username, password, type, (err, result: UserQuery) => {
        if(err) throw err;
       if(result.length > 0){
           req.session.userid = result[0].id;
           res.redirect('/');   
           return;
        }
        
        con.query(`select * from mydb.users where username = '${username}' and type = '${type}'`, (err, result: UserQuery) => {
            if(err) throw err;
            if(result.length > 0){
                res.redirect('/?error=wrong_password');
                return;
            }
            insertUser(con, username, password, type, (err, result) => {
                if(err) throw err;
                req.session.userid = `${result.insertId}`;
                res.redirect('/');   
            });
       });
    });
});

app.get('/user-type', (req: UserSession, res) => {
    const sezzion = req.session;
    if(sezzion.userid){
        retrieveUserFieldById(con, sezzion.userid, "type",(err, result: UserQuery) => {
            if(err) throw err;
            res.json(result[0].type);
        });
    }else{
        res.json(null);
    }
});

app.get('/stadiums', (req: UserSession, res) => {

    verifyUser(req, res, () => {
        retrieveStadiums(con, (err, result: StadiumQuery) => {
            if(err) throw err;
            res.json(result);
        });
    });

});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, imagesDirectory)
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + file.originalname)
    }
  })
  
  const upload = multer({ storage: storage })
app.post('/create-stadium', upload.single('image'),(req: UserSession, res, next) => {

    const body = req.body as StadiumBody;
    body.type = (body.type as unknown as string[]).join('x');
    const file = req.file;
    verifyUser(req, res, () => {
        if(!body.name || !body.type || !body.location || !body.price_total || !body.available_to || !body.available_from || !body.game_length || !body.sport){
            res.redirect('/stadium-creation?error=missing_fields');
            return;
        }
        if(file!=undefined){
            body.image = imagesDirectory+ file.fieldname + '-' + file.originalname;
        }
        insertStadium(con, req.session.userid as unknown as number, body, (err, result) => {
            if(err) throw err;
            res.writeHead(302, {
                'Location': '/'
            });
            res.end();
        });
    });

});
app.post('/stadium-creation', (req: UserSession, res) => {

    verifyUser(req, res, () => {
        res.sendFile(stadiumCreation);
    });

});

app.get('/username', (req: UserSession, res) => {
    verifyUser(req, res, () => retrieveUserFieldById(con, req.session.userid, "username",(err, result: UserQuery) => {
        if(err || result.length==0) throw err;
        res.json(result[0].username);
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

app.get('/merchant', (req: UserSession, res) => {
    const sezzion = req.session;
    if(sezzion.userid){
        res.sendFile(user);
        return;
    }else{
        res.sendFile(merchant);
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
        'CREATE TABLE IF NOT EXISTS mydb.users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255), password VARCHAR(255), type ENUM("Normal", "Merchant", "Admin"))', (res, err) => {
        }
    )
    con.query(
        'CREATE TABLE IF NOT EXISTS mydb.stadiums (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), type VARCHAR(255), sport VARCHAR(255), date BIGINT(255), photo_url VARCHAR(255)'+
            ', price_total FLOAT(255,2), available_from TINYINT(255), available_to TINYINT(255))', (res, err) => {
        }
    )
    return console.log('Express is listening in '+port);
})