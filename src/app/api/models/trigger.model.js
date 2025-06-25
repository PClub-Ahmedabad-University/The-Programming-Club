import mongoose from "mongoose";

const triggerSchema = new mongoose.Schema(
  {
    sheetUrl: { type: String, required: true },
    webhookUrl: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "triggers" }
);

export default mongoose.models.Trigger || mongoose.model("Trigger", triggerSchema);



//Legacy for apps script
// Change this to the Google Sheet you want to watch
// const sheetUrl = "https://docs.google.com/spreadsheets/d/1NRyecTq5JGPhHiohh5fzFfhJU5th9k4gS_Yte_V5vbg/edit";
// const webhookUrl = "https://the-programming-club.vercel.app/api/hook";

// // Install this ONCE for each Sheet you want to monitor
// function installFormTrigger() {
//   const ss = SpreadsheetApp.openByUrl(sheetUrl);
//   ScriptApp.newTrigger("onDynamicFormSubmit")
//     .forSpreadsheet(ss)
//     .onFormSubmit()
//     .create();
// }

// function onDynamicFormSubmit(e) {
//   const ss = SpreadsheetApp.openByUrl(sheetUrl);
//   const sheet = ss.getSheets()[0]; // or use sheet name
//   const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
//   const lastRow = sheet.getLastRow();
//   const rowData = sheet.getRange(lastRow, 1, 1, headers.length).getValues()[0];

//   const cleanedRow = rowData.map(clean);
//   const dataToSend = {};
//   headers.forEach((key, i) => {
//     dataToSend[key] = cleanedRow[i];
//   });

//   sendToWebhook(dataToSend);
// }

// function clean(val) {
//   return String(val)
//     .replace(/Object/g, '')
//     .replace(/\n/g, '')
//     .replace(/\s+/g, ' ')
//     .trim();
// }

// function sendToWebhook(payload) {
//   const formData = Object.entries(payload)
//     .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
//     .join("&");

//   const options = {
//     method: "post",
//     contentType: "application/x-www-form-urlencoded",
//     payload: formData
//   };

//   try {
//     const response = UrlFetchApp.fetch(webhookUrl, options);
//     Logger.log("✅ Webhook sent! Status: " + response.getResponseCode());
//   } catch (err) {
//     Logger.log("❌ Webhook error: " + err);
//   }
// }