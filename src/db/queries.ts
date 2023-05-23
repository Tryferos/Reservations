import mysql from 'mysql2';
import {UserSession, UserCredentials, UserQuery, UserQuerySingle, MySQLType, MySQLInsert} from '../types/user'

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
    callback: (err: mysql.QueryError | null, res: MySQLInsert) => void
    ) {
    db.query(`insert into mydb.users (username, password) values ('${username}', '${password}')`, [username, password], callback);
}

export function retrieveUserById(
    db: mysql.Connection,
    id: string | number,
    callback: (err: mysql.QueryError | null, res: UserQuerySingle | UserQuery) => void
    ) {
        db.query(`select s.username from mydb.users s where id = ${id}`, [id], callback);
    };

export function verifyUser(req: UserSession, res: any, next: (...args: any) => any) {
    if(req.session.userid){
        next();
    }else{
        res.redirect('/');
    }
}