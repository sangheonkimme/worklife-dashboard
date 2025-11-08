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
  Select,
  PasswordInput,
  Tabs,
} from '@mantine/core';
import {
  IconPlus,
  IconStar,
  IconPin,
  IconTrash,
  IconEdit,
  IconMenu2,
  IconFilter,
  IconPaperclip,
  IconTemplate,
  IconLock,
} from '@tabler/icons-react';
import {
  useNotes,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
  useTogglePinned,
  useToggleFavorite,
} from '@/hooks/useNotes';
import type { Note, CreateNoteDto, NoteType, NoteVisibility } from '@/types/note';
import { useDisclosure } from '@mantine/hooks';
import { useNoteFilters } from '@/hooks/useNoteFilters';
import { FolderTree } from '@/components/notes/FolderTree';
import { TagList } from '@/components/notes/TagList';
import { SearchBar } from '@/components/notes/SearchBar';
import { SearchFilters } from '@/components/notes/SearchFilters';
import { TagInput } from '@/components/notes/TagInput';
import { MarkdownEditor } from '@/components/notes/NoteEditor/MarkdownEditor';
import { ChecklistEditor } from '@/components/notes/NoteEditor/ChecklistEditor';
import { AttachmentUpload } from '@/components/notes/Attachments/AttachmentUpload';
import { TemplateModal } from '@/components/notes/NoteModals/TemplateModal';
import { QuickNote } from '@/components/notes/QuickNote';
import { formatDate } from '@/utils/format';

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
  const [templateModalOpened, { open: openTemplateModal, close: closeTemplateModal }] =
    useDisclosure(false);

  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState<CreateNoteDto>({
    title: '',
    content: '',
    type: 'TEXT',
    visibility: 'PRIVATE',
    tagIds: [],
  });
  const [tempChecklistItems, setTempChecklistItems] = useState<string[]>([]);

  const handleOpenModal = (note?: Note) => {
    if (note) {
      setEditingNote(note);
      setFormData({
        title: note.title,
        content: note.content,
        type: note.type,
        visibility: note.visibility,
        password: note.password,
        tagIds: note.tags?.map((t) => t.id) || [],
        folderId: note.folderId || undefined,
      });
    } else {
      setEditingNote(null);
      setFormData({
        title: '',
        content: '',
        type: 'TEXT',
        visibility: 'PRIVATE',
        tagIds: [],
        folderId: filters.folderId,
      });
    }
    openNoteModal();
  };

  const handleTemplateSelect = (template: { content: string; type: NoteType }) => {
    setFormData({
      ...formData,
      content: template.content,
      type: template.type,
    });
    closeTemplateModal();
    openNoteModal();
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      return;
    }

    // 체크리스트 타입이고 새로운 메모인 경우, 임시 항목들을 content에 저장
    let submitData = { ...formData };
    if (formData.type === 'CHECKLIST' && !editingNote && tempChecklistItems.length > 0) {
      const validItems = tempChecklistItems.filter((item) => item.trim() !== '');
      submitData.content = JSON.stringify(validItems);
    }

    if (editingNote) {
      updateNoteMutation.mutate(
        { id: editingNote.id, data: submitData },
        {
          onSuccess: () => {
            closeNoteModal();
            setFormData({ title: '', content: '', type: 'TEXT', visibility: 'PRIVATE', tagIds: [] });
            setEditingNote(null);
            setTempChecklistItems([]);
          },
        }
      );
    } else {
      createNoteMutation.mutate(submitData, {
        onSuccess: () => {
          closeNoteModal();
          setFormData({ title: '', content: '', type: 'TEXT', visibility: 'PRIVATE', tagIds: [] });
          setTempChecklistItems([]);
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
                                {formatDate(note.updatedAt)}
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
        size="xl"
      >
        <Tabs defaultValue="basic">
          <Tabs.List>
            <Tabs.Tab value="basic">기본 정보</Tabs.Tab>
            <Tabs.Tab value="settings" leftSection={<IconLock size={16} />}>
              설정
            </Tabs.Tab>
            {editingNote && (
              <Tabs.Tab value="attachments" leftSection={<IconPaperclip size={16} />}>
                첨부파일
              </Tabs.Tab>
            )}
          </Tabs.List>

          <Tabs.Panel value="basic" pt="md">
            <Stack>
              <Group grow>
                <TextInput
                  label="제목"
                  placeholder="메모 제목을 입력하세요"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.currentTarget.value })}
                  required
                />
                <Select
                  label="메모 타입"
                  value={formData.type}
                  onChange={(value) =>
                    setFormData({ ...formData, type: value as NoteType })
                  }
                  data={[
                    { value: 'TEXT', label: '텍스트' },
                    { value: 'MARKDOWN', label: '마크다운' },
                    { value: 'CHECKLIST', label: '체크리스트' },
                  ]}
                  disabled={!!editingNote}
                />
              </Group>

              {/* 타입별 에디터 */}
              {formData.type === 'TEXT' && (
                <Textarea
                  label="내용"
                  placeholder="메모 내용을 입력하세요"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.currentTarget.value })}
                  minRows={10}
                  autosize
                />
              )}

              {formData.type === 'MARKDOWN' && (
                <Box>
                  <Text size="sm" fw={500} mb="xs">
                    내용
                  </Text>
                  <MarkdownEditor
                    value={formData.content || ''}
                    onChange={(value) => setFormData({ ...formData, content: value })}
                  />
                </Box>
              )}

              {formData.type === 'CHECKLIST' && editingNote && (
                <Box>
                  <Text size="sm" fw={500} mb="xs">
                    체크리스트
                  </Text>
                  <ChecklistEditor noteId={editingNote.id} />
                </Box>
              )}

              {formData.type === 'CHECKLIST' && !editingNote && (
                <Box>
                  <Text size="sm" fw={500} mb="xs">
                    체크리스트 항목
                  </Text>
                  <Stack gap="xs">
                    {tempChecklistItems.map((item, index) => (
                      <Paper key={index} p="sm" withBorder>
                        <Group gap="xs" wrap="nowrap">
                          <TextInput
                            value={item}
                            onChange={(e) => {
                              const newItems = [...tempChecklistItems];
                              newItems[index] = e.currentTarget.value;
                              setTempChecklistItems(newItems);
                            }}
                            placeholder="체크리스트 항목"
                            style={{ flex: 1 }}
                            size="sm"
                          />
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            size="sm"
                            onClick={() => {
                              setTempChecklistItems(tempChecklistItems.filter((_, i) => i !== index));
                            }}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Paper>
                    ))}
                    <Button
                      variant="light"
                      size="sm"
                      leftSection={<IconPlus size={16} />}
                      onClick={() => setTempChecklistItems([...tempChecklistItems, ''])}
                    >
                      항목 추가
                    </Button>
                  </Stack>
                </Box>
              )}

              <TagInput
                value={formData.tagIds || []}
                onChange={(tagIds) => setFormData({ ...formData, tagIds })}
                placeholder="태그 선택 또는 생성"
              />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="settings" pt="md">
            <Stack>
              <Select
                label="공개 설정"
                description="메모의 공개 범위를 설정합니다"
                value={formData.visibility}
                onChange={(value) =>
                  setFormData({ ...formData, visibility: value as NoteVisibility })
                }
                data={[
                  { value: 'PRIVATE', label: '비공개 (나만 보기)' },
                  { value: 'PUBLIC', label: '공개 (링크로 공유 가능)' },
                  { value: 'PROTECTED', label: '비밀번호 보호' },
                ]}
              />

              {formData.visibility === 'PROTECTED' && (
                <PasswordInput
                  label="비밀번호"
                  placeholder="메모를 보호할 비밀번호를 입력하세요"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.currentTarget.value })}
                  required
                />
              )}

              {formData.visibility === 'PUBLIC' && editingNote?.publishedUrl && (
                <Paper p="md" withBorder>
                  <Text size="sm" fw={500} mb="xs">
                    공개 URL
                  </Text>
                  <Group gap="xs">
                    <Text
                      size="sm"
                      c="blue"
                      style={{ wordBreak: 'break-all', flex: 1 }}
                    >
                      {`${window.location.origin}/notes/public/${editingNote.publishedUrl}`}
                    </Text>
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/notes/public/${editingNote.publishedUrl}`
                        );
                        alert('링크가 복사되었습니다!');
                      }}
                    >
                      복사
                    </Button>
                  </Group>
                </Paper>
              )}
            </Stack>
          </Tabs.Panel>

          {editingNote && (
            <Tabs.Panel value="attachments" pt="md">
              <AttachmentUpload noteId={editingNote.id} />
            </Tabs.Panel>
          )}
        </Tabs>

        <Group justify="space-between" mt="xl">
          <Button
            variant="subtle"
            leftSection={<IconTemplate size={16} />}
            onClick={openTemplateModal}
            disabled={!!editingNote}
          >
            템플릿 선택
          </Button>
          <Group>
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
        </Group>
      </Modal>

      {/* 템플릿 선택 모달 */}
      <TemplateModal
        opened={templateModalOpened}
        onClose={closeTemplateModal}
        onSelectTemplate={handleTemplateSelect}
      />

      {/* 빠른 메모 플로팅 위젯 */}
      <QuickNote />
    </>
  );
}
