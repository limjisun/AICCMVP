import React, { useState, useMemo } from 'react';
import { DataGrid } from 'react-data-grid';
import type { Column, SortColumn } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import { DateRangePicker } from '@/components/common/DateRangePicker';
import { Pagination } from '@/components/common/Pagination';
import { cn } from '@/lib/utils';
import { Select } from '@/components/common/Select';
import type { SelectOption } from '@/components/common/Select';
import { useConsultationHistoryStore } from '@/stores/consultationHistoryStore';
import type { ConsultationHistory } from '@/stores/consultationHistoryStore';
import ConsultationDetailPanel from '@/components/consultation/ConsultationDetailPanel';

const Consultation: React.FC = () => {
  const {
    histories,
    filters,
    setFilters,
    resetFilters,
    setSelectedHistory,
    selectedHistory,
    isDetailPanelOpen
  } = useConsultationHistoryStore();

  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([]);

  // 정렬 처리
  const sortedHistories = useMemo(() => {
    if (sortColumns.length === 0) return histories;

    return [...histories].sort((a, b) => {
      for (const sort of sortColumns) {
        const aValue = a[sort.columnKey as keyof ConsultationHistory];
        const bValue = b[sort.columnKey as keyof ConsultationHistory];
        if (aValue === undefined || bValue === undefined) continue;
        const compareResult = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        if (compareResult !== 0) {
          return sort.direction === 'ASC' ? compareResult : -compareResult;
        }
      }
      return 0;
    });
  }, [histories, sortColumns]);

  // 페이지네이션 계산
  const totalPages = Math.ceil(sortedHistories.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedHistories = sortedHistories.slice(startIndex, endIndex);

  const statusOptions: SelectOption[] = [
    { label: '전체', value: '' },
    { label: '상담완료', value: '상담완료' },
    { label: '상담사전환', value: '상담사전환' },
    { label: '상담실패', value: '상담실패' },
    { label: '재연락', value: '재연락' },
    { label: '부재', value: '부재' },
    { label: '무응답', value: '무응답' },
  ];

  const channelOptions: SelectOption[] = [
    { label: '전체', value: '' },
    { label: '콜', value: '콜' },
    { label: '채팅', value: '채팅' },
  ];

  const handleSearch = () => {
    console.log('Search with filters:', filters);
  };

  const handleReset = () => {
    resetFilters();
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const getStatusBadgeClass = (color: string) => {
    const colorMap: Record<string, string> = {
      purple: 'badge-purple',
      blue: 'badge-blue',
      gray: 'badge-gray',
      orange: 'badge-orange',
      yellow: 'badge-yellow',
      green: 'badge-green',
    };
    return colorMap[color] || 'badge-gray';
  };

  // DataGrid 컬럼 정의
  const columns = useMemo<Column<ConsultationHistory>[]>(() => [
    { key: 'createdAt', name: '상담일시', width: '12%' },
    { key: 'consultationId', name: '상담ID', width: '10%' },
    {
      key: 'status',
      name: '상담상태',
      width: '10%',
      cellClass: 'cell-center',
      renderCell: ({ row }) => (
        <span className={cn('status-badge', getStatusBadgeClass(row.statusColor))}>
          {row.status}
        </span>
      )
    },
    { key: 'category', name: '인텐트', width: '8%' },
    {
      key: 'channel',
      name: '상담채널',
      width: '10%',
      cellClass: 'cell-center',
      headerCellClass: 'header-center',
      renderCell: ({ row }) => (
        <span className={cn('channel-badge', row.channel === '콜' ? 'channel-call' : 'channel-chat')}>
          {row.channel}
        </span>
      )
    },
    {
      key: 'consultationType',
      name: '상담유형',
      width: '8%',
      cellClass: 'cell-center',
      headerCellClass: 'header-center'
    },
    { key: 'customerName', name: '고객명', width: '8%' },
    { key: 'email', name: '이메일', width: '12%' },
    { key: 'contactPhone', name: '전화번호', width: '12%' },
    {
      key: 'actions',
      name: '상담내역',
      width: '10%',
      headerCellClass: 'header-center',
      cellClass: 'cell-center',
      renderCell: ({ row }) => (
        <button
          className="btn-icon-consult"
          onClick={() => setSelectedHistory(row)}
        >
        </button>
      )
    }
  ], [setSelectedHistory]);

  return (
    <div className="consultation-page">
      <h3 className="page-title">AI상담이력</h3>
      {/* 필터 영역 */}
      <div className="consultation-filters">
        <div className="filter-row">
          {/* 기간 */}
          <div className="filter-item filter-date">
            <label className="filter-label">기간</label>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              startPlaceholder="2025-10-10"
              endPlaceholder="2025-10-10"
            />
          </div>

          {/* 상담상태 */}
          <div className="filter-item">
            <label className="filter-label">상담상태</label>
            <Select
              value={filters.status}
              options={statusOptions}
              onChange={(value: string | number) => setFilters({ status: String(value) })}
              placeholder="전체"
            />
          </div>

          {/* 상담채널 */}
          <div className="filter-item">
            <label className="filter-label">상담채널</label>
            <Select
              value={filters.channel}
              options={channelOptions}
              onChange={(value: string | number) => setFilters({ channel: String(value) })}
              placeholder="전체"
            />
          </div>

          {/* 검색 */}
          <div className="filter-item">
            <label className="filter-label">검색</label>
            <input
              type="text"
              className="search-input"
              placeholder="검색어 입력"
              value={filters.search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({ search: e.target.value })}
            />
          </div>
        </div>
          {/* 버튼 */}
          <div className="btn-flex-wrap">
            <button
              className="btn-basic btn-line2"
              onClick={handleReset}
              title=""
            >
              초기화
            </button>
            <button onClick={handleSearch} className="btn-basic btn-bg">
              조회
            </button>
          </div>
      </div>

      {/* 테이블 영역 */}
      <div className={cn(
          "consultation-content",
          isDetailPanelOpen && "open"
        )}>
        <div className="table-container">
          <div className="data-grid-wrapper">
            <DataGrid
              columns={columns}
              rows={paginatedHistories}
              rowKeyGetter={(row: ConsultationHistory) => row.id}
              sortColumns={sortColumns}
              onSortColumnsChange={setSortColumns}
              rowClass={(row) => selectedHistory?.id === row.id ? 'row-selected' : ''}
              defaultColumnOptions={{
                sortable: true,
                resizable: false
              }}
              className="consultation-data-grid"
            />
             {/* 페이지네이션 */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                canPreviousPage={currentPage > 0}
                canNextPage={currentPage < totalPages - 1}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
              />
          </div>
        </div>

        {/* 상세 패널 */}
        {isDetailPanelOpen && selectedHistory && (
          <ConsultationDetailPanel />
        )}
      </div>

    </div>
  );
};

export default Consultation;
