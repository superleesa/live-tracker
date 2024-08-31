
export interface DataFormatBase {
}

// Example implementations of DataFormatBase
export interface NumberPairFormat extends DataFormatBase {
x: number;
y: number;
}

export interface ImageFormat extends DataFormatBase {
// TODO: define image format
}

export interface TextFormat extends DataFormatBase {
    text: string;
}

export class DataSource<DataFormatT extends DataFormatBase> {
    name: string;
    format: string;
    content?: DataFormatT[];
  
    constructor(name: string, data_type: string, data?: DataFormatT[]) {
      this.name = name;
      this.format = data_type;
      this.content = data;
    }
  
    fetchData() {
        // change this to async later on
      // TODO: fetch data from the backend
      // for now we will mock
      const content = [
        {x: 0, y: 10},
        {x: 1, y: 4},
        {x: 2, y: 5},
        {x: 3, y: 10},
        {x: 4, y: 7},
        {x: 4, y: 7},
        {x: 4, y: 7},
        {x: 4, y: 7},
        {x: 4, y: 7}
      ] as unknown as DataFormatT[];
      this.content = content;
    }
  }
  
//   class NumberPairDataSource extends DataSource<[number, number]> {
//     constructor(name: string) {
//       super(name, "number-number");
//     }
//   }