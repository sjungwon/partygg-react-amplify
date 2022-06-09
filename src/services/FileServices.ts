import { Storage } from "aws-amplify";
import { addImageResData } from "../types/file.type";
import UserServices from "./UserServices";

export default class FileServices {
  public static async putPostImage(
    file: File
  ): Promise<addImageResData | null> {
    try {
      const { username } = await UserServices.getUsernameWithRefresh();
      const encodedUsername = encodeURIComponent(username);
      const encodedFilename = encodeURIComponent(file.name);
      const encodedDate = encodeURIComponent(new Date().toLocaleString());
      const path = `${encodedUsername}/${encodedDate}/${encodedFilename}`;
      const fullsizeKey = `fullsize/${path}`;
      await Storage.put(fullsizeKey, file);
      const resizedKey = `resized/${path}`;
      return {
        fullsizeKey,
        resizedKey,
      };
    } catch {
      return null;
    }
  }

  public static async putProfileImage(
    file: File
  ): Promise<addImageResData | null> {
    try {
      const { username } = await UserServices.getUsernameWithRefresh();
      const encodedUsername = encodeURIComponent(username);
      const encodedFilename = encodeURIComponent(file.name);
      const encodedDate = encodeURIComponent(new Date().toLocaleString());
      const path = `profiles/${encodedUsername}/${encodedDate}/${encodedFilename}`;
      const fullsizeKey = `fullsize/${path}`;
      await Storage.put(fullsizeKey, file);
      const resizedKey = `resized/${path}`;
      return {
        fullsizeKey,
        resizedKey,
      };
    } catch {
      return null;
    }
  }

  public static async getImage(
    keyObject: addImageResData,
    size: "fullsize" | "resized"
  ): Promise<string | null> {
    try {
      const key =
        size === "fullsize" ? keyObject.fullsizeKey : keyObject.resizedKey;
      const result = await Storage.get(key);
      return result;
    } catch {
      return null;
    }
  }

  public static async removeImage(
    keyObject: addImageResData
  ): Promise<boolean> {
    try {
      await Storage.remove(keyObject.fullsizeKey);
      await Storage.remove(keyObject.resizedKey);
      return true;
    } catch (err) {
      return false;
    }
  }
}
