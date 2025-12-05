"use client";

import { useState, useCallback } from 'react';
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
  SegmentedControl,
  Box,
  Drawer,
} from '@mantine/core';
import {
  IconPlus,
  IconStar,
  IconPin,
  IconTrash,
  IconEdit,
  IconMenu2,
  IconSearch,
} from '@tabler/icons-react';
import {
  useNotes,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
  useTogglePinned,
  useToggleFavorite,
} from '@/hooks/useNotes';
import type { Note, CreateNoteDto, NoteType } from '@/types/note';
import { useDisclosure } from '@mantine/hooks';
import { FolderTree } from '@/components/notes/FolderTree';
import { formatDate } from '@/utils/format';
import { useTranslation } from 'react-i18next';
import { AuthRequiredWrapper } from '@/components/auth/AuthRequiredWrapper';
import { useAuth } from '@/hooks/useAuth';

export default function NotesPage() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation('notes');

  // 필터 상태
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useNotes(
    { folderId: selectedFolderId, search: searchQuery || undefined },
    isAuthenticated
  );

  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();
  const togglePinnedMutation = useTogglePinned();
  const toggleFavoriteMutation = useToggleFavorite();

  const [noteModalOpened, { open: openNoteModal, close: closeNoteModal }] = useDisclosure(false);
  const [sidebarOpened, { toggle: toggleSidebar, close: closeSidebar }] = useDisclosure(false);

  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState<CreateNoteDto>({
    title: '',
    content: '',
    type: 'TEXT',
  });

  const handleOpenModal = useCallback((note?: Note) => {
    if (note) {
      setEditingNote(note);
      setFormData({
        title: note.title,
        content: note.content,
        type: note.type,
        folderId: note.folderId || undefined,
      });
    } else {
      setEditingNote(null);
      setFormData({
        title: '',
        content: '',
        type: 'TEXT',
        folderId: selectedFolderId,
      });
    }
    openNoteModal();
  }, [selectedFolderId, openNoteModal]);

  const handleSubmit = useCallback(() => {
    if (!formData.title.trim()) return;

    if (editingNote) {
      updateNoteMutation.mutate(
        { id: editingNote.id, data: formData },
        {
          onSuccess: () => {
            closeNoteModal();
            setFormData({ title: '', content: '', type: 'TEXT' });
            setEditingNote(null);
          },
        }
      );
    } else {
      createNoteMutation.mutate(formData, {
        onSuccess: () => {
          closeNoteModal();
          setFormData({ title: '', content: '', type: 'TEXT' });
        },
      });
    }
  }, [formData, editingNote, updateNoteMutation, createNoteMutation, closeNoteModal]);

  const handleDelete = useCallback((id: string) => {
    if (window.confirm(t('page.confirmDelete'))) {
      deleteNoteMutation.mutate(id);
    }
  }, [deleteNoteMutation, t]);

  const handleTogglePin = useCallback((id: string, currentValue: boolean) => {
    togglePinnedMutation.mutate({ id, value: !currentValue });
  }, [togglePinnedMutation]);

  const handleToggleFavorite = useCallback((id: string, currentValue: boolean) => {
    toggleFavoriteMutation.mutate({ id, value: !currentValue });
  }, [toggleFavoriteMutation]);

  const sortedNotes = data?.notes?.slice().sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  }) || [];

  return (
    <AuthRequiredWrapper>
      <Container size="xl" py="xl">
        <Grid>
          {/* 사이드바 (데스크톱) */}
          <Grid.Col span={{ base: 12, md: 3 }} visibleFrom="md">
            <Stack gap="md">
              <TextInput
                placeholder={t('searchBar.placeholder')}
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
              />
              <Paper p="md" withBorder>
                <FolderTree
                  selectedFolderId={selectedFolderId}
                  onSelectFolder={setSelectedFolderId}
                />
              </Paper>
            </Stack>
          </Grid.Col>

          {/* 메인 콘텐츠 */}
          <Grid.Col span={{ base: 12, md: 9 }}>
            <Stack gap="md">
              {/* 헤더 */}
              <Group justify="space-between">
                <Group>
                  <ActionIcon hiddenFrom="md" onClick={toggleSidebar} variant="subtle">
                    <IconMenu2 size={20} />
                  </ActionIcon>
                  <Title order={2}>{t('page.title')}</Title>
                </Group>
                <Button leftSection={<IconPlus size={16} />} onClick={() => handleOpenModal()}>
                  {t('page.newNote')}
                </Button>
              </Group>

              {/* 모바일 검색 */}
              <Box hiddenFrom="md">
                <TextInput
                  placeholder={t('searchBar.placeholder')}
                  leftSection={<IconSearch size={16} />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.currentTarget.value)}
                />
              </Box>

              {/* 노트 목록 */}
              <Paper p="md" withBorder pos="relative" mih={200}>
                <LoadingOverlay visible={isLoading} />

                {sortedNotes.length === 0 && !isLoading && (
                  <Stack align="center" py="xl">
                    <Text c="dimmed">{t('page.empty.title')}</Text>
                    <Button leftSection={<IconPlus size={16} />} onClick={() => handleOpenModal()}>
                      {t('page.empty.cta')}
                    </Button>
                  </Stack>
                )}

                <Grid>
                  {sortedNotes.map((note) => (
                    <Grid.Col key={note.id} span={{ base: 12, sm: 6, lg: 4 }}>
                      <Card withBorder padding="lg" radius="md" h="100%">
                        <Stack gap="sm">
                          <Group justify="space-between" wrap="nowrap">
                            <Text fw={600} lineClamp={1} style={{ flex: 1 }}>
                              {note.title}
                            </Text>
                            <Group gap={4} wrap="nowrap">
                              <ActionIcon
                                variant={note.isPinned ? 'filled' : 'subtle'}
                                color={note.isPinned ? 'blue' : 'gray'}
                                size="sm"
                                onClick={() => handleTogglePin(note.id, note.isPinned)}
                              >
                                <IconPin size={14} />
                              </ActionIcon>
                              <ActionIcon
                                variant={note.isFavorite ? 'filled' : 'subtle'}
                                color={note.isFavorite ? 'yellow' : 'gray'}
                                size="sm"
                                onClick={() => handleToggleFavorite(note.id, note.isFavorite)}
                              >
                                <IconStar size={14} />
                              </ActionIcon>
                            </Group>
                          </Group>

                          <Text size="sm" c="dimmed" lineClamp={3}>
                            {note.content || t('page.contentFallback')}
                          </Text>

                          <Group gap="xs">
                            <Badge size="xs" variant="light">
                              {t(`page.noteTypes.${note.type}`, { defaultValue: note.type })}
                            </Badge>
                            {note.folder && (
                              <Badge size="xs" variant="outline" color={note.folder.color || 'gray'}>
                                {note.folder.name}
                              </Badge>
                            )}
                          </Group>

                          <Group justify="space-between" mt="auto">
                            <Text size="xs" c="dimmed">
                              {formatDate(note.updatedAt)}
                            </Text>
                            <Group gap={4}>
                              <ActionIcon variant="subtle" size="sm" onClick={() => handleOpenModal(note)}>
                                <IconEdit size={14} />
                              </ActionIcon>
                              <ActionIcon
                                variant="subtle"
                                color="red"
                                size="sm"
                                onClick={() => handleDelete(note.id)}
                              >
                                <IconTrash size={14} />
                              </ActionIcon>
                            </Group>
                          </Group>
                        </Stack>
                      </Card>
                    </Grid.Col>
                  ))}
                </Grid>
              </Paper>
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>

      {/* 모바일 사이드바 */}
      <Drawer
        opened={sidebarOpened}
        onClose={closeSidebar}
        title={t('page.drawer.menu')}
        padding="md"
        size="sm"
        hiddenFrom="md"
      >
        <Stack gap="lg">
          <Paper p="md" withBorder>
            <FolderTree
              selectedFolderId={selectedFolderId}
              onSelectFolder={(id) => {
                setSelectedFolderId(id);
                closeSidebar();
              }}
            />
          </Paper>
        </Stack>
      </Drawer>

      {/* 노트 생성/수정 모달 */}
      <Modal
        opened={noteModalOpened}
        onClose={closeNoteModal}
        title={t(`page.modals.note.title.${editingNote ? 'edit' : 'create'}`)}
        size="lg"
      >
        <Stack>
          <TextInput
            label={t('page.modals.note.form.title.label')}
            placeholder={t('page.modals.note.form.title.placeholder')}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.currentTarget.value })}
            required
          />

          <SegmentedControl
            value={formData.type}
            onChange={(value) => setFormData({ ...formData, type: value as NoteType })}
            data={[
              { value: 'TEXT', label: t('page.noteTypes.TEXT') },
              { value: 'MARKDOWN', label: t('page.noteTypes.MARKDOWN') },
              { value: 'CHECKLIST', label: t('page.noteTypes.CHECKLIST') },
            ]}
            disabled={!!editingNote}
            fullWidth
          />

          <Textarea
            label={t('page.modals.note.form.content.label')}
            placeholder={t('page.modals.note.form.content.placeholder')}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.currentTarget.value })}
            minRows={8}
            autosize
            maxRows={20}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={closeNoteModal}>
              {t('actions.cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              loading={createNoteMutation.isPending || updateNoteMutation.isPending}
            >
              {t(editingNote ? 'page.modals.note.submit.update' : 'page.modals.note.submit.create')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </AuthRequiredWrapper>
  );
}
