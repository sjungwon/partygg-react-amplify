import { useCallback, useContext, useState } from "react";
import { UserDataContext } from "../context/UserDataContextProvider";
import ProfileBlock from "./ProfileBlock";
import { AiOutlineClose } from "react-icons/ai";
import { BsPlusLg } from "react-icons/bs";
import styles from "./UserInfoBar.module.scss";
import AddProfileModal from "./AddProfileModal";

export default function UserInfoBar() {
  const { username, profileArr } = useContext(UserDataContext);

  const [showAdd, setShowAdd] = useState<boolean>(false);
  const setShowAddHandler = useCallback(() => {
    if (!username) {
      window.alert("로그인이 필요합니다.");
      return;
    }
    setShowAdd((prev) => !prev);
  }, [username]);
  const close = useCallback(() => {
    setShowAdd(false);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.title_container}>
        <h3 className={styles.title}>{username} 님의 프로필</h3>
        <button className={styles.title_btn_add} onClick={setShowAddHandler}>
          {showAdd ? <AiOutlineClose /> : <BsPlusLg />}
        </button>
      </div>
      <AddProfileModal show={showAdd} close={close} />
      <div>
        {profileArr.map((profile, i) => {
          if (i === 0 || profileArr[i].game !== profileArr[i - 1].game) {
            return (
              <>
                <div key={`game-${profile.game}`}>{profile.game}</div>
                <div
                  key={`${profile.game}-${profile.nickname}`}
                  className={styles.profile_container}
                >
                  <ProfileBlock profile={profile} hideUsername />
                </div>
              </>
            );
          }
          return (
            <div
              key={`${profile.game}-${profile.nickname}`}
              className={styles.profile_container}
            >
              <ProfileBlock profile={profile} hideUsername />
            </div>
          );
        })}
      </div>
      <div>
        <a
          href="https://www.flaticon.com/kr/free-icons/"
          title="사용자 아이콘"
          className={styles.profile_img_credit}
        >
          사용자 아이콘 제작자: Ongicon - Flaticon
        </a>
        <a
          href="https://www.flaticon.com/free-icons/warning"
          title="warning icons"
        >
          Warning icons created by amonrat rungreangfangsai - Flaticon
        </a>
      </div>
    </div>
  );
}
