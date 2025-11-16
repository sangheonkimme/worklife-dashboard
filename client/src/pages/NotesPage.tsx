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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('notes');

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
    const submitData = { ...formData };
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
    if (window.confirm(t('page.confirmDelete'))) {
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
                  <Title order={2}>{t('page.title')}</Title>
                  {hasActiveFilters && (
                    <Badge color="blue" variant="light">
                      {t('page.filtersApplied')}
                    </Badge>
                  )}
                </Group>
                <Group>
                  <ActionIcon hiddenFrom="md" onClick={toggleFilters}>
                    <IconFilter size={20} />
                  </ActionIcon>
                  <Button leftSection={<IconPlus size={16} />} onClick={() => handleOpenModal()}>
                    {t('page.newNote')}
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
                    <Text c="dimmed">{t('page.empty.title')}</Text>
                    <Button
                      leftSection={<IconPlus size={16} />}
                      onClick={() => handleOpenModal()}
                    >
                      {t('page.empty.cta')}
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
                              {note.content || t('page.contentFallback')}
                            </Text>

                            <Group gap="xs">
                              {note.isPinned && (
                                <Badge size="xs" color="blue">
                                  {t('page.badges.pinned')}
                                </Badge>
                              )}
                              {note.isFavorite && (
                                <Badge size="xs" color="yellow">
                                  {t('page.badges.favorite')}
                                </Badge>
                              )}
                              <Badge size="xs" variant="light">
                                {t(`page.noteTypes.${note.type}`, { defaultValue: note.type })}
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
        title={t('page.drawer.menu')}
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
        title={t('page.drawer.filters')}
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
        title={t(`page.modals.note.title.${editingNote ? 'edit' : 'create'}`)}
        size="xl"
      >
        <Tabs defaultValue="basic">
          <Tabs.List>
            <Tabs.Tab value="basic">{t('page.modals.note.tabs.basic')}</Tabs.Tab>
            <Tabs.Tab value="settings" leftSection={<IconLock size={16} />}>
              {t('page.modals.note.tabs.settings')}
            </Tabs.Tab>
            {editingNote && (
              <Tabs.Tab value="attachments" leftSection={<IconPaperclip size={16} />}>
                {t('page.modals.note.tabs.attachments')}
              </Tabs.Tab>
            )}
          </Tabs.List>

          <Tabs.Panel value="basic" pt="md">
            <Stack>
              <Group grow>
                <TextInput
                  label={t('page.modals.note.form.title.label')}
                  placeholder={t('page.modals.note.form.title.placeholder')}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.currentTarget.value })}
                  required
                />
                <Select
                  label={t('page.modals.note.form.type.label')}
                  value={formData.type}
                  onChange={(value) =>
                    setFormData({ ...formData, type: value as NoteType })
                  }
                  data={[
                    { value: 'TEXT', label: t('page.noteTypes.TEXT') },
                    { value: 'MARKDOWN', label: t('page.noteTypes.MARKDOWN') },
                    { value: 'CHECKLIST', label: t('page.noteTypes.CHECKLIST') },
                  ]}
                  disabled={!!editingNote}
                />
              </Group>

              {/* 타입별 에디터 */}
              {formData.type === 'TEXT' && (
                <Textarea
                  label={t('page.modals.note.form.content.label')}
                  placeholder={t('page.modals.note.form.content.placeholder')}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.currentTarget.value })}
                  minRows={10}
                  autosize
                />
              )}

              {formData.type === 'MARKDOWN' && (
                <Box>
                  <Text size="sm" fw={500} mb="xs">
                    {t('page.modals.note.form.markdownLabel')}
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
                    {t('page.modals.note.form.checklistLabel')}
                  </Text>
                  <ChecklistEditor noteId={editingNote.id} />
                </Box>
              )}

              {formData.type === 'CHECKLIST' && !editingNote && (
                <Box>
                  <Text size="sm" fw={500} mb="xs">
                    {t('page.modals.note.form.checklistItemsLabel')}
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
                            placeholder={t('page.modals.note.form.checklistPlaceholder')}
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
                      {t('page.modals.note.form.addChecklistItem')}
                    </Button>
                  </Stack>
                </Box>
              )}

              <TagInput
                value={formData.tagIds || []}
                onChange={(tagIds) => setFormData({ ...formData, tagIds })}
                placeholder={t('page.modals.note.form.tagsPlaceholder')}
              />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="settings" pt="md">
            <Stack>
              <Select
                label={t('page.modals.note.visibility.label')}
                description={t('page.modals.note.visibility.description')}
                value={formData.visibility}
                onChange={(value) =>
                  setFormData({ ...formData, visibility: value as NoteVisibility })
                }
                data={[
                  { value: 'PRIVATE', label: t('page.modals.note.visibility.options.PRIVATE') },
                  { value: 'PUBLIC', label: t('page.modals.note.visibility.options.PUBLIC') },
                  { value: 'PROTECTED', label: t('page.modals.note.visibility.options.PROTECTED') },
                ]}
              />

              {formData.visibility === 'PROTECTED' && (
                <PasswordInput
                  label={t('page.modals.note.visibility.password.label')}
                  placeholder={t('page.modals.note.visibility.password.placeholder')}
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.currentTarget.value })}
                  required
                />
              )}

              {formData.visibility === 'PUBLIC' && editingNote?.publishedUrl && (
                <Paper p="md" withBorder>
                  <Text size="sm" fw={500} mb="xs">
                    {t('page.modals.note.visibility.publicUrl.label')}
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
                        alert(t('page.modals.note.visibility.publicUrl.success'));
                      }}
                    >
                      {t('page.modals.note.visibility.publicUrl.copy')}
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
            {t('page.modals.note.templateButton')}
          </Button>
          <Group>
            <Button variant="subtle" onClick={closeNoteModal}>
              {t('actions.cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              loading={createNoteMutation.isPending || updateNoteMutation.isPending}
            >
              {t(
                editingNote
                  ? 'page.modals.note.submit.update'
                  : 'page.modals.note.submit.create'
              )}
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
