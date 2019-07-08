//
export interface UserHighlightsInterface {
    coordinates?: number[]; // can i define a getter and setter here?
    page?: number;
    field?: string;
    value?: any;
    comments?: string;
    author?: string;
    expanded?: boolean;
    formMode?: boolean;
    count?: number;
    passed?: boolean;
  }

export interface CanvasLocationInterface {
  left?: number,
  right?: number,
  top?: number, 
  bottom?: number
}