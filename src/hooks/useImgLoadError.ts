import { useCallback } from "react";
import FileServices from "../services/FileServices";
import { ImageKeys } from "../types/file.type";

export default function useImgLoadError() {
  const loadError = useCallback(async (event: any) => {
    const imageEl = event.target;
    const origSrc: string = imageEl.src;
    if (!origSrc) {
      imageEl.src = "/error.png";
    }

    //key로 받아온 이미지가 아니면
    if (!origSrc.includes("fullsize") && !origSrc.includes("resized")) {
      imageEl.src = "/error.png";
      return;
    }

    //fullsize도 실패한 경우 -> 이미지 깨짐처리
    if (origSrc.includes("fullsize/")) {
      imageEl.src = "/error.png";
      return;
    }

    //key 다시 받아서 시도
    const pivotIndex = origSrc.includes("profiles") ? 6 : 5;
    const resizedKeySplit = origSrc.split("/");
    const username = decodeURIComponent(resizedKeySplit[pivotIndex]);
    const date = decodeURIComponent(resizedKeySplit[pivotIndex + 1]);
    const imageName = decodeURIComponent(
      resizedKeySplit[pivotIndex + 2].split("?")[0]
    );
    const key: ImageKeys = {
      resizedKey: `resized/${
        pivotIndex > 5 ? "profiles/" : ""
      }${username}/${date}/${imageName}`,
      fullsizeKey: `fullsize/${
        pivotIndex > 5 ? "profiles/" : ""
      }${username}/${date}/${imageName}`,
    };
    const fullsizeImageURL = await FileServices.getImage(key, "fullsize");
    if (fullsizeImageURL) {
      imageEl.src = fullsizeImageURL;
    } else {
      imageEl.src = "/error.png";
    }
  }, []);

  return loadError;
}
