import { useCallback, useEffect, useState } from "react";
import FileServices from "../services/FileServices";
import { ImageKeys } from "../types/file.type";

export default function useProfileImage(key?: ImageKeys) {
  const [profileImage, setProfileImage] = useState<string>("");

  const getImage = useCallback(async (key: ImageKeys) => {
    const resizedImage = await FileServices.getImage(key, "resized");
    if (resizedImage) {
      console.log("async set image");
      setProfileImage(resizedImage);
      return;
    }
    const fullsize = await FileServices.getImage(key, "fullsize");
    setProfileImage(fullsize ? fullsize : "/error.png");
  }, []);

  useEffect(() => {
    if (key && key.resizedKey) {
      getImage(key);
      return;
    }
  }, [getImage, key]);

  return key ? profileImage : "";
}
