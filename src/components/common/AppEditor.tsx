import { useCreateBlockNote } from "@blocknote/react";
// Or, you can use ariakit, shadcn, etc.
import { BlockNoteView } from "@blocknote/mantine";
import { ko } from "@blocknote/core/locales";
// Default styles for the mantine editor
import "@blocknote/mantine/style.css";
// Include the included Inter font
import "@blocknote/core/fonts/inter.css";
import type { Block } from "@blocknote/core";
import { useEffect } from "react";

interface AppEditorProps {
  content?: Block[];
  setContent?: (content: Block[]) => void;
  readonly?: boolean;
}

export function AppEditor({ content, setContent, readonly }: AppEditorProps) {
  const locale = ko;
  // Create a new editor instance
  const editor = useCreateBlockNote({
    dictionary: {
      ...locale,
      placeholders: {
        ...locale.placeholders,
        emptyDocument: "텍스트를 입력하거나 '/'를 눌러 명령어를 실행하세요.",
      },
    },
  });

  useEffect(() => {
    if (content && content.length > 0) {
      const current = JSON.stringify(editor.document);
      const next = JSON.stringify(content);

      // 두 개의 배열이 다르면 업데이트
      if (current !== next) {
        editor.replaceBlocks(editor.document, content);
      }
    }
  }, [content, editor]);
  // Render the editor
  return (
    <BlockNoteView
      editor={editor}
      editable={!readonly}
      lang="ko"
      onChange={() => {
        if (!readonly) {
          setContent?.(editor.document);
        }
      }}
    />
  );
}
