import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Register from "./components/Register";
import Login from "./components/Login";
import DashboardPage from "./components/DashboardPage";
import NewGroupMenu from "./components/NewGroup";
import { Consumer } from "./store/StoreToken";
import Logout from "./components/Logout";
import NotFound from "./components/NotFoundPage";

function App() {
  const { isLoggedin, user } = Consumer();

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} exact />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />

          {isLoggedin ? (
            <>
              <Route path="/dashboard" element={<DashboardPage />}>
                <Route path="newGroup" element={<NewGroupMenu />} />
              </Route>
            </>
          ) : (
            <Route path="/" element={<Login />} />
          )}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
