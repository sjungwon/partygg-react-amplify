import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Button, Dropdown, DropdownButton, Modal } from "react-bootstrap";
import { GameDataContext } from "../context/GameDataContextProvider";
import { UserDataContext } from "../context/UserDataContextProvider";
import FileServices from "../services/FileServices";
import ProfileServices from "../services/ProfileServices";
import TextValidServices from "../services/TextValidServices";
import { AddProfileReqData, Profile } from "../types/profile.type";
import { MdOutlinePhotoSizeSelectActual } from "react-icons/md";
import styles from "./AddProfileModal.module.scss";
import { ImageKeys } from "../types/file.type";
import { useLocation } from "react-router-dom";

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
  const fileRef = useRef<HTMLInputElement>(null);

  const [image, setImage] = useState<string>("");
  const openFileInput = useCallback(() => {
    fileRef?.current?.click();
  }, [fileRef]);

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
    if (TextValidServices.isIncludeSpecial(nickname)) {
      window.alert(
        "닉네임에 특수문자를 사용할 수 없습니다. 다시 시도해주세요."
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
    window.location.reload();
  }, [close, file, prevData, profileArr, selectedGames, updateProfileHandler]);

  return (
    <Modal backdrop="static" show={show} size="sm" centered>
      <Modal.Header>
        <Modal.Title>프로필 {prevData ? "수정" : "추가"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {prevData ? (
          <p>
            프로필 수정 시 다른 데이터에 반영을 위해 페이지가 새로고침됩니다.
          </p>
        ) : null}
        <div className={styles.form_game_selector}>
          <DropdownButton
            id="dropdown-gameList"
            title="게임"
            onSelect={select}
            size="sm"
            disabled={!games.length}
          >
            {games.map((game, index) => {
              return (
                <Dropdown.Item key={game.name} eventKey={index}>
                  {game.name}
                </Dropdown.Item>
              );
            })}
          </DropdownButton>
          <input
            disabled
            value={
              games.length
                ? selectedGames
                  ? selectedGames
                  : "게임을 선택해주세요."
                : "게임을 추가해주세요."
            }
          />
        </div>
        <div className={styles.form_file}>
          <Button
            onClick={openFileInput}
            size="sm"
            name="add-image"
            className={styles.form_file_btn}
          >
            <MdOutlinePhotoSizeSelectActual />
          </Button>
          <input
            type="file"
            accept="image/jpg,image/png,image/jpeg"
            onInput={addImage}
            multiple
            className={styles.form_file_input}
            ref={fileRef}
          />
          <img
            src={image ? image : "/default_profile.png"}
            alt="added_profile"
            className={styles.form_file_img}
          />
        </div>
        <div className={styles.form_nickname}>
          <label className={styles.form_nickname_label}>닉네임</label>
          <input
            type="text"
            ref={nicknameRef}
            placeholder="닉네임을 입력해주세요"
            className={styles.form_nickname_input}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          size="sm"
          onClick={submitProfile}
          disabled={loading}
          className={styles.btn_submit}
        >
          {loading
            ? prevData
              ? "수정 중..."
              : "추가 중..."
            : prevData
            ? "수정"
            : "추가"}
        </Button>
        <Button onClick={close} size="sm">
          취소
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
