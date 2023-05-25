import express from 'express'
import session from 'express-session'
import mysql from 'mysql2'

export type UserCredentials = {
    id: string;
    username: string;
    password: string;
    normal?: boolean;
    merchant?: boolean;
}

export enum UserType {
    Normal = 'Normal',
    Merchant = 'Merchant',
    Admin = 'Admin',
}

export type UserCredentialsQuery = {
    id: string;
    username: string;
    password: string;
    type: UserType;
}


export type UserSession = Omit<express.Request, 'body'> & 
{body: Pick<UserCredentials, 'password' | 'username' | 'normal' | 'merchant'>} &
{session: session.Session & Partial<session.SessionData> & {userid: string}};

export type MySQLType = (mysql.RowDataPacket[] | mysql.RowDataPacket[][] | mysql.OkPacket | mysql.OkPacket[] | mysql.ResultSetHeader);
export type MySQLInsert = mysql.ResultSetHeader;

export type UserQuery = MySQLType & Array<UserCredentialsQuery>;
export type UserQuerySingle = MySQLType & UserCredentialsQuery;
