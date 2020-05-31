export type AnyFunction = (...args: any[]) => any;

export interface People {
    id?: Player;
}

export interface Player {
    client: {
        id: string,
        status: string
    };
    name: string;
    host: boolean;
}