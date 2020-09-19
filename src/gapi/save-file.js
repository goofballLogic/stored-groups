// thanks: https://github.com/gsuitedevs/drive-quickeditors/blob/master/web/src/components/drive/drive.service.js
import MultiPartBuilder from "./multipart.js";

export default function saveFile(gapi, metadata, content) {

    if (!metadata) throw new Error("Metadata not supplied");
    if (!metadata.mimeType) throw new Error("Metadata mimeType not specified");

    const [method, path] = metadata.id
        ? ["PUT", "/upload/drive/v3/files/" + encodeURIComponent(metadata.id)]
        : ["POST", "/upload/drive/v3/files/"]

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

};