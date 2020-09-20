import saveFile from "./save-file.js";

window.saveJSON = saveJSON;

export default function saveJSON(gapi, name, contentObject) {
    const metadata = {
        name,
        mimeType: "application/json"
    };
    const content = JSON.stringify(contentObject);
    return saveFile(gapi, metadata, content);
}