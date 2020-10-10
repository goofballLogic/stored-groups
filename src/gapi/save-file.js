import { identifyFile } from "./getters.js";

export default async function saveFile(gapi, metadata, content) {
    if (!metadata) throw new Error("Metadata not supplied");
    if (!metadata.mimeType) throw new Error("Metadata mimeType not specified");
    const fileId = await identifyFile(metadata.name, metadata.mimeType);
    const path = `/upload/drive/v2/files/${encodeURIComponent(fileId)}?uploadType=media`;
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