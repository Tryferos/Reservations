import express from 'express'
import session from 'express-session'
import mysql from 'mysql2'

export type UserCredentials = {
    id: string;
    username: string;
    password: string;
}

export type Stadium = {
    id: number;
    name: string;
    type: string;
    sport: string;
    date: number;
    photo_url: string;
    price_total: number;
    available_from: number;
    available_to: number;
}

export type UserSession = Omit<express.Request, 'body'> & 
{body: Pick<UserCredentials, 'password' | 'username'>} &
{session: session.Session & Partial<session.SessionData> & {userid: string}};

type MySQLType = (mysql.RowDataPacket[] | mysql.RowDataPacket[][] | mysql.OkPacket | mysql.OkPacket[] | mysql.ResultSetHeader);

export type UserQuery = MySQLType & Array<UserCredentials>;
export type UserQuerySingle = MySQLType & UserCredentials;

export type StadiumQuery = MySQLType & Array<Stadium>;
export type StadiumQuerySingle = MySQLType & Stadium;