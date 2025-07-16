import { z } from 'zod';
export declare const UserStatusSchema: z.ZodEnum<["online", "offline", "away"]>;
export declare const MessageStatusSchema: z.ZodEnum<["sent", "delivered", "read"]>;
export declare const MessageTypeSchema: z.ZodEnum<["TEXT", "IMAGE", "AUDIO", "VIDEO", "SYSTEM"]>;
export declare const ConversationTypeSchema: z.ZodEnum<["DIRECT", "GROUP", "SESSION", "SUPPORT"]>;
export declare const AttachmentSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["image", "document", "audio", "video"]>;
    url: z.ZodString;
    name: z.ZodString;
    size: z.ZodOptional<z.ZodNumber>;
    previewUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "video" | "audio" | "image" | "document";
    url: string;
    name: string;
    size?: number | undefined;
    previewUrl?: string | undefined;
}, {
    id: string;
    type: "video" | "audio" | "image" | "document";
    url: string;
    name: string;
    size?: number | undefined;
    previewUrl?: string | undefined;
}>;
export declare const ReactionSchema: z.ZodObject<{
    emoji: z.ZodString;
    count: z.ZodNumber;
    users: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    emoji: string;
    count: number;
    users: string[];
}, {
    emoji: string;
    count: number;
    users: string[];
}>;
export declare const ReadReceiptSchema: z.ZodObject<{
    userId: z.ZodString;
    readAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    userId: string;
    readAt: string;
}, {
    userId: string;
    readAt: string;
}>;
export declare const MessageSchema: z.ZodObject<{
    id: z.ZodString;
    sender: z.ZodEnum<["me", "them"]>;
    text: z.ZodString;
    time: z.ZodString;
    status: z.ZodOptional<z.ZodEnum<["sent", "delivered", "read"]>>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["image", "document", "audio", "video"]>;
        url: z.ZodString;
        name: z.ZodString;
        size: z.ZodOptional<z.ZodNumber>;
        previewUrl: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: "video" | "audio" | "image" | "document";
        url: string;
        name: string;
        size?: number | undefined;
        previewUrl?: string | undefined;
    }, {
        id: string;
        type: "video" | "audio" | "image" | "document";
        url: string;
        name: string;
        size?: number | undefined;
        previewUrl?: string | undefined;
    }>, "many">>;
    isDeleted: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    reactions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        emoji: z.ZodString;
        count: z.ZodNumber;
        users: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        emoji: string;
        count: number;
        users: string[];
    }, {
        emoji: string;
        count: number;
        users: string[];
    }>, "many">>;
    replyTo: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    time: string;
    sender: "me" | "them";
    text: string;
    isDeleted: boolean;
    status?: "sent" | "delivered" | "read" | undefined;
    attachments?: {
        id: string;
        type: "video" | "audio" | "image" | "document";
        url: string;
        name: string;
        size?: number | undefined;
        previewUrl?: string | undefined;
    }[] | undefined;
    reactions?: {
        emoji: string;
        count: number;
        users: string[];
    }[] | undefined;
    replyTo?: string | undefined;
}, {
    id: string;
    time: string;
    sender: "me" | "them";
    text: string;
    status?: "sent" | "delivered" | "read" | undefined;
    attachments?: {
        id: string;
        type: "video" | "audio" | "image" | "document";
        url: string;
        name: string;
        size?: number | undefined;
        previewUrl?: string | undefined;
    }[] | undefined;
    isDeleted?: boolean | undefined;
    reactions?: {
        emoji: string;
        count: number;
        users: string[];
    }[] | undefined;
    replyTo?: string | undefined;
}>;
export declare const BackendMessageSchema: z.ZodObject<{
    id: z.ZodString;
    senderId: z.ZodString;
    content: z.ZodString;
    createdAt: z.ZodString;
    isRead: z.ZodDefault<z.ZodBoolean>;
    messageType: z.ZodDefault<z.ZodEnum<["TEXT", "IMAGE", "AUDIO", "VIDEO", "SYSTEM"]>>;
    reactions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        emoji: z.ZodString;
        userId: z.ZodString;
        count: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        userId: string;
        emoji: string;
        count: number;
    }, {
        userId: string;
        emoji: string;
        count: number;
    }>, "many">>;
    attachment: z.ZodOptional<z.ZodObject<{
        url: z.ZodString;
        name: z.ZodString;
        size: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        url: string;
        name: string;
        size: number;
    }, {
        url: string;
        name: string;
        size: number;
    }>>;
    attachmentUrl: z.ZodOptional<z.ZodString>;
    attachmentName: z.ZodOptional<z.ZodString>;
    attachmentSize: z.ZodOptional<z.ZodNumber>;
    replyToId: z.ZodOptional<z.ZodString>;
    isDeleted: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    readReceipts: z.ZodOptional<z.ZodArray<z.ZodObject<{
        userId: z.ZodString;
        readAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        userId: string;
        readAt: string;
    }, {
        userId: string;
        readAt: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    content: string;
    isDeleted: boolean;
    senderId: string;
    isRead: boolean;
    messageType: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "SYSTEM";
    reactions?: {
        userId: string;
        emoji: string;
        count: number;
    }[] | undefined;
    attachment?: {
        url: string;
        name: string;
        size: number;
    } | undefined;
    attachmentUrl?: string | undefined;
    attachmentName?: string | undefined;
    attachmentSize?: number | undefined;
    replyToId?: string | undefined;
    readReceipts?: {
        userId: string;
        readAt: string;
    }[] | undefined;
}, {
    id: string;
    createdAt: string;
    content: string;
    senderId: string;
    isDeleted?: boolean | undefined;
    reactions?: {
        userId: string;
        emoji: string;
        count: number;
    }[] | undefined;
    isRead?: boolean | undefined;
    messageType?: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "SYSTEM" | undefined;
    attachment?: {
        url: string;
        name: string;
        size: number;
    } | undefined;
    attachmentUrl?: string | undefined;
    attachmentName?: string | undefined;
    attachmentSize?: number | undefined;
    replyToId?: string | undefined;
    readReceipts?: {
        userId: string;
        readAt: string;
    }[] | undefined;
}>;
export declare const ContactSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    status: z.ZodEnum<["online", "offline", "away"]>;
    lastMessage: z.ZodDefault<z.ZodString>;
    time: z.ZodString;
    unread: z.ZodDefault<z.ZodNumber>;
    avatar: z.ZodOptional<z.ZodString>;
    isTyping: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "online" | "offline" | "away";
    time: string;
    name: string;
    lastMessage: string;
    unread: number;
    isTyping: boolean;
    avatar?: string | undefined;
}, {
    id: string;
    status: "online" | "offline" | "away";
    time: string;
    name: string;
    avatar?: string | undefined;
    lastMessage?: string | undefined;
    unread?: number | undefined;
    isTyping?: boolean | undefined;
}>;
export declare const ConversationSchema: z.ZodObject<{
    id: z.ZodString;
    contactId: z.ZodString;
    messages: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        sender: z.ZodEnum<["me", "them"]>;
        text: z.ZodString;
        time: z.ZodString;
        status: z.ZodOptional<z.ZodEnum<["sent", "delivered", "read"]>>;
        attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodEnum<["image", "document", "audio", "video"]>;
            url: z.ZodString;
            name: z.ZodString;
            size: z.ZodOptional<z.ZodNumber>;
            previewUrl: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            type: "video" | "audio" | "image" | "document";
            url: string;
            name: string;
            size?: number | undefined;
            previewUrl?: string | undefined;
        }, {
            id: string;
            type: "video" | "audio" | "image" | "document";
            url: string;
            name: string;
            size?: number | undefined;
            previewUrl?: string | undefined;
        }>, "many">>;
        isDeleted: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        reactions: z.ZodOptional<z.ZodArray<z.ZodObject<{
            emoji: z.ZodString;
            count: z.ZodNumber;
            users: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            emoji: string;
            count: number;
            users: string[];
        }, {
            emoji: string;
            count: number;
            users: string[];
        }>, "many">>;
        replyTo: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        time: string;
        sender: "me" | "them";
        text: string;
        isDeleted: boolean;
        status?: "sent" | "delivered" | "read" | undefined;
        attachments?: {
            id: string;
            type: "video" | "audio" | "image" | "document";
            url: string;
            name: string;
            size?: number | undefined;
            previewUrl?: string | undefined;
        }[] | undefined;
        reactions?: {
            emoji: string;
            count: number;
            users: string[];
        }[] | undefined;
        replyTo?: string | undefined;
    }, {
        id: string;
        time: string;
        sender: "me" | "them";
        text: string;
        status?: "sent" | "delivered" | "read" | undefined;
        attachments?: {
            id: string;
            type: "video" | "audio" | "image" | "document";
            url: string;
            name: string;
            size?: number | undefined;
            previewUrl?: string | undefined;
        }[] | undefined;
        isDeleted?: boolean | undefined;
        reactions?: {
            emoji: string;
            count: number;
            users: string[];
        }[] | undefined;
        replyTo?: string | undefined;
    }>, "many">;
    lastReadMessageId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    contactId: string;
    messages: {
        id: string;
        time: string;
        sender: "me" | "them";
        text: string;
        isDeleted: boolean;
        status?: "sent" | "delivered" | "read" | undefined;
        attachments?: {
            id: string;
            type: "video" | "audio" | "image" | "document";
            url: string;
            name: string;
            size?: number | undefined;
            previewUrl?: string | undefined;
        }[] | undefined;
        reactions?: {
            emoji: string;
            count: number;
            users: string[];
        }[] | undefined;
        replyTo?: string | undefined;
    }[];
    lastReadMessageId?: string | undefined;
}, {
    id: string;
    contactId: string;
    messages: {
        id: string;
        time: string;
        sender: "me" | "them";
        text: string;
        status?: "sent" | "delivered" | "read" | undefined;
        attachments?: {
            id: string;
            type: "video" | "audio" | "image" | "document";
            url: string;
            name: string;
            size?: number | undefined;
            previewUrl?: string | undefined;
        }[] | undefined;
        isDeleted?: boolean | undefined;
        reactions?: {
            emoji: string;
            count: number;
            users: string[];
        }[] | undefined;
        replyTo?: string | undefined;
    }[];
    lastReadMessageId?: string | undefined;
}>;
export declare const MessageGroupSchema: z.ZodObject<{
    date: z.ZodString;
    messages: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        sender: z.ZodEnum<["me", "them"]>;
        text: z.ZodString;
        time: z.ZodString;
        status: z.ZodOptional<z.ZodEnum<["sent", "delivered", "read"]>>;
        attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodEnum<["image", "document", "audio", "video"]>;
            url: z.ZodString;
            name: z.ZodString;
            size: z.ZodOptional<z.ZodNumber>;
            previewUrl: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            type: "video" | "audio" | "image" | "document";
            url: string;
            name: string;
            size?: number | undefined;
            previewUrl?: string | undefined;
        }, {
            id: string;
            type: "video" | "audio" | "image" | "document";
            url: string;
            name: string;
            size?: number | undefined;
            previewUrl?: string | undefined;
        }>, "many">>;
        isDeleted: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        reactions: z.ZodOptional<z.ZodArray<z.ZodObject<{
            emoji: z.ZodString;
            count: z.ZodNumber;
            users: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            emoji: string;
            count: number;
            users: string[];
        }, {
            emoji: string;
            count: number;
            users: string[];
        }>, "many">>;
        replyTo: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        time: string;
        sender: "me" | "them";
        text: string;
        isDeleted: boolean;
        status?: "sent" | "delivered" | "read" | undefined;
        attachments?: {
            id: string;
            type: "video" | "audio" | "image" | "document";
            url: string;
            name: string;
            size?: number | undefined;
            previewUrl?: string | undefined;
        }[] | undefined;
        reactions?: {
            emoji: string;
            count: number;
            users: string[];
        }[] | undefined;
        replyTo?: string | undefined;
    }, {
        id: string;
        time: string;
        sender: "me" | "them";
        text: string;
        status?: "sent" | "delivered" | "read" | undefined;
        attachments?: {
            id: string;
            type: "video" | "audio" | "image" | "document";
            url: string;
            name: string;
            size?: number | undefined;
            previewUrl?: string | undefined;
        }[] | undefined;
        isDeleted?: boolean | undefined;
        reactions?: {
            emoji: string;
            count: number;
            users: string[];
        }[] | undefined;
        replyTo?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    date: string;
    messages: {
        id: string;
        time: string;
        sender: "me" | "them";
        text: string;
        isDeleted: boolean;
        status?: "sent" | "delivered" | "read" | undefined;
        attachments?: {
            id: string;
            type: "video" | "audio" | "image" | "document";
            url: string;
            name: string;
            size?: number | undefined;
            previewUrl?: string | undefined;
        }[] | undefined;
        reactions?: {
            emoji: string;
            count: number;
            users: string[];
        }[] | undefined;
        replyTo?: string | undefined;
    }[];
}, {
    date: string;
    messages: {
        id: string;
        time: string;
        sender: "me" | "them";
        text: string;
        status?: "sent" | "delivered" | "read" | undefined;
        attachments?: {
            id: string;
            type: "video" | "audio" | "image" | "document";
            url: string;
            name: string;
            size?: number | undefined;
            previewUrl?: string | undefined;
        }[] | undefined;
        isDeleted?: boolean | undefined;
        reactions?: {
            emoji: string;
            count: number;
            users: string[];
        }[] | undefined;
        replyTo?: string | undefined;
    }[];
}>;
export declare const MessagesStateSchema: z.ZodObject<{
    contacts: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        status: z.ZodEnum<["online", "offline", "away"]>;
        lastMessage: z.ZodDefault<z.ZodString>;
        time: z.ZodString;
        unread: z.ZodDefault<z.ZodNumber>;
        avatar: z.ZodOptional<z.ZodString>;
        isTyping: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        status: "online" | "offline" | "away";
        time: string;
        name: string;
        lastMessage: string;
        unread: number;
        isTyping: boolean;
        avatar?: string | undefined;
    }, {
        id: string;
        status: "online" | "offline" | "away";
        time: string;
        name: string;
        avatar?: string | undefined;
        lastMessage?: string | undefined;
        unread?: number | undefined;
        isTyping?: boolean | undefined;
    }>, "many">;
    conversations: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        contactId: z.ZodString;
        messages: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            sender: z.ZodEnum<["me", "them"]>;
            text: z.ZodString;
            time: z.ZodString;
            status: z.ZodOptional<z.ZodEnum<["sent", "delivered", "read"]>>;
            attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodEnum<["image", "document", "audio", "video"]>;
                url: z.ZodString;
                name: z.ZodString;
                size: z.ZodOptional<z.ZodNumber>;
                previewUrl: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                type: "video" | "audio" | "image" | "document";
                url: string;
                name: string;
                size?: number | undefined;
                previewUrl?: string | undefined;
            }, {
                id: string;
                type: "video" | "audio" | "image" | "document";
                url: string;
                name: string;
                size?: number | undefined;
                previewUrl?: string | undefined;
            }>, "many">>;
            isDeleted: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
            reactions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                emoji: z.ZodString;
                count: z.ZodNumber;
                users: z.ZodArray<z.ZodString, "many">;
            }, "strip", z.ZodTypeAny, {
                emoji: string;
                count: number;
                users: string[];
            }, {
                emoji: string;
                count: number;
                users: string[];
            }>, "many">>;
            replyTo: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            time: string;
            sender: "me" | "them";
            text: string;
            isDeleted: boolean;
            status?: "sent" | "delivered" | "read" | undefined;
            attachments?: {
                id: string;
                type: "video" | "audio" | "image" | "document";
                url: string;
                name: string;
                size?: number | undefined;
                previewUrl?: string | undefined;
            }[] | undefined;
            reactions?: {
                emoji: string;
                count: number;
                users: string[];
            }[] | undefined;
            replyTo?: string | undefined;
        }, {
            id: string;
            time: string;
            sender: "me" | "them";
            text: string;
            status?: "sent" | "delivered" | "read" | undefined;
            attachments?: {
                id: string;
                type: "video" | "audio" | "image" | "document";
                url: string;
                name: string;
                size?: number | undefined;
                previewUrl?: string | undefined;
            }[] | undefined;
            isDeleted?: boolean | undefined;
            reactions?: {
                emoji: string;
                count: number;
                users: string[];
            }[] | undefined;
            replyTo?: string | undefined;
        }>, "many">;
        lastReadMessageId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        contactId: string;
        messages: {
            id: string;
            time: string;
            sender: "me" | "them";
            text: string;
            isDeleted: boolean;
            status?: "sent" | "delivered" | "read" | undefined;
            attachments?: {
                id: string;
                type: "video" | "audio" | "image" | "document";
                url: string;
                name: string;
                size?: number | undefined;
                previewUrl?: string | undefined;
            }[] | undefined;
            reactions?: {
                emoji: string;
                count: number;
                users: string[];
            }[] | undefined;
            replyTo?: string | undefined;
        }[];
        lastReadMessageId?: string | undefined;
    }, {
        id: string;
        contactId: string;
        messages: {
            id: string;
            time: string;
            sender: "me" | "them";
            text: string;
            status?: "sent" | "delivered" | "read" | undefined;
            attachments?: {
                id: string;
                type: "video" | "audio" | "image" | "document";
                url: string;
                name: string;
                size?: number | undefined;
                previewUrl?: string | undefined;
            }[] | undefined;
            isDeleted?: boolean | undefined;
            reactions?: {
                emoji: string;
                count: number;
                users: string[];
            }[] | undefined;
            replyTo?: string | undefined;
        }[];
        lastReadMessageId?: string | undefined;
    }>, "many">;
    selectedContactId: z.ZodNullable<z.ZodString>;
    isLoadingMessages: z.ZodDefault<z.ZodBoolean>;
    error: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    contacts: {
        id: string;
        status: "online" | "offline" | "away";
        time: string;
        name: string;
        lastMessage: string;
        unread: number;
        isTyping: boolean;
        avatar?: string | undefined;
    }[];
    conversations: {
        id: string;
        contactId: string;
        messages: {
            id: string;
            time: string;
            sender: "me" | "them";
            text: string;
            isDeleted: boolean;
            status?: "sent" | "delivered" | "read" | undefined;
            attachments?: {
                id: string;
                type: "video" | "audio" | "image" | "document";
                url: string;
                name: string;
                size?: number | undefined;
                previewUrl?: string | undefined;
            }[] | undefined;
            reactions?: {
                emoji: string;
                count: number;
                users: string[];
            }[] | undefined;
            replyTo?: string | undefined;
        }[];
        lastReadMessageId?: string | undefined;
    }[];
    selectedContactId: string | null;
    isLoadingMessages: boolean;
    error: string | null;
}, {
    contacts: {
        id: string;
        status: "online" | "offline" | "away";
        time: string;
        name: string;
        avatar?: string | undefined;
        lastMessage?: string | undefined;
        unread?: number | undefined;
        isTyping?: boolean | undefined;
    }[];
    conversations: {
        id: string;
        contactId: string;
        messages: {
            id: string;
            time: string;
            sender: "me" | "them";
            text: string;
            status?: "sent" | "delivered" | "read" | undefined;
            attachments?: {
                id: string;
                type: "video" | "audio" | "image" | "document";
                url: string;
                name: string;
                size?: number | undefined;
                previewUrl?: string | undefined;
            }[] | undefined;
            isDeleted?: boolean | undefined;
            reactions?: {
                emoji: string;
                count: number;
                users: string[];
            }[] | undefined;
            replyTo?: string | undefined;
        }[];
        lastReadMessageId?: string | undefined;
    }[];
    selectedContactId: string | null;
    error: string | null;
    isLoadingMessages?: boolean | undefined;
}>;
export declare const CreateConversationDtoSchema: z.ZodObject<{
    participantIds: z.ZodArray<z.ZodString, "many">;
    type: z.ZodDefault<z.ZodOptional<z.ZodEnum<["DIRECT", "GROUP", "SESSION", "SUPPORT"]>>>;
    title: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "DIRECT" | "GROUP" | "SESSION" | "SUPPORT";
    participantIds: string[];
    title?: string | undefined;
}, {
    participantIds: string[];
    type?: "DIRECT" | "GROUP" | "SESSION" | "SUPPORT" | undefined;
    title?: string | undefined;
}>;
export declare const SendMessageDtoSchema: z.ZodEffects<z.ZodObject<{
    content: z.ZodString;
    messageType: z.ZodDefault<z.ZodOptional<z.ZodEnum<["TEXT", "IMAGE", "AUDIO", "VIDEO", "SYSTEM"]>>>;
    replyToId: z.ZodOptional<z.ZodString>;
    attachmentUrl: z.ZodOptional<z.ZodString>;
    attachmentName: z.ZodOptional<z.ZodString>;
    attachmentSize: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    content: string;
    messageType: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "SYSTEM";
    attachmentUrl?: string | undefined;
    attachmentName?: string | undefined;
    attachmentSize?: number | undefined;
    replyToId?: string | undefined;
}, {
    content: string;
    messageType?: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "SYSTEM" | undefined;
    attachmentUrl?: string | undefined;
    attachmentName?: string | undefined;
    attachmentSize?: number | undefined;
    replyToId?: string | undefined;
}>, {
    content: string;
    messageType: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "SYSTEM";
    attachmentUrl?: string | undefined;
    attachmentName?: string | undefined;
    attachmentSize?: number | undefined;
    replyToId?: string | undefined;
}, {
    content: string;
    messageType?: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "SYSTEM" | undefined;
    attachmentUrl?: string | undefined;
    attachmentName?: string | undefined;
    attachmentSize?: number | undefined;
    replyToId?: string | undefined;
}>;
export declare const UpdateMessageDtoSchema: z.ZodObject<{
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    content: string;
}, {
    content: string;
}>;
export declare const AddReactionDtoSchema: z.ZodObject<{
    emoji: z.ZodString;
}, "strip", z.ZodTypeAny, {
    emoji: string;
}, {
    emoji: string;
}>;
export declare const BlockUserDtoSchema: z.ZodObject<{
    userId: z.ZodString;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    reason?: string | undefined;
}, {
    userId: string;
    reason?: string | undefined;
}>;
export declare const SearchMessagesDtoSchema: z.ZodObject<{
    query: z.ZodString;
    conversationId: z.ZodOptional<z.ZodString>;
    page: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    query: string;
    limit?: string | undefined;
    page?: string | undefined;
    conversationId?: string | undefined;
}, {
    query: string;
    limit?: string | undefined;
    page?: string | undefined;
    conversationId?: string | undefined;
}>;
export declare const JoinConversationDtoSchema: z.ZodObject<{
    conversationId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    conversationId: string;
}, {
    conversationId: string;
}>;
export declare const LeaveConversationDtoSchema: z.ZodObject<{
    conversationId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    conversationId: string;
}, {
    conversationId: string;
}>;
export declare const TypingIndicatorDtoSchema: z.ZodObject<{
    conversationId: z.ZodString;
    isTyping: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    isTyping: boolean;
    conversationId: string;
}, {
    conversationId: string;
    isTyping?: boolean | undefined;
}>;
export declare const ConversationParticipantSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    conversationId: z.ZodString;
    joinedAt: z.ZodString;
    leftAt: z.ZodNullable<z.ZodString>;
    role: z.ZodDefault<z.ZodEnum<["ADMIN", "MODERATOR", "MEMBER"]>>;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id: string;
    role: "ADMIN" | "MODERATOR" | "MEMBER";
    userId: string;
    isActive: boolean;
    conversationId: string;
    joinedAt: string;
    leftAt: string | null;
}, {
    id: string;
    userId: string;
    conversationId: string;
    joinedAt: string;
    leftAt: string | null;
    role?: "ADMIN" | "MODERATOR" | "MEMBER" | undefined;
    isActive?: boolean | undefined;
}>;
export declare const BackendConversationSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["DIRECT", "GROUP", "SESSION", "SUPPORT"]>;
    title: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    participants: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        userId: z.ZodString;
        conversationId: z.ZodString;
        joinedAt: z.ZodString;
        leftAt: z.ZodNullable<z.ZodString>;
        role: z.ZodDefault<z.ZodEnum<["ADMIN", "MODERATOR", "MEMBER"]>>;
        isActive: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        role: "ADMIN" | "MODERATOR" | "MEMBER";
        userId: string;
        isActive: boolean;
        conversationId: string;
        joinedAt: string;
        leftAt: string | null;
    }, {
        id: string;
        userId: string;
        conversationId: string;
        joinedAt: string;
        leftAt: string | null;
        role?: "ADMIN" | "MODERATOR" | "MEMBER" | undefined;
        isActive?: boolean | undefined;
    }>, "many">;
    messages: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        senderId: z.ZodString;
        content: z.ZodString;
        createdAt: z.ZodString;
        isRead: z.ZodDefault<z.ZodBoolean>;
        messageType: z.ZodDefault<z.ZodEnum<["TEXT", "IMAGE", "AUDIO", "VIDEO", "SYSTEM"]>>;
        reactions: z.ZodOptional<z.ZodArray<z.ZodObject<{
            emoji: z.ZodString;
            userId: z.ZodString;
            count: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            userId: string;
            emoji: string;
            count: number;
        }, {
            userId: string;
            emoji: string;
            count: number;
        }>, "many">>;
        attachment: z.ZodOptional<z.ZodObject<{
            url: z.ZodString;
            name: z.ZodString;
            size: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            url: string;
            name: string;
            size: number;
        }, {
            url: string;
            name: string;
            size: number;
        }>>;
        attachmentUrl: z.ZodOptional<z.ZodString>;
        attachmentName: z.ZodOptional<z.ZodString>;
        attachmentSize: z.ZodOptional<z.ZodNumber>;
        replyToId: z.ZodOptional<z.ZodString>;
        isDeleted: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        readReceipts: z.ZodOptional<z.ZodArray<z.ZodObject<{
            userId: z.ZodString;
            readAt: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            userId: string;
            readAt: string;
        }, {
            userId: string;
            readAt: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: string;
        content: string;
        isDeleted: boolean;
        senderId: string;
        isRead: boolean;
        messageType: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "SYSTEM";
        reactions?: {
            userId: string;
            emoji: string;
            count: number;
        }[] | undefined;
        attachment?: {
            url: string;
            name: string;
            size: number;
        } | undefined;
        attachmentUrl?: string | undefined;
        attachmentName?: string | undefined;
        attachmentSize?: number | undefined;
        replyToId?: string | undefined;
        readReceipts?: {
            userId: string;
            readAt: string;
        }[] | undefined;
    }, {
        id: string;
        createdAt: string;
        content: string;
        senderId: string;
        isDeleted?: boolean | undefined;
        reactions?: {
            userId: string;
            emoji: string;
            count: number;
        }[] | undefined;
        isRead?: boolean | undefined;
        messageType?: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "SYSTEM" | undefined;
        attachment?: {
            url: string;
            name: string;
            size: number;
        } | undefined;
        attachmentUrl?: string | undefined;
        attachmentName?: string | undefined;
        attachmentSize?: number | undefined;
        replyToId?: string | undefined;
        readReceipts?: {
            userId: string;
            readAt: string;
        }[] | undefined;
    }>, "many">;
    lastMessageAt: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    updatedAt: string;
    type: "DIRECT" | "GROUP" | "SESSION" | "SUPPORT";
    isActive: boolean;
    messages: {
        id: string;
        createdAt: string;
        content: string;
        isDeleted: boolean;
        senderId: string;
        isRead: boolean;
        messageType: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "SYSTEM";
        reactions?: {
            userId: string;
            emoji: string;
            count: number;
        }[] | undefined;
        attachment?: {
            url: string;
            name: string;
            size: number;
        } | undefined;
        attachmentUrl?: string | undefined;
        attachmentName?: string | undefined;
        attachmentSize?: number | undefined;
        replyToId?: string | undefined;
        readReceipts?: {
            userId: string;
            readAt: string;
        }[] | undefined;
    }[];
    participants: {
        id: string;
        role: "ADMIN" | "MODERATOR" | "MEMBER";
        userId: string;
        isActive: boolean;
        conversationId: string;
        joinedAt: string;
        leftAt: string | null;
    }[];
    title?: string | undefined;
    lastMessageAt?: string | undefined;
}, {
    id: string;
    createdAt: string;
    updatedAt: string;
    type: "DIRECT" | "GROUP" | "SESSION" | "SUPPORT";
    messages: {
        id: string;
        createdAt: string;
        content: string;
        senderId: string;
        isDeleted?: boolean | undefined;
        reactions?: {
            userId: string;
            emoji: string;
            count: number;
        }[] | undefined;
        isRead?: boolean | undefined;
        messageType?: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "SYSTEM" | undefined;
        attachment?: {
            url: string;
            name: string;
            size: number;
        } | undefined;
        attachmentUrl?: string | undefined;
        attachmentName?: string | undefined;
        attachmentSize?: number | undefined;
        replyToId?: string | undefined;
        readReceipts?: {
            userId: string;
            readAt: string;
        }[] | undefined;
    }[];
    participants: {
        id: string;
        userId: string;
        conversationId: string;
        joinedAt: string;
        leftAt: string | null;
        role?: "ADMIN" | "MODERATOR" | "MEMBER" | undefined;
        isActive?: boolean | undefined;
    }[];
    isActive?: boolean | undefined;
    title?: string | undefined;
    lastMessageAt?: string | undefined;
}>;
export declare const MessageSearchResultSchema: z.ZodObject<{
    messages: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        senderId: z.ZodString;
        content: z.ZodString;
        createdAt: z.ZodString;
        isRead: z.ZodDefault<z.ZodBoolean>;
        messageType: z.ZodDefault<z.ZodEnum<["TEXT", "IMAGE", "AUDIO", "VIDEO", "SYSTEM"]>>;
        reactions: z.ZodOptional<z.ZodArray<z.ZodObject<{
            emoji: z.ZodString;
            userId: z.ZodString;
            count: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            userId: string;
            emoji: string;
            count: number;
        }, {
            userId: string;
            emoji: string;
            count: number;
        }>, "many">>;
        attachment: z.ZodOptional<z.ZodObject<{
            url: z.ZodString;
            name: z.ZodString;
            size: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            url: string;
            name: string;
            size: number;
        }, {
            url: string;
            name: string;
            size: number;
        }>>;
        attachmentUrl: z.ZodOptional<z.ZodString>;
        attachmentName: z.ZodOptional<z.ZodString>;
        attachmentSize: z.ZodOptional<z.ZodNumber>;
        replyToId: z.ZodOptional<z.ZodString>;
        isDeleted: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        readReceipts: z.ZodOptional<z.ZodArray<z.ZodObject<{
            userId: z.ZodString;
            readAt: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            userId: string;
            readAt: string;
        }, {
            userId: string;
            readAt: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: string;
        content: string;
        isDeleted: boolean;
        senderId: string;
        isRead: boolean;
        messageType: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "SYSTEM";
        reactions?: {
            userId: string;
            emoji: string;
            count: number;
        }[] | undefined;
        attachment?: {
            url: string;
            name: string;
            size: number;
        } | undefined;
        attachmentUrl?: string | undefined;
        attachmentName?: string | undefined;
        attachmentSize?: number | undefined;
        replyToId?: string | undefined;
        readReceipts?: {
            userId: string;
            readAt: string;
        }[] | undefined;
    }, {
        id: string;
        createdAt: string;
        content: string;
        senderId: string;
        isDeleted?: boolean | undefined;
        reactions?: {
            userId: string;
            emoji: string;
            count: number;
        }[] | undefined;
        isRead?: boolean | undefined;
        messageType?: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "SYSTEM" | undefined;
        attachment?: {
            url: string;
            name: string;
            size: number;
        } | undefined;
        attachmentUrl?: string | undefined;
        attachmentName?: string | undefined;
        attachmentSize?: number | undefined;
        replyToId?: string | undefined;
        readReceipts?: {
            userId: string;
            readAt: string;
        }[] | undefined;
    }>, "many">;
    totalCount: z.ZodNumber;
    page: z.ZodNumber;
    pageSize: z.ZodNumber;
    totalPages: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    messages: {
        id: string;
        createdAt: string;
        content: string;
        isDeleted: boolean;
        senderId: string;
        isRead: boolean;
        messageType: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "SYSTEM";
        reactions?: {
            userId: string;
            emoji: string;
            count: number;
        }[] | undefined;
        attachment?: {
            url: string;
            name: string;
            size: number;
        } | undefined;
        attachmentUrl?: string | undefined;
        attachmentName?: string | undefined;
        attachmentSize?: number | undefined;
        replyToId?: string | undefined;
        readReceipts?: {
            userId: string;
            readAt: string;
        }[] | undefined;
    }[];
}, {
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    messages: {
        id: string;
        createdAt: string;
        content: string;
        senderId: string;
        isDeleted?: boolean | undefined;
        reactions?: {
            userId: string;
            emoji: string;
            count: number;
        }[] | undefined;
        isRead?: boolean | undefined;
        messageType?: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "SYSTEM" | undefined;
        attachment?: {
            url: string;
            name: string;
            size: number;
        } | undefined;
        attachmentUrl?: string | undefined;
        attachmentName?: string | undefined;
        attachmentSize?: number | undefined;
        replyToId?: string | undefined;
        readReceipts?: {
            userId: string;
            readAt: string;
        }[] | undefined;
    }[];
}>;
export declare const ConversationListParamsSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodEnum<["DIRECT", "GROUP", "SESSION", "SUPPORT"]>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["lastMessageAt", "createdAt"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: "createdAt" | "lastMessageAt";
    sortOrder: "asc" | "desc";
    type?: "DIRECT" | "GROUP" | "SESSION" | "SUPPORT" | undefined;
    isActive?: boolean | undefined;
}, {
    type?: "DIRECT" | "GROUP" | "SESSION" | "SUPPORT" | undefined;
    isActive?: boolean | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "lastMessageAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export declare const MessageAnalyticsSchema: z.ZodObject<{
    conversationId: z.ZodString;
    participantId: z.ZodString;
    timeframe: z.ZodEnum<["day", "week", "month"]>;
    metrics: z.ZodObject<{
        totalMessages: z.ZodNumber;
        averageResponseTime: z.ZodNumber;
        messageFrequency: z.ZodArray<z.ZodObject<{
            hour: z.ZodNumber;
            count: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            hour: number;
            count: number;
        }, {
            hour: number;
            count: number;
        }>, "many">;
        attachmentTypes: z.ZodRecord<z.ZodString, z.ZodNumber>;
        engagementScore: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        totalMessages: number;
        averageResponseTime: number;
        messageFrequency: {
            hour: number;
            count: number;
        }[];
        attachmentTypes: Record<string, number>;
        engagementScore: number;
    }, {
        totalMessages: number;
        averageResponseTime: number;
        messageFrequency: {
            hour: number;
            count: number;
        }[];
        attachmentTypes: Record<string, number>;
        engagementScore: number;
    }>;
}, "strip", z.ZodTypeAny, {
    timeframe: "month" | "week" | "day";
    metrics: {
        totalMessages: number;
        averageResponseTime: number;
        messageFrequency: {
            hour: number;
            count: number;
        }[];
        attachmentTypes: Record<string, number>;
        engagementScore: number;
    };
    conversationId: string;
    participantId: string;
}, {
    timeframe: "month" | "week" | "day";
    metrics: {
        totalMessages: number;
        averageResponseTime: number;
        messageFrequency: {
            hour: number;
            count: number;
        }[];
        attachmentTypes: Record<string, number>;
        engagementScore: number;
    };
    conversationId: string;
    participantId: string;
}>;
export declare const MessageNotificationPreferencesSchema: z.ZodObject<{
    userId: z.ZodString;
    emailNotifications: z.ZodDefault<z.ZodBoolean>;
    pushNotifications: z.ZodDefault<z.ZodBoolean>;
    soundEnabled: z.ZodDefault<z.ZodBoolean>;
    quietHours: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        startTime: z.ZodString;
        endTime: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        startTime: string;
        endTime: string;
        enabled: boolean;
    }, {
        startTime: string;
        endTime: string;
        enabled?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    soundEnabled: boolean;
    quietHours?: {
        startTime: string;
        endTime: string;
        enabled: boolean;
    } | undefined;
}, {
    userId: string;
    emailNotifications?: boolean | undefined;
    pushNotifications?: boolean | undefined;
    soundEnabled?: boolean | undefined;
    quietHours?: {
        startTime: string;
        endTime: string;
        enabled?: boolean | undefined;
    } | undefined;
}>;
export declare const MessagesListParamsSchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    before: z.ZodOptional<z.ZodString>;
    after: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    sortOrder: "asc" | "desc";
    before?: string | undefined;
    after?: string | undefined;
}, {
    limit?: number | undefined;
    offset?: number | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    before?: string | undefined;
    after?: string | undefined;
}>;
export declare const BlockedUserSchema: z.ZodObject<{
    id: z.ZodString;
    blockedUserId: z.ZodString;
    blockedBy: z.ZodString;
    reason: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    blockedUser: z.ZodObject<{
        id: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        profileImage: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        firstName: string;
        lastName: string;
        profileImage?: string | undefined;
    }, {
        id: string;
        firstName: string;
        lastName: string;
        profileImage?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    blockedUserId: string;
    blockedBy: string;
    blockedUser: {
        id: string;
        firstName: string;
        lastName: string;
        profileImage?: string | undefined;
    };
    reason?: string | undefined;
}, {
    id: string;
    createdAt: string;
    blockedUserId: string;
    blockedBy: string;
    blockedUser: {
        id: string;
        firstName: string;
        lastName: string;
        profileImage?: string | undefined;
    };
    reason?: string | undefined;
}>;
export declare const SearchMessagesResponseSchema: z.ZodObject<{
    messages: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        senderId: z.ZodString;
        content: z.ZodString;
        createdAt: z.ZodString;
        isRead: z.ZodDefault<z.ZodBoolean>;
        messageType: z.ZodDefault<z.ZodEnum<["TEXT", "IMAGE", "AUDIO", "VIDEO", "SYSTEM"]>>;
        reactions: z.ZodOptional<z.ZodArray<z.ZodObject<{
            emoji: z.ZodString;
            userId: z.ZodString;
            count: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            userId: string;
            emoji: string;
            count: number;
        }, {
            userId: string;
            emoji: string;
            count: number;
        }>, "many">>;
        attachment: z.ZodOptional<z.ZodObject<{
            url: z.ZodString;
            name: z.ZodString;
            size: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            url: string;
            name: string;
            size: number;
        }, {
            url: string;
            name: string;
            size: number;
        }>>;
        attachmentUrl: z.ZodOptional<z.ZodString>;
        attachmentName: z.ZodOptional<z.ZodString>;
        attachmentSize: z.ZodOptional<z.ZodNumber>;
        replyToId: z.ZodOptional<z.ZodString>;
        isDeleted: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        readReceipts: z.ZodOptional<z.ZodArray<z.ZodObject<{
            userId: z.ZodString;
            readAt: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            userId: string;
            readAt: string;
        }, {
            userId: string;
            readAt: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: string;
        content: string;
        isDeleted: boolean;
        senderId: string;
        isRead: boolean;
        messageType: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "SYSTEM";
        reactions?: {
            userId: string;
            emoji: string;
            count: number;
        }[] | undefined;
        attachment?: {
            url: string;
            name: string;
            size: number;
        } | undefined;
        attachmentUrl?: string | undefined;
        attachmentName?: string | undefined;
        attachmentSize?: number | undefined;
        replyToId?: string | undefined;
        readReceipts?: {
            userId: string;
            readAt: string;
        }[] | undefined;
    }, {
        id: string;
        createdAt: string;
        content: string;
        senderId: string;
        isDeleted?: boolean | undefined;
        reactions?: {
            userId: string;
            emoji: string;
            count: number;
        }[] | undefined;
        isRead?: boolean | undefined;
        messageType?: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "SYSTEM" | undefined;
        attachment?: {
            url: string;
            name: string;
            size: number;
        } | undefined;
        attachmentUrl?: string | undefined;
        attachmentName?: string | undefined;
        attachmentSize?: number | undefined;
        replyToId?: string | undefined;
        readReceipts?: {
            userId: string;
            readAt: string;
        }[] | undefined;
    }>, "many">;
    conversations: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["DIRECT", "GROUP", "SESSION", "SUPPORT"]>;
        title: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        participants: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            userId: z.ZodString;
            conversationId: z.ZodString;
            joinedAt: z.ZodString;
            leftAt: z.ZodNullable<z.ZodString>;
            role: z.ZodDefault<z.ZodEnum<["ADMIN", "MODERATOR", "MEMBER"]>>;
            isActive: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            role: "ADMIN" | "MODERATOR" | "MEMBER";
            userId: string;
            isActive: boolean;
            conversationId: string;
            joinedAt: string;
            leftAt: string | null;
        }, {
            id: string;
            userId: string;
            conversationId: string;
            joinedAt: string;
            leftAt: string | null;
            role?: "ADMIN" | "MODERATOR" | "MEMBER" | undefined;
            isActive?: boolean | undefined;
        }>, "many">;
        messages: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            senderId: z.ZodString;
            content: z.ZodString;
            createdAt: z.ZodString;
            isRead: z.ZodDefault<z.ZodBoolean>;
            messageType: z.ZodDefault<z.ZodEnum<["TEXT", "IMAGE", "AUDIO", "VIDEO", "SYSTEM"]>>;
            reactions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                emoji: z.ZodString;
                userId: z.ZodString;
                count: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                userId: string;
                emoji: string;
                count: number;
            }, {
                userId: string;
                emoji: string;
                count: number;
            }>, "many">>;
            attachment: z.ZodOptional<z.ZodObject<{
                url: z.ZodString;
                name: z.ZodString;
                size: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                url: string;
                name: string;
                size: number;
            }, {
                url: string;
                name: string;
                size: number;
            }>>;
            attachmentUrl: z.ZodOptional<z.ZodString>;
            attachmentName: z.ZodOptional<z.ZodString>;
            attachmentSize: z.ZodOptional<z.ZodNumber>;
            replyToId: z.ZodOptional<z.ZodString>;
            isDeleted: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
            readReceipts: z.ZodOptional<z.ZodArray<z.ZodObject<{
                userId: z.ZodString;
                readAt: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                userId: string;
                readAt: string;
            }, {
                userId: string;
                readAt: string;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            createdAt: string;
            content: string;
            isDeleted: boolean;
            senderId: string;
            isRead: boolean;
            messageType: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "SYSTEM";
            reactions?: {
                userId: string;
                emoji: string;
                count: number;
            }[] | undefined;
            attachment?: {
                url: string;
                name: string;
                size: number;
            } | undefined;
            attachmentUrl?: string | undefined;
            attachmentName?: string | undefined;
            attachmentSize?: number | undefined;
            replyToId?: string | undefined;
            readReceipts?: {
                userId: string;
                readAt: string;
            }[] | undefined;
        }, {
            id: string;
            createdAt: string;
            content: string;
            senderId: string;
            isDeleted?: boolean | undefined;
            reactions?: {
                userId: string;
                emoji: string;
                count: number;
            }[] | undefined;
            isRead?: boolean | undefined;
            messageType?: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "SYSTEM" | undefined;
            attachment?: {
                url: string;
                name: string;
                size: number;
            } | undefined;
            attachmentUrl?: string | undefined;
            attachmentName?: string | undefined;
            attachmentSize?: number | undefined;
            replyToId?: string | undefined;
            readReceipts?: {
                userId: string;
                readAt: string;
            }[] | undefined;
        }>, "many">;
        lastMessageAt: z.ZodOptional<z.ZodString>;
        isActive: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: string;
        updatedAt: string;
        type: "DIRECT" | "GROUP" | "SESSION" | "SUPPORT";
        isActive: boolean;
        messages: {
            id: string;
            createdAt: string;
            content: string;
            isDeleted: boolean;
            senderId: string;
            isRead: boolean;
            messageType: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "SYSTEM";
            reactions?: {
                userId: string;
                emoji: string;
                count: number;
            }[] | undefined;
            attachment?: {
                url: string;
                name: string;
                size: number;
            } | undefined;
            attachmentUrl?: string | undefined;
            attachmentName?: string | undefined;
            attachmentSize?: number | undefined;
            replyToId?: string | undefined;
            readReceipts?: {
                userId: string;
                readAt: string;
            }[] | undefined;
        }[];
        participants: {
            id: string;
            role: "ADMIN" | "MODERATOR" | "MEMBER";
            userId: string;
            isActive: boolean;
            conversationId: string;
            joinedAt: string;
            leftAt: string | null;
        }[];
        title?: string | undefined;
        lastMessageAt?: string | undefined;
    }, {
        id: string;
        createdAt: string;
        updatedAt: string;
        type: "DIRECT" | "GROUP" | "SESSION" | "SUPPORT";
        messages: {
            id: string;
            createdAt: string;
            content: string;
            senderId: string;
            isDeleted?: boolean | undefined;
            reactions?: {
                userId: string;
                emoji: string;
                count: number;
            }[] | undefined;
            isRead?: boolean | undefined;
            messageType?: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "SYSTEM" | undefined;
            attachment?: {
                url: string;
                name: string;
                size: number;
            } | undefined;
            attachmentUrl?: string | undefined;
            attachmentName?: string | undefined;
            attachmentSize?: number | undefined;
            replyToId?: string | undefined;
            readReceipts?: {
                userId: string;
                readAt: string;
            }[] | undefined;
        }[];
        participants: {
            id: string;
            userId: string;
            conversationId: string;
            joinedAt: string;
            leftAt: string | null;
            role?: "ADMIN" | "MODERATOR" | "MEMBER" | undefined;
            isActive?: boolean | undefined;
        }[];
        isActive?: boolean | undefined;
        title?: string | undefined;
        lastMessageAt?: string | undefined;
    }>, "many">;
    totalResults: z.ZodNumber;
    page: z.ZodNumber;
    limit: z.ZodNumber;
    totalPages: z.ZodNumber;
    hasMore: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    hasMore: boolean;
    totalPages: number;
    messages: {
        id: string;
        createdAt: string;
        content: string;
        isDeleted: boolean;
        senderId: string;
        isRead: boolean;
        messageType: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "SYSTEM";
        reactions?: {
            userId: string;
            emoji: string;
            count: number;
        }[] | undefined;
        attachment?: {
            url: string;
            name: string;
            size: number;
        } | undefined;
        attachmentUrl?: string | undefined;
        attachmentName?: string | undefined;
        attachmentSize?: number | undefined;
        replyToId?: string | undefined;
        readReceipts?: {
            userId: string;
            readAt: string;
        }[] | undefined;
    }[];
    conversations: {
        id: string;
        createdAt: string;
        updatedAt: string;
        type: "DIRECT" | "GROUP" | "SESSION" | "SUPPORT";
        isActive: boolean;
        messages: {
            id: string;
            createdAt: string;
            content: string;
            isDeleted: boolean;
            senderId: string;
            isRead: boolean;
            messageType: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "SYSTEM";
            reactions?: {
                userId: string;
                emoji: string;
                count: number;
            }[] | undefined;
            attachment?: {
                url: string;
                name: string;
                size: number;
            } | undefined;
            attachmentUrl?: string | undefined;
            attachmentName?: string | undefined;
            attachmentSize?: number | undefined;
            replyToId?: string | undefined;
            readReceipts?: {
                userId: string;
                readAt: string;
            }[] | undefined;
        }[];
        participants: {
            id: string;
            role: "ADMIN" | "MODERATOR" | "MEMBER";
            userId: string;
            isActive: boolean;
            conversationId: string;
            joinedAt: string;
            leftAt: string | null;
        }[];
        title?: string | undefined;
        lastMessageAt?: string | undefined;
    }[];
    totalResults: number;
}, {
    limit: number;
    page: number;
    hasMore: boolean;
    totalPages: number;
    messages: {
        id: string;
        createdAt: string;
        content: string;
        senderId: string;
        isDeleted?: boolean | undefined;
        reactions?: {
            userId: string;
            emoji: string;
            count: number;
        }[] | undefined;
        isRead?: boolean | undefined;
        messageType?: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "SYSTEM" | undefined;
        attachment?: {
            url: string;
            name: string;
            size: number;
        } | undefined;
        attachmentUrl?: string | undefined;
        attachmentName?: string | undefined;
        attachmentSize?: number | undefined;
        replyToId?: string | undefined;
        readReceipts?: {
            userId: string;
            readAt: string;
        }[] | undefined;
    }[];
    conversations: {
        id: string;
        createdAt: string;
        updatedAt: string;
        type: "DIRECT" | "GROUP" | "SESSION" | "SUPPORT";
        messages: {
            id: string;
            createdAt: string;
            content: string;
            senderId: string;
            isDeleted?: boolean | undefined;
            reactions?: {
                userId: string;
                emoji: string;
                count: number;
            }[] | undefined;
            isRead?: boolean | undefined;
            messageType?: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "SYSTEM" | undefined;
            attachment?: {
                url: string;
                name: string;
                size: number;
            } | undefined;
            attachmentUrl?: string | undefined;
            attachmentName?: string | undefined;
            attachmentSize?: number | undefined;
            replyToId?: string | undefined;
            readReceipts?: {
                userId: string;
                readAt: string;
            }[] | undefined;
        }[];
        participants: {
            id: string;
            userId: string;
            conversationId: string;
            joinedAt: string;
            leftAt: string | null;
            role?: "ADMIN" | "MODERATOR" | "MEMBER" | undefined;
            isActive?: boolean | undefined;
        }[];
        isActive?: boolean | undefined;
        title?: string | undefined;
        lastMessageAt?: string | undefined;
    }[];
    totalResults: number;
}>;
export declare const MessageReactionSchema: z.ZodObject<{
    id: z.ZodString;
    messageId: z.ZodString;
    userId: z.ZodString;
    emoji: z.ZodString;
    createdAt: z.ZodString;
    user: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        profileImage: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        firstName: string;
        lastName: string;
        profileImage?: string | undefined;
    }, {
        id: string;
        firstName: string;
        lastName: string;
        profileImage?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    userId: string;
    emoji: string;
    messageId: string;
    user?: {
        id: string;
        firstName: string;
        lastName: string;
        profileImage?: string | undefined;
    } | undefined;
}, {
    id: string;
    createdAt: string;
    userId: string;
    emoji: string;
    messageId: string;
    user?: {
        id: string;
        firstName: string;
        lastName: string;
        profileImage?: string | undefined;
    } | undefined;
}>;
export type UserStatus = z.infer<typeof UserStatusSchema>;
export type MessageStatus = z.infer<typeof MessageStatusSchema>;
export type MessageType = z.infer<typeof MessageTypeSchema>;
export type ConversationType = z.infer<typeof ConversationTypeSchema>;
export type Attachment = z.infer<typeof AttachmentSchema>;
export type Reaction = z.infer<typeof ReactionSchema>;
export type ReadReceipt = z.infer<typeof ReadReceiptSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type BackendMessage = z.infer<typeof BackendMessageSchema>;
export type Contact = z.infer<typeof ContactSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;
export type MessageGroup = z.infer<typeof MessageGroupSchema>;
export type MessagesState = z.infer<typeof MessagesStateSchema>;
export type CreateConversationDto = z.infer<typeof CreateConversationDtoSchema>;
export type SendMessageDto = z.infer<typeof SendMessageDtoSchema>;
export type UpdateMessageDto = z.infer<typeof UpdateMessageDtoSchema>;
export type AddReactionDto = z.infer<typeof AddReactionDtoSchema>;
export type BlockUserDto = z.infer<typeof BlockUserDtoSchema>;
export type SearchMessagesDto = z.infer<typeof SearchMessagesDtoSchema>;
export type JoinConversationDto = z.infer<typeof JoinConversationDtoSchema>;
export type LeaveConversationDto = z.infer<typeof LeaveConversationDtoSchema>;
export type TypingIndicatorDto = z.infer<typeof TypingIndicatorDtoSchema>;
export type ConversationParticipant = z.infer<typeof ConversationParticipantSchema>;
export type BackendConversation = z.infer<typeof BackendConversationSchema>;
export type MessageSearchResult = z.infer<typeof MessageSearchResultSchema>;
export type ConversationListParams = z.infer<typeof ConversationListParamsSchema>;
export type MessageAnalytics = z.infer<typeof MessageAnalyticsSchema>;
export type MessageNotificationPreferences = z.infer<typeof MessageNotificationPreferencesSchema>;
export type MessagesListParams = z.infer<typeof MessagesListParamsSchema>;
export type BlockedUser = z.infer<typeof BlockedUserSchema>;
export type SearchMessagesResponse = z.infer<typeof SearchMessagesResponseSchema>;
export type MessageReaction = z.infer<typeof MessageReactionSchema>;
//# sourceMappingURL=messaging.d.ts.map