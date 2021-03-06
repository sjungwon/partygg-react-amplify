import styles from "./scss/AddSubcomment.module.scss";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { AddSubcommentReqData, Subcomment } from "../../types/post.type";
import { UserDataContext } from "../../context/UserDataContextProvider";
import PostServices from "../../services/PostServices";
import { Profile } from "../../types/profile.type";
import NeedLoginBlock from "../atoms/NeedLoginBlock";
import NeedProfileBlock from "../atoms/NeedProfileBlock";
import LoadingBlock from "../atoms/LoadingBlock";
import DefaultButton from "../atoms/DefaultButton";
import CommentCard from "../atoms/CommentCard";
import ProfileBlock from "./ProfileBlock";
import ProfileSelector from "../atoms/ProfileSelector";
import DefaultTextarea from "../atoms/DefaultTextarea";

interface PropsType {
  commentId: string;
  game: string;
  prevData?: Subcomment;
  setModeDefault: () => void;
  subcommentsListHandlerWithRenderLength: (
    subcomment: Subcomment,
    type: "modify" | "add" | "remove"
  ) => void;
}

export default function AddSubcomment({
  commentId,
  game,
  prevData,
  setModeDefault,
  subcommentsListHandlerWithRenderLength: subcommentsListHandler,
}: PropsType) {
  //유저 데이터 사용 -> 프로필, 이름
  const { profileArr, currentProfile: defaultProfile } =
    useContext(UserDataContext);

  const [currentProfile, setCurrentProfile] = useState<Profile>(defaultProfile);
  const [filteredProfileArr, setFilteredProfileArr] = useState<Profile[]>([]);

  useEffect(() => {
    const filtered = profileArr.filter((profile) => profile.game === game);
    setFilteredProfileArr(filtered);
    //수정인 경우 수정할 comment profile로 설정
    if (prevData && filtered.length) {
      const finded = profileArr.find(
        (profile) => profile.id === prevData.profileId
      );
      setCurrentProfile(finded ? finded : filtered[0]);
      return;
    }
    //수정이 아닌 경우 = 댓글 추가인 경우
    setCurrentProfile(filtered[0]);
  }, [prevData, setCurrentProfile, defaultProfile, profileArr, game]);

  //데이터 제출용 ref
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  //데이터 제출

  const [loading, setLoading] = useState<boolean>(false);

  const clickToSubmit = useCallback(async () => {
    const text = textAreaRef.current ? textAreaRef.current.value.trim() : "";
    if (!text) {
      return;
    }
    setLoading(true);

    const submitData: AddSubcommentReqData = {
      profileId: currentProfile.id,
      profile: currentProfile,
      game: currentProfile.game,
      commentId,
      text,
    };
    if (!prevData) {
      const newSubcomment = await PostServices.addSubcomments(submitData);
      if (!newSubcomment) {
        window.alert("댓글을 추가하는데 실패했습니다. 다시 시도해주세요.");
        setLoading(false);
        return;
      }
      subcommentsListHandler(newSubcomment, "add");
      if (textAreaRef.current) {
        textAreaRef.current.value = "";
      }
      setLoading(false);
      setModeDefault();
      return;
    }

    const modifyComment = await PostServices.modifySubcomments({
      ...prevData,
      ...submitData,
    });
    if (!modifyComment) {
      window.alert("댓글을 수정하는데 실패했습니다. 다시 시도해주세요.");
      setLoading(false);
      return;
    }
    subcommentsListHandler(modifyComment, "modify");
    setModeDefault();
    setLoading(false);
  }, [
    commentId,
    currentProfile,
    prevData,
    setModeDefault,
    subcommentsListHandler,
  ]);

  const select = useCallback(
    (eventKey: string | null) => {
      if (eventKey !== null && filteredProfileArr.length) {
        setCurrentProfile(filteredProfileArr[parseInt(eventKey)]);
      }
    },
    [filteredProfileArr, setCurrentProfile]
  );

  return (
    <CommentCard>
      <NeedLoginBlock requiredMessage="대댓글을 작성하려면 ">
        <NeedProfileBlock
          requiredMessage="대댓글을 작성하려면 카테고리에 맞는 "
          profiles={filteredProfileArr}
        >
          <CommentCard.Header>
            <ProfileBlock profile={currentProfile} disableNavigate />
            <ProfileSelector
              profileArr={filteredProfileArr}
              size="sm"
              onSelect={select}
            />
          </CommentCard.Header>
          <CommentCard.Body>
            <DefaultTextarea
              size="sm"
              ref={textAreaRef}
              defaultValue={prevData?.text}
              maxLength={250}
            />
          </CommentCard.Body>
          <CommentCard.Buttons>
            <DefaultButton
              size="sm"
              disabled={loading}
              onClick={clickToSubmit}
              className={styles.btn_margin}
            >
              <LoadingBlock loading={loading}>등록</LoadingBlock>
            </DefaultButton>
            <DefaultButton
              size="sm"
              disabled={loading}
              onClick={setModeDefault}
            >
              취소
            </DefaultButton>
          </CommentCard.Buttons>
        </NeedProfileBlock>
      </NeedLoginBlock>
    </CommentCard>
  );
}
