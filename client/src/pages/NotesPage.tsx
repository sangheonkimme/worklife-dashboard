import { useState } from 'react';
import {
  Container,
  Title,
  Group,
  Button,
  Paper,
  Text,
  Grid,
  Card,
  Badge,
  ActionIcon,
  LoadingOverlay,
  Stack,
  Modal,
  TextInput,
  Textarea,
} from '@mantine/core';
import { IconPlus, IconStar, IconPin, IconTrash, IconEdit } from '@tabler/icons-react';
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote, useTogglePinned, useToggleFavorite } from '@/hooks/useNotes';
import type { Note, CreateNoteDto } from '@/types/note';
import { useDisclosure } from '@mantine/hooks';

export default function NotesPage() {
  const [filters] = useState({});
  const { data, isLoading } = useNotes(filters);
  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();
  const togglePinnedMutation = useTogglePinned();
  const toggleFavoriteMutation = useToggleFavorite();

  const [opened, { open, close }] = useDisclosure(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState<CreateNoteDto>({
    title: '',
    content: '',
  });

  const handleOpenModal = (note?: Note) => {
    if (note) {
      setEditingNote(note);
      setFormData({
        title: note.title,
        content: note.content,
      });
    } else {
      setEditingNote(null);
      setFormData({
        title: '',
        content: '',
      });
    }
    open();
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      return;
    }

    if (editingNote) {
      // 수정 모드
      updateNoteMutation.mutate(
        { id: editingNote.id, data: formData },
        {
          onSuccess: () => {
            close();
            setFormData({ title: '', content: '' });
            setEditingNote(null);
          },
        }
      );
    } else {
      // 생성 모드
      createNoteMutation.mutate(formData, {
        onSuccess: () => {
          close();
          setFormData({ title: '', content: '' });
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('메모를 삭제하시겠습니까?')) {
      deleteNoteMutation.mutate(id);
    }
  };

  const handleTogglePin = (id: string, currentValue: boolean) => {
    togglePinnedMutation.mutate({ id, value: !currentValue });
  };

  const handleToggleFavorite = (id: string, currentValue: boolean) => {
    toggleFavoriteMutation.mutate({ id, value: !currentValue });
  };

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="lg">
        <Title order={2}>메모</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={() => handleOpenModal()}>
          새 메모
        </Button>
      </Group>

      <Paper p="md" withBorder>
        <LoadingOverlay visible={isLoading} />

        {data?.notes && data.notes.length === 0 && (
          <Stack align="center" py="xl">
            <Text c="dimmed">메모가 없습니다.</Text>
            <Button leftSection={<IconPlus size={16} />} onClick={() => handleOpenModal()}>
              첫 메모 만들기
            </Button>
          </Stack>
        )}

        <Grid>
          {data?.notes
            .slice()
            .sort((a, b) => {
              // 고정된 메모를 먼저 표시
              if (a.isPinned && !b.isPinned) return -1;
              if (!a.isPinned && b.isPinned) return 1;
              // 고정 상태가 같으면 업데이트 날짜로 정렬 (최신순)
              return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            })
            .map((note) => (
              <Grid.Col key={note.id} span={{ base: 12, sm: 6, md: 4 }}>
                <Card withBorder padding="lg" radius="md" h="100%">
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text fw={600} lineClamp={1}>
                      {note.title}
                    </Text>
                    <Group gap="xs">
                      <ActionIcon
                        variant={note.isPinned ? 'filled' : 'subtle'}
                        color={note.isPinned ? 'blue' : 'gray'}
                        onClick={() => handleTogglePin(note.id, note.isPinned)}
                      >
                        <IconPin size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant={note.isFavorite ? 'filled' : 'subtle'}
                        color={note.isFavorite ? 'yellow' : 'gray'}
                        onClick={() => handleToggleFavorite(note.id, note.isFavorite)}
                      >
                        <IconStar size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>

                  <Text size="sm" c="dimmed" lineClamp={3}>
                    {note.content || '내용 없음'}
                  </Text>

                  <Group gap="xs">
                    {note.isPinned && <Badge size="xs" color="blue">고정</Badge>}
                    {note.isFavorite && <Badge size="xs" color="yellow">즐겨찾기</Badge>}
                    <Badge size="xs" variant="light">
                      {note.type}
                    </Badge>
                  </Group>

                  <Group justify="space-between" mt="auto">
                    <Text size="xs" c="dimmed">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </Text>
                    <Group gap="xs">
                      <ActionIcon variant="subtle" onClick={() => handleOpenModal(note)}>
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => handleDelete(note.id)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Paper>

      {/* 메모 생성/수정 모달 */}
      <Modal opened={opened} onClose={close} title={editingNote ? '메모 수정' : '새 메모'}>
        <Stack>
          <TextInput
            label="제목"
            placeholder="메모 제목을 입력하세요"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.currentTarget.value })}
            required
          />
          <Textarea
            label="내용"
            placeholder="메모 내용을 입력하세요"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.currentTarget.value })}
            minRows={6}
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={close}>
              취소
            </Button>
            <Button
              onClick={handleSubmit}
              loading={createNoteMutation.isPending || updateNoteMutation.isPending}
            >
              {editingNote ? '수정' : '생성'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
