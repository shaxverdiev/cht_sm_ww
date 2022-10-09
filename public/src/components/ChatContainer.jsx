import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { sendMessageRoute, recieveMessageRoute } from "../utils/APIRoutes";

export default function ChatContainer({ currentChat, socket }) {
 
  const [messages, setMessages] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);


  const scrollRef = useRef();


  useEffect(async () => { 
    const data = await JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    );
    const response = await axios.post(recieveMessageRoute, {      ///// GETMESSAGE
      from: data.id,            ///////на сервер id мой
      to: currentChat.id,      //////на сервер id собеседника 
    });
    setMessages(response.data);//////////тут приходит промис с сообщениями
  }, [currentChat]);// каждый раз когда происходит обновление состояния currentChat
  


  useEffect(() => { ////////КАЖДЫЙ РАЗ КОГДА ПЕРЕКЛЮЧАЕТСЯ ЧАТ GETCURRENTCHAT ОБНОВЛЯЕТСЯ
    const getCurrentChat = async () => {
      if (currentChat) {
        await JSON.parse(
          localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
        ).id; /////////вытаскивает из локального хранилища id пользователя
      }
    };
    getCurrentChat();
  }, [currentChat]);


  const handleSendMsg = async (msg) => {     /////ОТПРАВКА СООБЩЕНИЙ ПО СОКЕТАМ
    const data = await JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)  /// ВЫТАСКИВАЕМ ИЗ ЛОКАЛА ОБЪЕКТ
    );
    socket.current.emit("send-msg", {/////// ОТПРАВКА ПО СОКЕТАМ
      to: currentChat.id,        //////// В ТЕКУЩИЙ ЧАТ (ТО ЕСТЬ ДРУГОМУ ПОЛЬЗОВАТЕЛЮ)
      from: data.id,            /////ОТ МЕНЯ(ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ)
      msg,                      //////////////САМО СООБЩЕНИЕ 
    });
    await axios.post(sendMessageRoute, {  //////???????? ПОСТ ЗАПРОС НА СЕРВЕР С ТЕМИ ЖЕ ДАННЫМИ???????????????????
      from: data.id,    
      to: currentChat.id,
      message: msg,
    });
    const msgs = [...messages];       ///////////////////ВСЕ ОТПРАВЛЕННЫЕ СООБЩЕНИЯ
    msgs.push({ fromSelf: true, message: msg });
    setMessages(msgs);////////////////////ИЗМЕНЕНИЕ СТЕЙТА СООБЩЕНИЙ
  };

  useEffect(() => { ////////////// ОБРАБОТКА ВХОДЯЩИХ СООБЩЕНИЙ 
    if (socket.current) {
      socket.current.on("msg-recieve", (msg) => {
        setArrivalMessage({ fromSelf: false, message: msg }); /// ЕСЛИ fromSelf-false ЗНАЧИТ СООБЩЕНИЯ ОТ СОБЕСЕДНИКА ПРИХОДЯТ
      });
    }
  }, []);



  useEffect(() => {            
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]); /////ПОПОЛНЕНИЕ МАССИВА СООБЩЕНИЕ СООБЩЕНИЯМИ ОТ СОБЕСЕДНИКА
  }, [arrivalMessage]);   ////// ПРИ КАЖДОМ ИЗМЕНЕНИИ СТЕЙТА ВХОДЯЩИХ СООБЩЕНИЙ(ТО ЕСТЬ ПРИ КАЖДОЙ ОТПРАВКИ СООБЩЕНИЕМ СОБЕСЕДНИКОМ)


  
  useEffect(() => {////АВТОСКРОЛЛ ВНИЗ ЕСЛИ ОБНОВЛЯЕТСЯ СТЕЙТ ВСЕХ СООБЩЕНИЙ(ТО ЕСТЬ КОГДА В ЧАТ ДОБАВЛЯЮТСЯ СООБЩЕНИЯ)
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);



  return (
    <Container>
      <div className="chat-header">
        <div className="user-details">
          <div className="username">
            <h3>{currentChat.username}</h3>
          </div>
        </div>

        <Logout />
      </div>
      
     <div className="chat-messages">  {/* сообщенияя */}
        {messages.map((message) => {
          return (
            <div ref={scrollRef} key={uuidv4()}>
              <div    
                className={`message ${              ///////////ОТПРАВЛЕННЫЕ И ПОЛУЧЕННЫЕ определяет цвет 
                  message.fromSelf ? "sended" : "recieved"     
                }`}
              >                                 
                <div className="content ">
                  <p>{message.message}</p>
                </div>
              </div>
            </div> 
          );
        })}
      </div>
      <ChatInput handleSendMsg={handleSendMsg} />
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      .avatar {
        img {
          height: 3rem;
        }
      }
      .username {
        h3 {
          color: white;
        }
      }
    }
  }
  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .message {
      display: flex;
      align-items: center;
      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #d1d1d1;
        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
        }
      }
    }
    .sended {
      justify-content: flex-end;
      .content {
        background-color: #4f04ff21;
      }
    }
    .recieved {
      justify-content: flex-start;
      .content {
        background-color: #9900ff20;
      }
    }
  }
`;
