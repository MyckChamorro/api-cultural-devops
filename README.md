# Proyecto API Cultural

## Descripción
Este proyecto está enfocado en el desarrollo y pruebas de una API para gestionar saludos. La rama `test-korea` se utiliza exclusivamente para las pruebas automatizadas que aseguran el correcto funcionamiento del endpoint `/greetings`.

## Cambios realizados

### Rama `test-korea`:
- **Pruebas unitarias implementadas con Jest**:
  - Se han agregado pruebas automatizadas para verificar la funcionalidad del endpoint `/greetings`.
  - Estas pruebas cubren los métodos HTTP `POST`, `GET`, y `PUT`.
  - Se utilizaron herramientas como `jest` y `supertest` para realizar las pruebas de integración.

### Archivos Modificados:
- **app.test.js**: Se crearon nuevas pruebas para asegurar el correcto funcionamiento de los métodos HTTP en el endpoint `/greetings`.
- **Configuración de Jest**: Se configuraron las pruebas unitarias en el proyecto, lo que permite realizar pruebas automáticas en el backend.
  
## Estado del Proyecto:
- Las pruebas unitarias para el backend están completas y verificadas.
- El código de la rama `test-korea` se mantiene separado del código de producción en `main` para evitar interferencias hasta que se complete la validación de las pruebas.

## Fecha del Commit:
- **11 de junio de 2025**
