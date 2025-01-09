import { createContext, useContext, useEffect, useState } from "react";

//this is context
const cteateCont = createContext();

// This is provider
const StoreToken = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState("");
  const [selectedChat, setSelectedChat] = useState();
  const [chats, setChats] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [isLoading, setLoading] = useState(true);

  const authorizedToken = token?.length > 0 ? `Bearer ${token}` : "";

  const storeToken = (serverToken) => {
    setToken(serverToken);
    return localStorage.setItem("token", serverToken);
  };

  let isLoggedin = !!token;

  const LogoutUser = () => {
    setToken("");
    return localStorage.removeItem("token");
  };

  const authentication = async () => {
    try {
      setLoading(true);
      const respons = await fetch(
        `http://localhost:5000/api/user/currentUser`,
        {
          method: "GET",
          headers: {
            Authorization: authorizedToken,
          },
        }
      );
      if (respons.ok) {
        const data = await respons.json();
        console.log(data.userData);
        setUser(data.userData);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    authentication();
  }, []);

  return (
    <cteateCont.Provider
      value={{
        isLoggedin,
        storeToken,
        LogoutUser,
        user,
        setUser,
        selectedChat,
        chats,
        setChats,
        setSelectedChat,
        authorizedToken,
        isLoading,
        notifications,
        setNotifications,
      }}
    >
      {children}
    </cteateCont.Provider>
  );
};

//Consumer

const Consumer = () => {
  const createContex = useContext(cteateCont);
  if (!createContex) {
    throw new Error("Its been Used outside the provider");
  }
  return createContex;
};

export { StoreToken, Consumer };
