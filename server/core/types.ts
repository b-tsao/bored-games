export type AnyFunction = (...args: any[]) => any;

export interface People {
    id?: Player;
}

export interface Person {
    client: {
        id: string,
        status: string
    };
}

export interface Player extends Person {
    name: string;
    host: boolean;
}