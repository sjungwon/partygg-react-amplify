import styles from "./AddComment.module.scss";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import ProfileSelector from "../ProfileSelector";
import { AddSubcommentReqData, Subcomment } from "../../types/post.type";
import { UserDataContext } from "../../context/UserDataContextProvider";
import PostServices from "../../services/PostServices";
import { Profile } from "../../types/profile.type";
import ProfileBlock from "../ProfileBlock";

interface PropsType {
  commentId: string;
  prevData?: Subcomment;
  setModeDefault: () => void;
  subcommentsListHandler: (
    newSubcomment: Subcomment,
    type: "modify" | "add"
  ) => void;
}

export default function AddSubcomment({
  commentId,
  prevData,
  setModeDefault,
  subcommentsListHandler,
}: PropsType) {
  //유저 데이터 사용 -> 프로필, 이름
  const {
    username,
    currentProfile: defaultProfile,
    filteredProfileArr,
  } = useContext(UserDataContext);

  const [currentProfile, setCurrentProfile] = useState<Profile>(defaultProfile);

  useEffect(() => {
    //수정인 경우 수정할 comment profile로 설정
    if (prevData) {
      setCurrentProfile(prevData.profile);
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

    const submitData: AddSubcommentReqData = {
      profileId: currentProfile.id,
      profile: currentProfile,
      game: currentProfile.game,
      commentId,
      text,
    };
    console.log(submitData);
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

  const textFocusControl = useCallback(
    (e: any) =>
      (e.currentTarget.selectionStart = e.currentTarget.selectionEnd =
        prevData ? prevData.text.length : 0),
    [prevData]
  );

  if (!username) {
    return (
      <div className={styles.add_comment_border}>
        <div className={styles.add_comment_need_login}>
          댓글을 작성하려면 로그인해주세요.
        </div>
      </div>
    );
  }

  if (!filteredProfileArr.length) {
    return (
      <div className={styles.add_comment_border}>
        <div className={styles.add_comment_need_login}>
          댓글을 작성하려면 프로필을 추가해주세요.
        </div>
      </div>
    );
  }

  return (
    <div className={prevData ? styles.add_comment : styles.add_comment_border}>
      <div className={styles.add_comment_header}>
        <ProfileBlock profile={currentProfile} />
        <ProfileSelector size={"sm"} setCurrentProfile={setCurrentProfile} />
      </div>
      <textarea
        className={styles.add_comment_textArea}
        ref={textAreaRef}
        defaultValue={prevData ? prevData.text : ""}
        autoFocus
        onFocus={textFocusControl}
      />
      <button
        className={styles.add_comment_btn}
        disabled={!username || loading}
        onClick={clickToSubmit}
      >
        {loading ? "등록 중..." : "등록"}
      </button>

      <button
        className={styles.add_comment_btn}
        disabled={loading}
        onClick={setModeDefault}
      >
        취소
      </button>
    </div>
  );
}
