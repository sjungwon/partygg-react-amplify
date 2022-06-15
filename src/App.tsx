import "@aws-amplify/ui-react/styles.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { ErrorBoundary } from "react-error-boundary";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import ErrorPage from "./pages/ErrorPage";
import { useContext, useEffect } from "react";
import { UserDataContext } from "./context/UserDataContextProvider";
import { GameDataContext } from "./context/GameDataContextProvider";

function App() {
  const { checkLogin } = useContext(UserDataContext);
  const { getGames } = useContext(GameDataContext);

  useEffect(() => {
    console.log("login check");
    checkLogin();
    getGames();
  }, [checkLogin, getGames]);

  return (
    <div className="App">
      <ErrorBoundary FallbackComponent={ErrorPage}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/posts/games/*" element={<HomePage />} />
            <Route path="/posts/usernames/*" element={<HomePage />} />
            <Route path="/posts/profiles/*" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </div>
  );
}

export default App;
