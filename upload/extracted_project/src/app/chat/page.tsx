'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileBox,
  Send,
  Search,
  Plus,
  X,
  Loader2,
  User,
  Reply,
  Play,
  ExternalLink,
  Smile,
  Trash2,
  MoreVertical,
  Copy,
  Image as ImageIcon,
  Video,
  Music,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuthStore, useChatStore } from '@/store';
import { ref, onValue, off, push, set, onDisconnect, get, remove } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import type { Chat, Message, UserProfile, Reaction } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';
import { formatFileSize } from '@/lib/api/catbox';

interface ChatWithUser extends Chat {
  otherUser?: UserProfile;
  unreadCount?: number;
}

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

export default function ChatPage() {
  const { user, isLoading } = useAuthStore();
  const { activeChatId, setActiveChat } = useChatStore();
  const router = useRouter();
  const { toast } = useToast();

  const [chats, setChats] = useState<ChatWithUser[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [previewFile, setPreviewFile] = useState<{
    url: string;
    type: 'image' | 'video' | 'audio';
    name?: string;
  } | null>(null);
  const [showChatList, setShowChatList] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Set up presence
  useEffect(() => {
    if (!user) return;

    const presenceRef = ref(database, `presence/${user.uid}`);
    set(presenceRef, { status: 'online', lastSeen: Date.now() });
    onDisconnect(presenceRef).set({ status: 'offline', lastSeen: Date.now() });

    return () => {
      off(presenceRef);
    };
  }, [user]);

  // Load chats
  useEffect(() => {
    if (!user) return;

    const userInboxRef = ref(database, `userInbox/${user.uid}/chats`);
    const handler = onValue(userInboxRef, async (snapshot) => {
      if (snapshot.exists()) {
        const chatList: ChatWithUser[] = [];
        const chatData = snapshot.val();

        for (const chatId of Object.keys(chatData)) {
          const chatRef = ref(database, `chats/${chatId}`);
          const chatSnapshot = await get(chatRef);

          if (chatSnapshot.exists()) {
            const chat = chatSnapshot.val() as Chat;
            const otherUserId = Object.keys(chat.participants).find((id) => id !== user.uid);

            if (otherUserId) {
              const userRef = ref(database, `users/${otherUserId}`);
              const userSnapshot = await get(userRef);
              const otherUser = userSnapshot.exists() ? userSnapshot.val() as UserProfile : undefined;

              chatList.push({
                ...chat,
                id: chatId,
                otherUser,
                unreadCount: chatData[chatId].unreadCount || 0,
              });
            }
          }
        }

        setChats(chatList.sort((a, b) => (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0)));
      } else {
        setChats([]);
      }
    });

    return () => off(userInboxRef, 'value', handler);
  }, [user]);

  // Load messages for active chat
  useEffect(() => {
    if (!user || !activeChatId) {
      setMessages([]);
      return;
    }

    const messagesRef = ref(database, `chats/${activeChatId}/messages`);
    const handler = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const messagesData = Object.values(snapshot.val()) as Message[];
        const visibleMessages = messagesData.filter(msg => 
          !msg.deletedForEveryone && !msg.deletedFor?.[user.uid]
        );
        setMessages(visibleMessages.sort((a, b) => a.timestamp - b.timestamp));
      } else {
        setMessages([]);
      }
    });

    const chatInboxRef = ref(database, `userInbox/${user.uid}/chats/${activeChatId}/unreadCount`);
    set(chatInboxRef, 0);

    return () => off(messagesRef, 'value', handler);
  }, [user, activeChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Responsive: hide chat list when a chat is selected on mobile
  useEffect(() => {
    if (activeChatId && window.innerWidth < 768) {
      setShowChatList(false);
    }
  }, [activeChatId]);

  const searchUsers = async (query: string) => {
    if (!query.trim() || !user) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/user/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data.users || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const startNewChat = async (otherUser: UserProfile) => {
    if (!user) return;

    const existingChat = chats.find((c) => c.otherUser?.uid === otherUser.uid);
    if (existingChat) {
      setActiveChat(existingChat.id || '');
      setShowNewChat(false);
      return;
    }

    const chatId = uuidv4();
    const chatData: Chat = {
      id: chatId,
      participants: {
        [user.uid]: true,
        [otherUser.uid]: true,
      },
      createdAt: Date.now(),
    };

    await set(ref(database, `chats/${chatId}`), chatData);

    await set(ref(database, `userInbox/${user.uid}/chats/${chatId}`), {
      unreadCount: 0,
      updatedAt: Date.now(),
    });
    await set(ref(database, `userInbox/${otherUser.uid}/chats/${chatId}`), {
      unreadCount: 0,
      updatedAt: Date.now(),
    });

    setActiveChat(chatId);
    setShowNewChat(false);
  };

  const sendMessage = async () => {
    if (!user || !activeChatId || !newMessage.trim()) return;

    const messageId = uuidv4();
    const messageData: Message = {
      id: messageId,
      senderId: user.uid,
      text: newMessage.trim(),
      timestamp: Date.now(),
      type: 'text',
      readBy: { [user.uid]: Date.now() },
      replyTo: replyingTo?.id,
    };

    await set(ref(database, `chats/${activeChatId}/messages/${messageId}`), messageData);

    const activeChat = chats.find((c) => c.id === activeChatId);
    if (activeChat) {
      const lastMessageData = {
        text: newMessage.trim(),
        senderId: user.uid,
        timestamp: Date.now(),
        type: 'text',
      };

      await set(ref(database, `chats/${activeChatId}/lastMessage`), lastMessageData);

      for (const participantId of Object.keys(activeChat.participants)) {
        const inboxRef = ref(database, `userInbox/${participantId}/chats/${activeChatId}`);
        const inboxSnapshot = await get(inboxRef);
        const currentUnread = inboxSnapshot.exists() ? inboxSnapshot.val().unreadCount || 0 : 0;

        await set(inboxRef, {
          lastMessage: lastMessageData,
          unreadCount: participantId === user.uid ? 0 : currentUnread + 1,
          updatedAt: Date.now(),
        });
      }
    }

    setNewMessage('');
    setReplyingTo(null);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !activeChatId) return;

    let messageType: 'image' | 'video' | 'audio' = 'image';
    if (file.type.startsWith('video/')) messageType = 'video';
    else if (file.type.startsWith('audio/')) messageType = 'audio';

    const maxSize = messageType === 'video' ? 100 : messageType === 'audio' ? 30 : 12;
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: `Maximum size for ${messageType} is ${maxSize}MB.`,
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/catbox', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      const mediaUrl = result.data;

      const messageId = uuidv4();
      const messageData: Message = {
        id: messageId,
        senderId: user.uid,
        timestamp: Date.now(),
        type: messageType,
        mediaUrl,
        mediaSize: file.size,
        mediaName: file.name,
        readBy: { [user.uid]: Date.now() },
        replyTo: replyingTo?.id,
      };

      await set(ref(database, `chats/${activeChatId}/messages/${messageId}`), messageData);

      const activeChat = chats.find((c) => c.id === activeChatId);
      if (activeChat) {
        const lastMessageData = {
          text: `Sent a ${messageType}`,
          senderId: user.uid,
          timestamp: Date.now(),
          type: messageType,
          mediaUrl,
        };

        await set(ref(database, `chats/${activeChatId}/lastMessage`), lastMessageData);

        for (const participantId of Object.keys(activeChat.participants)) {
          const inboxRef = ref(database, `userInbox/${participantId}/chats/${activeChatId}`);
          const inboxSnapshot = await get(inboxRef);
          const currentUnread = inboxSnapshot.exists() ? inboxSnapshot.val().unreadCount || 0 : 0;

          await set(inboxRef, {
            lastMessage: lastMessageData,
            unreadCount: participantId === user.uid ? 0 : currentUnread + 1,
            updatedAt: Date.now(),
          });
        }
      }

      toast({
        title: 'Media sent',
        description: 'Your file has been sent successfully.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: error.message || 'Failed to upload file.',
      });
    } finally {
      setIsUploading(false);
      setReplyingTo(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const addReaction = async (msg: Message, emoji: string) => {
    if (!user || !activeChatId) return;

    const reactionId = uuidv4();
    const reactionData: Reaction = {
      emoji,
      userId: user.uid,
      timestamp: Date.now(),
    };

    const reactionsRef = ref(database, `chats/${activeChatId}/messages/${msg.id}/reactions/${reactionId}`);
    await set(reactionsRef, reactionData);
  };

  const removeReaction = async (msg: Message, reactionId: string) => {
    if (!user || !activeChatId) return;

    const reactionRef = ref(database, `chats/${activeChatId}/messages/${msg.id}/reactions/${reactionId}`);
    await remove(reactionRef);
  };

  const handleReactionClick = async (msg: Message, emoji: string) => {
    if (!user) return;

    const existingReaction = Object.entries(msg.reactions || {}).find(
      ([_, r]) => r.emoji === emoji && r.userId === user.uid
    );

    if (existingReaction) {
      await removeReaction(msg, existingReaction[0]);
    } else {
      await addReaction(msg, emoji);
    }
  };

  const deleteForMe = async (msg: Message) => {
    if (!user || !activeChatId) return;

    const messageRef = ref(database, `chats/${activeChatId}/messages/${msg.id}/deletedFor/${user.uid}`);
    await set(messageRef, true);
    toast({ title: 'Message deleted for you' });
  };

  const deleteForEveryone = async (msg: Message) => {
    if (!user || !activeChatId) return;

    if (msg.senderId !== user.uid) {
      toast({
        variant: 'destructive',
        title: 'Cannot delete',
        description: 'Only the sender can delete for everyone.',
      });
      return;
    }

    const messageRef = ref(database, `chats/${activeChatId}/messages/${msg.id}/deletedForEveryone`);
    await set(messageRef, true);
    toast({ title: 'Message deleted for everyone' });
  };

  const copyMessage = (msg: Message) => {
    if (msg.text) {
      navigator.clipboard.writeText(msg.text);
      toast({ title: 'Message copied' });
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMediaMessage = (msg: Message) => {
    if (!msg.mediaUrl) return null;

    const handleClick = () => {
      setPreviewFile({
        url: msg.mediaUrl,
        type: msg.type as 'image' | 'video' | 'audio',
        name: msg.mediaName,
      });
    };

    const getIcon = () => {
      switch (msg.type) {
        case 'image': return <ImageIcon className="h-5 w-5" />;
        case 'video': return <Video className="h-5 w-5" />;
        case 'audio': return <Music className="h-5 w-5" />;
        default: return null;
      }
    };

    switch (msg.type) {
      case 'image':
        return (
          <div 
            className="relative group cursor-pointer rounded-xl overflow-hidden max-w-[240px] sm:max-w-xs"
            onClick={handleClick}
          >
            <img
              src={msg.mediaUrl}
              alt={msg.mediaName || 'Image'}
              className="rounded-xl max-w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <ExternalLink className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        );
      case 'video':
        return (
          <div 
            className="relative cursor-pointer rounded-xl overflow-hidden bg-black/10 max-w-[240px] sm:max-w-xs"
            onClick={handleClick}
          >
            <video
              src={msg.mediaUrl}
              className="rounded-xl max-w-full max-h-40"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors">
              <Play className="h-10 w-10 text-white fill-white" />
            </div>
          </div>
        );
      case 'audio':
        return (
          <div 
            className="cursor-pointer rounded-xl p-3 bg-gradient-to-br from-violet-500/10 to-purple-500/10 hover:from-violet-500/20 hover:to-purple-500/20 transition-all max-w-[240px] sm:max-w-xs"
            onClick={handleClick}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center shrink-0">
                <Music className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{msg.mediaName || 'Audio'}</p>
                {msg.mediaSize && (
                  <p className="text-xs text-muted-foreground">{formatFileSize(msg.mediaSize)}</p>
                )}
              </div>
              <Play className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getReplyMessage = (replyId?: string) => {
    if (!replyId) return null;
    return messages.find((m) => m.id === replyId);
  };

  const getMessageReactions = (msg: Message) => {
    if (!msg.reactions) return [];
    const grouped: Record<string, { count: number; reacted: boolean; reactionIds: string[] }> = {};
    
    Object.entries(msg.reactions).forEach(([id, reaction]) => {
      if (!grouped[reaction.emoji]) {
        grouped[reaction.emoji] = { count: 0, reacted: false, reactionIds: [] };
      }
      grouped[reaction.emoji].count++;
      grouped[reaction.emoji].reactionIds.push(id);
      if (reaction.userId === user?.uid) {
        grouped[reaction.emoji].reacted = true;
      }
    });
    
    return Object.entries(grouped).map(([emoji, data]) => ({
      emoji,
      ...data,
    }));
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <FileBox className="h-12 w-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <MainLayout hideSidebar hideFooter>
      <div className="flex h-[calc(100vh-64px)]">
        {/* Chat List - Hidden on mobile when chat is active */}
        <div className={`w-full md:w-80 border-r flex flex-col glass shrink-0 ${
          !showChatList ? 'hidden md:flex' : 'flex'
        }`}>
          <div className="p-4 border-b bg-background/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Messages</h2>
              <Button size="icon" onClick={() => setShowNewChat(true)} className="rounded-full">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchUsers(e.target.value);
                }}
                className="pl-10 input-glow"
              />
            </div>
          </div>

          <ScrollArea className="flex-1 custom-scrollbar">
            <div className="p-2">
              {chats.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground px-4">
                  <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                    <User className="h-8 w-8" />
                  </div>
                  <p className="font-medium">No conversations yet</p>
                  <p className="text-sm mt-1 mb-4">Start chatting with someone</p>
                  <Button variant="outline" onClick={() => setShowNewChat(true)} className="rounded-full">
                    <Plus className="h-4 w-4 mr-2" />
                    New Chat
                  </Button>
                </div>
              ) : (
                chats.map((chat) => (
                  <motion.button
                    key={chat.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      setActiveChat(chat.id || '');
                      setShowChatList(false);
                    }}
                    className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                      activeChatId === chat.id 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Avatar className="h-12 w-12 shrink-0 ring-2 ring-background">
                      <AvatarImage src={chat.otherUser?.photoURL} />
                      <AvatarFallback className="gradient-primary text-white">
                        {chat.otherUser?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">
                          {chat.otherUser?.displayName || 'Unknown'}
                        </p>
                        {chat.lastMessage && (
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatTime(chat.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-sm text-muted-foreground truncate">
                          {chat.lastMessage?.type !== 'text'
                            ? `📎 ${chat.lastMessage?.type}`
                            : chat.lastMessage?.text || 'No messages'}
                        </p>
                        {chat.unreadCount && chat.unreadCount > 0 && (
                          <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full shrink-0">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col min-w-0 ${
          showChatList ? 'hidden md:flex' : 'flex'
        }`}>
          {activeChatId ? (
            <>
              {/* Chat Header */}
              <div className="p-3 sm:p-4 border-b glass flex items-center gap-3 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden shrink-0"
                  onClick={() => setShowChatList(true)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={chats.find((c) => c.id === activeChatId)?.otherUser?.photoURL} />
                  <AvatarFallback className="gradient-primary text-white">
                    {chats.find((c) => c.id === activeChatId)?.otherUser?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">
                    {chats.find((c) => c.id === activeChatId)?.otherUser?.displayName || 'Unknown'}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    @{chats.find((c) => c.id === activeChatId)?.otherUser?.username}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-3 sm:p-4">
                <div className="space-y-2 max-w-3xl mx-auto">
                  {messages.map((msg) => {
                    const isMine = msg.senderId === user.uid;
                    const replyMsg = getReplyMessage(msg.replyTo);
                    const reactions = getMessageReactions(msg);

                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'} group`}
                      >
                        <div className={`max-w-[85%] sm:max-w-[75%] ${isMine ? 'order-2' : 'order-1'}`}>
                          {/* Reply indicator */}
                          {replyMsg && (
                            <div
                              className={`mb-1 px-3 py-1.5 rounded-t-xl border-l-2 border-primary bg-muted/50 text-xs ${
                                isMine ? 'mr-2' : 'ml-2'
                              }`}
                            >
                              <p className="text-muted-foreground truncate">
                                {replyMsg.type === 'text'
                                  ? replyMsg.text?.slice(0, 50)
                                  : `📎 ${replyMsg.type}`}
                                {replyMsg.text && replyMsg.text.length > 50 ? '...' : ''}
                              </p>
                            </div>
                          )}

                          <div className="flex items-end gap-1">
                            {/* Reaction button */}
                            <Popover>
                              <PopoverTrigger asChild>
                                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-muted shrink-0">
                                  <Smile className="h-4 w-4 text-muted-foreground" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-2" align="start">
                                <div className="flex gap-1">
                                  {REACTION_EMOJIS.map((emoji) => (
                                    <button
                                      key={emoji}
                                      onClick={() => handleReactionClick(msg, emoji)}
                                      className="p-1.5 hover:bg-muted rounded-lg text-xl transition-transform hover:scale-125"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              </PopoverContent>
                            </Popover>

                            <div
                              className={`px-3 sm:px-4 py-2 rounded-2xl relative ${
                                isMine
                                  ? 'gradient-primary text-white rounded-br-md'
                                  : 'bg-muted rounded-bl-md'
                              }`}
                            >
                              {msg.type === 'text' && <p className="whitespace-pre-wrap break-words">{msg.text}</p>}
                              {msg.type !== 'text' && renderMediaMessage(msg)}
                              
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs opacity-70">
                                  {formatTime(msg.timestamp)}
                                </p>
                                {isMine && (
                                  <Check className="h-3 w-3 opacity-70" />
                                )}
                              </div>
                            </div>

                            {/* More options */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-muted shrink-0">
                                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="glass">
                                <DropdownMenuItem onClick={() => setReplyingTo(msg)}>
                                  <Reply className="mr-2 h-4 w-4" />
                                  Reply
                                </DropdownMenuItem>
                                {msg.type === 'text' && (
                                  <DropdownMenuItem onClick={() => copyMessage(msg)}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copy
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => deleteForMe(msg)} className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete for me
                                </DropdownMenuItem>
                                {isMine && (
                                  <DropdownMenuItem onClick={() => deleteForEveryone(msg)} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete for everyone
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Reactions display */}
                          {reactions.length > 0 && (
                            <div className={`flex gap-1 mt-1 ${isMine ? 'justify-end mr-6' : 'ml-6'}`}>
                              {reactions.map(({ emoji, count, reacted }) => (
                                <button
                                  key={emoji}
                                  onClick={() => handleReactionClick(msg, emoji)}
                                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${
                                    reacted
                                      ? 'bg-primary/10 border-primary'
                                      : 'bg-muted border-transparent'
                                  } hover:scale-110 transition-transform`}
                                >
                                  <span>{emoji}</span>
                                  <span>{count}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Reply Preview */}
              {replyingTo && (
                <div className="px-3 sm:px-4 py-2 glass border-t flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Replying to</p>
                    <p className="text-sm truncate">
                      {replyingTo.type === 'text'
                        ? replyingTo.text
                        : `📎 ${replyingTo.type}`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-8 w-8"
                    onClick={() => setReplyingTo(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Message Input */}
              <div className="p-3 sm:p-4 border-t glass shrink-0">
                <div className="flex items-center gap-2 max-w-3xl mx-auto">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*,audio/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleFileSelect}
                    disabled={isUploading}
                    className="shrink-0 rounded-full"
                  >
                    {isUploading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Plus className="h-5 w-5" />
                    )}
                  </Button>
                  <Input
                    ref={messageInputRef}
                    placeholder={replyingTo ? 'Write a reply...' : 'Type a message...'}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    className="flex-1 input-glow"
                    disabled={isUploading}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || isUploading}
                    className="shrink-0 rounded-full btn-gradient"
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  📎 Images (12MB) • Videos (100MB) • Audio (30MB)
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground p-4">
              <div className="text-center">
                <div className="h-20 w-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                  <User className="h-10 w-10" />
                </div>
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm mt-1">or start a new one</p>
                <Button variant="outline" onClick={() => setShowNewChat(true)} className="mt-4 rounded-full">
                  <Plus className="h-4 w-4 mr-2" />
                  New Chat
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Dialog */}
      <AnimatePresence>
        {showNewChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewChat(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-2xl p-6 w-full max-w-md shadow-2xl border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">New Conversation</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowNewChat(false)} className="rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    searchUsers(e.target.value);
                  }}
                  className="pl-10 input-glow"
                />
              </div>
              <ScrollArea className="max-h-64 custom-scrollbar">
                <div className="space-y-1">
                  {searchResults.map((result) => (
                    <motion.button
                      key={result.uid}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => startNewChat(result)}
                      className="w-full p-3 rounded-xl flex items-center gap-3 hover:bg-muted transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={result.photoURL} />
                        <AvatarFallback className="gradient-primary text-white">
                          {result.displayName?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="font-medium">{result.displayName}</p>
                        <p className="text-sm text-muted-foreground">@{result.username}</p>
                      </div>
                    </motion.button>
                  ))}
                  {searchQuery && searchResults.length === 0 && !isSearching && (
                    <p className="text-center text-muted-foreground py-8">No users found</p>
                  )}
                </div>
              </ScrollArea>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Preview Modal */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden glass">
          <DialogHeader>
            <DialogTitle className="truncate pr-8">
              {previewFile?.name || 'Preview'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center overflow-auto">
            {previewFile?.type === 'image' && (
              <img
                src={previewFile.url}
                alt="Preview"
                className="max-w-full max-h-[70vh] object-contain rounded-xl"
              />
            )}
            {previewFile?.type === 'video' && (
              <video
                src={previewFile.url}
                controls
                autoPlay
                className="max-w-full max-h-[70vh] rounded-xl"
              />
            )}
            {previewFile?.type === 'audio' && (
              <div className="w-full max-w-md p-8 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-2xl">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-24 w-24 rounded-full gradient-primary flex items-center justify-center">
                    <Music className="h-12 w-12 text-white" />
                  </div>
                  <audio
                    src={previewFile.url}
                    controls
                    autoPlay
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(previewFile?.url || '');
                toast({ title: 'Link copied!' });
              }}
              className="rounded-full"
            >
              Copy Link
            </Button>
            <Button asChild className="rounded-full btn-gradient">
              <a href={previewFile?.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Full
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
