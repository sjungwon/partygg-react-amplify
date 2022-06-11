import { useContext } from "react";
import { UserDataContext } from "../context/UserDataContextProvider";
import styles from "./UserInfoBar.module.scss";

export default function UserInfoBar() {
  const { username, profileArr } = useContext(UserDataContext);
  return (
    <div className={styles.container}>
      <div>{username} 님의 게임 프로필</div>
      <div>
        {/* <DropdownButton>
        </DropdownButton> */}
        <input type="text" />
        <button>추가</button>
      </div>
      <div>
        {profileArr.map((profile) => {
          return <div>{profile.nickname}</div>;
        })}
      </div>
      <div>좋아요 표시한 포스트</div>
      <div>싫어요 표시한 포스트</div>
    </div>
  );
}
