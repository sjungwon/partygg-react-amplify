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

function App() {
  const { checkLogin } = useContext(UserDataContext);

  useEffect(() => {
    console.log("login check");
    checkLogin();
  }, [checkLogin]);

  return (
    <div className="App">
      <ErrorBoundary FallbackComponent={ErrorPage}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/games/*" element={<HomePage />} />
            <Route path="/usernames/*" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </div>
  );
}

export default App;
