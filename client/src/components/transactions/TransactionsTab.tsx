"use client";

import { useState, useEffect } from 'react';
import { Stack, Button, Modal, Group, Text } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { useTranslation } from 'react-i18next';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';
import TransactionFilter from './TransactionFilter';
import CategoryManager from './CategoryManager';
import TransactionQuickAddBar from './TransactionQuickAddBar';
import { transactionApi } from '@/services/api/transactionApi';
import type { Transaction, CreateTransactionDto, UpdateTransactionDto, TransactionFilters } from '@/types/transaction';
import { getApiErrorMessage } from '@/utils/error';

export default function TransactionsTab() {
  const [page, setPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>({
    page: 1,
    limit: 20,
  });
  const [quickAddFocusSignal, setQuickAddFocusSignal] = useState(0);
  const [quickAddResetSignal, setQuickAddResetSignal] = useState(0);

  const queryClient = useQueryClient();
  const { t } = useTranslation('finance');

  // Allow external affordances to open the modal
  useEffect(() => {
    const handleOpenModal = () => {
      setQuickAddFocusSignal((prev) => prev + 1);
    };

    window.addEventListener('openTransactionModal', handleOpenModal);
    return () => {
      window.removeEventListener('openTransactionModal', handleOpenModal);
    };
  }, []);

  // Fetch transactions
  const { data, isLoading } = useQuery({
    queryKey: ['transactions', { ...filters, page }],
    queryFn: () => transactionApi.getTransactions({ ...filters, page }),
  });

  // Create transaction
  const createMutation = useMutation({
    mutationFn: transactionApi.createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      notifications.show({
        title: t('transactionsTab.notifications.successTitle'),
        message: t('transactionsTab.notifications.createSuccess'),
        color: 'teal',
      });
      setQuickAddResetSignal((prev) => prev + 1);
    },
    onError: (error: unknown) => {
      notifications.show({
        title: t('transactionsTab.notifications.errorTitle'),
        message: getApiErrorMessage(
          error,
          t('transactionsTab.notifications.createError')
        ),
        color: 'red',
      });
    },
  });

  // Update transaction
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionDto }) =>
      transactionApi.updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      notifications.show({
        title: t('transactionsTab.notifications.successTitle'),
        message: t('transactionsTab.notifications.updateSuccess'),
        color: 'teal',
      });
      setIsEditModalOpen(false);
      setEditingTransaction(null);
    },
    onError: (error: unknown) => {
      notifications.show({
        title: t('transactionsTab.notifications.errorTitle'),
        message: getApiErrorMessage(
          error,
          t('transactionsTab.notifications.updateError')
        ),
        color: 'red',
      });
    },
  });

  // Delete transaction
  const deleteMutation = useMutation({
    mutationFn: transactionApi.deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      notifications.show({
        title: t('transactionsTab.notifications.successTitle'),
        message: t('transactionsTab.notifications.deleteSuccess'),
        color: 'teal',
      });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: t('transactionsTab.notifications.errorTitle'),
        message: getApiErrorMessage(
          error,
          t('transactionsTab.notifications.deleteError')
        ),
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
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string) => {
    modals.openConfirmModal({
      title: t('transactionsTab.confirmDelete.title'),
      children: (
        <Text size="sm">{t('transactionsTab.confirmDelete.message')}</Text>
      ),
      labels: {
        confirm: t('transactionsTab.confirmDelete.confirm'),
        cancel: t('transactionsTab.confirmDelete.cancel'),
      },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteMutation.mutate(id),
    });
  };

  const handleModalClose = () => {
    setIsEditModalOpen(false);
    setEditingTransaction(null);
  };

  const handleFiltersChange = (newFilters: TransactionFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handleFiltersReset = () => {
    setFilters({ page: 1, limit: 20 });
    setPage(1);
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text size="lg" fw={600}>
          {t('transactionsTab.title')}
        </Text>
        <Group gap="sm">
          <Button
            variant="light"
            leftSection={<IconSettings size={16} />}
            onClick={() => setIsCategoryModalOpen(true)}
          >
            {t('transactionsTab.buttons.manageCategories')}
          </Button>
        </Group>
      </Group>

      <TransactionQuickAddBar
        onSubmit={handleCreate}
        loading={createMutation.isPending}
        focusSignal={quickAddFocusSignal}
        resetSignal={quickAddResetSignal}
      />

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
        opened={isEditModalOpen}
        onClose={handleModalClose}
        title={
          editingTransaction
            ? t('transactionsTab.modal.editTitle')
            : t('transactionsTab.modal.createTitle')
        }
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
