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

export interface FileInterface {
  favourite: boolean,
  name: string,
  root: string,
  location: string,
  highlights: {
    highlights: any,
    count: number, 
    new: boolean
  },
  dateAccessed: Date,
  zoom: number
}

export interface userDataInterface {
  pdfs: any //this will be an object of {fileName1: FileInterface, fileName2: FileInterface ... }
}