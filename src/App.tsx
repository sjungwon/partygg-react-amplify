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
            <Route path="/games">
              <Route path="/games/" element={<NotFoundPage />} />
              <Route path="/games/undefined" element={<NotFoundPage />} />
              <Route path="/games/null" element={<NotFoundPage />} />
              <Route path=":game" element={<HomePage />} />
            </Route>
            <Route path="/usernames">
              <Route path="/usernames/" element={<NotFoundPage />} />
              <Route path="/usernames/undefined" element={<NotFoundPage />} />
              <Route path="/usernames/null" element={<NotFoundPage />} />
              <Route path=":username" element={<HomePage />} />
            </Route>
            <Route path="/profiles">
              <Route path="/profiles/" element={<NotFoundPage />} />
              <Route path="/profiles/undefined" element={<NotFoundPage />} />
              <Route path="/profiles/null" element={<NotFoundPage />} />
              <Route path=":profile" element={<HomePage />} />
            </Route>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </div>
  );
}

export default App;
