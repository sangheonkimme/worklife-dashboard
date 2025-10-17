import { useState, useEffect } from 'react';
import { Stack, Button, Modal, Group, Text } from '@mantine/core';
import { IconPlus, IconSettings } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';
import TransactionFilter from './TransactionFilter';
import CategoryManager from './CategoryManager';
import { transactionApi } from '@/services/api/transactionApi';
import type { Transaction, CreateTransactionDto, UpdateTransactionDto, TransactionFilters } from '@/types/transaction';

export default function TransactionsTab() {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>({
    page: 1,
    limit: 20,
  });

  const queryClient = useQueryClient();

  // Affix 버튼에서 모달 열기
  useEffect(() => {
    const handleOpenModal = () => {
      setIsModalOpen(true);
    };

    window.addEventListener('openTransactionModal', handleOpenModal);
    return () => {
      window.removeEventListener('openTransactionModal', handleOpenModal);
    };
  }, []);

  // 거래 목록 조회
  const { data, isLoading } = useQuery({
    queryKey: ['transactions', { ...filters, page }],
    queryFn: () => transactionApi.getTransactions({ ...filters, page }),
  });

  // 거래 생성
  const createMutation = useMutation({
    mutationFn: transactionApi.createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      notifications.show({
        title: '성공',
        message: '거래가 등록되었습니다',
        color: 'teal',
      });
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      notifications.show({
        title: '오류',
        message: error.response?.data?.message || '거래 등록에 실패했습니다',
        color: 'red',
      });
    },
  });

  // 거래 수정
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionDto }) =>
      transactionApi.updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      notifications.show({
        title: '성공',
        message: '거래가 수정되었습니다',
        color: 'teal',
      });
      setIsModalOpen(false);
      setEditingTransaction(null);
    },
    onError: (error: any) => {
      notifications.show({
        title: '오류',
        message: error.response?.data?.message || '거래 수정에 실패했습니다',
        color: 'red',
      });
    },
  });

  // 거래 삭제
  const deleteMutation = useMutation({
    mutationFn: transactionApi.deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      notifications.show({
        title: '성공',
        message: '거래가 삭제되었습니다',
        color: 'teal',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: '오류',
        message: error.response?.data?.message || '거래 삭제에 실패했습니다',
        color: 'red',
      });
    },
  });

  const handleCreate = (values: CreateTransactionDto) => {
    createMutation.mutate(values);
  };

  const handleUpdate = (values: CreateTransactionDto) => {
    if (!editingTransaction) return;
    updateMutation.mutate({
      id: editingTransaction.id,
      data: values,
    });
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    modals.openConfirmModal({
      title: '거래 삭제',
      children: <Text size="sm">정말로 이 거래를 삭제하시겠습니까?</Text>,
      labels: { confirm: '삭제', cancel: '취소' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteMutation.mutate(id),
    });
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const handleFiltersChange = (newFilters: TransactionFilters) => {
    setFilters(newFilters);
    setPage(1); // 필터 변경 시 첫 페이지로
  };

  const handleFiltersReset = () => {
    setFilters({ page: 1, limit: 20 });
    setPage(1);
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text size="lg" fw={600}>
          거래 내역
        </Text>
        <Group gap="sm">
          <Button
            variant="light"
            leftSection={<IconSettings size={16} />}
            onClick={() => setIsCategoryModalOpen(true)}
          >
            카테고리 관리
          </Button>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setIsModalOpen(true)}
          >
            거래 추가
          </Button>
        </Group>
      </Group>

      <TransactionFilter
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleFiltersReset}
      />

      <TransactionList
        transactions={data?.transactions || []}
        currentPage={page}
        totalPages={data?.pagination.totalPages || 1}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={isLoading || deleteMutation.isPending}
      />

      <Modal
        opened={isModalOpen}
        onClose={handleModalClose}
        title={editingTransaction ? '거래 수정' : '거래 추가'}
        size="md"
      >
        <TransactionForm
          initialValues={
            editingTransaction
              ? {
                  type: editingTransaction.type,
                  amount: editingTransaction.amount,
                  categoryId: editingTransaction.categoryId,
                  date: editingTransaction.date,
                  description: editingTransaction.description,
                }
              : undefined
          }
          onSubmit={editingTransaction ? handleUpdate : handleCreate}
          onCancel={handleModalClose}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      <CategoryManager
        opened={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </Stack>
  );
}
