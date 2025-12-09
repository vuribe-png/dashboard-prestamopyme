<change>
<file>src/vite-env.d.ts</file>
<description>Añadir referencia a tipos de cliente Vite para solucionar errores de compilación TypeScript</description>
<content><![CDATA[/// <reference types="vite/client" />
declare module '.css';
declare module '.svg';
declare module '.png';
declare module '.jpg';]]></content>
</change>