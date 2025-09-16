import { useEffect, useMemo, useState } from "react";
import { usePublicClient, useWriteContract, useAccount } from "wagmi";
import { CHAT_CONTRACT_ABI } from "../config/ABI";
import { parseEther } from "viem";

export const useChat = () => {
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [domain, setDomain] = useState("");
    const [registrationFee, setRegistrationFee] = useState(0);
    const publicClient = usePublicClient();
    const { writeContract } = useWriteContract();
    const { address } = useAccount();

    const contractAddress = import.meta.env.VITE_CHAT_CONTRACT_ADDRESS;

    // Fetch all registered users
    const fetchUsers = async () => {
        if (!publicClient || !contractAddress) return;
        try {
            const result = await publicClient.readContract({
                address: contractAddress,
                abi: CHAT_CONTRACT_ABI,
                functionName: "getAllRegisteredUsers",
            });
            setUsers(result || []);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    // Fetch domain and registration fee
    const fetchContractInfo = async () => {
        if (!publicClient || !contractAddress) return;
        try {
            const [domainResult, feeResult] = await Promise.all([
                publicClient.readContract({
                    address: contractAddress,
                    abi: CHAT_CONTRACT_ABI,
                    functionName: "domain",
                }),
                publicClient.readContract({
                    address: contractAddress,
                    abi: CHAT_CONTRACT_ABI,
                    functionName: "registrationFee",
                })
            ]);
            setDomain(domainResult);
            setRegistrationFee(feeResult);
        } catch (error) {
            console.error("Error fetching contract info:", error);
        }
    };

    // Fetch user messages
    const fetchUserMessages = async (userAddress) => {
        if (!publicClient || !contractAddress || !userAddress) return [];
        try {
            const result = await publicClient.readContract({
                address: contractAddress,
                abi: CHAT_CONTRACT_ABI,
                functionName: "getUserMessages",
                args: [userAddress],
            });
            return result || [];
        } catch (error) {
            console.error("Error fetching messages:", error);
            return [];
        }
    };

    // Register user
    const registerUser = async (name, imageHash) => {
        if (!writeContract || !contractAddress) return;
        try {
            await writeContract({
                address: contractAddress,
                abi: CHAT_CONTRACT_ABI,
                functionName: "registerUser",
                args: [name, imageHash],
                value: registrationFee,
            });
        } catch (error) {
            console.error("Error registering user:", error);
            throw error;
        }
    };

    // Send message
    const sendMessage = async (receiverName, content) => {
        if (!writeContract || !contractAddress) return;
        try {
            await writeContract({
                address: contractAddress,
                abi: CHAT_CONTRACT_ABI,
                functionName: "sendMessage",
                args: [receiverName, content],
            });
        } catch (error) {
            console.error("Error sending message:", error);
            throw error;
        }
    };

    // Get user's full name (name.domain)
    const getFullName = async (userAddress) => {
        if (!publicClient || !contractAddress || !userAddress) return "";
        try {
            const result = await publicClient.readContract({
                address: contractAddress,
                abi: CHAT_CONTRACT_ABI,
                functionName: "getFullName",
                args: [userAddress],
            });
            return result;
        } catch (error) {
            console.error("Error fetching full name:", error);
            return "";
        }
    };

    useEffect(() => {
        fetchContractInfo();
        fetchUsers();
    }, [publicClient, contractAddress]);

    return {
        users,
        messages,
        domain,
        registrationFee,
        registerUser,
        sendMessage,
        fetchUsers,
        fetchUserMessages,
        getFullName,
        contractAddress,
    };
};
