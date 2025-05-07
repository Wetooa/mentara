export interface Contact {
  id: string;
  name: string;
  status: "online" | "offline" | "away";
  lastMessage: string;
  time: string;
  unread: number;
}

export interface Message {
  id: string;
  sender: string;
  text: string;
  time: string;
  status?: "sent" | "delivered" | "read"; // Optional with specific values
}
