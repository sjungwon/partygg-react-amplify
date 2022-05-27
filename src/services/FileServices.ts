import { Storage } from "aws-amplify";
import UserServices from "./UserServices";

export default class FileServices {
  public static async putPostImage(fileName: string, file: object) {
    try {
      const { username } = await UserServices.getUsernameWithRefresh();
      const result = await Storage.put(
        `uploads/${encodeURIComponent(username)}/${encodeURIComponent(
          fileName
        )}`,
        file
      );
      return result;
    } catch {
      return null;
    }
  }

  public static async putProfileImage(fileName: string, file: object) {
    try {
      const { username } = await UserServices.getUsernameWithRefresh();
      const result = await Storage.put(
        `uploads/profiles/${encodeURIComponent(username)}/${encodeURIComponent(
          fileName
        )}`,
        file
      );
      return result;
    } catch {
      return null;
    }
  }
}
