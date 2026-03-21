import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useIspMembership } from '@/hooks/useIspMembership';
import { useQueryClient } from '@tanstack/react-query';
import type { Json } from '@/integrations/supabase/types';

export interface ConversationItem {
  id: string;
  user_phone: string;
  user_identifier: string | null;
  mode: string;
  handover_at: string | null;
  handover_reason: string | null;
  handover_summary: string | null;
  assigned_agent_id: string | null;
  collected_context: Json | null;
  resolved_at: string | null;
  tenant_agent_id: string;
  last_message?: string;
  last_message_at?: string;
  unread?: boolean;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: string;
  content: string | null;
  created_at: string | null;
  sent_by_agent_id: string | null;
  tool_name: string | null;
}

export interface HumanAgent {
  id: string;
  user_id: string;
  display_name: string;
  is_available: boolean | null;
  current_chat_count: number | null;
  max_concurrent_chats: number | null;
  isp_id: string;
}

export interface QuickReply {
  id: string;
  text: string;
  category: string | null;
}

export function useLiveSupport() {
  const { user } = useAuth();
  const { membership } = useIspMembership();
  const queryClient = useQueryClient();

  const [myAgent, setMyAgent] = useState<HumanAgent | null>(null);
  const [waitingQueue, setWaitingQueue] = useState<ConversationItem[]>([]);
  const [myConversations, setMyConversations] = useState<ConversationItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [onlineAgents, setOnlineAgents] = useState<HumanAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);

  const ispId = membership?.ispId;

  // Fetch agent record for current user
  useEffect(() => {
    if (!user?.id || !ispId) return;

    const fetchAgent = async () => {
      const { data } = await supabase
        .from('human_agents')
        .select('*')
        .eq('user_id', user.id)
        .eq('isp_id', ispId)
        .maybeSingle();

      setMyAgent(data as HumanAgent | null);
    };

    fetchAgent();
  }, [user?.id, ispId]);

  // Toggle availability
  const toggleAvailability = useCallback(async () => {
    if (!myAgent) return;
    const newValue = !myAgent.is_available;
    await supabase
      .from('human_agents')
      .update({ is_available: newValue, last_seen_at: new Date().toISOString() })
      .eq('id', myAgent.id);
    setMyAgent((prev) => (prev ? { ...prev, is_available: newValue } : null));
  }, [myAgent]);

  // Fetch conversation queues
  const fetchQueues = useCallback(async () => {
    if (!ispId) return;

    const { data: convs } = await supabase
      .from('conversations')
      .select('*')
      .eq('isp_id', ispId)
      .eq('mode', 'human')
      .is('resolved_at', null)
      .order('handover_at', { ascending: true });

    if (!convs) return;

    const waiting: ConversationItem[] = [];
    const mine: ConversationItem[] = [];

    for (const c of convs) {
      const item: ConversationItem = {
        id: c.id,
        user_phone: c.user_phone,
        user_identifier: c.user_identifier,
        mode: c.mode,
        handover_at: c.handover_at,
        handover_reason: c.handover_reason,
        handover_summary: c.handover_summary,
        assigned_agent_id: c.assigned_agent_id,
        collected_context: c.collected_context,
        resolved_at: c.resolved_at,
        tenant_agent_id: c.tenant_agent_id,
      };

      if (!c.assigned_agent_id) {
        waiting.push(item);
      } else if (myAgent && c.assigned_agent_id === myAgent.id) {
        mine.push(item);
      }
    }

    // Fetch last message for each conversation
    const allConvIds = [...waiting, ...mine].map((c) => c.id);
    if (allConvIds.length > 0) {
      for (const conv of [...waiting, ...mine]) {
        const { data: lastMsg } = await supabase
          .from('messages')
          .select('content, created_at')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (lastMsg) {
          conv.last_message = lastMsg.content || '';
          conv.last_message_at = lastMsg.created_at || '';
        }
      }
    }

    setWaitingQueue(waiting);
    setMyConversations(mine);
    setLoading(false);
  }, [ispId, myAgent]);

  useEffect(() => {
    fetchQueues();
  }, [fetchQueues]);

  // Realtime: conversations changes
  useEffect(() => {
    if (!ispId) return;

    const channel = supabase
      .channel(`live-support-convs-${ispId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `isp_id=eq.${ispId}`,
        },
        (payload) => {
          // Refetch queues on any change
          fetchQueues();

          // Play sound for new human conversations
          if (
            payload.eventType === 'UPDATE' &&
            (payload.new as any).mode === 'human' &&
            (payload.old as any)?.mode !== 'human'
          ) {
            playNotificationSound();
            showBrowserNotification('Novo atendimento', 'Uma conversa foi escalada para atendimento humano.');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ispId, fetchQueues]);

  // Fetch messages for active conversation
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('id, conversation_id, role, content, created_at, sent_by_agent_id, tool_name')
        .eq('conversation_id', activeConversationId)
        .order('created_at', { ascending: true });

      setMessages((data as Message[]) || []);
    };

    fetchMessages();
  }, [activeConversationId]);

  // Realtime: messages for active conversation
  useEffect(() => {
    if (!activeConversationId) return;

    const channel = supabase
      .channel(`live-support-msgs-${activeConversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${activeConversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversationId]);

  // Fetch quick replies
  useEffect(() => {
    if (!ispId) return;

    const fetchReplies = async () => {
      const { data } = await supabase
        .from('quick_replies')
        .select('id, text, category')
        .or(`isp_id.eq.${ispId},isp_id.is.null`)
        .order('sort_order', { ascending: true });

      setQuickReplies((data as QuickReply[]) || []);
    };

    fetchReplies();
  }, [ispId]);

  // Fetch online agents
  useEffect(() => {
    if (!ispId) return;

    const fetchAgents = async () => {
      const { data } = await supabase
        .from('human_agents')
        .select('*')
        .eq('isp_id', ispId)
        .eq('is_available', true);

      setOnlineAgents((data as HumanAgent[]) || []);
    };

    fetchAgents();
    const interval = setInterval(fetchAgents, 30000);
    return () => clearInterval(interval);
  }, [ispId]);

  // Claim conversation
  const claimConversation = useCallback(
    async (conversationId: string) => {
      if (!myAgent) return;

      const { error } = await supabase
        .from('conversations')
        .update({ assigned_agent_id: myAgent.id })
        .eq('id', conversationId)
        .is('assigned_agent_id', null);

      if (!error) {
        setActiveConversationId(conversationId);
        fetchQueues();
      }
    },
    [myAgent, fetchQueues]
  );

  // Send message
  const sendMessage = useCallback(
    async (text: string) => {
      if (!activeConversationId || !text.trim() || sending) return;

      setSending(true);

      // Optimistic insert
      const optimisticMsg: Message = {
        id: `temp-${Date.now()}`,
        conversation_id: activeConversationId,
        role: 'agent',
        content: text,
        created_at: new Date().toISOString(),
        sent_by_agent_id: myAgent?.id || null,
        tool_name: null,
      };
      setMessages((prev) => [...prev, optimisticMsg]);

      try {
        await supabase.functions.invoke('send-human-reply', {
          body: { conversation_id: activeConversationId, message: text },
        });
      } catch (err) {
        console.error('Failed to send message:', err);
      } finally {
        setSending(false);
      }
    },
    [activeConversationId, myAgent, sending]
  );

  // Return to bot
  const returnToBot = useCallback(async () => {
    if (!activeConversationId) return;

    await supabase
      .from('conversations')
      .update({
        mode: 'bot',
        assigned_agent_id: null,
      })
      .eq('id', activeConversationId);

    setActiveConversationId(null);
    fetchQueues();
  }, [activeConversationId, fetchQueues]);

  // Resolve
  const resolveConversation = useCallback(async () => {
    if (!activeConversationId) return;

    await supabase
      .from('conversations')
      .update({
        resolved_at: new Date().toISOString(),
        resolved_by: 'human',
      })
      .eq('id', activeConversationId);

    setActiveConversationId(null);
    fetchQueues();
  }, [activeConversationId, fetchQueues]);

  // Transfer
  const transferConversation = useCallback(
    async (targetAgentId: string) => {
      if (!activeConversationId) return;

      await supabase
        .from('conversations')
        .update({ assigned_agent_id: targetAgentId })
        .eq('id', activeConversationId);

      setActiveConversationId(null);
      fetchQueues();
    },
    [activeConversationId, fetchQueues]
  );

  // Notification helpers
  function playNotificationSound() {
    try {
      if (!notificationSoundRef.current) {
        const audio = new Audio(
          'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdWqbl5ePi4yYn5+dmJqWl5+foJ2cnJmamZyanJ2dn5+cn52dnJuanJ2enZ2cnJybnJydn5+fn5+fn5+goKCgoKCgoJ+fn5+fn5+fn5+fn5+fn5+fn5+goKCgoKChoaGhoaGhoaGhoaGioqKioqKioqKio6Ojo6Ojo6OjoqKioqKioqKhoaGhoaGhoaChoaGhoaGhoaGhoaGhoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoQ=='
        );
        notificationSoundRef.current = audio;
      }
      notificationSoundRef.current.play().catch(() => {});
    } catch (_) {}
  }

  function showBrowserNotification(title: string, body: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/placeholder.svg' });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }

  // Get active conversation data
  const activeConversation = [...waitingQueue, ...myConversations].find(
    (c) => c.id === activeConversationId
  );

  return {
    myAgent,
    waitingQueue,
    myConversations,
    activeConversationId,
    activeConversation,
    messages,
    quickReplies,
    onlineAgents,
    loading,
    sending,
    setActiveConversationId,
    toggleAvailability,
    claimConversation,
    sendMessage,
    returnToBot,
    resolveConversation,
    transferConversation,
  };
}
