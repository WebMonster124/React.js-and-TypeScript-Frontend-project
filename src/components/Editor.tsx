import React, { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { editor } from 'monaco-editor/esm/vs/editor/editor.api';

export type CodeEditor = editor.IStandaloneCodeEditor;

const options: editor.IStandaloneEditorConstructionOptions = {
  selectOnLineNumbers: true,
  fontSize: 14,
  automaticLayout: true,
};

interface Props {
  value: string;
  language: 'text' | 'css' | 'json' | 'javascript';
  options?: editor.IStandaloneEditorConstructionOptions;
  className?: string;
  onChange?(value: string): void;
  editorDidMount?(editor: CodeEditor): void;
}

const Editor: React.FC<Props> = (props) => {
  const [editor, setEditor] = useState<CodeEditor | undefined>();

  const onMount = (editor: CodeEditor) => {
    setEditor(editor);
    if (props.editorDidMount) props.editorDidMount(editor);
  };

  useEffect(() => {
    if (editor) {
      const handle = setTimeout(() => {
        editor.getAction('editor.action.formatDocument')?.run();
        editor.focus();
        editor.setPosition({ column: 0, lineNumber: 0 });
        // TODO check this setTimeout
      }, 1000);
      return () => clearTimeout(handle);
    }
  }, [editor]);

  return (
    <div className={props.className} style={{ overflowX: 'hidden' }}>
      <MonacoEditor
        height="500px"
        theme="vs-dark"
        value={props.value}
        language={props.language}
        onChange={props.onChange}
        onMount={onMount}
        options={{ ...options, ...props.options }}
      />
    </div>
  );
};

export default Editor;
