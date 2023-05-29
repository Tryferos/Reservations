import mysql from 'mysql2';
import {UserSession, UserCredentials, UserQuery, UserQuerySingle, MySQLType, MySQLInsert, UserType} from '../types/user'
import { UserCredentialsQuery } from '../types/user';
import { ReservationBody, StadiumBody, StadiumQuery, Weekday } from '../types/stadium'

export function retrieveUser(
    db: mysql.Connection,
    username: string,
    password: string,
    type: UserType,
    callback: (err: mysql.QueryError | null, res: UserQuery | UserQuerySingle) => void
    ) {
        if(type === UserType.Admin){
            return;
        }
        db.query(`select * from mydb.users where username = '${username}' and password = '${password}' and type = '${type}'`, [username, password, type], callback);
    }
    export function insertUser(
        db: mysql.Connection,
        username: string,
        password: string,
        type: UserType,
    callback: (err: mysql.QueryError | null, res: MySQLInsert) => void
    ) {
        if(type === UserType.Admin){
            return;
        }
    db.query(`insert into mydb.users (username, password, type) values ('${username}', '${password}', '${type}')`, [username, password, type], callback);
}

export function retrieveUserFieldById(
    db: mysql.Connection,
    id: string | number,
    field: keyof UserCredentialsQuery,
    callback: (err: mysql.QueryError | null, res: UserQuerySingle | UserQuery) => void
    ) {
        db.query(`select s.${field} from mydb.users s where id = ${id}`, [id], callback);
}

export function insertStadium(
    db: mysql.Connection,
    owner_id: number,
    data: StadiumBody,
    callback: (err: mysql.QueryError | null, res: MySQLInsert) => void
    ) {
        const date = new Date().getTime();
        db.query(
            `insert into mydb.stadiums (name, type, sport, date, image, price_total, available_from, available_to, location, description, owner_id, game_length, available_days) values ('${data.name}', '${data.type}', '${data.sport}', '${date}', '${data.image}', '${data.price_total}', '${data.available_from}', '${data.available_to}', '${data.location}', '${data.description}', '${owner_id}', '${data.game_length}', '${(data.available_days as Weekday[]).join(',')}')`,
        callback);
}

export function retrieveStadiums(
    db: mysql.Connection,
    callback: (err: mysql.QueryError | null, res: StadiumQuery) => void
    ) {
        db.query('select s.name, s.type, s.sport, s.date, s.price_total, s.available_from, s.available_to, s.location, s.game_length, s.image, s.description, s.id, s.available_days from mydb.stadiums s', callback);
}
export function retrieveStadium(
    db: mysql.Connection,
    stadium_id: number | string,
    callback: (err: mysql.QueryError | null, res: StadiumQuery) => void
    ) {
        db.query(`select s.name, s.type, s.sport, s.date, s.price_total, s.available_from, s.available_to, s.location, s.game_length, s.image, s.description, s.id, s.available_days from mydb.stadiums s where s.id=${stadium_id}`, callback);
}

export function retrieveUserReservations(
    db: mysql.Connection,
    user_id: number | string,
    callback: (err: mysql.QueryError | null, res: MySQLType) => void
){
    db.query(`select * from mydb.reservations where user_id = ${user_id} order by date_day`, [user_id], callback);
}

export function retrieveStadiumReservations(
    db: mysql.Connection,
    stadium_id: number,
    day: Weekday,
    callback: (err: mysql.QueryError | null, res: MySQLType) => void
    ) {
        const date = new Date();
        const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0,0,0);
        db.query(`select r.date, r.time_slot, r.id, r.stadium_id, r.day from mydb.reservations r where r.stadium_id = ${stadium_id} and r.day = '${day}' and r.date_day > ${end.getTime()}`, callback);
}

export function insertStadiumReservation(
    db: mysql.Connection,
    body: ReservationBody,
    user_id: number | string,
    callback: (err: mysql.QueryError | null, res: MySQLInsert) => void
    ) {
        const date = new Date(); //6 -> 4, 4 -> 6, 2 -> 3
        const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
        let offset = 0;
        if(date.getDay()>body.day){
            offset = (6-date.getDay())+body.day+1;
        }else{
            offset = body.day-date.getDay();
        }
        const date_day = end.getTime() + (86400*1000*(offset));
        db.query(`insert into mydb.reservations (stadium_id, user_id, date, time_slot, day, date_day) select ${body.stadium_id}, ${user_id}, ${date.getTime()}, ${body.time_slot}, '${body.day}', ${date_day}  
        where not exists (select stadium_id, time_slot, day, date_day from mydb.reservations 
            where stadium_id=${body.stadium_id} and time_slot=${body.time_slot} and day='${body.day}' and date_day > ${date.getTime()}
        )`, callback);
}





export function verifyUser(req: UserSession, res: any, next: (...args: any) => any) {
    if(req.session.userid){
        next();
    }else{
        res.redirect('/');
    }
}