import { useState } from 'react';
import {
  Modal,
  Stack,
  TextInput,
  Textarea,
  Select,
  Button,
  Group,
  Card,
  Text,
  Badge,
  Grid,
  ActionIcon,
  Divider,
  Box,
  Loader,
} from '@mantine/core';
import { IconTemplate, IconPlus, IconTrash, IconEdit } from '@tabler/icons-react';
import { useTemplates, useCreateTemplate, useUpdateTemplate, useDeleteTemplate } from '@/hooks/useTemplates';
import type { NoteTemplate, CreateTemplateDto, UpdateTemplateDto } from '@/types/template';
import type { NoteType } from '@/types/note';
import { useTranslation } from 'react-i18next';

interface TemplateModalProps {
  opened: boolean;
  onClose: () => void;
  onSelectTemplate?: (template: NoteTemplate) => void;
}

export function TemplateModal({ opened, onClose, onSelectTemplate }: TemplateModalProps) {
  const [mode, setMode] = useState<'select' | 'create' | 'edit'>('select');
  const [editingTemplate, setEditingTemplate] = useState<NoteTemplate | null>(null);

  const { data: templates = [], isLoading } = useTemplates();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const { t } = useTranslation('notes');

  const [formData, setFormData] = useState<CreateTemplateDto>({
    name: '',
    content: '',
    description: '',
    type: 'TEXT',
  });

  const handleSelectTemplate = (template: NoteTemplate) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
      onClose();
    }
  };

  const handleCreateMode = () => {
    setMode('create');
    setFormData({
      name: '',
      content: '',
      description: '',
      type: 'TEXT',
    });
  };

  const handleEditMode = (template: NoteTemplate) => {
    setMode('edit');
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      content: template.content,
      description: template.description || '',
      type: template.type,
    });
  };

  const handleSave = () => {
    if (mode === 'create') {
      createTemplate.mutate(formData, {
        onSuccess: () => {
          setMode('select');
          setFormData({ name: '', content: '', description: '', type: 'TEXT' });
        },
      });
    } else if (mode === 'edit' && editingTemplate) {
      const updateData: UpdateTemplateDto = {
        name: formData.name,
        content: formData.content,
        description: formData.description,
        type: formData.type,
      };
      updateTemplate.mutate(
        { id: editingTemplate.id, data: updateData },
        {
          onSuccess: () => {
            setMode('select');
            setEditingTemplate(null);
            setFormData({ name: '', content: '', description: '', type: 'TEXT' });
          },
        }
      );
    }
  };

  const handleDelete = (id: string) => {
    if (confirm(t('templateModal.deleteConfirm'))) {
      deleteTemplate.mutate(id);
    }
  };

  const handleCancel = () => {
    setMode('select');
    setEditingTemplate(null);
    setFormData({ name: '', content: '', description: '', type: 'TEXT' });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        mode === 'select'
          ? t('templateModal.title.select')
          : mode === 'create'
            ? t('templateModal.title.create')
            : t('templateModal.title.edit')
      }
      size="lg"
    >
      {mode === 'select' ? (
        <Stack gap="md">
          {/* Create Button */}
          <Button
            leftSection={<IconPlus size={16} />}
            variant="light"
            onClick={handleCreateMode}
          >
            {t('templateModal.createButton')}
          </Button>

          <Divider />

          {/* Template List */}
          {isLoading ? (
            <Box ta="center" py="xl">
              <Loader size="sm" />
            </Box>
          ) : templates.length === 0 ? (
            <Box ta="center" py="xl" c="dimmed">
              <Text size="sm">{t('templateModal.empty')}</Text>
            </Box>
          ) : (
            <Grid>
              {templates.map((template) => (
                <Grid.Col key={template.id} span={{ base: 12, sm: 6 }}>
                  <Card
                    withBorder
                    padding="md"
                    style={{ cursor: 'pointer', height: '100%' }}
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <Stack gap="xs">
                      <Group justify="space-between" wrap="nowrap">
                        <Group gap="xs">
                          <IconTemplate size={18} />
                          <Text fw={600} size="sm" lineClamp={1}>
                            {template.name}
                          </Text>
                        </Group>
                        {template.isDefault && (
                          <Badge size="xs" color="blue" variant="light">
                            {t('templateModal.defaultBadge')}
                          </Badge>
                        )}
                      </Group>

                      {template.description && (
                        <Text size="xs" c="dimmed" lineClamp={2}>
                          {template.description}
                        </Text>
                      )}

                      {!template.isDefault && (
                        <Group gap="xs" mt="xs">
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditMode(template);
                            }}
                          >
                            <IconEdit size={14} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(template.id);
                            }}
                          >
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Group>
                      )}
                    </Stack>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          )}
        </Stack>
      ) : (
        <Stack gap="md">
          <TextInput
            label={t('templateModal.fields.name.label')}
            placeholder={t('templateModal.fields.name.placeholder')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Textarea
            label={t('templateModal.fields.description.label')}
            placeholder={t('templateModal.fields.description.placeholder')}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            autosize
            minRows={2}
            maxRows={3}
          />

          <Select
            label={t('templateModal.fields.type.label')}
            value={formData.type}
            onChange={(value) => setFormData({ ...formData, type: value as NoteType })}
            data={[
              { value: 'TEXT', label: t('templateModal.types.TEXT') },
              { value: 'CHECKLIST', label: t('templateModal.types.CHECKLIST') },
              { value: 'MARKDOWN', label: t('templateModal.types.MARKDOWN') },
              { value: 'QUICK', label: t('templateModal.types.QUICK') },
            ]}
          />

          <Textarea
            label={t('templateModal.fields.content.label')}
            placeholder={t('templateModal.fields.content.placeholder')}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            autosize
            minRows={10}
            maxRows={20}
            required
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleCancel}>
              {t('actions.cancel')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.name.trim() || !formData.content.trim()}
              loading={createTemplate.isPending || updateTemplate.isPending}
            >
              {t(mode === 'create' ? 'actions.create' : 'actions.update')}
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
