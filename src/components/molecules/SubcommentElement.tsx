import styles from "./scss/SubcommentElement.module.scss";
import { useCallback, useState } from "react";
import { BsTrash, BsPencilSquare } from "react-icons/bs";
import { Subcomment } from "../../types/post.type";
import RemoveConfirmModal from "./RemoveConfirmModal";
import PostServices from "../../services/PostServices";
import AddSubcomment from "./AddSubcomment";
import ProfileBlock from "./ProfileBlock";
import CommentCard from "../atoms/CommentCard";
import CheckUserBlock from "../atoms/CheckUserBlock";
import DefaultButton from "../atoms/DefaultButton";

interface CommentElementProps {
  subcomment: Subcomment;
  subcommentsListHandlerWithRenderLength: (
    subcomment: Subcomment,
    type: "add" | "modify" | "remove"
  ) => void;
}

export default function SubcommentElement({
  subcomment,
  subcommentsListHandlerWithRenderLength: subcommentsListHandler,
}: CommentElementProps) {
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
          subcommentsListHandlerWithRenderLength={subcommentsListHandler}
        />
      </div>
    );
  }

  //수정하려는 경우가 아니면 subcomment 렌더
  return (
    <CommentCard>
      <CommentCard.Header>
        <ProfileBlock profile={subcomment.profile} />
      </CommentCard.Header>
      <CommentCard.Body>
        <div className={styles.subcomment_text}>{subcomment.text}</div>
        <div className={styles.subcomment_date}>
          {`${subcomment.game} - ${subcomment.date.slice(
            0,
            subcomment.date.length - 4
          )}`}
        </div>
      </CommentCard.Body>
      <CommentCard.Buttons>
        <CheckUserBlock resourceUsername={subcomment.username}>
          <DefaultButton
            onClick={setModeModify}
            size="sm"
            className={styles.btn_margin}
          >
            <BsPencilSquare /> <span className={styles.btn_text}>수정</span>
          </DefaultButton>
          <DefaultButton onClick={handleRemoveModalOpen} size="sm">
            <BsTrash /> <span className={styles.btn_text}>삭제</span>
          </DefaultButton>
        </CheckUserBlock>
      </CommentCard.Buttons>
      <RemoveConfirmModal
        close={handleRemoveModalClose}
        show={showRemoveModal}
        loading={loading}
        remove={removeSubcomment}
      />
    </CommentCard>
  );
}
