// Removed reference to missing vite/client types to fix build error
// /// <reference types="vite/client" />

declare module '*.css';
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';

// Declare process to support process.env.API_KEY usage
declare const process: {
  env: {
    API_KEY: string;
    [key: string]: string | undefined;
  }
};