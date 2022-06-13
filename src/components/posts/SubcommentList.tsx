import { Subcomment, SubcommentsLastEvaluatedKey } from "../../types/post.type";
import { AiOutlineDownCircle, AiOutlineUpCircle } from "react-icons/ai";
import { useCallback, useState } from "react";
import styles from "./SubcommentList.module.scss";
import AddSubcomment from "./AddSubcomment";
import PostServices from "../../services/PostServices";
import SubcommentElement from "./SubcommentElement";

interface SubcommentsData {
  data: Subcomment[];
  lastEvaluatedKey?: SubcommentsLastEvaluatedKey;
}

interface PropsType {
  commentId: string;
  subcommentsData: SubcommentsData;
  addSubcomment: boolean;
  setAddSubcomment: (value: boolean) => void;
}

export default function SubcommentList({
  commentId,
  subcommentsData,
  addSubcomment,
  setAddSubcomment,
}: PropsType) {
  const [subcomments, setSubcomments] = useState<Subcomment[]>(
    subcommentsData.data
  );
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState<
    SubcommentsLastEvaluatedKey | undefined
  >(subcommentsData.lastEvaluatedKey);
  const [renderLength, setRenderLength] = useState<number>(
    subcommentsData.data.length > 0 ? 1 : 0
  );
  const [subcommentLoading, setSubcommentLoading] = useState<boolean>(false);
  const renderLengthHandler = useCallback(
    (type: "more" | "close") => {
      return async () => {
        if (type === "close") {
          setRenderLength(subcomments.length > 0 ? 1 : 0);
          return;
        }
        if (renderLength >= subcomments.length) {
          if (lastEvaluatedKey) {
            setSubcommentLoading(true);
            const extraComments = await PostServices.getNextSubcomments(
              lastEvaluatedKey
            );
            if (extraComments) {
              setSubcomments((prev) => [...prev, ...extraComments.data]);
              setLastEvaluatedKey(extraComments.subcommentsLastEvaluatedKey);
              setRenderLength((prev) => prev + extraComments.data.length);
            }
            setSubcommentLoading(false);
          }
          return;
        } else {
          setRenderLength((prev) =>
            prev + 3 > subcomments.length ? subcomments.length : prev + 3
          );
        }
      };
    },
    [lastEvaluatedKey, renderLength, subcomments.length]
  );

  const subcommentsListHandler = useCallback(
    (subcomment: Subcomment, type: "modify" | "add" | "remove") => {
      if (type === "add") {
        setSubcomments((prev) => [subcomment, ...prev]);
        setRenderLength((prev) => prev + 1);
        return;
      }

      const newSubcommentId = `${subcomment.commentId}/${subcomment.date}`;

      if (type === "remove") {
        setSubcomments((prev) =>
          prev.filter((prevSubcomment) => {
            const subcommentId = `${prevSubcomment.commentId}/${prevSubcomment.date}`;
            return subcommentId !== newSubcommentId;
          })
        );
        setRenderLength((prev) => (prev > 1 ? prev - 1 : prev));
        return;
      }

      setSubcomments((prev) =>
        prev.map((prevSubcomment) => {
          const subcommentId = `${prevSubcomment.commentId}/${prevSubcomment.date}`;
          if (subcommentId === newSubcommentId) {
            return subcomment;
          }

          return prevSubcomment;
        })
      );
    },
    []
  );

  const setModeDefault = useCallback(() => {
    setAddSubcomment(false);
  }, [setAddSubcomment]);

  //subComment가 없는 경우
  if (subcomments.length === 0) {
    if (!addSubcomment) {
      return null;
    }

    return (
      <div className={styles.container}>
        <AddSubcomment
          commentId={commentId}
          subcommentsListHandler={subcommentsListHandler}
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
          subcommentsListHandler={subcommentsListHandler}
          setModeDefault={setModeDefault}
        />
      ) : null}
      {subcomments.slice(0, renderLength).map((subcomment, index) => {
        return (
          <SubcommentElement
            key={`${subcomment.commentId}/${subcomment.date}`}
            subcomment={subcomment}
            subcommentsListHandler={subcommentsListHandler}
          />
        );
      })}
      <div className={styles.more_container}>
        {renderLength < subcomments.length || lastEvaluatedKey ? (
          <button
            className={styles.more}
            onClick={renderLengthHandler("more")}
            disabled={subcommentLoading}
          >
            {subcommentLoading ? "가져오는 중..." : "더보기 "}
            <span className={styles.more_icon}>
              <AiOutlineDownCircle />
            </span>
          </button>
        ) : null}
        {renderLength > 3 ? (
          <button
            className={styles.more}
            onClick={renderLengthHandler("close")}
          >
            {"닫기 "}
            <span className={styles.more_icon}>
              <AiOutlineUpCircle />
            </span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
