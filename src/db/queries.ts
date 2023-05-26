import mysql from 'mysql2';
import {UserSession, UserCredentials, UserQuery, UserQuerySingle, MySQLType, MySQLInsert, UserType} from '../types/user'
import { UserCredentialsQuery } from '../types/user';
import { StadiumBody } from '../types/stadium'

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
            `insert into mydb.stadiums (name, type, sport, date, image, price_total, available_from, available_to, location, description, owner_id, game_length) values ('${data.name}', '${data.type}', '${data.sport}', '${date}', '${data.image}', '${data.price_total}', '${data.available_from}', '${data.available_to}', '${data.location}', '${data.description}', '${owner_id}', '${data.game_length}')`,
        callback);
}



export function verifyUser(req: UserSession, res: any, next: (...args: any) => any) {
    if(req.session.userid){
        next();
    }else{
        res.redirect('/');
    }
}