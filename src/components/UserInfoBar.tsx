import { MouseEventHandler, useCallback, useContext, useState } from "react";
import { UserDataContext } from "../context/UserDataContextProvider";
import ProfileBlock from "./ProfileBlock";
import { AiOutlineClose } from "react-icons/ai";
import { BsPlusLg } from "react-icons/bs";
import styles from "./UserInfoBar.module.scss";
import AddProfileModal from "./AddProfileModal";
import { BsPencilSquare, BsTrash } from "react-icons/bs";
import { Link } from "react-router-dom";
import ProfileServices from "../services/ProfileServices";
import FileServices from "../services/FileServices";
import RemoveConfirmModal from "./RemoveConfirmModal";
import { Profile } from "../types/profile.type";

const ProfileWithMenu: React.FC<{
  profile: Profile;
  i: number;
  setIndex: MouseEventHandler;
}> = ({ profile, i, setIndex }) => {
  return (
    <>
      <ul className={styles.profile_category}>{profile.game}</ul>
      <li className={styles.profile_container}>
        <Link
          to={`/posts/profiles/${profile.id}`}
          className={styles.profile_block}
        >
          <ProfileBlock profile={profile} hideUsername />
        </Link>
        <button
          className={styles.profile_btn}
          data-profile-index={i}
          data-profile-type={"modify"}
          onClick={setIndex}
        >
          <BsPencilSquare />
        </button>
        <button
          className={styles.profile_btn}
          data-profile-index={i}
          data-profile-type={"remove"}
          onClick={setIndex}
        >
          <BsTrash />
        </button>
      </li>
    </>
  );
};

const ProfileWithoutMenu: React.FC<{
  profile: Profile;
  i: number;
  setIndex: MouseEventHandler;
}> = ({ profile, i, setIndex }) => {
  return (
    <li className={styles.profile_container}>
      <Link
        to={`/posts/profiles/${profile.id}`}
        className={styles.profile_block}
      >
        <ProfileBlock profile={profile} hideUsername />
      </Link>
      <button
        className={styles.profile_btn}
        data-profile-index={i}
        data-profile-type={"modify"}
        onClick={setIndex}
      >
        <BsPencilSquare />
      </button>
      <button
        className={styles.profile_btn}
        data-profile-index={i}
        data-profile-type={"remove"}
        onClick={setIndex}
      >
        <BsTrash />
      </button>
    </li>
  );
};

export default function UserInfoBar() {
  const { username, profileArr, updateProfileHandler } =
    useContext(UserDataContext);

  const [showAdd, setShowAdd] = useState<boolean>(false);
  const [modifyData, setModifyData] = useState<Profile | undefined>();

  const openShowAdd = useCallback(() => {
    if (!username) {
      window.alert("로그인이 필요합니다.");
      return;
    }
    setShowAdd(true);
  }, [username]);
  const closeShowAdd = useCallback(() => {
    setModifyData(undefined);
    setShowAdd(false);
  }, []);

  const [loading, setLoading] = useState<boolean>(false);
  const [profileIndex, setProfileIndex] = useState<number>(-1);

  //remove modal
  const [showRemoveMd, setShowRemoveMd] = useState<boolean>(false);
  const removeMdClose = useCallback(() => {
    setShowRemoveMd(false);
  }, []);

  const setIndex: MouseEventHandler = useCallback(
    (event) => {
      if (!username) {
        window.alert("로그인이 필요합니다.");
        return;
      }
      const btnEl = event.target as HTMLButtonElement;
      const index = Number(btnEl.dataset.profileIndex);
      const type = btnEl.dataset.profileType;
      if (isNaN(index)) {
        window.alert(
          `프로필 ${
            type === "remove" ? "제거" : "수정"
          }에 오류가 발생했습니다. 다시 시도해주세요.`
        );
        return;
      }
      setProfileIndex(index);
      if (type === "remove") {
        setShowRemoveMd(true);
        return;
      }
      if (type === "modify") {
        setModifyData(profileArr[index]);
      }
      openShowAdd();
    },
    [openShowAdd, profileArr, username]
  );

  const deleteProfile = useCallback(async () => {
    setLoading(true);
    const removeProfile = profileArr[profileIndex];
    const success = await ProfileServices.deleteProfile(removeProfile.id);
    if (!success) {
      window.alert("프로필 제거에 오류가 발생했습니다. 다시 시도해주세요.");
      setLoading(false);
      return;
    }
    if (removeProfile.profileImage) {
      FileServices.removeImage(removeProfile.profileImage);
    }
    updateProfileHandler(removeProfile, "remove");
    setLoading(false);
    setShowRemoveMd(false);
  }, [profileArr, profileIndex, updateProfileHandler]);

  return (
    <div className={styles.container}>
      <div className={styles.title_container}>
        <h3 className={styles.title}>{username} 님의 프로필</h3>
        <button className={styles.title_btn_add} onClick={openShowAdd}>
          {showAdd ? <AiOutlineClose /> : <BsPlusLg />}
        </button>
      </div>
      <AddProfileModal
        show={showAdd}
        close={closeShowAdd}
        prevData={modifyData}
      />
      <div>
        {profileArr.map((profile, i) => {
          if (i === 0 || profileArr[i].game !== profileArr[i - 1].game) {
            return (
              <ProfileWithMenu
                profile={profile}
                i={i}
                setIndex={setIndex}
                key={`${profile.game}-${profile.nickname}`}
              />
            );
          }
          return (
            <ProfileWithoutMenu
              profile={profile}
              i={i}
              setIndex={setIndex}
              key={`${profile.game}-${profile.nickname}`}
            />
          );
        })}
      </div>

      <RemoveConfirmModal
        show={showRemoveMd}
        loading={loading}
        remove={deleteProfile}
        close={removeMdClose}
      />
    </div>
  );
}
