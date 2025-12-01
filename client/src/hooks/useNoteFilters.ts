import { useState, useCallback, useMemo } from 'react';
import type { NoteFilters } from '@/types/note';

export interface FilterState extends NoteFilters {
  folderId?: string;
  isPinned?: boolean;
  isFavorite?: boolean;
  isArchived?: boolean;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const useNoteFilters = (initialFilters: FilterState = {}) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // 필터 업데이트
  const updateFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : (value as number), // 페이지 외 필터 변경 시 1페이지로 초기화
    }));
  }, []);

  // 필터 초기화
  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // 폴더 필터
  const setFolderFilter = useCallback(
    (folderId?: string) => {
      updateFilter('folderId', folderId);
    },
    [updateFilter]
  );

  // 검색 필터
  const setSearchFilter = useCallback(
    (search?: string) => {
      updateFilter('search', search);
    },
    [updateFilter]
  );

  // 상태 필터
  const setStatusFilter = useCallback(
    (status: 'pinned' | 'favorite' | 'archived', value?: boolean) => {
      updateFilter(
        status === 'pinned' ? 'isPinned' : status === 'favorite' ? 'isFavorite' : 'isArchived',
        value
      );
    },
    [updateFilter]
  );

  // 페이지 변경
  const setPage = useCallback(
    (page: number) => {
      updateFilter('page', page);
    },
    [updateFilter]
  );

  // 정렬 변경
  const setSort = useCallback(
    (sortBy: FilterState['sortBy'], sortOrder?: FilterState['sortOrder']) => {
      setFilters((prev) => ({
        ...prev,
        sortBy,
        sortOrder: sortOrder || prev.sortOrder,
      }));
    },
    []
  );

  // 활성 필터 개수
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.folderId) count++;
    if (filters.isPinned) count++;
    if (filters.isFavorite) count++;
    if (filters.isArchived) count++;
    if (filters.search) count++;
    if (filters.type) count++;
    return count;
  }, [filters]);

  // 필터 적용 여부
  const hasActiveFilters = activeFilterCount > 0;

  return {
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    setFolderFilter,
    setSearchFilter,
    setStatusFilter,
    setPage,
    setSort,
    activeFilterCount,
    hasActiveFilters,
  };
};
