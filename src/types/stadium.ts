import { MySQLType } from "./user";

export type Weekday = 0 | 1 | 2 | 3 | 5 | 6;

export type StadiumQuerySQL = {
    id: number;
    name: string;
    type: string;
    sport: string;
    date: number;
    image: string;
    price_total: number;
    available_from: number;
    available_to: number;
    available_days: Weekday[] | string;
    location: string;
    description: string;
    owner_id: number;
    game_length: number;
}
export type StadiumBody = Omit<StadiumQuerySQL, 'id' | 'owner_id'>;
export type Stadium = Omit<StadiumQuerySQL, 'owner_id'>;

export type StadiumQuery = MySQLType & Array<Stadium>;
export type StadiumQuerySingle = MySQLType & Stadium;

export type ReservationQuerySql = {
    stadium_id: number;
    user_id: number;
    time_slot: number;
    day: Weekday;
} & Pick<StadiumQuerySQL, 'id' | 'date'>;

export type ReservationBody = Omit<ReservationQuerySql, 'id' | 'user_id' | 'date'>;
export type Reservation = Omit<ReservationQuerySql, 'user_id'>;
export type ReservationQuery = MySQLType & Array<Reservation>;
export type ReservationQuerySingle = MySQLType & Reservation;