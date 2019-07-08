import { Component, OnInit, AfterViewInit, EventEmitter } from '@angular/core';
import { LoadPdfService } from '../load-pdf.service';
import { LoadPdfOverlayService } from '../load-pdf-overlay.service';

@Component({
  selector: 'app-pdf',
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.css']
})
export class PdfComponent implements OnInit, AfterViewInit {
  pages;
  zoom: number = 1; //someday i want to use scale to increase resolution...not today
  changeDetectionHack: any = null;
  linearHighlights: any[] = [];

  constructor(private pdfOverlayService: LoadPdfOverlayService, private pdfService: LoadPdfService) { 
    this.linearHighlights = pdfOverlayService.getLinearUserHighlights();
  }

  ngOnInit() {
    this.pdfService.getDocument().promise.then((doc)=>{
      this.pages = new Array(doc.numPages);
    });
  }//
  
  ngAfterViewInit(){
    // document.getElementById('sidebarRight').addEventListener('resize', this.positionPDFDiv());
    // document.getElementById('sidebarLeft').addEventListener('resize', this.positionPDFDiv());//
    this.positionPDFDiv();//my god, this would work best as a resize event listener, but hose don't wrk
  }

  positionPDFDiv() {
    let sidebarRight = document.getElementById('sidebarRight').getBoundingClientRect().left;
    let sidebarLeft = document.getElementById('sidebarLeft').getBoundingClientRect().right;
    let PDFDiv: any = document.getElementsByClassName('pdf')[0];

    let width = sidebarRight - sidebarLeft;
    let leftCoordinate = sidebarLeft;

    PDFDiv.style.left = leftCoordinate + "px";
    PDFDiv.style.width = width + "px";
  }

  // linearizeHighlights(){//this is pretty crude. yikes. 
  //   this.linearHighlights = [];
  //   for(let i=0; i<this.highlights.length; i++){
  //     if(!(this.highlights[i] === undefined)) {
  //       this.linearHighlights.push(...this.highlights[i]);
  //     }
  //   };
  // }

  zoomIn(){
    this.zoom+=0.1;
  }

  zoomOut(){
    this.zoom-=0.1;
  }

  scrollTo(highlightObject){
    let thePage = document.getElementById('pdfCanvas' + highlightObject.page);
    let rect: any = thePage.getBoundingClientRect();
    let scrollVal = rect.y + highlightObject.coordinates[1] - 100;
    // thePage.scrollIntoView();
    window.scrollTo(0, scrollVal);
  }

  edit(highlightObject){
    highlightObject.formMode = !highlightObject.formMode;
  }

  delete(highlightObject){
    //need to have a part of service that deletes one and call linearize again...
    this.pdfOverlayService.deleteUserHighlight(highlightObject);
    //and reset canvas... how do?
    this.linearHighlights = this.pdfOverlayService.getLinearUserHighlights();
  }

  loadNewPDF(e){
    this.pdfService.getDocumentFromInput(e.target, true).then((doc: any)=>{
      this.pages = new Array(doc.numPages);
      if(this.changeDetectionHack === null){
        for(let i=0; i<this.pages.length; i++){
          this.pages[i] = 1;
          this.changeDetectionHack = 1;
        }
      }
      else{
        this.changeDetectionHack = null;
      }
    })
  }

  updateHighlights(page){//an event listener for a form submission on each pdf-page.component
    // this.linearizeHighlights();
    this.linearHighlights = this.pdfOverlayService.getLinearUserHighlights();
  }

  expandField(highlight, ngForm){
    //i would like to add logic here to check for undefined or whatever?
    if(highlight.formMode){
      this.onSubmit(highlight, ngForm);
    };
    highlight.expanded = !highlight.expanded;//wtf not working
  }

  onSubmit(highlight, ngForm){
    highlight.formMode = false;
    highlight.field = ngForm.value.field;
    highlight.value = ngForm.value.value;
    highlight.comments = ngForm.value.comments;
    highlight.passed = ngForm.value.passed;

    this.pdfOverlayService.setUserHighlights(highlight);//this is crashing chrome...
  }
}
