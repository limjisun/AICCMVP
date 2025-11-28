import React, { useState, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { DataGrid } from 'react-data-grid';
import type { Column, SortColumn } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import type {
  KeywordTabType,
  SynonymItem,
  MisrecognitionItem,
  UsageAreaType,
} from '../../types';
import { Dropdown } from '../common/DropdownMenu';
import { Checkbox } from '../common/Checkbox';
import { EditableCell } from '../common/EditableCell';
import { Select } from '../common/Select';
import Tooltip from '../common/Tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';

interface KeywordsTableProps {
  tabType: KeywordTabType;
}

const KeywordsTable: React.FC<KeywordsTableProps> = ({ tabType }) => {
  const [synonymKeywords, setSynonymKeywords] = useState<SynonymItem[]>([]);
  const [misrecognitionKeywords, setMisrecognitionKeywords] = useState<
    MisrecognitionItem[]
  >([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<string>>(new Set());
  const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
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
    const filteredData = filteredKeywords.filter(
      (kw) => !selectedRows.has(kw.id)
    );
    setKeywords(filteredData as any);
    setSelectedRows(new Set());
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

  // 정렬 처리
  const sortedKeywords = useMemo(() => {
    if (sortColumns.length === 0) return filteredKeywords;

    return [...filteredKeywords].sort((a, b) => {
      for (const sort of sortColumns) {
        const aValue = a[sort.columnKey as keyof typeof a];
        const bValue = b[sort.columnKey as keyof typeof b];
        if (aValue === undefined || bValue === undefined) continue;
        const compareResult = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        if (compareResult !== 0) {
          return sort.direction === 'ASC' ? compareResult : -compareResult;
        }
      }
      return 0;
    });
  }, [filteredKeywords, sortColumns]);

  // 페이지네이션
  const totalPages = Math.ceil(sortedKeywords.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedKeywords = sortedKeywords.slice(startIndex, endIndex);

  // 동의어 테이블 컬럼 정의
  const synonymColumns = useMemo<Column<SynonymItem>[]>(
    () => [
      {
        key: 'select',
        name: '',
        width: '5%',
        headerCellClass: 'table-head-center',
        cellClass: 'cell-center',
        renderHeaderCell: () => (
          <Checkbox
            checked={selectedRows.size === paginatedKeywords.length && paginatedKeywords.length > 0}
            indeterminate={selectedRows.size > 0 && selectedRows.size < paginatedKeywords.length}
            onCheckedChange={(checked) => {
              if (checked) {
                setSelectedRows(new Set(paginatedKeywords.map(kw => kw.id)));
              } else {
                setSelectedRows(new Set());
              }
            }}
          />
        ),
        renderCell: ({ row }) => (
          <Checkbox
            checked={selectedRows.has(row.id)}
            onCheckedChange={(checked) => {
              const newSelection = new Set(selectedRows);
              if (checked) {
                newSelection.add(row.id);
              } else {
                newSelection.delete(row.id);
              }
              setSelectedRows(newSelection);
            }}
          />
        ),
      },
      {
        key: 'date',
        name: '최근수정일시',
        width: '15%',
        renderCell: ({ row }) => <span className="table-date">{row.date}</span>,
      },
      {
        key: 'representative',
        name: '대표 키워드',
        width: '20%',
        renderCell: ({ row }) => (
          <EditableCell
            value={row.representative}
            onChange={(value) => handleFieldChange(row.id, 'representative', value)}
            placeholder="대표 키워드 입력"
          />
        ),
      },
      {
        key: 'synonyms',
        name: '유사어',
        width: '25%',
        renderCell: ({ row }) => (
          <EditableCell
            value={row.synonyms}
            onChange={(value) => handleFieldChange(row.id, 'synonyms', value)}
            placeholder="유사어 입력 (쉼표로 구분)"
          />
        ),
      },
      {
        key: 'usageArea',
        name: '사용영역',
        width: '15%',
        cellClass: 'cell-center',
        renderHeaderCell: () => (
          <Tooltip text="금지어: 고객 응대 시 사용하지 말아야 할 단어 / 부정어: 부정적인 의미를 가진 단어">
            사용영역
          </Tooltip>
        ),
        renderCell: ({ row }) => (
          <div className="usage-area-toggle">
            <button
              className={`usage-btn ${
                row.usageArea === 'forbidden' ? 'usage-btn--active' : ''
              }`}
              onClick={() => handleFieldChange(row.id, 'usageArea', 'forbidden')}
            >
              금지어
            </button>
            <button
              className={`usage-btn ${
                row.usageArea === 'negative' ? 'usage-btn--active' : ''
              }`}
              onClick={() => handleFieldChange(row.id, 'usageArea', 'negative')}
            >
              부정어
            </button>
          </div>
        ),
      },
      {
        key: 'actions',
        name: '',
        width: '20%',
        cellClass: 'cell-center',
        renderCell: ({ row }) => (
          <div className="table-actions">
            {/* 신규건: 취소, 저장 */}
            {row.isNew && (
              <div className="btn-flex-wrap">
                <button
                  onClick={() => handleCancel(row.id)}
                  className="btn-table btn-cancel"
                >
                  취소
                </button>
                <button
                  onClick={() => handleSave(row.id)}
                  className="btn-table btn-save"
                >
                  저장
                </button>
              </div>
            )}
            {/* 저장된 건: 삭제만 (수정하지 않은 경우) */}
            {!row.isNew && !row.isDirty && (
              <button
                onClick={() => handleDelete(row.id)}
                className="btn-table btn-delete"
              >
                삭제
              </button>
            )}
            {/* 저장된 건 수정 시: 삭제, 저장 */}
            {!row.isNew && row.isDirty && (
              <>
                <button
                  onClick={() => handleDelete(row.id)}
                  className="btn-table btn-delete"
                >
                  삭제
                </button>
                <button
                  onClick={() => handleSave(row.id)}
                  className="btn-table btn-save"
                >
                  저장
                </button>
              </>
            )}
          </div>
        ),
      },
    ],
    [handleFieldChange, handleDelete, handleCancel, handleSave, selectedRows, paginatedKeywords]
  );

  // 오인식 교정 테이블 컬럼 정의
  const misrecognitionColumns = useMemo<Column<MisrecognitionItem>[]>(
    () => [
      {
        key: 'select',
        name: '',
        width: '5%',
        headerCellClass: 'table-head-center',
        renderHeaderCell: () => (
          <Checkbox
            checked={selectedRows.size === paginatedKeywords.length && paginatedKeywords.length > 0}
            indeterminate={selectedRows.size > 0 && selectedRows.size < paginatedKeywords.length}
            onCheckedChange={(checked) => {
              if (checked) {
                setSelectedRows(new Set(paginatedKeywords.map(kw => kw.id)));
              } else {
                setSelectedRows(new Set());
              }
            }}
          />
        ),
        renderCell: ({ row }) => (
          <Checkbox
            checked={selectedRows.has(row.id)}
            onCheckedChange={(checked) => {
              const newSelection = new Set(selectedRows);
              if (checked) {
                newSelection.add(row.id);
              } else {
                newSelection.delete(row.id);
              }
              setSelectedRows(newSelection);
            }}
          />
        ),
      },
      {
        key: 'date',
        name: '최근수정일시',
        width: '20%',
        renderCell: ({ row }) => <span className="table-date">{row.date}</span>,
      },
      {
        key: 'correctedWord',
        name: '교정어',
        width: '30%',
        renderCell: ({ row }) => (
          <EditableCell
            value={row.correctedWord}
            onChange={(value) => handleFieldChange(row.id, 'correctedWord', value)}
            placeholder="교정어 입력"
          />
        ),
      },
      {
        key: 'misrecognizedWord',
        name: '오인식어',
        width: '30%',
        renderCell: ({ row }) => (
          <EditableCell
            value={row.misrecognizedWord}
            onChange={(value) => handleFieldChange(row.id, 'misrecognizedWord', value)}
            placeholder="오인식어 입력 (쉼표로 구분)"
          />
        ),
      },
      {
        key: 'actions',
        name: '버튼',
        width: '15%',
        renderCell: ({ row }) => (
          <div className="table-actions">
            {/* 신규건: 취소, 저장 */}
            {row.isNew && (
              <>
                <button
                  onClick={() => handleCancel(row.id)}
                  className="btn-table btn-cancel"
                >
                  취소
                </button>
                <button
                  onClick={() => handleSave(row.id)}
                  className="btn-table btn-save"
                >
                  저장
                </button>
              </>
            )}
            {/* 저장된 건: 삭제만 (수정하지 않은 경우) */}
            {!row.isNew && !row.isDirty && (
              <button
                onClick={() => handleDelete(row.id)}
                className="btn-table btn-delete"
              >
                삭제
              </button>
            )}
            {/* 저장된 건 수정 시: 삭제, 저장 */}
            {!row.isNew && row.isDirty && (
              <>
                <button
                  onClick={() => handleDelete(row.id)}
                  className="btn-table btn-delete"
                >
                  삭제
                </button>
                <button
                  onClick={() => handleSave(row.id)}
                  className="btn-table btn-save"
                >
                  저장
                </button>
              </>
            )}
          </div>
        ),
      },
    ],
    [handleFieldChange, handleDelete, handleCancel, handleSave, selectedRows, paginatedKeywords]
  );

  // 현재 탭에 따른 컬럼 선택
  const columns = tabType === 'synonym' ? synonymColumns : misrecognitionColumns;

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
        <div className="btn-flex-wrap">
          <Dropdown
            trigger={<button className="btn-basic btn-line">업로드</button>}
            items={[
              { label: '양식 다운로드', onClick: downloadTemplate },
              {
                label: '엑셀 업로드',
                onClick: () => fileInputRef.current?.click(),
              },
            ]}
          />
          <button className="btn-basic btn-bg" onClick={handleAddNew}>추가</button>
        </div>
      </div>
    );
  }

  return (
    <div className="keywords-grid-container">
      {/* 상단 액션 */}
      <div className="keywords-actions">
        <div className="keywords-search-wrap">
          <input
            type="text"
            className="keywords-search"
            placeholder="검색어 입력"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="btn-flex-wrap">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="btn-basic btn-line"
                disabled={selectedRows.size === 0}
              >
                삭제
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  대표키워드 {selectedRows.size}를 삭제하시겠어요?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  대표키워드를 삭제하면 관련된 <br />
                  {tabType === 'synonym'
                    ? '모든 동의어 세트가 함께 제거됩니다.'
                    : '모든 오인식어 세트가 함께 제거됩니다.'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>닫기</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteSelected}>
                  삭제
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Dropdown
            trigger={<button className="btn-basic btn-line">업로드</button>}
            items={[
              { label: '양식 다운로드', onClick: downloadTemplate },
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
          <button className="btn-basic btn-bg" onClick={handleAddNew}>
            추가
          </button>
        </div>
      </div>

      {/* 테이블 */}
      <div className="keywords-table-wrapper">
        <DataGrid
          columns={columns as Column<SynonymItem | MisrecognitionItem>[]}
          rows={paginatedKeywords as (SynonymItem | MisrecognitionItem)[]}
          rowKeyGetter={(row) => row.id}
          sortColumns={sortColumns}
          onSortColumnsChange={setSortColumns}
          defaultColumnOptions={{
            sortable: true,
            resizable: true
          }}
          className="keywords-data-grid"
        />
      </div>

      {/* 페이지네이션 */}
      <div className="table-pagination">
        <div className="pagination-controls">
          {/* 이전 그룹으로 (10페이지씩) */}
          <button
            onClick={() => {
              const maxPages = 10;
              const currentGroup = Math.floor(currentPage / maxPages);
              const prevGroupStart = (currentGroup - 1) * maxPages;
              setCurrentPage(Math.max(0, prevGroupStart));
            }}
            disabled={currentPage < 10}
            className="pagination-arrow pagination-left01"
          ></button>

          {/* 이전 페이지 */}
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 0}
            className="pagination-arrow pagination-left02"
          ></button>

          {/* 페이지 번호 버튼들 */}
          {(() => {
            const maxPages = 10;
            const startPage = Math.floor(currentPage / maxPages) * maxPages;
            const endPage = Math.min(startPage + maxPages, totalPages);

            const pages = [];
            for (let i = startPage; i < endPage; i++) {
              pages.push(
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`pagination-btn pagination-number ${
                    currentPage === i ? 'active' : ''
                  }`}
                >
                  {i + 1}
                </button>
              );
            }
            return pages;
          })()}

          {/* 다음 페이지 */}
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="pagination-arrow pagination-right02"
          ></button>

          {/* 다음 그룹으로 (10페이지씩) */}
          <button
            onClick={() => {
              const maxPages = 10;
              const currentGroup = Math.floor(currentPage / maxPages);
              const nextGroupStart = (currentGroup + 1) * maxPages;
              setCurrentPage(Math.min(totalPages - 1, nextGroupStart));
            }}
            disabled={
              Math.floor(currentPage / 10) >= Math.floor((totalPages - 1) / 10)
            }
            className="pagination-arrow pagination-right01"
          ></button>

          <Select
            value={pageSize}
            options={[10, 20, 30, 40, 50].map((size) => ({
              label: `Show ${size}`,
              value: size,
            }))}
            onChange={(value) => {
              setPageSize(Number(value));
              setCurrentPage(0);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default KeywordsTable;
