import { useCallback, useContext, useState } from "react";
import { Dropdown, DropdownButton } from "react-bootstrap";
import { UserDataContext } from "../context/UserDataContextProvider";
import { Profile } from "../types/profile.type";

interface PropsType {
  size?: "sm" | "lg";
  setCurrentProfile: (profile: Profile) => void;
}

export default function ProfileSelector({
  size,
  setCurrentProfile,
}: PropsType) {
  //프로필 상태 데이터
  const { filteredProfileArr } = useContext(UserDataContext);

  console.log("selector render");
  //프로필 선택
  const select = useCallback(
    (eventKey: string | null) => {
      if (eventKey !== null && filteredProfileArr.length) {
        setCurrentProfile(filteredProfileArr[parseInt(eventKey)]);
      }
    },
    [filteredProfileArr, setCurrentProfile]
  );

  return (
    <DropdownButton
      id="dropdown-profile"
      title="프로필"
      onSelect={select}
      size={size}
      disabled={!filteredProfileArr.length}
    >
      {filteredProfileArr.map((profile, index) => {
        return (
          <Dropdown.Item key={profile.game + profile.nickname} eventKey={index}>
            {profile.game} - {profile.nickname}
          </Dropdown.Item>
        );
      })}
    </DropdownButton>
  );
}
