import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import { Loader } from "lucide-react";
import { useDispatch, useSelector } from "react-redux"
import { useEffect } from "react";
import { getUser, serOnlineUsers } from "./store/slices/authSlice";
import { connectSocket, disconnectSocket } from "./lib/socket";

const App = () => {
  const { authUser, isCheckingAuth } = useSelector(state => state.auth)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getUser())
  }, [getUser])

  useEffect(() => {
    if (authUser) {
      const socket = connectSocket(authUser._id)

      socket.on("getOnlineUsers", (users) => {
        dispatch(serOnlineUsers(users))
      })

      return () => disconnectSocket()
    }
  }, [authUser])



  return <></>;
};

export default App;
