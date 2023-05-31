import express from 'express'
import path from 'path';
import session from 'express-session';
import {UserSession, UserCredentials, UserQuery, UserQuerySingle,  MySQLInsert, UserType} from './types/user'
import {Reservation, ReservationBody, StadiumBody, StadiumQuery, Weekday} from './types/stadium';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mysql from 'mysql2';
import dotenv from 'dotenv';
import multer from 'multer';
import {deleteReservation, insertStadium, insertStadiumReservation, insertUser, retrieveStadium, retrieveStadiumReservations, retrieveStadiums, retrieveUser, retrieveUserFieldById, retrieveUserReservations, verifyUser} from './db/queries'

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
const reservations = path.join(__dirname, '../public/html/reservations.html')
const merchant = path.join(__dirname, '../public/html/merchant.html')
const stadiumCreation = path.join(__dirname, '../public/html/stadium-creation.html')
const user = path.join(__dirname, '../public/html/user.html')

function authMiddleware(req: UserSession, res, next){
    const query = req.path;
    const allowedPaths = ['/login', '/', '/merchant']
    if(req.session.userid || allowedPaths.includes(query)){
        next();
    }else{
        res.redirect('/?error=not_logged_in');
    }
}

app.use(authMiddleware);

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

app.get('/')

app.get('/user-type', (req: UserSession, res) => {
    const sezzion = req.session;
    retrieveUserFieldById(con, sezzion.userid, "type",(err, result: UserQuery) => {
        if(err) throw err;
        res.json(result[0].type);
    });
});

app.post('/reservation', (req: UserSession, res) => {
    const body = req.body as ReservationBody;
    insertStadiumReservation(con, body, req.session.userid,(err, result: MySQLInsert) => {
        if(err) throw err;
        res.status(200).json(result.insertId);
    });
});

app.get('/reservations', (req: UserSession, res) => {
    res.sendFile(reservations)
});

app.get('/get-reservations', (req: UserSession, res) => {
    retrieveUserReservations(con, req.session.userid,(err, result) => {
        if(err) throw err;
        res.json(result);
    });
});
app.get('/get-stadium/:stadium_id', (req: UserSession, res) => {
    const stadium_id = req.params.stadium_id as unknown as number;
    retrieveStadium(con, stadium_id,(err, result) => {
        if(err) throw err;
        res.json(result[0]);
    });
});

app.get('/reservations/:stadium_id/:day', (req: UserSession, res) => {
    const stadium_id = req.params.stadium_id as unknown as number;
    const day = req.params.day as unknown as Weekday;
    retrieveStadiumReservations(con, stadium_id, day,(err, result) => {
        if(err) throw err;
        res.json(result);
    });
});

app.post('/reservations/delete', (req: UserSession, res) => {
    const body = req.body as Reservation;
    const user_id = req.session.userid as unknown as number;
    deleteReservation(con, body, user_id,(err, result) => {
        if(err) throw err;
        if(result.affectedRows!=1){
            res.json({success: false})
        }
        res.json({success: true, id: body.id});
    });
});

app.get('/stadiums', (req: UserSession, res) => {

    retrieveStadiums(con, (err, result: StadiumQuery) => {
        if(err) throw err;
        res.json(result.map(item => ({...item, available_days: (item.available_days as string).split(',')})));
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
    console.log(body);
    const file = req.file;
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
app.post('/stadium-creation', (req: UserSession, res) => {

    res.sendFile(stadiumCreation);

});

app.get('/username', (req: UserSession, res) => {
    retrieveUserFieldById(con, req.session.userid, "username",(err, result: UserQuery) => {
        if(err || result.length==0) throw err;
        res.json(result[0].username);
    });
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
        'CREATE TABLE IF NOT EXISTS mydb.stadiums (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), type VARCHAR(255), sport VARCHAR(255), date BIGINT(255), image VARCHAR(255), available_days set("0", "1", "2", "3", "4", "5", "6"),description VARCHAR(255), location VARCHAR(255), owner_id INT FOREIGN KEY references mydb.users(id)'+
            ', price_total FLOAT(255,2), available_from TINYINT(255), available_to TINYINT(255))', (res, err) => {
        }
    )
    con.query(
        'CREATE TABLE IF NOT EXISTS mydb.reservations (id INT AUTO_INCREMENT PRIMARY KEY,'+
            'stadium_id int, user_id int, time_slot int, date bigint(255), date_day bigint(255),FOREIGN KEY (stadium_id) references mydb.stadiums(id), FOREIGN KEY (user_id) references mydb.users(id))', (res, err) => {
        }
    )
})