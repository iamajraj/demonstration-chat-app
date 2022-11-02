import { useState } from "react";
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import "./App.css";
import { auth, db } from "./firebase";
import { useEffect } from "react";
import {
    doc,
    setDoc,
    onSnapshot,
    collection,
    serverTimestamp,
    query,
    orderBy,
} from "firebase/firestore";

function App() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [messages, setMessages] = useState([]);
    const [user, setUser] = useState("");
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [alreadyChatsWithUsers, setAlreadyChatsWithUsers] = useState([]);
    const [message, setMessage] = useState("");

    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
        let cusers = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        setUsers(cusers);
    });

    useEffect(() => {
        if (selectedUser) {
            const upath =
                selectedUser > user.uid
                    ? selectedUser + user.uid
                    : user.uid + selectedUser;
            const q = query(
                collection(db, "messages", upath, "message"),
                orderBy("timestamp")
            );
            onSnapshot(q, (snapshot) => {
                const msgs = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setMessages(msgs);
            });
        }
    }, [selectedUser]);

    useEffect(() => {
        if (user) {
            const q = query(
                collection(db, "users", user.uid, "chatsWith"),
                orderBy("updated_at")
            );
            const unsub = onSnapshot(q, (snapshot) => {
                const auser = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setAlreadyChatsWithUsers(auser);
            });
        }
    }, [user]);

    const createAccount = async () => {
        const user = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );
        await setDoc(doc(db, "users", user.user.uid), {
            email: user.user.email,
            name: user.user.displayName,
            image: user.user.photoURL,
        });
    };
    const signIn = async () => {
        const user = await signInWithEmailAndPassword(auth, email, password);
        console.log(user);
    };
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }
        });
    }, []);
    const sendMessage = async (e) => {
        if (!message) return;
        const upath =
            selectedUser > user.uid
                ? selectedUser + user.uid
                : user.uid + selectedUser;
        const newMessage = doc(collection(db, "messages", upath, "message"));
        await setDoc(newMessage, {
            from: selectedUser,
            fromEmail: users.find((user) => user.id == selectedUser).email,
            to: user.uid,
            toEmail: user.email,
            message: message,
            timestamp: serverTimestamp(),
        });
        await setDoc(
            doc(collection(db, "users", user.uid, "chatsWith"), selectedUser),
            {
                id: selectedUser,
                email: users.find((user) => user.id == selectedUser).email,
                updated_at: serverTimestamp(),
            }
        );
        setMessage("");
    };
    return (
        <div className="App">
            {user ? (
                <>
                    <p>All Users</p>
                    <ul>
                        {users &&
                            users.map((usr) => {
                                if (usr.id == user.uid) return;
                                return (
                                    <li
                                        style={{
                                            color: "green",
                                        }}
                                        onClick={(e) => {
                                            setSelectedUser(
                                                e.target.getAttribute("data-id")
                                            );
                                        }}
                                        data-id={usr.id}
                                    >
                                        {usr.email}
                                    </li>
                                );
                            })}
                    </ul>
                    <p>You are logged in as {user.email}</p>
                    <button onClick={() => signOut(auth)}>Sign out</button>
                    <p>Already Chats With</p>
                    <ul>
                        {alreadyChatsWithUsers &&
                            alreadyChatsWithUsers.map((user) => (
                                <li
                                    onClick={(e) =>
                                        setSelectedUser(
                                            e.target.getAttribute("data-id")
                                        )
                                    }
                                    data-id={user.id}
                                >
                                    {user.email}
                                </li>
                            ))}
                    </ul>
                    {selectedUser && (
                        <>
                            <p>
                                Chatting with{" "}
                                {
                                    users.find(
                                        (user) => user.id == selectedUser
                                    ).email
                                }
                            </p>
                            <div>
                                <ul>
                                    {messages &&
                                        messages.map((msg) => (
                                            <li
                                                style={{
                                                    color:
                                                        msg.from != user.uid
                                                            ? "green"
                                                            : "red",
                                                }}
                                            >
                                                {msg.message}
                                            </li>
                                        ))}
                                </ul>
                                <input
                                    onChange={(e) => setMessage(e.target.value)}
                                    value={message}
                                    type="text"
                                    placeholder="Enter your message"
                                />
                                <button onClick={sendMessage}>
                                    Send Message
                                </button>
                            </div>
                        </>
                    )}
                </>
            ) : (
                <div>
                    <div className="App">
                        <h1>Signup</h1>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="text"
                            placeholder="Enter email"
                        />
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="text"
                            placeholder="Enter password"
                        />
                        <button onClick={createAccount}>Create Account</button>
                    </div>
                    <div className="App">
                        <h1>Sign in</h1>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="text"
                            placeholder="Enter email"
                        />
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="text"
                            placeholder="Enter password"
                        />
                        <button onClick={signIn}>Login in</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
