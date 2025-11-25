import React, { useState, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState,
  flexRender,
} from '@tanstack/react-table';
import type {
  KeywordTabType,
  SynonymItem,
  MisrecognitionItem,
  UsageAreaType,
} from '../../types';
import { Dropdown } from '../common/DropdownMenu';
import { Checkbox } from '../common/Checkbox';
import { EditableCell } from '../common/EditableCell';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../common/Table';

interface KeywordsTableProps {
  tabType: KeywordTabType;
}

const KeywordsTable: React.FC<KeywordsTableProps> = ({ tabType }) => {
  const [synonymKeywords, setSynonymKeywords] = useState<SynonymItem[]>([]);
  const [misrecognitionKeywords, setMisrecognitionKeywords] = useState<
    MisrecognitionItem[]
  >([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 현재 탭에 따른 키워드 데이터
  const keywords =
    tabType === 'synonym' ? synonymKeywords : misrecognitionKeywords;
  const setKeywords =
    tabType === 'synonym' ? setSynonymKeywords : setMisrecognitionKeywords;

  // 오늘 날짜 포맷 (YYYYMMDD)
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  };

  // 현재 날짜/시간 포맷 (YYYY/MM/DD HH:MM)
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  };

  // 샘플 엑셀 파일 다운로드
  const downloadSample = () => {
    const tabName = tabType === 'synonym' ? '동의어' : '오인식교정';
    const sampleData =
      tabType === 'synonym'
        ? [
            {
              '최근수정일시': '2025/11/05 15:13',
              '대표 키워드': '인출',
              '유사어': '거래처, 계산',
              '사용영역': '금지어',
            },
          ]
        : [
            {
              '최근수정일시': '2025/11/05 15:13',
              '교정어': '핵심스',
              '오인식어': '핵시스, 핵시ㅅ',
            },
          ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, tabName);

    const fileName = `${tabName}_${getTodayDate()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // 양식 엑셀 파일 다운로드 (빈 파일)
  const downloadTemplate = () => {
    const tabName = tabType === 'synonym' ? '동의어' : '오인식교정';
    const templateData =
      tabType === 'synonym'
        ? [
            {
              '최근수정일시': '',
              '대표 키워드': '',
              '유사어': '',
              '사용영역': '',
            },
          ]
        : [
            {
              '최근수정일시': '',
              '교정어': '',
              '오인식어': '',
            },
          ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, tabName);

    const fileName = `${tabName}_양식_${getTodayDate()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // 엑셀 파일 업로드
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<
          string,
          string
        >[];

        if (tabType === 'synonym') {
          // 동의어 데이터 변환
          const newKeywords: SynonymItem[] = jsonData.map((row, index) => ({
            id: `KW${Date.now()}${index}`,
            date: row['최근수정일시'] || getCurrentDateTime(),
            representative: row['대표 키워드'] || '',
            synonyms: row['유사어'] || '',
            usageArea: (row['사용영역'] === '부정어'
              ? 'negative'
              : 'forbidden') as UsageAreaType,
            isNew: false,
          }));

          // 중복 제거 (대표 키워드 기준)
          const uniqueKeywords = newKeywords.filter((newKw) => {
            return !(synonymKeywords as SynonymItem[]).some(
              (existingKw) => existingKw.representative === newKw.representative
            );
          });

          setSynonymKeywords([
            ...(synonymKeywords as SynonymItem[]),
            ...uniqueKeywords,
          ]);
          alert(`${uniqueKeywords.length}개의 키워드가 등록되었습니다.`);
        } else {
          // 오인식 교정 데이터 변환
          const newKeywords: MisrecognitionItem[] = jsonData.map(
            (row, index) => ({
              id: `KW${Date.now()}${index}`,
              date: row['최근수정일시'] || getCurrentDateTime(),
              correctedWord: row['교정어'] || '',
              misrecognizedWord: row['오인식어'] || '',
              isNew: false,
            })
          );

          // 중복 제거 (교정어 기준)
          const uniqueKeywords = newKeywords.filter((newKw) => {
            return !(misrecognitionKeywords as MisrecognitionItem[]).some(
              (existingKw) => existingKw.correctedWord === newKw.correctedWord
            );
          });

          setMisrecognitionKeywords([
            ...(misrecognitionKeywords as MisrecognitionItem[]),
            ...uniqueKeywords,
          ]);
          alert(`${uniqueKeywords.length}개의 교정어가 등록되었습니다.`);
        }
      } catch (error) {
        alert('엑셀 파일을 읽는 중 오류가 발생했습니다.');
        console.error(error);
      }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = ''; // 파일 input 초기화
  };

  // 신규 행 추가
  const handleAddNew = () => {
    if (tabType === 'synonym') {
      const newKeyword: SynonymItem = {
        id: `NEW${Date.now()}`,
        date: getCurrentDateTime(),
        representative: '',
        synonyms: '',
        usageArea: 'forbidden',
        isNew: true,
      };
      setSynonymKeywords([newKeyword, ...(synonymKeywords as SynonymItem[])]);
    } else {
      const newKeyword: MisrecognitionItem = {
        id: `NEW${Date.now()}`,
        date: getCurrentDateTime(),
        correctedWord: '',
        misrecognizedWord: '',
        isNew: true,
      };
      setMisrecognitionKeywords([
        newKeyword,
        ...(misrecognitionKeywords as MisrecognitionItem[]),
      ]);
    }
  };

  // 키워드 삭제
  const handleDelete = React.useCallback(
    (id: string) => {
      if (confirm('삭제하시겠습니까?')) {
        setKeywords(keywords.filter((kw) => kw.id !== id) as any);
      }
    },
    [keywords, setKeywords]
  );

  // 선택된 행 삭제
  const handleDeleteSelected = () => {
    const selectedIds = Object.keys(rowSelection);
    if (selectedIds.length === 0) {
      alert('삭제할 항목을 선택해주세요.');
      return;
    }

    if (confirm(`${selectedIds.length}개 항목을 삭제하시겠습니까?`)) {
      const selectedIndexes = selectedIds.map(Number);
      const filteredData = filteredKeywords.filter(
        (_, index) => !selectedIndexes.includes(index)
      );
      setKeywords(filteredData as any);
      setRowSelection({});
    }
  };

  // 취소 (신규건만 - 행 삭제)
  const handleCancel = React.useCallback(
    (id: string) => {
      setKeywords(keywords.filter((kw) => kw.id !== id) as any);
    },
    [keywords, setKeywords]
  );

  // 저장 (수정사항 반영)
  const handleSave = React.useCallback(
    (id: string) => {
      setKeywords(
        keywords.map((kw) =>
          kw.id === id
            ? { ...kw, isNew: false, isDirty: false, date: getCurrentDateTime() }
            : kw
        ) as any
      );
    },
    [keywords, setKeywords]
  );

  // 필드 업데이트 (저장된 건은 isDirty 플래그 설정)
  const handleFieldChange = React.useCallback(
    (
      id: string,
      field: keyof SynonymItem | keyof MisrecognitionItem,
      value: string | UsageAreaType
    ) => {
      setKeywords(
        keywords.map((kw) => {
          if (kw.id === id) {
            // 신규건이 아니면 isDirty 플래그 설정
            return kw.isNew
              ? { ...kw, [field]: value }
              : { ...kw, [field]: value, isDirty: true };
          }
          return kw;
        }) as any
      );
    },
    [keywords, setKeywords]
  );

  // 검색 필터링
  const filteredKeywords = useMemo(() => {
    if (!searchQuery) return keywords;
    if (tabType === 'synonym') {
      return (keywords as SynonymItem[]).filter((kw) => {
        return (
          kw.representative.includes(searchQuery) ||
          kw.synonyms.includes(searchQuery)
        );
      });
    } else {
      return (keywords as MisrecognitionItem[]).filter((kw) => {
        return (
          kw.correctedWord.includes(searchQuery) ||
          kw.misrecognizedWord.includes(searchQuery)
        );
      });
    }
  }, [keywords, searchQuery, tabType]);

  // 동의어 테이블 컬럼 정의
  const synonymColumns = useMemo<ColumnDef<SynonymItem>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
          />
        ),
        enableSorting: false,
        size: 40,
      },
      {
        accessorKey: 'date',
        header: '최근수정일시',
        cell: ({ row }) => {
          const kw = row.original;
          return <span className="table-date">{kw.date}</span>;
        },
        size: 150,
      },
      {
        accessorKey: 'representative',
        header: '대표 키워드',
        cell: ({ row }) => {
          const kw = row.original;
          return (
            <EditableCell
              value={kw.representative}
              onChange={(value) =>
                handleFieldChange(kw.id, 'representative', value)
              }
              placeholder="대표 키워드 입력"
            />
          );
        },
        size: 200,
      },
      {
        accessorKey: 'synonyms',
        header: '유사어',
        cell: ({ row }) => {
          const kw = row.original;
          return (
            <EditableCell
              value={kw.synonyms}
              onChange={(value) => handleFieldChange(kw.id, 'synonyms', value)}
              placeholder="유사어 입력 (쉼표로 구분)"
            />
          );
        },
        size: 250,
      },
      {
        accessorKey: 'usageArea',
        header: '사용영역',
        cell: ({ row }) => {
          const kw = row.original;
          return (
            <div className="usage-area-toggle">
              <button
                className={`usage-btn ${
                  kw.usageArea === 'forbidden' ? 'usage-btn--active' : ''
                }`}
                onClick={() =>
                  handleFieldChange(kw.id, 'usageArea', 'forbidden')
                }
              >
                금지어
              </button>
              <button
                className={`usage-btn ${
                  kw.usageArea === 'negative' ? 'usage-btn--active' : ''
                }`}
                onClick={() =>
                  handleFieldChange(kw.id, 'usageArea', 'negative')
                }
              >
                부정어
              </button>
            </div>
          );
        },
        enableSorting: false,
        size: 150,
      },
      {
        id: 'actions',
        header: '버튼',
        cell: ({ row }) => {
          const kw = row.original;
          return (
            <div className="table-actions">
              {/* 신규건: 취소, 저장 */}
              {kw.isNew && (
                <>
                  <button
                    onClick={() => handleCancel(kw.id)}
                    className="btn-table btn-cancel"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => handleSave(kw.id)}
                    className="btn-table btn-save"
                  >
                    저장
                  </button>
                </>
              )}
              {/* 저장된 건: 삭제만 (수정하지 않은 경우) */}
              {!kw.isNew && !kw.isDirty && (
                <button
                  onClick={() => handleDelete(kw.id)}
                  className="btn-table btn-delete"
                >
                  삭제
                </button>
              )}
              {/* 저장된 건 수정 시: 삭제, 저장 */}
              {!kw.isNew && kw.isDirty && (
                <>
                  <button
                    onClick={() => handleDelete(kw.id)}
                    className="btn-table btn-delete"
                  >
                    삭제
                  </button>
                  <button
                    onClick={() => handleSave(kw.id)}
                    className="btn-table btn-save"
                  >
                    저장
                  </button>
                </>
              )}
            </div>
          );
        },
        enableSorting: false,
        size: 180,
      },
    ],
    [handleFieldChange, handleDelete, handleCancel, handleSave]
  );

  // 오인식 교정 테이블 컬럼 정의
  const misrecognitionColumns = useMemo<ColumnDef<MisrecognitionItem>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
          />
        ),
        enableSorting: false,
        size: 40,
      },
      {
        accessorKey: 'date',
        header: '최근수정일시',
        cell: ({ row }) => {
          const kw = row.original;
          return <span className="table-date">{kw.date}</span>;
        },
        size: 150,
      },
      {
        accessorKey: 'correctedWord',
        header: '교정어',
        cell: ({ row }) => {
          const kw = row.original;
          return (
            <EditableCell
              value={kw.correctedWord}
              onChange={(value) =>
                handleFieldChange(kw.id, 'correctedWord', value)
              }
              placeholder="교정어 입력"
            />
          );
        },
        size: 250,
      },
      {
        accessorKey: 'misrecognizedWord',
        header: '오인식어',
        cell: ({ row }) => {
          const kw = row.original;
          return (
            <EditableCell
              value={kw.misrecognizedWord}
              onChange={(value) =>
                handleFieldChange(kw.id, 'misrecognizedWord', value)
              }
              placeholder="오인식어 입력 (쉼표로 구분)"
            />
          );
        },
        size: 250,
      },
      {
        id: 'actions',
        header: '버튼',
        cell: ({ row }) => {
          const kw = row.original;
          return (
            <div className="table-actions">
              {/* 신규건: 취소, 저장 */}
              {kw.isNew && (
                <>
                  <button
                    onClick={() => handleCancel(kw.id)}
                    className="btn-table btn-cancel"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => handleSave(kw.id)}
                    className="btn-table btn-save"
                  >
                    저장
                  </button>
                </>
              )}
              {/* 저장된 건: 삭제만 (수정하지 않은 경우) */}
              {!kw.isNew && !kw.isDirty && (
                <button
                  onClick={() => handleDelete(kw.id)}
                  className="btn-table btn-delete"
                >
                  삭제
                </button>
              )}
              {/* 저장된 건 수정 시: 삭제, 저장 */}
              {!kw.isNew && kw.isDirty && (
                <>
                  <button
                    onClick={() => handleDelete(kw.id)}
                    className="btn-table btn-delete"
                  >
                    삭제
                  </button>
                  <button
                    onClick={() => handleSave(kw.id)}
                    className="btn-table btn-save"
                  >
                    저장
                  </button>
                </>
              )}
            </div>
          );
        },
        enableSorting: false,
        size: 180,
      },
    ],
    [handleFieldChange, handleDelete, handleCancel, handleSave]
  );

  // 현재 탭에 따른 컬럼 선택
  const columns = tabType === 'synonym' ? synonymColumns : misrecognitionColumns;

  // TanStack Table 설정
  const table = useReactTable({
    data: filteredKeywords as any,
    columns: columns as any,
    state: {
      sorting,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // 빈 화면 처리
  if (keywords.length === 0) {
    return (
      <div className="keywords-empty">
        <p className="keywords-empty__title">
          {tabType === 'synonym'
            ? '등록된 동의어가 없습니다.'
            : '등록된 오인식 교정어가 없습니다.'}
        </p>
        <p className="keywords-empty__subtitle">
          {tabType === 'synonym'
            ? '동의어를 등록해 보세요.'
            : '교정어를 등록해보세요.'}
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="keywords-upload-input"
        />

        <Dropdown
          trigger={<button className="keywords-upload-btn">업로드</button>}
          items={[
            { label: '양식 다운로드', onClick: downloadTemplate },
            { label: '샘플 다운로드', onClick: downloadSample },
            {
              label: '엑셀 업로드',
              onClick: () => fileInputRef.current?.click(),
            },
          ]}
        />
      </div>
    );
  }

  return (
    <div className="keywords-grid-container">
      {/* 상단 액션 */}
      <div className="keywords-actions">
        <input
          type="text"
          className="keywords-search"
          placeholder="검색어 입력"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="keywords-actions-right">
          <button
            className="keywords-btn keywords-btn--sm keywords-btn--primary"
            onClick={handleAddNew}
          >
            신규 추가
          </button>
          <button
            className="keywords-btn keywords-btn--sm keywords-btn--danger"
            onClick={handleDeleteSelected}
          >
            선택 삭제
          </button>
          <Dropdown
            trigger={
              <button className="keywords-btn keywords-btn--sm keywords-btn--primary">
                업로드
              </button>
            }
            items={[
              { label: '양식 다운로드', onClick: downloadTemplate },
              { label: '샘플 다운로드', onClick: downloadSample },
              {
                label: '엑셀 업로드',
                onClick: () => fileInputRef.current?.click(),
              },
            ]}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            className="keywords-upload-input"
          />
        </div>
      </div>

      {/* 테이블 */}
      <div className="keywords-table-wrapper">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() }}
                    onClick={header.column.getToggleSortingHandler()}
                    className={
                      header.column.getCanSort() ? 'cursor-pointer' : ''
                    }
                  >
                    <div className="table-head-content">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getIsSorted() && (
                        <span className="sort-indicator">
                          {header.column.getIsSorted() === 'asc' ? ' ↑' : ' ↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 */}
      <div className="table-pagination">
        <div className="pagination-info">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected
        </div>
        <div className="pagination-controls">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="pagination-btn"
          >
            {'<<'}
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="pagination-btn"
          >
            {'<'}
          </button>
          <span className="pagination-page">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="pagination-btn"
          >
            {'>'}
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="pagination-btn"
          >
            {'>>'}
          </button>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="pagination-select"
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default KeywordsTable;
