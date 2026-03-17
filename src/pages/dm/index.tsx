import { useDmMessages, useDmRooms, useGetOrCreateRoom, useSendMessage } from "@/hooks/useDm";
import { useAuthStore } from "@/stores";
import { cn } from "@/lib/utils";
import { dmApi } from "@/api/dm";
import type { DmRoom } from "@/api/dm";
import { File as FileIcon, Image, MessageSquare, Paperclip, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.locale("ko");

export default function DmPage() {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeRoomId, setActiveRoomId] = useState<string | null>(searchParams.get("room"));
  const [inputText, setInputText] = useState("");
  const [previewFile, setPreviewFile] = useState<{ file: File; url: string; type: "image" | "file" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const getOrCreate = useGetOrCreateRoom();

  const { data: rooms = [] } = useDmRooms();
  const { data: messages = [] } = useDmMessages(activeRoomId);
  const sendMessage = useSendMessage(activeRoomId);

  const activeRoom = rooms.find((r) => r.id === activeRoomId);

  // URL 파라미터로 상대방 지정 시 방 자동 생성
  useEffect(() => {
    const targetUserId = searchParams.get("user");
    if (targetUserId && user?.id) {
      getOrCreate.mutate(targetUserId, {
        onSuccess: (roomId) => {
          setActiveRoomId(roomId);
          setSearchParams({ room: roomId });
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 새 메시지 오면 채팅 컨테이너 내부 스크롤 최하단으로
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const handleSelectRoom = (room: DmRoom) => {
    setActiveRoomId(room.id);
    setSearchParams({ room: room.id });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "file") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewFile({ file, url, type });
    e.target.value = "";
  };

  const handleSend = async () => {
    if (!activeRoomId) return;
    if (!inputText.trim() && !previewFile) return;

    if (previewFile) {
      const { url, type } = await dmApi.uploadFile(previewFile.file);
      sendMessage.mutate({ content: inputText.trim() || undefined, file_url: url, file_type: type });
      URL.revokeObjectURL(previewFile.url);
      setPreviewFile(null);
    } else {
      sendMessage.mutate({ content: inputText.trim() });
    }
    setInputText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-60px)] overflow-hidden rounded-xl border border-white/10 bg-[#111]">
      {/* ── 왼쪽: 채팅 목록 ── */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-white/10">
        <div className="border-b border-white/10 px-4 py-4">
          <h2 className="text-sm font-semibold text-white">다이렉트 메시지</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {rooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-white/30">
              <MessageSquare className="h-8 w-8" />
              <p className="text-xs">대화가 없습니다</p>
            </div>
          ) : (
            rooms.map((room) => {
              const other = room.other_user;
              const isActive = room.id === activeRoomId;
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => handleSelectRoom(room)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/5",
                    isActive && "bg-white/8",
                  )}
                >
                  {other?.profile_image ? (
                    <img src={other.profile_image} alt="" className="h-9 w-9 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs text-white/60">
                      {other?.nickname?.charAt(0) ?? "?"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white/90">{other?.nickname ?? "알 수 없음"}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ── 오른쪽: 대화창 ── */}
      {activeRoomId && activeRoom ? (
        <div className="flex flex-1 flex-col min-w-0">
          {/* 헤더 */}
          <div className="flex items-center gap-3 border-b border-white/10 px-5 py-3.5">
            {activeRoom.other_user?.profile_image ? (
              <img src={activeRoom.other_user.profile_image} alt="" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs text-white/60">
                {activeRoom.other_user?.nickname?.charAt(0) ?? "?"}
              </div>
            )}
            <span className="text-sm font-semibold text-white">{activeRoom.other_user?.nickname}</span>
          </div>

          {/* 메시지 목록 */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {messages.map((msg) => {
              const isMine = msg.sender_id === user?.id;
              return (
                <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[70%] space-y-1", isMine ? "items-end" : "items-start")}>
                    {/* 파일/이미지 */}
                    {msg.file_url && msg.file_type === "image" && (
                      <img src={msg.file_url} alt="이미지" className="max-h-60 w-auto rounded-xl object-cover" />
                    )}
                    {msg.file_url && msg.file_type === "file" && (
                      <a
                        href={msg.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(
                          "flex items-center gap-2 rounded-xl px-3 py-2 text-xs underline",
                          isMine ? "bg-indigo-600/80 text-white" : "bg-white/10 text-white/80",
                        )}
                      >
                        <FileIcon className="h-4 w-4 shrink-0" />
                        파일 다운로드
                      </a>
                    )}
                    {/* 텍스트 */}
                    {msg.content && (
                      <div
                        className={cn(
                          "rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                          isMine ? "rounded-tr-sm bg-indigo-600 text-white" : "rounded-tl-sm bg-white/10 text-white/90",
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>
                    )}
                    <p className="text-[10px] text-white/30 px-1">{dayjs(msg.created_at).fromNow()}</p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* 파일 미리보기 */}
          {previewFile && (
            <div className="mx-5 mb-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              {previewFile.type === "image" ? (
                <img src={previewFile.url} alt="" className="h-12 w-12 rounded-lg object-cover" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
                  <FileIcon className="h-5 w-5 text-white/60" />
                </div>
              )}
              <span className="flex-1 truncate text-xs text-white/60">{previewFile.file.name}</span>
              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(previewFile.url);
                  setPreviewFile(null);
                }}
                className="text-white/40 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* 입력창 */}
          <div className="border-t border-white/10 px-5 py-4">
            <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              {/* 이미지 업로드 */}
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="mb-1 text-white/40 transition hover:text-white/80"
                title="이미지 첨부"
              >
                <Image className="h-5 w-5" />
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e, "image")}
              />

              {/* 파일 업로드 */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mb-1 text-white/40 transition hover:text-white/80"
                title="파일 첨부"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => handleFileSelect(e, "file")} />

              <textarea
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="메시지 보내기 (Enter 전송, Shift+Enter 줄바꿈)"
                className="flex-1 resize-none bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
                style={{ maxHeight: "120px" }}
              />

              <button
                type="button"
                onClick={handleSend}
                disabled={sendMessage.isPending || (!inputText.trim() && !previewFile)}
                className="mb-1 text-indigo-400 transition hover:text-indigo-300 disabled:opacity-30"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-white/20">
          <MessageSquare className="h-12 w-12" />
          <p className="text-sm">대화를 선택하거나 프로필에서 DM을 시작하세요</p>
        </div>
      )}
    </div>
  );
}
