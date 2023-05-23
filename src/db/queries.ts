import mysql from 'mysql2';
import {UserSession, UserCredentials, UserQuery, UserQuerySingle} from '../types/user'

export function retrieveUser(
    db: mysql.Connection,
    username: string,
    password: string,
    callback: (err: mysql.QueryError | null, res: UserQuery | UserQuerySingle) => void
    ) {
    db.query(`select * from mydb.users where username = '${username}' and password = '${password}'`, [username, password], callback);
}
export function insertUser(
    db: mysql.Connection,
    username: string,
    password: string,
    callback: (err: mysql.QueryError | null, res: UserQuery | UserQuerySingle) => void
    ) {
    db.query(`insert into mydb.users (username, password) values ('${username}', '${password}')`, [username, password], callback);
}

export function verifyUser(req: UserSession, res: any, next: () => void) {
    if(req.session.userid){
        next();
    }else{
        res.redirect('/');
    }
}