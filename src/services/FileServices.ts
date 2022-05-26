import { Storage } from "aws-amplify";
import UserServices from "./UserServices";

export default class FileServices {
  public static async putPostImage(fileName: string, file: object) {
    try {
      const { username } = await UserServices.getUsernameWithRefresh();
      const result = await Storage.put(
        `/uploads/${username}/${fileName}`,
        file
      );
    } catch {}
  }
}
