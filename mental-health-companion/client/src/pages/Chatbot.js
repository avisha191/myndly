import React, { useState, useEffect, useRef } from "react";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingDots, setTypingDots] = useState("");
  const typingTimeoutRef = useRef(null);
  const stopTypingRef = useRef(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const stopTyping = () => {
    stopTypingRef.current = true;
    setLoading(false);
    setTypingDots("");
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);

    const currentInput = input;
    setInput("");
    setLoading(true);
    stopTypingRef.current = false;

    setTypingDots("");
    let dotInterval = setInterval(() => {
      setTypingDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInput }),
      });

      const data = await res.json();
      let index = 0;
      const reply = data.reply;
      const botMsg = { role: "bot", content: "" };
      setMessages((prev) => [...prev, botMsg]);

      const typeNextChar = () => {
        if (stopTypingRef.current) {
          clearInterval(dotInterval);
          return;
        }
        if (index < reply.length) {
          const nextChar = reply[index];
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: updated[updated.length - 1].content + nextChar,
            };
            return updated;
          });
          index++;
          typingTimeoutRef.current = setTimeout(typeNextChar, 25);
        } else {
          clearInterval(dotInterval);
          setLoading(false);
        }
      };

      typeNextChar();
    } catch (err) {
      console.error("Error:", err);
      clearInterval(dotInterval);
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>💬 Myndly Chatbot</div>
      <div style={styles.chatBox}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.message,
              ...(msg.role === "user" ? styles.userMessage : styles.botMessage),
            }}
          >
            {msg.content}
          </div>
        ))}
        {loading && (
          <div style={styles.botMessage}>Bot is typing{typingDots}</div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div style={styles.inputArea}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          style={styles.input}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} style={styles.sendBtn}>
          ➤
        </button>
        {loading && (
          <button onClick={stopTyping} style={styles.stopBtn}>
            ✖
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 500,
    margin: "30px auto",
    fontFamily: "Segoe UI, sans-serif",
    display: "flex",
    flexDirection: "column",
    borderRadius: 12,
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  header: {
    background: "#6a5acd",
    color: "#fff",
    padding: "12px",
    textAlign: "center",
    fontSize: "18px",
    fontWeight: "bold",
  },
  chatBox: {
    height: 400,
    overflowY: "auto",
    background: "#f5f6fa",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
  },
  message: {
    padding: "10px 14px",
    margin: "8px 0",
    borderRadius: 18,
    maxWidth: "75%",
    lineHeight: "1.4",
    wordWrap: "break-word",
    animation: "fadeIn 0.3s ease-in-out",
  },
  userMessage: {
    background: "#6a5acd",
    color: "#fff",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  botMessage: {
    background: "#e4e6eb",
    color: "#000",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  inputArea: {
    display: "flex",
    padding: "10px",
    borderTop: "1px solid #ddd",
    background: "#fff",
    gap: "8px",
  },
  input: {
    flex: 1,
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: 20,
    fontSize: 14,
    outline: "none",
  },
  sendBtn: {
    padding: "0 16px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: 18,
  },
  stopBtn: {
    padding: "0 12px",
    background: "red",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: 16,
  },
};
