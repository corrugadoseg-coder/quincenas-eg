/**
 * EG Quincenas — backend de datos en Google Sheets.
 *
 * Guarda TODO el estado de la app (el objeto "db": períodos, empleados,
 * préstamos, SAC blanco, administrativos, etc.) como un bloque de texto JSON
 * en una sola celda de una hoja llamada "Datos".
 *
 * - doGet  -> devuelve el JSON guardado (o vacío la primera vez).
 * - doPost -> recibe el JSON completo y lo sobrescribe.
 *
 * Mismo patrón que las otras apps de EG (Pedidos, Cotizaciones): un /exec
 * publicado como aplicación web con acceso "Cualquier persona".
 *
 * En memoria de mi papá, Gerardo, analista programador,
 * que me enseñó a firmar lo que uno crea.
 */

const HOJA = "Datos";   // nombre de la hoja (pestaña) dentro de la planilla
const CELDA = "A1";     // celda donde vive todo el JSON

function hoja_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(HOJA);
  if (!sh) sh = ss.insertSheet(HOJA);
  return sh;
}

function doGet(e) {
  try {
    const sh = hoja_();
    const cell = sh.getRange(CELDA);
    const txt = cell.getValue();
    // Si está vacío, devolvemos db nulo para que la app arranque de cero.
    const data = (txt && String(txt).trim().length) ? String(txt) : "";
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, db: data }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    if (payload.action === "save" && typeof payload.db === "string") {
      const sh = hoja_();
      const cell = sh.getRange(CELDA);
      cell.setNumberFormat("@");   // forzar texto: no interpretar el JSON
      cell.setValue(payload.db);
      // Guardamos también una marca de tiempo en B1 para control.
      sh.getRange("B1").setValue(new Date());
      return ContentService
        .createTextOutput(JSON.stringify({ ok: true, message: "Datos guardados" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, message: "Accion no reconocida" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
