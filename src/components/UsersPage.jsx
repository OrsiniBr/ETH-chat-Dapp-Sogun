import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useChat } from "../hooks/useChat";
import { getIPFSUrl } from "../utils/pinata";
import { ArrowLeft, MessageCircle, Users, Send } from "lucide-react";

const UsersPage = ({ onNavigate }) => {
  const { address } = useAccount();
  const { users, fetchUsers, sendMessage, fetchUserMessages } = useChat();
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser && address) {
      loadMessages();
    }
  }, [selectedUser, address]);

  const loadMessages = async () => {
    if (!selectedUser || !address) return;
    try {
      const userMessages = await fetchUserMessages(address);
      const conversationMessages = userMessages.filter(
        (msg) =>
          (msg.sender === address &&
            msg.receiver === selectedUser.userAddress) ||
          (msg.sender === selectedUser.userAddress && msg.receiver === address)
      );
      setMessages(conversationMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    setIsLoading(true);
    try {
      await sendMessage(selectedUser.name, newMessage);
      setNewMessage("");
      setTimeout(loadMessages, 2000);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 max-w-6xl">
        <button
          onClick={() => onNavigate("landing")}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Home
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
          {/* Users Sidebar */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Users</h2>

            <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
              {users.length === 0 ? (
                <p className="text-gray-500 text-center py-6 text-sm">
                  No users registered yet
                </p>
              ) : (
                users.map((user, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedUser(user)}
                    className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
                      selectedUser?.userAddress === user.userAddress
                        ? "bg-blue-50 border border-blue-200"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <img
                      src={getIPFSUrl(user.imageHash)}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover mr-2"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${user.name}&background=random`;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.userAddress?.slice(0, 6)}...
                        {user.userAddress?.slice(-4)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm flex flex-col border border-gray-100">
            {selectedUser ? (
              <>
                <div className="p-3 border-b border-gray-200 flex items-center">
                  <img
                    src={getIPFSUrl(selectedUser.imageHash)}
                    alt={selectedUser.name}
                    className="w-8 h-8 rounded-full object-cover mr-2"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${selectedUser.name}&background=random`;
                    }}
                  />
                  <div>
                    <h3 className="font-medium text-gray-800 text-sm">
                      {selectedUser.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {selectedUser.userAddress?.slice(0, 6)}...
                      {selectedUser.userAddress?.slice(-4)}
                    </p>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {messages.length === 0 ? (
                    <p className="text-gray-500 text-center py-8 text-sm">
                      No messages yet. Start the conversation!
                    </p>
                  ) : (
                    messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.sender === address
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs px-3 py-2 rounded-lg ${
                            message.sender === address
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.sender === address
                                ? "text-blue-200"
                                : "text-gray-500"
                            }`}
                          >
                            {new Date(
                              Number(message.timestamp) * 1000
                            ).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t border-gray-200"
                >
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !newMessage.trim()}
                      className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    Select a user to start chatting
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
