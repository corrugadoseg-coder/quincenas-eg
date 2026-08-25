# Blindaje del Codigo.gs — EG Quincenas

Este `Codigo_con_blindaje.gs` reemplaza al Apps Script actual de la planilla
`EG_Corrugados_Quincenas`. Agrega una sola cosa sobre lo que ya andaba:

**Antes de sobrescribir A1, guarda una copia de lo anterior** en una hoja nueva
llamada "Respaldos", con fecha y hora. Conserva las últimas **50** copias
(las más viejas se borran solas). Así, si algo se pisa, hay copias para volver
atrás sin depender del historial de versiones de Google.

## Qué NO cambia
- El formato del dato en A1 (mismo JSON de texto).
- doGet / doPost siguen respondiendo igual a la app.
- La app (index.html) NO necesita ningún cambio para esto.

## Pasos para Claude Code
1. Abrir la planilla `EG_Corrugados_Quincenas` → Extensiones → Apps Script.
2. Reemplazar TODO el contenido por el de `Codigo_con_blindaje.gs`.
3. Guardar.
4. Implementar → Gestionar implementaciones → editar (lápiz) → Versión: **Nueva** → Implementar.
   (La URL /exec se mantiene, no cambia.)
5. Probar: hacer un guardado desde la app (cargar cualquier dato). Debería
   aparecer la hoja "Respaldos" con una fila nueva (fecha + copia anterior).

## Notas
- La hoja "Respaldos" se crea sola la primera vez.
- Solo respalda cuando había contenido previo con sustancia (no respalda vacíos).
- MAX_BK = 50 en el código; se puede subir/bajar cambiando ese número.
- NO tocar la hoja "Datos" ni su celda A1 a mano.

En memoria de mi papá, Gerardo, analista programador,
que me enseñó a firmar lo que uno crea.
