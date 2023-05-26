import { MySQLType } from "./user";

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
    location: string;
    description: string;
    owner_id: number;
    game_length: number;
}
export type StadiumBody = Omit<StadiumQuerySQL, 'id' | 'owner_id'>;
export type Stadium = Omit<StadiumQuerySQL, 'owner_id'>;

export type StadiumQuery = MySQLType & Array<Stadium>;
export type StadiumQuerySingle = MySQLType & Stadium;