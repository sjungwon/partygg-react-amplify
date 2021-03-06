import {
  ChangeEventHandler,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
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
import AddGames from "./AddGames";
import ImageSlide from "./ImageSlide";
import { BsTrash } from "react-icons/bs";

interface PropsType {
  show: boolean;
  close: () => void;
  prevData?: Profile;
}

export default function AddProfileModal({ show, close, prevData }: PropsType) {
  const { games } = useContext(GameDataContext);
  const { profileArr, updateProfileHandler } = useContext(UserDataContext);

  const nicknameRef = useRef<HTMLInputElement>(null);

  const [selectedGame, setSelectedGame] = useState<string>("");

  const select = useCallback(
    (eventKey: string | null) => {
      if (eventKey !== null && games.length) {
        const index = Number(eventKey);
        setSelectedGame(games[index].name);
      }
    },
    [games]
  );

  const [loading, setLoading] = useState<boolean>(false);

  const [file, setFile] = useState<File | undefined>(undefined);
  const [image, setImage] = useState<string>("");
  const [prevProfileImageKey, setPrevProfileImageKey] = useState<
    ImageKeys | undefined
  >(prevData?.profileImage);

  const [credentialFile, setCredentialFile] = useState<File | undefined>(
    undefined
  );
  const [credentialImage, setCredentialImage] = useState<string>("");
  const [prevCredentialImageKey, setPrevCredentialImageKey] = useState<
    ImageKeys | undefined
  >(prevData?.credential);

  const addImage = useCallback((event: any) => {
    const files = (event.target as HTMLInputElement).files;
    const file = files ? files[0] : null;
    if (file) {
      setFile(file);
      setImage(URL.createObjectURL(file));
      setPrevProfileImageKey({
        resizedKey: "change",
        fullsizeKey: "change",
      });
    }
  }, []);

  const removeImage = useCallback(() => {
    setFile(undefined);
    setImage("");
    setPrevProfileImageKey({
      resizedKey: "removed",
      fullsizeKey: "removed",
    });
  }, []);

  const addCredentialImage: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      const files = event.target.files;
      const file = files ? files[0] : null;
      if (file) {
        setCredentialFile(file);
        setCredentialImage(URL.createObjectURL(file));
        setPrevCredentialImageKey({
          resizedKey: "change",
          fullsizeKey: "change",
        });
      }
    },
    []
  );

  const removeCredentialImage = useCallback(() => {
    setCredentialFile(undefined);
    setCredentialImage("");
    setPrevCredentialImageKey({
      resizedKey: "removed",
      fullsizeKey: "removed",
    });
  }, []);

  const getPrevImage = useCallback(
    async (key: ImageKeys, type: "profile" | "credential") => {
      const image = await FileServices.getImage(key, "resized");
      if (image) {
        if (type === "profile") {
          setImage(image);
        } else {
          setCredentialImage(image);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (!prevData) {
      if (nicknameRef.current) {
        nicknameRef.current.value = "";
      }
      setSelectedGame("");
      setImage("");
      return;
    }
    if (nicknameRef.current) {
      nicknameRef.current.value = prevData.nickname;
    }
    if (prevData.profileImage) {
      getPrevImage(prevData.profileImage, "profile");
    } else {
      setImage("");
    }
    if (prevData.credential) {
      getPrevImage(prevData.credential, "credential");
    }
    setSelectedGame(prevData.game);
  }, [getPrevImage, prevData]);

  const submitProfile = useCallback(async () => {
    if (!selectedGame) {
      window.alert("????????? ??????????????????.");
      return;
    }
    const nickname = nicknameRef.current
      ? nicknameRef.current.value.trim()
      : "";
    if (!nickname) return;
    if (TextValidServices.isIncludePathSpecial(nickname)) {
      window.alert(
        `! * ${"`"} ' ; : @ & = + $ , / ? ${"\\"} # [ ] ( ) ??? ????????? ??? ????????????.`
      );
      return;
    }
    if (
      prevData &&
      selectedGame === prevData.game &&
      prevData.nickname === nickname &&
      prevProfileImageKey?.resizedKey !== "change" &&
      prevCredentialImageKey?.resizedKey !== "change"
    ) {
      close();
      return;
    }

    if (!prevData) {
      if (
        profileArr.find(
          (profile) =>
            profile.game === selectedGame && profile.nickname === nickname
        )
      ) {
        window.alert("?????? ???????????? ??????????????????.");
        return;
      }
    }
    let data: AddProfileReqData = {
      nickname,
      game: selectedGame,
      profileImage: undefined,
    };
    setLoading(true);

    if (file) {
      const profileImage = await FileServices.putProfileImage(file);
      if (!profileImage) {
        window.alert(
          `????????? ${
            prevData ? "??????" : "??????"
          }??? ??????????????????. ?????? ??????????????????.`
        );
        setLoading(false);
        return;
      }
      data = {
        ...data,
        profileImage,
      };
    }

    if (credentialFile) {
      const credentialImage = await FileServices.putPostImage(credentialFile);
      if (!credentialImage) {
        window.alert(
          `????????? ${
            prevData ? "??????" : "??????"
          }??? ??????????????????. ?????? ??????????????????.`
        );
        setLoading(false);
        return;
      }
      data = {
        ...data,
        credential: credentialImage,
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
        `????????? ${
          prevData ? "??????" : "??????"
        }??? ??????????????????. ?????? ??????????????????.`
      );
      setLoading(false);
      return;
    }
    if (prevData && prevData.profileImage) {
      FileServices.removeImage(prevData.profileImage);
    }
    if (prevData && prevData.credential) {
      FileServices.removeImage(prevData.credential);
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
  }, [
    close,
    credentialFile,
    file,
    prevCredentialImageKey,
    prevData,
    prevProfileImageKey,
    profileArr,
    selectedGame,
    updateProfileHandler,
  ]);

  const [addGameShow, setAddGameShow] = useState<boolean>(false);
  const addGameShowHandler = useCallback(() => {
    setAddGameShow((prev) => !prev);
  }, []);

  return (
    <Modal backdrop="static" show={show} size="sm" centered>
      <Modal.Header>
        <Modal.Title className={styles.title}>
          ????????? {prevData ? "??????" : "??????"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <DefaultButton size="md" onClick={addGameShowHandler} color="blue">
          ?????? ??????
        </DefaultButton>
        <div className={`${styles.form} ${addGameShow ? "" : styles.hide}`}>
          <AddGames display="flex" />
        </div>
        <div className={styles.form}>
          <label className={styles.form_label}>??????: </label>
          <DefaultTextInput
            disabled
            value={
              games.length
                ? selectedGame
                  ? selectedGame
                  : "????????? ??????????????????."
                : "????????? ??????????????????."
            }
            className={styles.input}
          />
          <GameSelector onSelect={select} size="sm" games={games} />
        </div>
        <div className={styles.form}>
          <label className={styles.form_label}>????????? ?????????:</label>
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
          <DefaultButton
            onClick={removeImage}
            size="sq_md"
            className={styles.margin_left}
            color="blue"
          >
            <BsTrash />
          </DefaultButton>
        </div>
        <div className={styles.form}>
          <label className={styles.form_label}>?????????: </label>
          <DefaultTextInput
            ref={nicknameRef}
            placeholder="???????????? ??????????????????"
            className={styles.input}
          />
        </div>
        <div>
          <div className={styles.form}>
            <label className={`${styles.form_label} ${styles.margin_right}`}>
              ??????(??????):{" "}
            </label>
            <ImageFileInputButton
              onImageFileInput={addCredentialImage}
              multiple={false}
              color="blue"
            />
            <DefaultButton
              onClick={removeCredentialImage}
              size="sq_md"
              className={styles.margin_left}
              color="blue"
            >
              <BsTrash />
            </DefaultButton>
          </div>
          {credentialImage ? (
            <ImageSlide images={[credentialImage]} noIndicator />
          ) : null}
        </div>
        {prevData ? (
          <p className={styles.warning}>
            ????????? ?????? ??? ?????? ???????????? ???????????? ?????? ???????????? ?????????????????????.
          </p>
        ) : null}
      </Modal.Body>
      <Modal.Footer className={styles.footer}>
        <DefaultButton size="md" onClick={submitProfile} disabled={loading}>
          <LoadingBlock loading={loading}>
            {prevData ? "??????" : "??????"}
          </LoadingBlock>
        </DefaultButton>
        <DefaultButton size="md" onClick={close} disabled={loading}>
          ??????
        </DefaultButton>
      </Modal.Footer>
    </Modal>
  );
}
