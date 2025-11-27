"use client";

import { useState, useMemo } from 'react';
import {
  Modal,
  Stack,
  TextInput,
  Select,
  Button,
  Group,
  Card,
  Text,
  Badge,
  Box,
  Loader,
  ActionIcon,
  Grid,
  Divider,
} from '@mantine/core';
import { IconSearch, IconTrash, IconLink } from '@tabler/icons-react';
import { useTransactionsForNote, useLinkTransaction, useUnlinkTransaction } from '@/hooks/useNoteTransactions';
import { transactionApi } from '@/services/api/transactionApi';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency, formatDate } from '@/utils/format';
import { useTranslation } from 'react-i18next';

interface LinkTransactionModalProps {
  noteId: string;
  opened: boolean;
  onClose: () => void;
}

export function LinkTransactionModal({ noteId, opened, onClose }: LinkTransactionModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const { t } = useTranslation(['notes', 'finance']);

  const { data: linkedTransactions = [] } = useTransactionsForNote(noteId);
  const { data: allTransactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions', 'all'],
    queryFn: () => transactionApi.getTransactions({ limit: 100 }),
  });

  const linkTransaction = useLinkTransaction();
  const unlinkTransaction = useUnlinkTransaction();

  const linkedIds = useMemo(
    () => new Set(linkedTransactions.map((t) => t.id)),
    [linkedTransactions]
  );

  const filteredTransactions = useMemo(() => {
    if (!allTransactions?.transactions) return [];

    return allTransactions.transactions.filter((transaction) => {
      // Skip transactions that are already linked
      if (linkedIds.has(transaction.id)) return false;

      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesDescription = transaction.description?.toLowerCase().includes(searchLower);
        const matchesCategory = transaction.category?.name.toLowerCase().includes(searchLower);
        if (!matchesDescription && !matchesCategory) return false;
      }

      // Apply type filter
      if (typeFilter && transaction.type !== typeFilter) return false;

      return true;
    });
  }, [allTransactions, linkedIds, searchTerm, typeFilter]);

  const handleLink = (transactionId: string) => {
    linkTransaction.mutate({ noteId, transactionId });
  };

  const handleUnlink = (transactionId: string) => {
    unlinkTransaction.mutate({ noteId, transactionId });
  };

  const getTypeColor = (type: string) => {
    return type === 'INCOME' ? 'green' : 'red';
  };

  const getTypeLabel = (type: string) =>
    t(`finance:transactionForm.types.${type as 'INCOME' | 'EXPENSE'}`);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('notes:linkTransactionModal.title')}
      size="lg"
    >
      <Stack gap="md">
        {/* Linked transactions */}
        {linkedTransactions.length > 0 && (
          <>
            <Box>
              <Text size="sm" fw={600} mb="xs">
                {t('notes:linkTransactionModal.linkedTitle', {
                  count: linkedTransactions.length,
                })}
              </Text>
              <Stack gap="xs">
                {linkedTransactions.map((transaction) => (
                  <Card key={transaction.id} withBorder padding="sm">
                    <Group justify="space-between" wrap="nowrap">
                      <Box style={{ flex: 1 }}>
                        <Group gap="xs" mb={4}>
                          <Badge size="xs" color={getTypeColor(transaction.type)}>
                            {getTypeLabel(transaction.type)}
                          </Badge>
                          <Text size="sm" fw={500}>
                            {transaction.category.name}
                          </Text>
                        </Group>
                        <Text size="xs" c="dimmed" lineClamp={1}>
                          {transaction.description ||
                            t('notes:linkTransactionModal.descriptionFallback')}
                        </Text>
                        <Group gap="xs" mt={4}>
                          <Text size="xs" c="dimmed">
                            {formatDate(transaction.date)}
                          </Text>
                          <Text size="sm" fw={600} c={getTypeColor(transaction.type)}>
                            {formatCurrency(transaction.amount)}
                          </Text>
                        </Group>
                      </Box>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size="sm"
                        onClick={() => handleUnlink(transaction.id)}
                        loading={unlinkTransaction.isPending}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Card>
                ))}
              </Stack>
            </Box>
            <Divider />
          </>
        )}

        {/* Filters */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              placeholder={t('notes:linkTransactionModal.filters.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftSection={<IconSearch size={16} />}
              size="sm"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              placeholder={t('notes:linkTransactionModal.filters.typePlaceholder')}
              value={typeFilter}
              onChange={setTypeFilter}
              data={[
                { value: 'INCOME', label: getTypeLabel('INCOME') },
                { value: 'EXPENSE', label: getTypeLabel('EXPENSE') },
              ]}
              clearable
              size="sm"
            />
          </Grid.Col>
        </Grid>

        {/* Transaction list */}
        <Box>
          <Text size="sm" fw={600} mb="xs">
            {t('notes:linkTransactionModal.listTitle')}
          </Text>
          {transactionsLoading ? (
            <Box ta="center" py="xl">
              <Loader size="sm" />
            </Box>
          ) : filteredTransactions.length === 0 ? (
            <Box ta="center" py="xl" c="dimmed">
              <Text size="sm">{t('notes:linkTransactionModal.empty')}</Text>
            </Box>
          ) : (
            <Stack gap="xs" mah={400} style={{ overflowY: 'auto' }}>
              {filteredTransactions.map((transaction) => (
                <Card key={transaction.id} withBorder padding="sm" style={{ cursor: 'pointer' }}>
                  <Group justify="space-between" wrap="nowrap">
                    <Box style={{ flex: 1 }}>
                      <Group gap="xs" mb={4}>
                        <Badge size="xs" color={getTypeColor(transaction.type)}>
                          {getTypeLabel(transaction.type)}
                        </Badge>
                        <Text size="sm" fw={500}>
                          {transaction.category.name}
                        </Text>
                      </Group>
                      <Text size="xs" c="dimmed" lineClamp={1}>
                        {transaction.description ||
                          t('notes:linkTransactionModal.descriptionFallback')}
                      </Text>
                      <Group gap="xs" mt={4}>
                        <Text size="xs" c="dimmed">
                          {formatDate(transaction.date)}
                        </Text>
                        <Text size="sm" fw={600} c={getTypeColor(transaction.type)}>
                          {formatCurrency(transaction.amount)}
                        </Text>
                      </Group>
                    </Box>
                    <Button
                      variant="light"
                      size="xs"
                      leftSection={<IconLink size={14} />}
                      onClick={() => handleLink(transaction.id)}
                      loading={linkTransaction.isPending}
                    >
                      {t('notes:linkTransactionModal.linkButton')}
                    </Button>
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
        </Box>

        {/* Actions */}
        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose}>
            {t('notes:linkTransactionModal.close')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
