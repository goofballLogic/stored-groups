// thanks: https://github.com/gsuitedevs/drive-quickeditors/blob/master/web/src/components/drive/drive.service.js
import MultiPartBuilder from "./multipart.js";
import { identifyFile } from "./getters.js";

export default async function saveFile(gapi, metadata, content) {

    if (!metadata) throw new Error("Metadata not supplied");
    if (!metadata.mimeType) throw new Error("Metadata mimeType not specified");
    const fileId = await identifyFile(metadata.name, metadata.mimeType);
    console.log("Identified", name, fileId);
    const path = `/upload/drive/v2/files/${encodeURIComponent(fileId)}?uploadType=media`;
    console.log("Putting", content);
    await gapi.client.request({
        path,
        method: "PUT",
        params: {
            uploadType: "media",
            supportsTeamDrives: true,
            fields: "id"
        },
        headers: { "Content-Type": metadata.mimeType },
        body: content
    });
};

function X(metadata, content, gapi) {
    const [method, path] = metadata.id
        ? ["PUT", "" + encodeURIComponent(metadata.id)]
        : ["POST", "/upload/drive/v3/files/"];

    const multipart = new MultiPartBuilder()
        .append("application/json", JSON.stringify(metadata))
        .append(metadata.mimeType, content)
        .finish();


    return new Promise((resolve, reject) => gapi.client.request({
        path: path,
        method: method,
        params: {
            uploadType: 'multipart',
            supportsTeamDrives: true,
            fields: "id"
        },
        headers: { "Content-Type": multipart.type },
        body: multipart.body
    }).then(resolve, reject));
}
