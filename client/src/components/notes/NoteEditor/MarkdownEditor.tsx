import { useState } from 'react';
import { Box, Textarea, Paper, SegmentedControl, Stack } from '@mantine/core';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  maxRows?: number;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = '마크다운 형식으로 작성하세요...',
  minRows = 10,
  maxRows = 30,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<'edit' | 'preview' | 'split'>('edit');

  return (
    <Stack gap="md">
      {/* Mode Selector */}
      <SegmentedControl
        value={mode}
        onChange={(value) => setMode(value as 'edit' | 'preview' | 'split')}
        data={[
          { label: '편집', value: 'edit' },
          { label: '미리보기', value: 'preview' },
          { label: '분할', value: 'split' },
        ]}
        fullWidth
      />

      {/* Editor and Preview */}
      <Box>
        {mode === 'edit' && (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            minRows={minRows}
            maxRows={maxRows}
            autosize
            styles={{
              input: {
                fontFamily: 'monospace',
                fontSize: '14px',
              },
            }}
          />
        )}

        {mode === 'preview' && (
          <Paper p="md" withBorder mih={200}>
            <MarkdownPreview content={value} />
          </Paper>
        )}

        {mode === 'split' && (
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
            }}
          >
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              minRows={minRows}
              maxRows={maxRows}
              autosize
              styles={{
                input: {
                  fontFamily: 'monospace',
                  fontSize: '14px',
                },
              }}
            />
            <Paper p="md" withBorder mih={200}>
              <MarkdownPreview content={value} />
            </Paper>
          </Box>
        )}
      </Box>
    </Stack>
  );
}

interface MarkdownPreviewProps {
  content: string;
}

function MarkdownPreview({ content }: MarkdownPreviewProps) {
  if (!content.trim()) {
    return (
      <Box c="dimmed" ta="center" py="xl">
        미리보기가 여기에 표시됩니다
      </Box>
    );
  }

  return (
    <Box
      className="markdown-preview"
      style={{
        '& h1': { fontSize: '2em', marginTop: '0.67em', marginBottom: '0.67em' },
        '& h2': { fontSize: '1.5em', marginTop: '0.83em', marginBottom: '0.83em' },
        '& h3': { fontSize: '1.17em', marginTop: '1em', marginBottom: '1em' },
        '& p': { marginTop: '1em', marginBottom: '1em' },
        '& ul, & ol': { marginTop: '1em', marginBottom: '1em', paddingLeft: '2em' },
        '& code': {
          backgroundColor: 'var(--mantine-color-gray-1)',
          padding: '0.2em 0.4em',
          borderRadius: '3px',
          fontFamily: 'monospace',
          fontSize: '0.9em',
        },
        '& pre': {
          backgroundColor: 'var(--mantine-color-gray-1)',
          padding: '1em',
          borderRadius: '5px',
          overflow: 'auto',
        },
        '& pre code': {
          backgroundColor: 'transparent',
          padding: 0,
        },
        '& blockquote': {
          borderLeft: '4px solid var(--mantine-color-gray-4)',
          paddingLeft: '1em',
          marginLeft: 0,
          color: 'var(--mantine-color-dimmed)',
        },
        '& table': {
          borderCollapse: 'collapse',
          width: '100%',
          marginTop: '1em',
          marginBottom: '1em',
        },
        '& th, & td': {
          border: '1px solid var(--mantine-color-gray-4)',
          padding: '0.5em',
        },
        '& th': {
          backgroundColor: 'var(--mantine-color-gray-1)',
          fontWeight: 'bold',
        },
        '& a': {
          color: 'var(--mantine-color-blue-6)',
          textDecoration: 'none',
        },
        '& a:hover': {
          textDecoration: 'underline',
        },
        '& img': {
          maxWidth: '100%',
          height: 'auto',
        },
        '& hr': {
          border: 'none',
          borderTop: '1px solid var(--mantine-color-gray-4)',
          marginTop: '2em',
          marginBottom: '2em',
        },
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </Box>
  );
}
