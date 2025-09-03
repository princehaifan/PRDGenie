
export enum ViewType {
  FORM = 'form',
  LOADING = 'loading',
  RESULT = 'result',
}

export interface AppState {
  view: ViewType;
  prdContent: string;
  error: string | null;
}
