import { useCallback, useContext } from "react";
import { Dropdown, DropdownButton } from "react-bootstrap";
import { UserDataContext } from "../context/UserDataContextProvider";
import { Profile } from "../types/profile.type";

interface PropsType {
  size?: "sm" | "lg";
  disabled?: boolean;
  setCurrentProfile: (profile: Profile) => void;
}

export default function ProfileSelector({
  size,
  disabled,
  setCurrentProfile,
}: PropsType) {
  //프로필 상태 데이터
  const { profileArr } = useContext(UserDataContext);
  console.log("selector render");
  //프로필 선택
  const select = useCallback(
    (eventKey: string | null) => {
      if (eventKey !== null && profileArr.length) {
        setCurrentProfile(profileArr[parseInt(eventKey)]);
      }
    },
    [profileArr, setCurrentProfile]
  );

  return (
    <DropdownButton
      id="dropdown-profile"
      title="프로필"
      onSelect={select}
      size={size}
      disabled={disabled}
    >
      {profileArr?.map((profile, index) => {
        return (
          <Dropdown.Item key={profile.game + profile.nickname} eventKey={index}>
            {profile.game} - {profile.nickname}
          </Dropdown.Item>
        );
      })}
    </DropdownButton>
  );
}
