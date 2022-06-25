import styles from "./scss/AddComment.module.scss";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import ProfileSelector from "../atoms/ProfileSelector";
import { AddCommentReqData, Comment } from "../../types/post.type";
import { UserDataContext } from "../../context/UserDataContextProvider";
import PostServices from "../../services/PostServices";
import { Profile } from "../../types/profile.type";
import LoadingBlock from "../atoms/LoadingBlock";
import DefaultButton from "../atoms/DefaultButton";
import NeedLoginBlock from "../atoms/NeedLoginBlock";
import NeedProfileBlock from "../atoms/NeedProfileBlock";
import CommentCard from "../atoms/CommentCard";
import ProfileBlock from "../molecules/ProfileBlock";
import DefaultTextarea from "../atoms/DefaultTextarea";

interface PropsType {
  postId: string;
  prevData?: {
    comment: Comment;
    setModeDefault: () => void;
  };
  commentsListHandler: (newComment: Comment, type: "modify" | "add") => void;
}

export default function AddComment({
  postId,
  prevData,
  commentsListHandler,
}: PropsType) {
  //유저 데이터 사용 -> 프로필, 이름
  const { currentProfile: defaultProfile, filteredProfileArr } =
    useContext(UserDataContext);

  const [currentProfile, setCurrentProfile] = useState<Profile>(defaultProfile);

  useEffect(() => {
    //수정인 경우 수정할 comment profile로 설정
    if (prevData) {
      setCurrentProfile(prevData.comment.profile);
    }
    //수정이 아닌 경우 = 댓글 추가인 경우
    //defaultProfile이 변경되면 defaultProfile로 설정
    if (!prevData && defaultProfile) {
      setCurrentProfile(defaultProfile);
    }
  }, [prevData, setCurrentProfile, defaultProfile]);

  //데이터 제출용 ref
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  //데이터 제출

  const [loading, setLoading] = useState<boolean>(false);

  const clickToSubmit = useCallback(async () => {
    const text = textAreaRef.current ? textAreaRef.current.value.trim() : "";
    if (!text) {
      return;
    }
    console.log(text);
    setLoading(true);

    const submitData: AddCommentReqData = {
      profileId: currentProfile.id,
      profile: currentProfile,
      game: currentProfile.game,
      postId,
      text,
    };
    if (!prevData) {
      const newComment = await PostServices.addComments(submitData);
      if (!newComment) {
        window.alert("댓글을 추가하는데 실패했습니다. 다시 시도해주세요.");
        setLoading(false);
        return;
      }
      commentsListHandler(newComment, "add");
      if (textAreaRef.current) {
        textAreaRef.current.value = "";
      }
      setLoading(false);
      return;
    }

    const modifyComment = await PostServices.modifyComments({
      ...prevData.comment,
      ...submitData,
    });
    if (!modifyComment) {
      window.alert("댓글을 수정하는데 실패했습니다. 다시 시도해주세요.");
      setLoading(false);
      return;
    }
    commentsListHandler(modifyComment, "modify");
    prevData.setModeDefault();
    setLoading(false);
  }, [commentsListHandler, currentProfile, postId, prevData]);

  const select = useCallback(
    (eventKey: string | null) => {
      if (eventKey !== null && filteredProfileArr.length) {
        setCurrentProfile(filteredProfileArr[parseInt(eventKey)]);
      }
    },
    [filteredProfileArr, setCurrentProfile]
  );

  return (
    <CommentCard borderBottom={!prevData}>
      <NeedLoginBlock requiredMessage="댓글을 작성하려면 ">
        <NeedProfileBlock
          profiles={filteredProfileArr}
          requiredMessage="댓글을 작성하려면 "
        >
          <CommentCard.Header>
            <ProfileBlock profile={currentProfile} disableNavigate />
            <ProfileSelector
              size={"sm"}
              profileArr={filteredProfileArr}
              onSelect={select}
            />
          </CommentCard.Header>
          <CommentCard.Body>
            <DefaultTextarea
              ref={textAreaRef}
              defaultValue={prevData?.comment.text}
              maxLength={250}
              size="sm"
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
            {prevData ? (
              <DefaultButton
                size="sm"
                disabled={loading}
                onClick={prevData.setModeDefault}
              >
                취소
              </DefaultButton>
            ) : null}
          </CommentCard.Buttons>
        </NeedProfileBlock>
      </NeedLoginBlock>
    </CommentCard>
  );
}
