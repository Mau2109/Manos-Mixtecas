# Manos Mixtecas

## Descripcion general

Manos Mixtecas es una aplicacion web orientada a la promocion, organizacion y comercializacion de productos artesanales vinculados con la cultura mixteca. El proyecto busca conectar a clientes, artesanos y administradores en una sola plataforma, facilitando la visibilidad del trabajo artesanal y apoyando la gestion operativa del catalogo, las ventas y el contacto con la comunidad.

Por la estructura actual del repositorio, el sistema esta planteado principalmente como una plataforma web desarrollada con Next.js. No se observan componentes nativos de Android o iOS, por lo que no corresponde a una app movil nativa; sin embargo, su interfaz puede evolucionar hacia una experiencia responsiva para distintos dispositivos.

## Que problema resuelve

El proyecto responde a una necesidad concreta: dar mayor visibilidad a los artesanos y a sus productos, centralizar la informacion de sus piezas y permitir una gestion mas ordenada del proceso comercial.

En terminos practicos, Manos Mixtecas ayuda a:

- difundir productos artesanales desde un catalogo digital;
- mostrar informacion relevante del producto, como precio, imagen, materiales, tecnica, fragilidad y si se trata de una pieza unica;
- visibilizar al artesano mediante perfil, historia, comunidad y ubicacion;
- facilitar el contacto con clientes potenciales;
- apoyar procesos internos como control de stock, compras, ventas, metodos de pago, reportes y gestion de usuarios.

## Proposito cultural y social

Mas alla de vender productos, el sistema promueve la cultura mixteca al incorporar elementos que no se limitan al comercio:

- rescata la identidad del artesano al mostrar su historia y comunidad;
- fortalece la apreciacion del trabajo manual y de las tecnicas tradicionales;
- contribuye a que el usuario conozca el origen de las piezas y no solo su precio;
- impulsa la preservacion y difusion del patrimonio artesanal por medio de una plataforma digital.

## Objetivo general

Desarrollar una aplicacion web que permita promocionar y administrar productos artesanales de origen mixteco, integrando catalogo, perfiles de artesanos, flujo de compra, contacto con clientes y herramientas administrativas para una operacion mas eficiente.

## Objetivos especificos

- ofrecer un catalogo digital con informacion detallada de los productos;
- permitir filtrar y consultar productos por artesano o tipo de artesania;
- mostrar perfiles de artesanos con historia, comunidad y ubicacion;
- apoyar el proceso de compra, venta y confirmacion de pedidos;
- administrar metodos de pago, comprobantes y stock;
- generar reportes operativos para la toma de decisiones;
- mantener una base de codigo validada con pruebas unitarias e integracion.

## Tipo de proyecto

Este repositorio corresponde a un sistema web full stack ligero con separacion por capas:

- capa de presentacion en `app/` con Next.js;
- capa de negocio en `lib/services/`;
- capa de persistencia en `lib/persistence/repositories/`;
- integracion con Supabase como backend de datos;
- pruebas automatizadas en `__tests__/`.

## Funcionalidades identificadas en el repositorio

Con base en los servicios, repositorios y pruebas, Manos Mixtecas contempla las siguientes capacidades:

### Funcionalidades para clientes o usuarios finales

- crear perfil de cliente;
- agregar y eliminar productos del carrito;
- visualizar carrito y calcular total de compra;
- listar productos del catalogo;
- ver detalle del producto con imagen, descripcion, materiales, tecnica y precio;
- consultar galeria de imagenes;
- filtrar productos por tipo de artesano;
- ver productos destacados;
- seleccionar metodo de pago;
- capturar datos de envio;
- confirmar pedido;
- enviar mensajes desde contacto;
- consultar mision, valores, redes y datos de contacto de la empresa;
- visualizar perfil del artesano, su historia, comunidad, galeria y ubicacion.

### Funcionalidades administrativas

- iniciar sesion como administrador;
- registrar, consultar, actualizar y eliminar productos;
- controlar stock y clasificar productos;
- registrar y administrar artesanos o proveedores;
- registrar compras y ventas;
- administrar metodos de pago;
- consultar ventas y filtrarlas por estado o fecha;
- generar reportes de ventas y top de productos;
- generar ticket de venta en PDF;
- adjuntar comprobantes de pago;
- gestionar usuarios y roles;
- limitar permisos para perfiles de vendedor.

## Tecnologias utilizadas

Segun `package.json` y la estructura del proyecto, las tecnologias principales son:

- `Next.js 16` para la aplicacion web;
- `React 19` para la interfaz;
- `TypeScript` para tipado y mantenimiento del codigo;
- `Supabase` como servicio de base de datos y acceso a datos;
- `Jest` para pruebas unitarias;
- `Testing Library` para pruebas de interfaz;
- `Tailwind CSS 4` para estilos;
- `ESLint` para calidad de codigo;
- `PDFKit` como dependencia relacionada con generacion de documentos PDF.

## Arquitectura del proyecto

La organizacion del repositorio sigue una separacion clara de responsabilidades:

### 1. Presentacion

La carpeta `app/` contiene las vistas principales de la aplicacion, por ejemplo:

- pagina de inicio;
- pagina de catalogo;
- pagina de contacto.

### 2. Logica de negocio

La carpeta `lib/services/` concentra casos de uso del sistema, por ejemplo:

- productos;
- artesanos;
- ventas;
- compras;
- carrito;
- contacto;
- usuarios;
- empresa.

### 3. Persistencia

La carpeta `lib/persistence/repositories/` encapsula la comunicacion con la base de datos en Supabase.

### 4. Pruebas

La carpeta `__tests__/` contiene pruebas que validan historias de usuario y procesos administrativos.

## Evidencia de uso de Scrum

El repositorio muestra una trazabilidad muy clara entre requerimientos y codigo mediante identificadores como `USD01`, `USD18`, `ADM14` o `ADM29`. Esto sugiere una organizacion del trabajo basada en historias de usuario y funcionalidades administrativas, algo totalmente alineado con Scrum.

Elementos que puedes mencionar en tu documentacion de Scrum:

- el backlog del producto puede representarse mediante historias de usuario (`USD`) y requerimientos administrativos (`ADM`);
- cada historia parece haberse implementado como una unidad funcional trazable;
- las pruebas ayudan a validar criterios de aceptacion;
- la division por modulos facilita trabajar por incrementos o sprints;
- la interfaz y la capa de negocio reflejan entregas iterativas en lugar de un desarrollo monolitico.

## Evidencia de uso de XP

Tambien hay señales claras de practicas cercanas a Extreme Programming:

- desarrollo guiado por pruebas en varios modulos;
- pruebas unitarias para servicios y reglas de negocio;
- pruebas de interfaz para historias como acceso al catalogo y formulario de contacto;
- refuerzo de validaciones en funciones antes de persistir datos;
- separacion de responsabilidades para facilitar refactorizacion.

En otras palabras, Scrum puede describir como se organizo el trabajo y XP como el enfoque tecnico para construir software con mas calidad.

## Historias de usuario y cobertura funcional

El archivo `huCatalog.cjs` registra un catalogo amplio de historias y funcionalidades administrativas, entre ellas:

- `USD01` a `USD28` para necesidades del usuario;
- `ADM01` a `ADM33` para administracion y operacion.

Esto fortalece la documentacion del proyecto porque demuestra planeacion funcional y trazabilidad entre requerimientos, implementacion y pruebas.

## Rol y trabajo en equipo

Con base en el historial de Git, el proyecto muestra participacion de varias personas, por lo que puede describirse como un trabajo colaborativo. Si necesitas explicarlo en una presentacion o memoria, puedes usar una redaccion como esta:

"Manos Mixtecas fue desarrollado en equipo bajo un enfoque agil. Mi participacion se centro en apoyar el analisis, la implementacion y la validacion de modulos del sistema, trabajando sobre historias de usuario y funcionalidades administrativas."

Si prefieres dejarlo mas personalizado, puedes ajustar este apartado segun tu contribucion real, por ejemplo:

- frontend y experiencia de usuario;
- backend y conexion con Supabase;
- pruebas automatizadas;
- documentacion y gestion agil del proyecto;
- coordinacion del backlog, historias de usuario y sprints.

## Valor academico del proyecto

Manos Mixtecas no solo demuestra desarrollo web, sino tambien aplicacion de ingenieria de software:

- analisis por historias de usuario;
- organizacion por capas;
- uso de base de datos y persistencia;
- pruebas automatizadas;
- trazabilidad entre requerimientos y codigo;
- posibilidad de justificar Scrum y XP con evidencia real del repositorio.

## Conclusion

Manos Mixtecas es una aplicacion web enfocada en la difusion y gestion de artesanias mixtecas. Integra componentes culturales, comerciales y administrativos en una misma solucion, y el repositorio muestra una base tecnica consistente para explicar objetivos, funcionalidades, tecnologias y metodologias agiles como Scrum y XP.

## Referencias internas del proyecto

- `app/`
- `lib/services/`
- `lib/persistence/repositories/`
- `__tests__/`
- `huCatalog.cjs`
- `package.json`
