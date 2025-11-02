import { useState } from 'react';
import {
  Stack,
  Group,
  Text,
  Paper,
  Image,
  ActionIcon,
  Badge,
  Box,
  Grid,
  Loader,
  Alert,
} from '@mantine/core';
import { Dropzone, type FileWithPath } from '@mantine/dropzone';
import { IconUpload, IconX, IconFile, IconTrash } from '@tabler/icons-react';
import { useAttachments, useUploadMultipleFiles, useDeleteAttachment } from '@/hooks/useAttachments';
import type { Attachment } from '@/types/attachment';
import { formatFileSize } from '@/utils/format';

interface AttachmentUploadProps {
  noteId: string;
}

export function AttachmentUpload({ noteId }: AttachmentUploadProps) {
  const [uploading, setUploading] = useState(false);

  const { data: attachments = [], isLoading } = useAttachments(noteId);
  const uploadFiles = useUploadMultipleFiles();
  const deleteAttachment = useDeleteAttachment();

  const handleDrop = async (files: FileWithPath[]) => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      await uploadFiles.mutateAsync({
        noteId,
        files,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('이 파일을 삭제하시겠습니까?')) {
      deleteAttachment.mutate({ id, noteId });
    }
  };

  return (
    <Stack gap="md">
      {/* Dropzone */}
      <Dropzone
        onDrop={handleDrop}
        maxSize={10 * 1024 * 1024} // 10MB
        accept={{
          'image/*': ['.png', '.gif', '.jpeg', '.jpg', '.webp'],
          'audio/*': ['.mp3', '.wav', '.ogg'],
          'application/pdf': ['.pdf'],
          'application/msword': ['.doc'],
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
          'application/vnd.ms-excel': ['.xls'],
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
          'text/csv': ['.csv'],
          'application/zip': ['.zip'],
        }}
        loading={uploading}
      >
        <Group justify="center" gap="xl" mih={120} style={{ pointerEvents: 'none' }}>
          <Dropzone.Accept>
            <IconUpload size={52} stroke={1.5} />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX size={52} stroke={1.5} />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconUpload size={52} stroke={1.5} />
          </Dropzone.Idle>

          <Box>
            <Text size="xl" inline>
              파일을 드래그하거나 클릭하여 업로드
            </Text>
            <Text size="sm" c="dimmed" inline mt={7}>
              최대 10MB, 이미지/오디오/문서 파일 지원
            </Text>
          </Box>
        </Group>
      </Dropzone>

      {/* Upload Progress */}
      {uploading && (
        <Alert color="blue" title="업로드 중...">
          <Group gap="xs">
            <Loader size="sm" />
            <Text size="sm">파일을 업로드하고 있습니다</Text>
          </Group>
        </Alert>
      )}

      {/* Attachments List */}
      {isLoading ? (
        <Box ta="center" py="xl">
          <Loader size="sm" />
        </Box>
      ) : attachments.length === 0 ? (
        <Box ta="center" py="xl" c="dimmed">
          <Text size="sm">첨부된 파일이 없습니다</Text>
        </Box>
      ) : (
        <Grid>
          {attachments.map((attachment) => (
            <Grid.Col key={attachment.id} span={{ base: 12, sm: 6, md: 4 }}>
              <AttachmentCard
                attachment={attachment}
                onDelete={() => handleDelete(attachment.id)}
                deleting={deleteAttachment.isPending}
              />
            </Grid.Col>
          ))}
        </Grid>
      )}
    </Stack>
  );
}

interface AttachmentCardProps {
  attachment: Attachment;
  onDelete: () => void;
  deleting: boolean;
}

function AttachmentCard({ attachment, onDelete, deleting }: AttachmentCardProps) {
  const isImage = attachment.type === 'IMAGE';

  return (
    <Paper withBorder p="sm">
      <Stack gap="xs">
        {/* Preview */}
        {isImage ? (
          <Box style={{ position: 'relative', width: '100%', paddingTop: '75%' }}>
            <Image
              src={attachment.url}
              alt={attachment.fileName}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '4px',
              }}
            />
          </Box>
        ) : (
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 100,
              backgroundColor: 'var(--mantine-color-gray-1)',
              borderRadius: '4px',
            }}
          >
            <IconFile size={48} stroke={1.5} color="var(--mantine-color-gray-6)" />
          </Box>
        )}

        {/* Info */}
        <Group justify="space-between" wrap="nowrap">
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text size="sm" fw={500} lineClamp={1} title={attachment.fileName}>
              {attachment.fileName}
            </Text>
            <Group gap={4} mt={2}>
              <Badge size="xs" color="gray" variant="light">
                {formatFileSize(attachment.fileSize)}
              </Badge>
            </Group>
          </Box>
          <ActionIcon
            variant="subtle"
            color="red"
            size="sm"
            onClick={onDelete}
            loading={deleting}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>

        {/* Download Link */}
        <Text
          component="a"
          href={attachment.url}
          target="_blank"
          rel="noopener noreferrer"
          size="xs"
          c="blue"
          style={{ cursor: 'pointer' }}
        >
          다운로드
        </Text>
      </Stack>
    </Paper>
  );
}
