import styles from "./SubcommentElement.module.scss";
import { useCallback, useContext, useMemo, useState } from "react";
import { BsTrash, BsPencilSquare } from "react-icons/bs";
import { Subcomment } from "../../types/post.type";
import { UserDataContext } from "../../context/UserDataContextProvider";
import RemoveConfirmModal from "./RemoveConfirmModal";
import PostServices from "../../services/PostServices";
import AddSubcomment from "./AddSubcomment";

interface CommentElementProps {
  subcomment: Subcomment;
  subcommentsListHandler: (
    subcomment: Subcomment,
    type: "add" | "modify" | "remove"
  ) => void;
}

export default function SubcommentElement({
  subcomment,
  subcommentsListHandler,
}: CommentElementProps) {
  //유저 관련 데이터
  const { username } = useContext(UserDataContext);
  const checkUser = useMemo(
    () => subcomment.username === username,
    [subcomment, username]
  );

  //삭제시 재확인 모달 관련 데이터
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const handleRemoveModalClose = useCallback(() => {
    setShowRemoveModal(false);
  }, []);
  const handleRemoveModalOpen = useCallback(() => {
    setShowRemoveModal(true);
  }, []);

  const [loading, setLoading] = useState<boolean>(false);

  const removeSubcomment = useCallback(async () => {
    setLoading(true);
    const success = await PostServices.removeSubcomments(subcomment);
    if (!success) {
      window.alert("댓글을 제거하는데 실패했습니다. 다시 시도해주세요.");
      handleRemoveModalClose();
      setLoading(false);
      return;
    }
    subcommentsListHandler(subcomment, "remove");
    setLoading(false);
    handleRemoveModalClose();
  }, [handleRemoveModalClose, subcomment, subcommentsListHandler]);

  const [mode, setMode] = useState<"" | "modify">("");

  const setModeModify = useCallback(() => {
    setMode("modify");
  }, []);

  const setModeDefault = useCallback(() => {
    setMode("");
  }, []);

  if (mode === "modify") {
    return (
      <div className={styles.subcomment}>
        <AddSubcomment
          commentId={subcomment.commentId}
          prevData={subcomment}
          setModeDefault={setModeDefault}
          subcommentsListHandler={subcommentsListHandler}
        />
      </div>
    );
  }

  //수정하려는 경우가 아니면 subcomment 렌더
  return (
    <div className={styles.subcomment}>
      <div className={styles.subcomment_header}>
        <img
          src={
            subcomment.profile.profileImage
              ? subcomment.profile.profileImage
              : "/default_profile.png"
          }
          className={styles.subcomment_header_img}
          alt="profile"
        />
        {subcomment.profile.profileImage ? null : (
          <a
            href="https://www.flaticon.com/kr/free-icons/"
            title="사용자 아이콘"
            className={styles.subcomment_header_img_credit}
          >
            사용자 아이콘 제작자: Ongicon - Flaticon
          </a>
        )}
        <div className={styles.subcomment_nickname}>
          {subcomment.profile.nickname}
          <span
            className={styles.subcomment_username}
          >{` (${subcomment.username})`}</span>
        </div>
      </div>

      <div className={styles.subcomment_text}>{subcomment.text}</div>
      <div className={styles.subcomment_date}>
        {subcomment.game} - {subcomment.date}
      </div>
      {checkUser ? (
        <div className={styles.subcomment_btns}>
          <button className={styles.subcomment_btn} onClick={setModeModify}>
            <BsPencilSquare /> <span>수정</span>
          </button>
          <button
            className={styles.subcomment_btn}
            onClick={handleRemoveModalOpen}
          >
            <BsTrash /> <span>삭제</span>
          </button>
        </div>
      ) : null}
      <RemoveConfirmModal
        close={handleRemoveModalClose}
        show={showRemoveModal}
        loading={loading}
        remove={removeSubcomment}
        className={styles.subComment_remove_modal}
      />
    </div>
  );
}
