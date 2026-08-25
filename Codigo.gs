/**
 * EG Quincenas — backend de datos en Google Sheets (con BLINDAJE).
 *
 * Guarda TODO el estado de la app (el objeto "db") como un bloque de texto JSON
 * en la celda A1 de la hoja "Datos".
 *
 * BLINDAJE (agregado 25/8): antes de sobrescribir A1, si ya había contenido,
 * guarda una copia en la hoja "Respaldos" con la fecha y hora. Mantiene solo
 * las ultimas 300 copias (MAX_BK). Así, si algo se pisa, hay copias para volver atrás
 * sin depender del historial de versiones de Google.
 *
 * En memoria de mi papá, Gerardo, analista programador,
 * que me enseñó a firmar lo que uno crea.
 */

const HOJA = "Datos";        // hoja con el dato vivo (A1)
const CELDA = "A1";
const HOJA_BK = "Respaldos"; // hoja donde se guardan las copias
const MAX_BK = 300;          // cuántas copias conservar

function hoja_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(HOJA);
  if (!sh) sh = ss.insertSheet(HOJA);
  return sh;
}

function hojaBk_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(HOJA_BK);
  if (!sh) {
    sh = ss.insertSheet(HOJA_BK);
    sh.getRange("A1").setValue("Fecha y hora");
    sh.getRange("B1").setValue("Copia de los datos (antes de sobrescribir)");
    sh.getRange("B:B").setNumberFormat("@"); // texto, no interpretar el JSON
  }
  return sh;
}

// Guarda una copia del contenido anterior antes de pisarlo.
function respaldar_(contenidoAnterior) {
  // Solo respaldamos si había algo con sustancia (evita respaldar vacíos).
  if (!contenidoAnterior || String(contenidoAnterior).trim().length < 2) return;
  const sh = hojaBk_();
  // Insertamos la copia nueva arriba (fila 2), debajo del encabezado.
  sh.insertRowAfter(1);
  sh.getRange("A2").setValue(new Date());
  sh.getRange("B2").setNumberFormat("@");
  sh.getRange("B2").setValue(String(contenidoAnterior));
  // Recortamos: dejamos encabezado (fila 1) + MAX_BK copias.
  const ultima = sh.getLastRow();
  const sobran = ultima - (1 + MAX_BK);
  if (sobran > 0) {
    sh.deleteRows(2 + MAX_BK, sobran);
  }
}

function doGet(e) {
  try {
    const sh = hoja_();
    const txt = sh.getRange(CELDA).getValue();
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

      // BLINDAJE: copiar lo que había ANTES de pisarlo.
      // Si el contenido no cambio, no gastamos una copia en vano.
      const anterior = cell.getValue();
      if (String(anterior) !== payload.db) respaldar_(anterior);

      cell.setNumberFormat("@"); // forzar texto
      cell.setValue(payload.db);
      sh.getRange("B1").setValue(new Date()); // marca de tiempo del último guardado
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
