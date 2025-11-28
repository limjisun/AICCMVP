import { Select } from './Select';
import type { SelectOption } from './Select';
import './Pagination.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  canPreviousPage: boolean;
  canNextPage: boolean;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  canPreviousPage,
  canNextPage,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 30, 40, 50],
}) => {
  const maxPages = 10;

  // Select 옵션 생성
  const selectOptions: SelectOption[] = pageSizeOptions.map((size) => ({
    label: `Show ${size}`,
    value: size,
  }));

  // 이전 그룹으로 이동
  const handlePreviousGroup = () => {
    const currentGroup = Math.floor(currentPage / maxPages);
    const prevGroupStart = (currentGroup - 1) * maxPages;
    onPageChange(Math.max(0, prevGroupStart));
  };

  // 다음 그룹으로 이동
  const handleNextGroup = () => {
    const currentGroup = Math.floor(currentPage / maxPages);
    const nextGroupStart = (currentGroup + 1) * maxPages;
    onPageChange(Math.min(totalPages - 1, nextGroupStart));
  };

  // 페이지 번호 버튼 생성
  const renderPageButtons = () => {
    const startPage = Math.floor(currentPage / maxPages) * maxPages;
    const endPage = Math.min(startPage + maxPages, totalPages);

    const pages = [];
    for (let i = startPage; i < endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`pagination-btn pagination-number ${
            currentPage === i ? 'active' : ''
          }`}
        >
          {i + 1}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="table-pagination">
      <div className="pagination-controls">
        {/* 이전 그룹으로 (10페이지씩) */}
        <button
          onClick={handlePreviousGroup}
          disabled={currentPage < 10}
          className="pagination-arrow pagination-left01"
        />

        {/* 이전 페이지 */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canPreviousPage}
          className="pagination-arrow pagination-left02"
        />

        {/* 페이지 번호 버튼들 */}
        {renderPageButtons()}

        {/* 다음 페이지 */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canNextPage}
          className="pagination-arrow pagination-right02"
        />

        {/* 다음 그룹으로 (10페이지씩) */}
        <button
          onClick={handleNextGroup}
          disabled={
            Math.floor(currentPage / 10) >= Math.floor((totalPages - 1) / 10)
          }
          className="pagination-arrow pagination-right01"
        />

        {/* 페이지 크기 선택 (옵션) */}
        {pageSize !== undefined && onPageSizeChange && (
          <div className="pagination-select">
            <Select
              value={pageSize}
              options={selectOptions}
              onChange={(value) => onPageSizeChange(Number(value))}
            />
          </div>
        )}
      </div>
    </div>
  );
};
