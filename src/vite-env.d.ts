<file>src/vite-env.d.ts</file>
<description>Añadir referencia a tipos de cliente Vite para evitar errores de TypeScript con import.meta</description>
<content><![CDATA[/// <reference types="vite/client" />
declare module '.css';
declare module '.svg';
declare module '.png';
declare module '.jpg';]]></content>