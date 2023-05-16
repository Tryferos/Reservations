import express from 'express'
import session from 'express-session'
import mysql from 'mysql2'

export type UserCredentials = {
    id: string;
    username: string;
    password: string;
}

export type UserSession = Omit<express.Request, 'body'> & 
{body: Pick<UserCredentials, 'password' | 'username'>} &
{session: session.Session & Partial<session.SessionData> & {userid: string}};

export type UserQuery = (mysql.RowDataPacket[] | mysql.RowDataPacket[][] | mysql.OkPacket | mysql.OkPacket[] | mysql.ResultSetHeader) & Array<UserCredentials>;
export type UserQuerySingle = (mysql.RowDataPacket[] | mysql.RowDataPacket[][] | mysql.OkPacket | mysql.OkPacket[] | mysql.ResultSetHeader) & UserCredentials;