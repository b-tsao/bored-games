import { createContext } from 'react';

export const ThemeContext: React.Context<[any, (...args: any[]) => any]> = createContext([null, () => { }]);
export const ClientContext: React.Context<[any, (...args: any[]) => any]> = createContext([null, () => { }]);
export const MessageContext: React.Context<(...args: any[]) => any> = createContext(() => { });