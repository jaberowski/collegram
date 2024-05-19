import { rename } from "fs/promises";
import { envManager } from "../main";
import { EnvManager } from "./EnvManager";

export function generateAvatarUrl(filename: string) {
  const serverUrl = EnvManager.getInstance().get("SERVER_URL");
  return `${serverUrl}/images/avatars/${filename}`;
}

export async function saveAvatarImage(fileName: string) {
  await rename(
    EnvManager.getInstance().get("UPLOAD_DIR") + "/" + fileName,
    "uploads/avatars/" + fileName
  );
}
