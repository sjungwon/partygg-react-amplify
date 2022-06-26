import { Subcomment, SubcommentsLastEvaluatedKey } from "../../types/post.type";
import { AiOutlineDownCircle, AiOutlineUpCircle } from "react-icons/ai";
import { useCallback, useContext, useState } from "react";
import styles from "./scss/SubcommentList.module.scss";
import AddSubcomment from "../molecules/AddSubcomment";
import PostServices from "../../services/PostServices";
import SubcommentElement from "./SubcommentElement";
import DefaultButton from "../atoms/DefaultButton";
import LoadingBlock from "../atoms/LoadingBlock";
import { PostDataContext } from "./PostList";

interface SubcommentsData {
  data: Subcomment[];
  lastEvaluatedKey?: SubcommentsLastEvaluatedKey;
}

interface PropsType {
  commentId: string;
  subcomments: SubcommentsData;
  addSubcomment: boolean;
  setAddSubcomment: (value: boolean) => void;
}

export default function SubcommentList({
  commentId,
  subcomments,
  addSubcomment,
  setAddSubcomment,
}: PropsType) {
  const { subcommentsListHandler } = useContext(PostDataContext);
  const [renderLength, setRenderLength] = useState<number>(
    subcomments.data.length > 0 ? 1 : 0
  );
  const [subcommentLoading, setSubcommentLoading] = useState<boolean>(false);
  const renderLengthHandler = useCallback(
    (type: "more" | "close") => {
      return async () => {
        if (type === "close") {
          setRenderLength(subcomments.data.length > 0 ? 1 : 0);
          return;
        }
        if (renderLength >= subcomments.data.length) {
          if (subcomments.lastEvaluatedKey) {
            setSubcommentLoading(true);
            const extraComments = await PostServices.getNextSubcomments(
              subcomments.lastEvaluatedKey
            );
            if (extraComments) {
              subcommentsListHandler(
                "more",
                commentId,
                extraComments.data,
                extraComments.subcommentsLastEvaluatedKey
              );
              setRenderLength((prev) => prev + extraComments.data.length);
            }
            setSubcommentLoading(false);
          }
          return;
        } else {
          setRenderLength((prev) =>
            prev + 3 > subcomments.data.length
              ? subcomments.data.length
              : prev + 3
          );
        }
      };
    },
    [
      commentId,
      renderLength,
      subcomments.data.length,
      subcomments.lastEvaluatedKey,
      subcommentsListHandler,
    ]
  );

  const subcommentsListHandlerWithRenderLength = useCallback(
    (subcomment: Subcomment, type: "modify" | "add" | "remove") => {
      subcommentsListHandler(type, commentId, [subcomment]);
      if (type === "add") {
        setRenderLength((prev) => prev + 1);
        return;
      }

      if (type === "remove") {
        setRenderLength((prev) => (prev > 1 ? prev - 1 : prev));
        return;
      }
    },
    [commentId, subcommentsListHandler]
  );

  const setModeDefault = useCallback(() => {
    setAddSubcomment(false);
  }, [setAddSubcomment]);

  //subComment가 없는 경우
  if (subcomments.data.length === 0) {
    if (!addSubcomment) {
      return null;
    }

    return (
      <div className={styles.container}>
        <AddSubcomment
          commentId={commentId}
          subcommentsListHandler={subcommentsListHandlerWithRenderLength}
          setModeDefault={setModeDefault}
        />
      </div>
    );
  }

  //subComment가 있는 경우
  return (
    <div className={styles.container}>
      {addSubcomment ? (
        <AddSubcomment
          commentId={commentId}
          subcommentsListHandler={subcommentsListHandlerWithRenderLength}
          setModeDefault={setModeDefault}
        />
      ) : null}
      {subcomments.data.slice(0, renderLength).map((subcomment, index) => {
        return (
          <SubcommentElement
            key={`${subcomment.commentId}/${subcomment.date}`}
            subcomment={subcomment}
            subcommentsListHandler={subcommentsListHandlerWithRenderLength}
          />
        );
      })}
      <div className={styles.more_container}>
        {renderLength < subcomments.data.length ||
        subcomments.lastEvaluatedKey ? (
          <DefaultButton
            size="sm"
            onClick={renderLengthHandler("more")}
            disabled={subcommentLoading}
          >
            <LoadingBlock loading={subcommentLoading}>
              {subcommentLoading ? "가져오는 중..." : "더보기 "}
              <AiOutlineDownCircle className={styles.more_icon} />
            </LoadingBlock>
          </DefaultButton>
        ) : null}
        {renderLength > 3 ? (
          <DefaultButton
            size="sm"
            className={styles.more}
            onClick={renderLengthHandler("close")}
            disabled={subcommentLoading}
          >
            {"닫기 "}
            <AiOutlineUpCircle className={styles.more_icon} />
          </DefaultButton>
        ) : null}
      </div>
    </div>
  );
}
