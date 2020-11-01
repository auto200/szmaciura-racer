import React, { useEffect, ChangeEvent, useRef, useState } from "react";
import { Link } from "gatsby";
import io from "socket.io-client";
import Layout from "../components/Layout";

const Online: React.FC = () => {
  const [socket, setSocket] = useState<SocketIOClient.Socket>(() =>
    io(process.env.SOCKET_URL!)
  );
  useEffect(() => {
    console.log(socket);
    if (socket) {
      socket.on("xd", (data: any) => {
        console.log(data);
      });
    }
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <Layout>
      <Link to="/">Go back to offline</Link>
    </Layout>
  );
};

export default Online;
