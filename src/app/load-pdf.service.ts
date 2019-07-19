import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class LoadPdfService {
  PDFJS;
  docPromise;
  load: boolean = true;//runs getDocument code on first run through, that's all
  //use boolean to see if docPromise is populate. for now just do one load. an don worry.
  constructor(private afStorage: AngularFireStorage){
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
    }//this block will be the whole storage api accessor dealio
    return this.docPromise; 
  }

  getDocumentFromInput(argsObj){//new pdf should always be set to true here by caller
    var file = argsObj.target.files[0];
    this.saveDocument(file, argsObj.userFileData);//put in database file storage
    //Step 2: Read the file using file reader
    var fileReader = new FileReader();
    const loadTask = new Promise((res, rej) => {
      fileReader.onload = () => {
        
        //Step 4:turn array buffer into typed array
        var typedarray = new Uint8Array(fileReader.result as ArrayBuffer);
        
        //Step 5:PDFJS should be able to read this
        //@ts-ignore
        res(this.getDocument(typedarray, argsObj.newPDF));
      };
    });
    //Step 3:Read the file as ArrayBuffer
    fileReader.readAsArrayBuffer(file);
    return loadTask;
  }

  saveDocument(file, userFileData){//path will be from args obj
    // this is the code from above... it just has to call afStorage and save the file, and pdf.comp.ts needs to call user.serv instead
    // it might be kind of nice to have a save option or just open to view, and then set newPDF to true in the whole PDFJS call, and false in the get doc form inpput cal
    let storagePath = this.afStorage.ref(userFileData.root).child(userFileData.location);//isn't in docs but console error said to do this... try it?
    storagePath.put(file);//todo cehck?
  }

  loadDocument(root, path){//worked before damnit. hrm
    let storageRef = this.afStorage.ref(root).child(path);//wat?
    let loadingTask = new Promise((res, rej)=>{
      storageRef.getDownloadURL().subscribe((url) => {
        // pass url to pdfjs. it handles the rest.
        res(this.getDocument(url, true));
      })
    })
    return loadingTask;
  }
}
