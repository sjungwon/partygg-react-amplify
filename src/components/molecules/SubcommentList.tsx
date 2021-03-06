import { Subcomment, SubcommentsLastEvaluatedKey } from "../../types/post.type";
import { AiOutlineDownCircle, AiOutlineUpCircle } from "react-icons/ai";
import { useCallback, useContext, useState } from "react";
import styles from "./scss/SubcommentList.module.scss";
import AddSubcomment from "../molecules/AddSubcomment";
import PostServices from "../../services/PostServices";
import SubcommentElement from "./SubcommentElement";
import DefaultButton from "../atoms/DefaultButton";
import LoadingBlock from "../atoms/LoadingBlock";
import { PostListContext } from "../../context/PostListContextProvider";

interface SubcommentsData {
  data: Subcomment[];
  lastEvaluatedKey?: SubcommentsLastEvaluatedKey;
}

interface PropsType {
  postId: string;
  commentId: string;
  game: string;
  subcomments: SubcommentsData;
  addSubcomment: boolean;
  setAddSubcomment: (value: boolean) => void;
}

export default function SubcommentList({
  postId,
  commentId,
  game,
  subcomments,
  addSubcomment,
  setAddSubcomment,
}: PropsType) {
  const { subcommentsListHandler } = useContext(PostListContext);
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
                postId,
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
      postId,
      renderLength,
      subcomments.data.length,
      subcomments.lastEvaluatedKey,
      subcommentsListHandler,
    ]
  );

  const subcommentsListHandlerWithRenderLength = useCallback(
    (subcomment: Subcomment, type: "modify" | "add" | "remove") => {
      subcommentsListHandler(type, postId, commentId, [subcomment]);
      if (type === "add") {
        setRenderLength((prev) => prev + 1);
        return;
      }

      if (type === "remove") {
        setRenderLength((prev) => (prev > 1 ? prev - 1 : prev));
        return;
      }
    },
    [commentId, postId, subcommentsListHandler]
  );

  const setModeDefault = useCallback(() => {
    setAddSubcomment(false);
  }, [setAddSubcomment]);

  //subComment??? ?????? ??????
  if (subcomments.data.length === 0) {
    if (!addSubcomment) {
      return null;
    }

    return (
      <div className={styles.container}>
        <AddSubcomment
          commentId={commentId}
          game={game}
          subcommentsListHandlerWithRenderLength={
            subcommentsListHandlerWithRenderLength
          }
          setModeDefault={setModeDefault}
        />
      </div>
    );
  }

  //subComment??? ?????? ??????
  return (
    <div className={styles.container}>
      {addSubcomment ? (
        <AddSubcomment
          commentId={commentId}
          game={game}
          subcommentsListHandlerWithRenderLength={
            subcommentsListHandlerWithRenderLength
          }
          setModeDefault={setModeDefault}
        />
      ) : null}
      {subcomments.data.slice(0, renderLength).map((subcomment, index) => {
        return (
          <SubcommentElement
            key={`${subcomment.commentId}/${subcomment.date}`}
            subcomment={subcomment}
            subcommentsListHandlerWithRenderLength={
              subcommentsListHandlerWithRenderLength
            }
            game={game}
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
              {subcommentLoading ? "???????????? ???..." : "????????? "}
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
            {"?????? "}
            <AiOutlineUpCircle className={styles.more_icon} />
          </DefaultButton>
        ) : null}
      </div>
    </div>
  );
}
