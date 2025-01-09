import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Consumer } from "../store/StoreToken";
function Logout() {
  const { LogoutUser } = Consumer();
  useEffect(() => {
    LogoutUser();
  }, [LogoutUser]);
  return <Navigate to="/login" />;
}

export default Logout;
