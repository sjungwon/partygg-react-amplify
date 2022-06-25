import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import { GameDataContext } from "../../context/GameDataContextProvider";
import { UserDataContext } from "../../context/UserDataContextProvider";
import FileServices from "../../services/FileServices";
import ProfileServices from "../../services/ProfileServices";
import TextValidServices from "../../services/TextValidServices";
import { AddProfileReqData, Profile } from "../../types/profile.type";
import styles from "./scss/AddProfileModal.module.scss";
import { ImageKeys } from "../../types/file.type";
import GameSelector from "../atoms/GameSelector";
import ImageFileInputButton from "../atoms/ImageFileInputButton";
import DefaultButton from "../atoms/DefaultButton";
import LoadingBlock from "../atoms/LoadingBlock";
import DefaultTextInput from "../atoms/DefaultTextInput";

interface PropsType {
  show: boolean;
  close: () => void;
  prevData?: Profile;
}

export default function AddProfileModal({ show, close, prevData }: PropsType) {
  const { games } = useContext(GameDataContext);
  const { profileArr, updateProfileHandler } = useContext(UserDataContext);

  const nicknameRef = useRef<HTMLInputElement>(null);

  const [selectedGames, setSelectedGames] = useState<string>("");

  const select = useCallback(
    (eventKey: string | null) => {
      if (eventKey !== null && games.length) {
        const index = Number(eventKey);
        setSelectedGames(games[index].name);
      }
    },
    [games]
  );

  const [loading, setLoading] = useState<boolean>(false);

  const [file, setFile] = useState<File | undefined>(undefined);

  const [image, setImage] = useState<string>("");

  const addImage = useCallback((event: any) => {
    const files = (event.target as HTMLInputElement).files;
    const file = files ? files[0] : null;
    if (file) {
      setFile(file);
      setImage(URL.createObjectURL(file));
    }
  }, []);

  const getPrevImage = useCallback(async (key: ImageKeys) => {
    const image = await FileServices.getImage(key, "resized");
    if (image) {
      setImage(image);
    }
  }, []);

  useEffect(() => {
    if (!prevData) {
      if (nicknameRef.current) {
        nicknameRef.current.value = "";
      }
      setSelectedGames("");
      setImage("");
      return;
    }
    if (nicknameRef.current) {
      nicknameRef.current.value = prevData.nickname;
    }
    if (prevData.profileImage) {
      getPrevImage(prevData.profileImage);
    } else {
      setImage("");
    }
    setSelectedGames(prevData.game);
  }, [getPrevImage, prevData]);

  const submitProfile = useCallback(async () => {
    if (!selectedGames) {
      window.alert("게임을 선택해주세요.");
      return;
    }
    const nickname = nicknameRef.current
      ? nicknameRef.current.value.trim()
      : "";
    if (!nickname) return;
    if (TextValidServices.isIncludePathSpecial(nickname)) {
      window.alert(
        `! * ${"`"} ' ; : @ & = + $ , / ? ${"\\"} # [ ] ( ) 는 포함할 수 없습니다.`
      );
      return;
    }

    if (!prevData) {
      if (
        profileArr.find(
          (profile) =>
            profile.game === selectedGames && profile.nickname === nickname
        )
      ) {
        window.alert("이미 존재하는 프로필입니다.");
        return;
      }
    }
    let data: AddProfileReqData = {
      nickname,
      game: selectedGames,
      profileImage: undefined,
    };
    setLoading(true);

    if (file) {
      const profileImage = await FileServices.putProfileImage(file);
      if (!profileImage) {
        window.alert(
          `프로필 ${
            prevData ? "수정" : "추가"
          }에 실패했습니다. 다시 시도해주세요.`
        );
        setLoading(false);
        return;
      }
      data = {
        ...data,
        profileImage,
      };
    }
    let profile: Profile | null = null;
    if (prevData) {
      const modifyData = {
        ...prevData,
        ...data,
      };
      profile = await ProfileServices.updateProfile(modifyData);
    } else {
      profile = await ProfileServices.addProfile(data);
    }
    if (!profile) {
      window.alert(
        `프로필 ${
          prevData ? "수정" : "추가"
        }에 실패했습니다. 다시 시도해주세요.`
      );
      setLoading(false);
      return;
    }
    if (prevData && prevData.profileImage) {
      FileServices.removeImage(prevData.profileImage);
    }
    if (prevData) {
      updateProfileHandler(profile, "modify");
    } else {
      updateProfileHandler(profile, "add");
    }
    setLoading(false);
    close();
    if (prevData) {
      window.location.reload();
    }
  }, [close, file, prevData, profileArr, selectedGames, updateProfileHandler]);

  return (
    <Modal backdrop="static" show={show} size="sm" centered>
      <Modal.Header>
        <Modal.Title className={styles.title}>
          프로필 {prevData ? "수정" : "추가"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className={styles.form}>
          <label className={styles.form_label}>게임: </label>
          <DefaultTextInput
            disabled
            value={
              games.length
                ? selectedGames
                  ? selectedGames
                  : "게임을 선택해주세요."
                : "게임을 추가해주세요."
            }
            className={styles.input}
          />
          <GameSelector onSelect={select} size="sm" games={games} />
        </div>
        <div className={styles.form}>
          <label className={styles.form_label}>이미지:</label>
          <img
            src={image ? image : "/default_profile.png"}
            alt="added_profile"
            className={styles.form_file_img}
          />
          <ImageFileInputButton
            onImageFileInput={addImage}
            multiple={false}
            color="blue"
          />
        </div>
        <div className={styles.form}>
          <label className={styles.form_label}>닉네임: </label>
          <DefaultTextInput
            ref={nicknameRef}
            placeholder="닉네임을 입력해주세요"
            className={styles.input}
          />
        </div>
        {prevData ? (
          <p className={styles.warning}>
            프로필 수정 시 다른 데이터에 반영을 위해 페이지가 새로고침됩니다.
          </p>
        ) : null}
      </Modal.Body>
      <Modal.Footer className={styles.footer}>
        <DefaultButton size="md" onClick={submitProfile} disabled={loading}>
          <LoadingBlock loading={loading}>
            {prevData ? "수정" : "추가"}
          </LoadingBlock>
        </DefaultButton>
        <DefaultButton size="md" onClick={close} disabled={loading}>
          취소
        </DefaultButton>
      </Modal.Footer>
    </Modal>
  );
}
