import {
  FC,
  MouseEventHandler,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { UserDataContext } from "../../context/UserDataContextProvider";
import FileServices from "../../services/FileServices";
import ProfileServices from "../../services/ProfileServices";
import { Profile } from "../../types/profile.type";
import AddProfileModal from "./AddProfileModal";
import RemoveConfirmModal from "./RemoveConfirmModal";
import styles from "./scss/ProfileList.module.scss";
import { NavLink } from "react-router-dom";
import ProfileBlock from "./ProfileBlock";
import DefaultButton from "../atoms/DefaultButton";

interface PropsType {
  username: string;
  profileArr: Profile[];
}

const ProfileLiEl: FC<{
  profile: Profile;
  i: number;
  setIndex: MouseEventHandler;
  my: boolean;
}> = ({ profile, i, setIndex, my }) => {
  return (
    <li className={my ? styles.profile_block : styles.profile_block_other}>
      <NavLink
        to={`/profiles/${profile.id}`}
        className={my ? styles.profile : styles.profile_other}
      >
        <ProfileBlock profile={profile} hideUsername disableNavigate />
      </NavLink>
      {my ? (
        <div className={styles.profile_btns}>
          <DefaultButton
            size="xs"
            className={styles.btn_margin}
            attributes={{
              "data-index": `${i}`,
              "data-type": "modify",
            }}
            onClick={setIndex}
          >
            수정
          </DefaultButton>
          <DefaultButton
            size="xs"
            attributes={{
              "data-index": `${i}`,
              "data-type": "remove",
            }}
            onClick={setIndex}
          >
            삭제
          </DefaultButton>
        </div>
      ) : null}
    </li>
  );
};

const ProfileWithMenu: FC<{
  profileArr: Profile[];
  i: number;
  setIndex: MouseEventHandler;
  my: boolean;
}> = ({ profileArr, i, setIndex, my }) => {
  return (
    <>
      <p
        className={
          my
            ? styles.profile_category_title
            : styles.profile_category_title_other
        }
      >
        {profileArr.length ? profileArr[0].game : null}
      </p>
      <ul
        className={
          my ? styles.profile_container : styles.profile_container_other
        }
      >
        {profileArr.map((profile, curIndex) => (
          <ProfileLiEl
            profile={profile}
            i={curIndex + i}
            setIndex={setIndex}
            my={my}
            key={profile.id}
          />
        ))}
      </ul>
    </>
  );
};

const CategorizedProfileList: FC<{
  profileArr: Profile[];
  setIndex: MouseEventHandler;
  username: string;
  myUsername: string;
}> = ({ profileArr, setIndex, username, myUsername }) => {
  return (
    <>
      {
        profileArr.reduce(
          (
            total: { node: ReactNode[]; profileArr: Profile[] },
            profile: Profile,
            i: number,
            origArr: Profile[]
          ) => {
            if (i === profileArr.length - 1) {
              if (i > 0 && origArr[i].game !== origArr[i - 1].game) {
                const prevIndex =
                  i - total.profileArr.length < 0
                    ? 0
                    : i - total.profileArr.length;
                const ulEl = (
                  <ProfileWithMenu
                    profileArr={[...total.profileArr]}
                    i={prevIndex}
                    setIndex={setIndex}
                    my={username === myUsername}
                    key={total.profileArr[0].id}
                  />
                );
                const myUlEl = (
                  <ProfileWithMenu
                    profileArr={[profile]}
                    i={i}
                    setIndex={setIndex}
                    my={username === myUsername}
                    key={profile.id}
                  />
                );
                return {
                  node: [...total.node, ulEl, myUlEl],
                  profileArr: [],
                };
              }
              const prevIndex = i - total.profileArr.length;
              const ulEl = (
                <ProfileWithMenu
                  profileArr={[...total.profileArr, profile]}
                  i={prevIndex < 0 ? 0 : prevIndex}
                  setIndex={setIndex}
                  my={username === myUsername}
                  key={profile.id}
                />
              );
              return {
                node: [...total.node, ulEl],
                profileArr: [],
              };
            }
            if (i !== 0 && origArr[i].game !== origArr[i - 1].game) {
              const prevIndex = i - total.profileArr.length;
              const ulEl = (
                <ProfileWithMenu
                  profileArr={total.profileArr}
                  i={prevIndex < 0 ? 0 : prevIndex}
                  setIndex={setIndex}
                  my={username === myUsername}
                  key={total.profileArr[0].id}
                />
              );
              return {
                node: [...total.node, ulEl],
                profileArr: [profile],
              };
            }
            return {
              ...total,
              profileArr: [...total.profileArr, profile],
            };
          },
          { node: [], profileArr: [] }
        ).node
      }
    </>
  );
};

export default function ProfileList({ username, profileArr }: PropsType) {
  const { username: myUsername, updateProfileHandler } =
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
      const index = Number(btnEl.dataset.index);
      const type = btnEl.dataset.type;
      if (isNaN(index)) {
        window.alert(
          `프로필 ${
            type === "remove" ? "삭제" : "수정"
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
      window.alert("프로필 삭제에 오류가 발생했습니다. 다시 시도해주세요.");
      setLoading(false);
      return;
    }
    if (removeProfile.profileImage) {
      await FileServices.removeImage(removeProfile.profileImage);
    }
    updateProfileHandler(removeProfile, "remove");
    setLoading(false);
    setShowRemoveMd(false);
    window.location.reload();
  }, [profileArr, profileIndex, updateProfileHandler]);

  return (
    <>
      <div
        className={
          username === myUsername
            ? styles.title_container
            : styles.title_container_other
        }
      >
        <h3 className={styles.title}>프로필</h3>
        {username === myUsername ? (
          <DefaultButton size="md" onClick={openShowAdd} disabled={!username}>
            프로필 추가
          </DefaultButton>
        ) : null}
      </div>
      <AddProfileModal
        show={showAdd}
        close={closeShowAdd}
        prevData={modifyData}
      />
      <div className={styles.profile_list_container}>
        <CategorizedProfileList
          profileArr={profileArr}
          setIndex={setIndex}
          username={username}
          myUsername={myUsername}
        />
      </div>
      <RemoveConfirmModal
        show={showRemoveMd}
        loading={loading}
        remove={deleteProfile}
        close={removeMdClose}
        customMessage={<RemoveMessage />}
      />
    </>
  );
}

const RemoveMessage = () => {
  return (
    <p className={styles.warning}>
      프로필 제거 시 다른 데이터에 반영하기 위해 페이지가 새로고침됩니다.
    </p>
  );
};
