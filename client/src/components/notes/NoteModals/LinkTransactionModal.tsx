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

interface LinkTransactionModalProps {
  noteId: string;
  opened: boolean;
  onClose: () => void;
}

export function LinkTransactionModal({ noteId, opened, onClose }: LinkTransactionModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

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
      // 이미 연결된 거래 제외
      if (linkedIds.has(transaction.id)) return false;

      // 검색어 필터
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesDescription = transaction.description?.toLowerCase().includes(searchLower);
        const matchesCategory = transaction.category?.name.toLowerCase().includes(searchLower);
        if (!matchesDescription && !matchesCategory) return false;
      }

      // 타입 필터
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

  const getTypeLabel = (type: string) => {
    return type === 'INCOME' ? '수입' : '지출';
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="거래 연결"
      size="lg"
    >
      <Stack gap="md">
        {/* 연결된 거래 목록 */}
        {linkedTransactions.length > 0 && (
          <>
            <Box>
              <Text size="sm" fw={600} mb="xs">
                연결된 거래 ({linkedTransactions.length})
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
                          {transaction.description || '설명 없음'}
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

        {/* 필터 */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              placeholder="거래 내용 또는 카테고리 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftSection={<IconSearch size={16} />}
              size="sm"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              placeholder="거래 유형"
              value={typeFilter}
              onChange={setTypeFilter}
              data={[
                { value: 'INCOME', label: '수입' },
                { value: 'EXPENSE', label: '지출' },
              ]}
              clearable
              size="sm"
            />
          </Grid.Col>
        </Grid>

        {/* 거래 목록 */}
        <Box>
          <Text size="sm" fw={600} mb="xs">
            거래 목록
          </Text>
          {transactionsLoading ? (
            <Box ta="center" py="xl">
              <Loader size="sm" />
            </Box>
          ) : filteredTransactions.length === 0 ? (
            <Box ta="center" py="xl" c="dimmed">
              <Text size="sm">연결할 수 있는 거래가 없습니다</Text>
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
                        {transaction.description || '설명 없음'}
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
                      연결
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
            닫기
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
