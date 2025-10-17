import { Table, Badge, ActionIcon, Group, Text, Paper, Stack, Pagination, Center } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import type { Transaction } from '@/types/transaction';

interface TransactionListProps {
  transactions: Transaction[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

export default function TransactionList({
  transactions,
  currentPage,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
  loading,
}: TransactionListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (transactions.length === 0) {
    return (
      <Paper p="xl" withBorder>
        <Stack align="center" gap="md">
          <Text c="dimmed" size="lg">
            거래 내역이 없습니다
          </Text>
          <Text c="dimmed" size="sm">
            새로운 거래를 추가해보세요
          </Text>
        </Stack>
      </Paper>
    );
  }

  return (
    <Stack gap="md">
      <Paper withBorder>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>날짜</Table.Th>
              <Table.Th>유형</Table.Th>
              <Table.Th>카테고리</Table.Th>
              <Table.Th>금액</Table.Th>
              <Table.Th>메모</Table.Th>
              <Table.Th>액션</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {transactions.map((transaction) => (
              <Table.Tr key={transaction.id}>
                <Table.Td>
                  <Text size="sm">{formatDate(transaction.date)}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge color={transaction.type === 'INCOME' ? 'teal' : 'red'} variant="light">
                    {transaction.type === 'INCOME' ? '수입' : '지출'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    {transaction.category.color && (
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: transaction.category.color,
                        }}
                      />
                    )}
                    <Text size="sm">{transaction.category.name}</Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Text
                    fw={600}
                    c={transaction.type === 'INCOME' ? 'teal' : 'red'}
                  >
                    {transaction.type === 'INCOME' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" lineClamp={1} c="dimmed">
                    {transaction.description || '-'}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon
                      variant="light"
                      color="blue"
                      onClick={() => onEdit(transaction)}
                      disabled={loading}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      onClick={() => onDelete(transaction.id)}
                      disabled={loading}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      {totalPages > 1 && (
        <Center>
          <Pagination
            value={currentPage}
            onChange={onPageChange}
            total={totalPages}
          />
        </Center>
      )}
    </Stack>
  );
}
