import { useCallback, useContext } from "react";
import { Dropdown, DropdownButton } from "react-bootstrap";
import { UserDataContext } from "../context/UserDataContextProvider";

interface PropsType {
  size?: "sm" | "lg";
}

export default function ProfileSelector({ size }: PropsType) {
  //프로필 상태 데이터
  const { profileArr, setCurrentProfileHandler } = useContext(UserDataContext);
  console.log("selector render");
  //프로필 선택
  const select = useCallback(
    (eventKey: string | null) => {
      if (eventKey !== null && profileArr) {
        setCurrentProfileHandler(profileArr[parseInt(eventKey)]);
      }
    },
    [profileArr, setCurrentProfileHandler]
  );

  return (
    <DropdownButton
      id="dropdown-profile"
      title="프로필"
      onSelect={select}
      size={size}
    >
      {profileArr?.map((profile, index) => {
        return (
          <Dropdown.Item key={profile.game} eventKey={index}>
            {profile.game} - {profile.nickname}
          </Dropdown.Item>
        );
      })}
    </DropdownButton>
  );
}
