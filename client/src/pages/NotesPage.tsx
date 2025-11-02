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
  Box,
  Drawer,
  Divider,
} from '@mantine/core';
import {
  IconPlus,
  IconStar,
  IconPin,
  IconTrash,
  IconEdit,
  IconMenu2,
  IconFilter,
} from '@tabler/icons-react';
import {
  useNotes,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
  useTogglePinned,
  useToggleFavorite,
} from '@/hooks/useNotes';
import type { Note, CreateNoteDto } from '@/types/note';
import { useDisclosure } from '@mantine/hooks';
import { useNoteFilters } from '@/hooks/useNoteFilters';
import { FolderTree } from '@/components/notes/FolderTree';
import { TagList } from '@/components/notes/TagList';
import { SearchBar } from '@/components/notes/SearchBar';
import { SearchFilters } from '@/components/notes/SearchFilters';
import { TagInput } from '@/components/notes/TagInput';

export default function NotesPage() {
  const {
    filters,
    setSearchFilter,
    setFolderFilter,
    setTagFilter,
    updateFilter,
    resetFilters,
    hasActiveFilters,
  } = useNoteFilters();

  const { data, isLoading } = useNotes(filters);
  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();
  const togglePinnedMutation = useTogglePinned();
  const toggleFavoriteMutation = useToggleFavorite();

  const [noteModalOpened, { open: openNoteModal, close: closeNoteModal }] =
    useDisclosure(false);
  const [sidebarOpened, { toggle: toggleSidebar, close: closeSidebar }] =
    useDisclosure(false);
  const [filtersOpened, { toggle: toggleFilters }] = useDisclosure(false);

  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState<CreateNoteDto>({
    title: '',
    content: '',
    tagIds: [],
  });

  const handleOpenModal = (note?: Note) => {
    if (note) {
      setEditingNote(note);
      setFormData({
        title: note.title,
        content: note.content,
        tagIds: note.tags?.map((t) => t.id) || [],
        folderId: note.folderId || undefined,
      });
    } else {
      setEditingNote(null);
      setFormData({
        title: '',
        content: '',
        tagIds: [],
        folderId: filters.folderId,
      });
    }
    openNoteModal();
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      return;
    }

    if (editingNote) {
      updateNoteMutation.mutate(
        { id: editingNote.id, data: formData },
        {
          onSuccess: () => {
            closeNoteModal();
            setFormData({ title: '', content: '', tagIds: [] });
            setEditingNote(null);
          },
        }
      );
    } else {
      createNoteMutation.mutate(formData, {
        onSuccess: () => {
          closeNoteModal();
          setFormData({ title: '', content: '', tagIds: [] });
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
    <>
      <Container size="xl" py="xl">
        <Grid>
          {/* 사이드바 (데스크톱) */}
          <Grid.Col span={{ base: 12, md: 3 }} visibleFrom="md">
            <Stack gap="lg">
              <SearchBar value={filters.search || ''} onChange={setSearchFilter} />

              <Paper p="md" withBorder>
                <FolderTree
                  selectedFolderId={filters.folderId}
                  onSelectFolder={setFolderFilter}
                />
              </Paper>

              <Paper p="md" withBorder>
                <TagList selectedTagId={filters.tagId} onSelectTag={setTagFilter} />
              </Paper>

              <Paper p="md" withBorder>
                <SearchFilters
                  type={filters.type}
                  dateFrom={
                    typeof filters.dateFrom === 'string'
                      ? new Date(filters.dateFrom)
                      : filters.dateFrom
                  }
                  dateTo={
                    typeof filters.dateTo === 'string' ? new Date(filters.dateTo) : filters.dateTo
                  }
                  isPinned={filters.isPinned}
                  isFavorite={filters.isFavorite}
                  isArchived={filters.isArchived}
                  onTypeChange={(type) => updateFilter('type', type)}
                  onDateFromChange={(date) => updateFilter('dateFrom', date?.toISOString())}
                  onDateToChange={(date) => updateFilter('dateTo', date?.toISOString())}
                  onPinnedChange={(value) => updateFilter('isPinned', value)}
                  onFavoriteChange={(value) => updateFilter('isFavorite', value)}
                  onArchivedChange={(value) => updateFilter('isArchived', value)}
                  onReset={resetFilters}
                />
              </Paper>
            </Stack>
          </Grid.Col>

          {/* 메인 콘텐츠 */}
          <Grid.Col span={{ base: 12, md: 9 }}>
            <Stack gap="md">
              <Group justify="space-between">
                <Group>
                  <ActionIcon hiddenFrom="md" onClick={toggleSidebar}>
                    <IconMenu2 size={20} />
                  </ActionIcon>
                  <Title order={2}>메모</Title>
                  {hasActiveFilters && (
                    <Badge color="blue" variant="light">
                      필터 적용됨
                    </Badge>
                  )}
                </Group>
                <Group>
                  <ActionIcon hiddenFrom="md" onClick={toggleFilters}>
                    <IconFilter size={20} />
                  </ActionIcon>
                  <Button leftSection={<IconPlus size={16} />} onClick={() => handleOpenModal()}>
                    새 메모
                  </Button>
                </Group>
              </Group>

              <Box hiddenFrom="md">
                <SearchBar value={filters.search || ''} onChange={setSearchFilter} />
              </Box>

              <Paper p="md" withBorder>
                <LoadingOverlay visible={isLoading} />

                {data?.notes && data.notes.length === 0 && (
                  <Stack align="center" py="xl">
                    <Text c="dimmed">메모가 없습니다.</Text>
                    <Button
                      leftSection={<IconPlus size={16} />}
                      onClick={() => handleOpenModal()}
                    >
                      첫 메모 만들기
                    </Button>
                  </Stack>
                )}

                <Grid>
                  {data?.notes
                    .slice()
                    .sort((a, b) => {
                      if (a.isPinned && !b.isPinned) return -1;
                      if (!a.isPinned && b.isPinned) return 1;
                      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
                    })
                    .map((note) => (
                      <Grid.Col key={note.id} span={{ base: 12, sm: 6, lg: 4 }}>
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
                              {note.isPinned && (
                                <Badge size="xs" color="blue">
                                  고정
                                </Badge>
                              )}
                              {note.isFavorite && (
                                <Badge size="xs" color="yellow">
                                  즐겨찾기
                                </Badge>
                              )}
                              <Badge size="xs" variant="light">
                                {note.type}
                              </Badge>
                              {note.tags?.map((tag) => (
                                <Badge key={tag.id} size="xs" color={tag.color || 'gray'}>
                                  {tag.name}
                                </Badge>
                              ))}
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
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>

      {/* 모바일 사이드바 */}
      <Drawer
        opened={sidebarOpened}
        onClose={closeSidebar}
        title="메뉴"
        padding="md"
        size="sm"
        hiddenFrom="md"
      >
        <Stack gap="lg">
          <Paper p="md" withBorder>
            <FolderTree selectedFolderId={filters.folderId} onSelectFolder={setFolderFilter} />
          </Paper>

          <Divider />

          <Paper p="md" withBorder>
            <TagList selectedTagId={filters.tagId} onSelectTag={setTagFilter} />
          </Paper>
        </Stack>
      </Drawer>

      {/* 모바일 필터 */}
      <Drawer
        opened={filtersOpened}
        onClose={toggleFilters}
        title="필터"
        padding="md"
        size="sm"
        position="right"
        hiddenFrom="md"
      >
        <SearchFilters
          type={filters.type}
          dateFrom={
            typeof filters.dateFrom === 'string' ? new Date(filters.dateFrom) : filters.dateFrom
          }
          dateTo={typeof filters.dateTo === 'string' ? new Date(filters.dateTo) : filters.dateTo}
          isPinned={filters.isPinned}
          isFavorite={filters.isFavorite}
          isArchived={filters.isArchived}
          onTypeChange={(type) => updateFilter('type', type)}
          onDateFromChange={(date) => updateFilter('dateFrom', date?.toISOString())}
          onDateToChange={(date) => updateFilter('dateTo', date?.toISOString())}
          onPinnedChange={(value) => updateFilter('isPinned', value)}
          onFavoriteChange={(value) => updateFilter('isFavorite', value)}
          onArchivedChange={(value) => updateFilter('isArchived', value)}
          onReset={resetFilters}
        />
      </Drawer>

      {/* 메모 생성/수정 모달 */}
      <Modal
        opened={noteModalOpened}
        onClose={closeNoteModal}
        title={editingNote ? '메모 수정' : '새 메모'}
        size="lg"
      >
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
          <TagInput
            value={formData.tagIds || []}
            onChange={(tagIds) => setFormData({ ...formData, tagIds })}
            placeholder="태그 선택 또는 생성"
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={closeNoteModal}>
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
    </>
  );
}
