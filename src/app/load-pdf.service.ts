import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadPdfService {
  PDFJS;
  docPromise;
  load: boolean = true;//runs getDocument code on first run through, that's all
  //use boolean to see if docPromise is populate. for now just do one load. an don worry.
  constructor(){
    this.init();
  }
  init(){
    this.PDFJS = window['pdfjs-dist/build/pdf'];
    this.PDFJS.GlobalWorkerOptions.workerSrc = './assets/vendors/build/pdf.worker.js';
  }

  getDocument(docLocation = './assets/vendors/pdfHowItWorks.pdf', newPDF: boolean = false){
    if(newPDF || this.load){
      this.docPromise = this.PDFJS.getDocument(docLocation);
      this.load = false;
    }
    return this.docPromise; 
  }

  getDocumentFromInput(target, newPDF: boolean = false){
    var file = target.files[0];

    //Step 2: Read the file using file reader
    var fileReader = new FileReader();
    const loadTask = new Promise((res, rej) => {
      fileReader.onload = () => {
        
        //Step 4:turn array buffer into typed array
        var typedarray = new Uint8Array(fileReader.result as ArrayBuffer);
        
        //Step 5:PDFJS should be able to read this
        //@ts-ignore
        res(this.getDocument(typedarray, newPDF));
      };
    });
    //Step 3:Read the file as ArrayBuffer
    fileReader.readAsArrayBuffer(file);
    return loadTask;
  }
}
