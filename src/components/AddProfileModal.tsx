import { useCallback, useContext, useRef, useState } from "react";
import { Button, Dropdown, DropdownButton, Modal } from "react-bootstrap";
import { GameDataContext } from "../context/GameDataContextProvider";
import { UserDataContext } from "../context/UserDataContextProvider";
import FileServices from "../services/FileServices";
import ProfileServices from "../services/ProfileServices";
import TextValidServices from "../services/TextValidServices";
import { AddProfileReqData } from "../types/profile.type";
import { MdOutlinePhotoSizeSelectActual } from "react-icons/md";
import styles from "./AddProfileModal.module.scss";

interface PropsType {
  show: boolean;
  close: () => void;
}

export default function AddProfileModal({ show, close }: PropsType) {
  const { games } = useContext(GameDataContext);
  const { profileArr, addProfileHandler } = useContext(UserDataContext);

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

  const closeWithInit = useCallback(() => {
    if (nicknameRef.current) {
      nicknameRef.current.value = "";
      setSelectedGames("");
      setImage("");
    }
    close();
  }, [close]);

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

    if (
      profileArr.find(
        (profile) =>
          profile.game === selectedGames && profile.nickname === nickname
      )
    ) {
      window.alert("이미 존재하는 프로필입니다.");
      return;
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
        window.alert("프로필 추가에 실패했습니다. 다시 시도해주세요.");
        setLoading(false);
        return;
      }
      data = {
        ...data,
        profileImage,
      };
    }
    const profile = await ProfileServices.addProfiles(data);
    if (!profile) {
      window.alert("프로필 추가에 실패했습니다. 다시 시도해주세요.");
      setLoading(false);
      return;
    }
    addProfileHandler(profile);
    setLoading(false);
    closeWithInit();
  }, [addProfileHandler, closeWithInit, file, profileArr, selectedGames]);

  return (
    <Modal backdrop="static" show={show} size="sm" centered>
      <Modal.Header>
        <Modal.Title>프로필 추가</Modal.Title>
      </Modal.Header>
      <Modal.Body>
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
          {loading ? "추가 중..." : "추가"}
        </Button>
        <Button onClick={closeWithInit} size="sm">
          취소
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
