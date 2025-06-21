export type CaseType = 'upper' | 'lower' | 'title' | 'sentence';
export type SortType = 'asc' | 'desc' | 'length_asc' | 'length_desc';
export type TrimType = 'all' | 'start_end' | 'duplicate';
export type DuplicateType = 'start' | 'end';

export interface TextEditorState {
  caseType: CaseType | '';
  sortType: SortType | '';
  trimType: TrimType | '';
  duplicateType: DuplicateType | '';
}