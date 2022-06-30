import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./scss/NotFoundPage.module.scss";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>404 - Not Found</h1>
        <div className={styles.card_img}>
          <img
            src="./not_found_icon.png"
            alt="not_found img"
            className={styles.not_found_img}
          />
        </div>
        <p className={styles.text}>페이지를 찾을 수 없습니다.</p>
        <p className={styles.text}>URL을 다시 확인해주세요.</p>
        <button onClick={goBack} className={styles.btn}>
          돌아가기
        </button>
      </div>
    </div>
  );
}
