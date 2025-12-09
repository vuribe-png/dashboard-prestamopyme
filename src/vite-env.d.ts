<file>src/vite-env.d.ts</file>
<description>Configuración de tipos TypeScript para Vite (import.meta.env)</description>
<content><![CDATA[/// <reference types="vite/client" />
interface ImportMetaEnv {
readonly VITE_API_KEY: string;
}
interface ImportMeta {
readonly env: ImportMetaEnv;
}
declare module '.css';
declare module '.svg';
declare module '.png';
declare module '.jpg';]]></content>