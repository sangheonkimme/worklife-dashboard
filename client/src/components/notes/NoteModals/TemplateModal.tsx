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
    if (confirm('이 템플릿을 삭제하시겠습니까?')) {
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
          ? '템플릿 선택'
          : mode === 'create'
            ? '템플릿 생성'
            : '템플릿 수정'
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
            새 템플릿 만들기
          </Button>

          <Divider />

          {/* Template List */}
          {isLoading ? (
            <Box ta="center" py="xl">
              <Loader size="sm" />
            </Box>
          ) : templates.length === 0 ? (
            <Box ta="center" py="xl" c="dimmed">
              <Text size="sm">템플릿이 없습니다</Text>
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
                            기본
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
            label="템플릿 이름"
            placeholder="템플릿 이름을 입력하세요"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Textarea
            label="설명"
            placeholder="템플릿 설명 (선택사항)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            autosize
            minRows={2}
            maxRows={3}
          />

          <Select
            label="메모 타입"
            value={formData.type}
            onChange={(value) => setFormData({ ...formData, type: value as NoteType })}
            data={[
              { value: 'TEXT', label: '일반 텍스트' },
              { value: 'CHECKLIST', label: '체크리스트' },
              { value: 'MARKDOWN', label: '마크다운' },
              { value: 'QUICK', label: '빠른 메모' },
            ]}
          />

          <Textarea
            label="내용"
            placeholder="템플릿 내용을 입력하세요"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            autosize
            minRows={10}
            maxRows={20}
            required
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleCancel}>
              취소
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.name.trim() || !formData.content.trim()}
              loading={createTemplate.isPending || updateTemplate.isPending}
            >
              {mode === 'create' ? '생성' : '수정'}
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
