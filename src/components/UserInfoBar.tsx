import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Dropdown, DropdownButton } from "react-bootstrap";
import { GameDataContext } from "../context/GameDataContextProvider";
import { UserDataContext } from "../context/UserDataContextProvider";
import ProfileServices from "../services/ProfileServices";
import TextValidServices from "../services/TextValidServices";
import { AddProfileReqData, Profile } from "../types/profile.type";
import ProfileBlock from "./ProfileBlock";
import styles from "./UserInfoBar.module.scss";

export default function UserInfoBar() {
  const { username, profileArr, addProfileHandler } =
    useContext(UserDataContext);
  const { games } = useContext(GameDataContext);
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

  const [profileGameList, setProfileGameList] = useState<string[]>([]);

  useEffect(() => {
    if (profileArr.length) {
      const gameList = profileArr.reduce((prev: string[], cur: Profile) => {
        if (!prev.includes(cur.game)) {
          return [...prev, cur.game];
        }
        return prev;
      }, []);
      setProfileGameList([...gameList].sort());
    }
  }, [profileArr]);

  console.log(profileGameList);

  const [loading, setLoading] = useState<boolean>(false);

  const addProfile = useCallback(async () => {
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
    const data: AddProfileReqData = {
      nickname,
      game: selectedGames,
      profileImage: "",
    };
    setLoading(true);
    const profile = await ProfileServices.addProfiles(data);
    if (!profile) {
      window.alert("프로필 추가에 실패했습니다. 다시 시도해주세요.");
      return;
    }
    addProfileHandler(profile);
    if (nicknameRef.current) {
      nicknameRef.current.value = "";
      setSelectedGames("");
    }
    setLoading(false);
  }, [addProfileHandler, selectedGames]);

  console.log(games);

  return (
    <div className={styles.container}>
      <div>{username} 님의 게임 프로필</div>
      <div>
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
        <p>
          {games.length
            ? selectedGames
              ? selectedGames
              : "게임을 선택해주세요."
            : "게임을 추가해주세요."}
        </p>
        <label>닉네임</label>
        <input type="text" ref={nicknameRef} />
        <button onClick={addProfile} disabled={loading}>
          {loading ? "추가 중..." : "추가"}
        </button>
      </div>
      <div>
        {profileArr.map((profile) => {
          return (
            <div key={`${profile.game}-${profile.nickname}`}>
              <ProfileBlock profile={profile} />
            </div>
          );
        })}
      </div>
      <div>좋아요 표시한 포스트</div>
      <div>싫어요 표시한 포스트</div>
    </div>
  );
}
