# Migración de "EG Quincenas" a GitHub Pages + Google Sheets

Este paquete lleva la app **EG Quincenas** (Parte B de sueldos) al mismo esquema
que las otras apps de EG Corrugados (Pedidos, Cotizaciones, Stock, Balance):
**GitHub Pages + Google Sheets + Google Apps Script**.

Cuenta de Google: `corrugadoseg@gmail.com`
Usuario de GitHub Pages: `corrugadoseg-coder` (las apps quedan en `corrugadoseg-coder.github.io/<repo>/`)

Archivos de este paquete:
- `index.html` — la app completa (un solo archivo), ya preparada para sincronizar con Google Sheets.
- `Codigo.gs` — el backend de Google Apps Script (guarda/lee todos los datos de la app).
- Este instructivo.

La app guarda TODO su estado (períodos, empleados, préstamos, SAC, administrativos, etc.)
como un único bloque de texto JSON en una celda de la planilla. Es el mismo dato que el
"backup JSON" que la app ya sabe exportar/importar desde su pestaña Ajustes.

---

## Parte A — Crear la planilla y el Apps Script (lo hace la persona en el navegador)

Estos pasos son en la cuenta `corrugadoseg@gmail.com`. Claude Code debe guiar a Raquel
paso a paso (ella no es técnica), uno a la vez, esperando confirmación.

1. **Crear la planilla**
   - En Google Drive: Nuevo → Hojas de cálculo de Google.
   - Nombre del archivo: `EG_Corrugados_Quincenas`.
   - Renombrar la primera hoja (pestaña de abajo) a `Datos` (exactamente así, con D mayúscula).

2. **Pegar el Apps Script**
   - En la planilla: menú **Extensiones → Apps Script**.
   - Borrar todo el contenido que aparezca y pegar el contenido completo de `Codigo.gs`.
   - Guardar (ícono de disquete).

3. **Publicar como aplicación web**
   - En el editor de Apps Script: botón **Implementar → Nueva implementación**.
   - Tipo: **Aplicación web**.
   - Descripción: `EG Quincenas`.
   - Ejecutar como: **Yo** (corrugadoseg@gmail.com).
   - Quién tiene acceso: **Cualquier persona**.
   - **Implementar**. Autorizar los permisos que pida (elegir la cuenta, "Configuración avanzada" → "Ir a (no seguro)" → Permitir; es normal en scripts propios).
   - Copiar la **URL de la aplicación web** (termina en `/exec`). Esta URL es la que va en el `index.html` (Parte B).

> Nota: cada vez que se cambie el `Codigo.gs`, hay que **Implementar → Gestionar implementaciones → editar (lápiz) → Versión: Nueva → Implementar** para que tome los cambios. La URL `/exec` se mantiene.

---

## Parte B — Poner la URL en la app (lo hace Claude Code)

En `index.html`, buscar esta línea (está cerca del principio del bloque `<script>`):

```js
const URL_SHEET = '';
```

Reemplazar las comillas vacías por la URL `/exec` copiada en el paso A.3. Debe quedar así
(con la URL real):

```js
const URL_SHEET = 'https://script.google.com/macros/s/AKfy.../exec';
```

Guardar el archivo. Con la URL puesta, la app deja de ser solo-local: al abrir trae los
datos de la planilla, y cada cambio se guarda en la planilla (y se sincroniza entre las
3 computadoras de la oficina). Sin URL, la app sigue funcionando pero solo en el navegador
local (útil para probar).

---

## Parte C — Publicar en GitHub Pages (lo hace Claude Code)

Mismo patrón que las otras apps de EG.

1. Crear un repositorio nuevo en la cuenta de GitHub de EG. Nombre sugerido: `quincenas-eg`.
2. Subir el `index.html` (ya con la URL puesta) a la raíz del repo.
3. Activar **GitHub Pages**: Settings → Pages → Source: `main` / carpeta `/root` → Save.
4. La app queda publicada en: `https://corrugadoseg-coder.github.io/quincenas-eg/`.

> Si Claude Code tiene acceso a `gh` (GitHub CLI) o al repo por git, puede crear el repo,
> hacer el commit y el push directamente. Si no, guiar a Raquel para crearlo por la web
> (New repository → subir index.html → Settings → Pages).

---

## Parte D — Pasar los datos ya cargados (importante)

Raquel YA cargó las quincenas pasadas en la versión local (localStorage del navegador).
Para que esos datos aparezcan en la versión publicada (que lee de la planilla):

1. En la app **local** (la que venía usando), pestaña **Ajustes** → botón de **backup / descargar datos**. Se baja un archivo `.json`.
2. Abrir la app **publicada** (la de GitHub Pages) por primera vez.
3. En la app publicada, pestaña **Ajustes** → botón de **restaurar / importar datos** → elegir ese `.json`.
4. Al importar, la app guarda todo y —como ahora hay URL— lo sube solo a la planilla.
   Desde ese momento, las 3 computadoras ven los mismos datos.

> Alternativa (si Claude Code prefiere): tomar el JSON del backup y escribirlo directamente
> en la celda A1 de la hoja `Datos` de la planilla (como texto). La app lo levantará al abrir.

---

## Verificación final

- Abrir la app publicada en dos computadoras distintas. Cargar algo en una y recargar la
  otra: el cambio tiene que aparecer. El indicador del encabezado debe decir "☁ Sincronizado".
- Si dice "⚠ Sin conexión", revisar que la URL `/exec` esté bien pegada y que la implementación
  del Apps Script tenga acceso "Cualquier persona".

---

## Notas de diseño (para que Code entienda la app)

- Todo el estado vive en un objeto `db` (períodos, empleados, préstamos, sacBlanco, admin).
- `guardar()` escribe en localStorage y además llama a `guardarEnNube()` (POST al `/exec`,
  con "debounce" de 0,8 s para no saturar).
- `cargarDeNube()` (al iniciar) hace GET al `/exec` y, si hay datos, reemplazan lo local.
- Es "última escritura gana": no hay bloqueo por usuario. Para esta oficina (3 personas que
  rara vez tocan lo mismo a la vez) es suficiente, igual que en las otras apps.
- El backup/restaurar JSON de Ajustes sigue funcionando como red de seguridad.

En memoria de mi papá, Gerardo, analista programador,
que me enseñó a firmar lo que uno crea.
