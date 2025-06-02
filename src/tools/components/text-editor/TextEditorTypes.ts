export type CaseType = 'upper' | 'lower' | 'title' | 'sentence';

export interface CaseConverterState {
    selectedCase: CaseType | '';
}