export interface Message {
    id: string;
    senderId: string;
    receiverId: string; // or conversationId
    text: string;
    createdAt: number;
    read?: boolean;
}

export interface Conversation {
    id: string; // Typically buyerId_sellerId_carId or similar
    participants: string[];
    lastMessage?: string;
    lastMessageTime?: number;
    carId: string;
    carTitle: string;
    carImage?: string;
    unreadCount?: number;
}
