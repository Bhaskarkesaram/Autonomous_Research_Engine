"use client";

import { useState, useRef, useEffect } from "react";
import { useStore } from "../../store/useStore";

import {
  MessageSquare,
  Pencil,
  Trash2,
  FolderOpen,
  MoreHorizontal,
} from "lucide-react";

type Props = {
  chat: {
    id: string;
    title: string;
  };
};

export default function ChatItem({
  chat,
}: Props) {
  const {
    setCurrentChat,
    currentChatId,
    renameChat,
    conversations,
    folders,
    assignFolder,
  } = useStore();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [menuPos, setMenuPos] =
    useState({
      x: 0,
      y: 0,
    });

  const [editing, setEditing] =
    useState(false);

  const [newTitle, setNewTitle] =
    useState(chat.title);

  const menuRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const inputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const isActive =
    currentChatId === chat.id;

  useEffect(() => {
    const handler = (
      e: MouseEvent
    ) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          e.target as Node
        )
      ) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      window.addEventListener(
        "click",
        handler
      );
    }

    return () =>
      window.removeEventListener(
        "click",
        handler
      );
  }, [menuOpen]);

  useEffect(() => {
    if (
      editing &&
      inputRef.current
    ) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleContextMenu = (
    e: React.MouseEvent
  ) => {
    e.preventDefault();

    const x = Math.min(
      e.clientX,
      window.innerWidth - 220
    );

    const y = Math.min(
      e.clientY,
      window.innerHeight - 240
    );

    setMenuPos({ x, y });
    setMenuOpen(true);
  };

  const handleDelete = () => {
    const updated =
      conversations.filter(
        (c) => c.id !== chat.id
      );

    useStore.setState({
      conversations: updated,
      currentChatId:
        updated[0]?.id || "",
    });

    setMenuOpen(false);
  };

  const handleRename = () => {
    setEditing(true);
    setMenuOpen(false);
  };

  const handleRenameSubmit =
    () => {
      if (newTitle.trim()) {
        renameChat(
          chat.id,
          newTitle.trim()
        );
      }

      setEditing(false);
    };

  const handleMove = (
    folderId: string
  ) => {
    assignFolder(
      chat.id,
      folderId
    );

    setMenuOpen(false);
  };

  return (
    <>
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData(
            "chatId",
            chat.id
          );
        }}
        onClick={() =>
          setCurrentChat(chat.id)
        }
        onContextMenu={
          handleContextMenu
        }
        className={`
          group
          flex
          items-center
          gap-3
          px-3
          py-3
          rounded-xl
          cursor-pointer
          transition-all
          duration-200

          ${
            isActive
              ? `
                bg-gradient-to-r
                from-blue-600/20
                to-blue-500/10
                border
                border-blue-500/30
                shadow-lg
              `
              : `
                hover:bg-white/5
              `
          }
        `}
      >
        <div
          className={`
          w-8
          h-8
          rounded-lg
          flex
          items-center
          justify-center
          shrink-0

          ${
            isActive
              ? `
                bg-blue-500/20
              `
              : `
                bg-white/5
              `
          }
        `}
        >
          <MessageSquare
            size={15}
          />
        </div>

        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              ref={inputRef}
              value={newTitle}
              onChange={(e) =>
                setNewTitle(
                  e.target.value
                )
              }
              onBlur={
                handleRenameSubmit
              }
              onKeyDown={(e) => {
                if (
                  e.key ===
                  "Enter"
                ) {
                  handleRenameSubmit();
                }
              }}
              className="
                bg-transparent
                outline-none
                text-sm
                w-full
              "
            />
          ) : (
            <div className="truncate text-sm">
              {chat.title}
            </div>
          )}
        </div>

        <MoreHorizontal
          size={16}
          className="
            opacity-0
            group-hover:opacity-100
            transition
            text-zinc-500
          "
        />
      </div>

      {menuOpen && (
        <div
          ref={menuRef}
          style={{
            top: menuPos.y,
            left: menuPos.x,
          }}
          className="
            fixed
            z-50
            w-52
            rounded-2xl
            border
            border-white/10
            bg-zinc-900
            backdrop-blur-xl
            shadow-2xl
            p-2
          "
        >
          <button
            onClick={
              handleRename
            }
            className="
              flex
              items-center
              gap-2
              w-full
              px-3
              py-2
              rounded-lg
              hover:bg-white/5
            "
          >
            <Pencil size={14} />
            Rename
          </button>

          <button
            onClick={
              handleDelete
            }
            className="
              flex
              items-center
              gap-2
              w-full
              px-3
              py-2
              rounded-lg
              hover:bg-red-500/10
              text-red-400
            "
          >
            <Trash2 size={14} />
            Delete
          </button>

          <div className="my-2 border-t border-white/10" />

          <div className="px-3 py-1 text-xs text-zinc-500">
            Move to folder
          </div>

          {folders.length === 0 ? (
            <div className="px-3 py-2 text-xs text-zinc-600">
              No folders
            </div>
          ) : (
            folders.map((f) => (
              <button
                key={f.id}
                onClick={() =>
                  handleMove(
                    f.id
                  )
                }
                className="
                  flex
                  items-center
                  gap-2
                  w-full
                  px-3
                  py-2
                  rounded-lg
                  hover:bg-white/5
                "
              >
                <FolderOpen
                  size={14}
                />
                {f.name}
              </button>
            ))
          )}
        </div>
      )}
    </>
  );
}