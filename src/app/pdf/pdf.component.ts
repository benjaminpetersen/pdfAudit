import { Component, OnInit, AfterViewInit, EventEmitter, Input } from '@angular/core';
import { LoadPdfService } from '../load-pdf.service';
import { LoadPdfOverlayService } from '../load-pdf-overlay.service';
import { UserService } from '../user.service';
import { UserHighlightsInterface } from 'src/public/interfaces';

@Component({
  selector: 'app-pdf',
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.css']
})
export class PdfComponent implements OnInit, AfterViewInit {
  user: any;
  userData: any;//
  pages; //for ngFor to generate one pdf-page per array item
  changeDetectionHack: any = null; //this is just to change each member of an array so that angular re-instantiates members with the ngFor directive
  zoom: number = 1;//changes scale for pdfjs and re-renders
  expandedHighlight: UserHighlightsInterface; //when another one gets expanded this one should submit and close
  linearHighlights: UserHighlightsInterface[] = [];
  favourite: boolean = false;//to set pdf fav in database and 
  redraw: boolean = false;//this just changes when you want to redraw teh canvas so that ngOnChange within pdf-page.comp.ts will fire

  constructor(private pdfOverlayService: LoadPdfOverlayService, private pdfService: LoadPdfService, private userService: UserService) { 
    this.linearHighlights = pdfOverlayService.getLinearUserHighlights();
    userService.authStateChange.subscribe(any => this.user = userService.user); //i should do some work with observers
    userService.userDataChange.subscribe((any) => {
      this.userData = userService.userData;
    });
  }
  
  ngOnInit() {
    this.pdfService.getDocument().promise.then((doc)=>{
      this.pages = new Array(doc.numPages);
    });
  }//
  
  ngAfterViewInit(){
    this.positionPDFDiv();//my god, this would work best as a resize event listener, but hose don't wrk
  }//pass a value to only one ngFor element. take page and just reset it?

  redrawCanvass(){
    this.redraw = !this.redraw;
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

  zoomIn(){
    this.zoom+=0.1; //passed into angular pdf-pages
  }

  zoomOut(){
    this.zoom-=0.1;
  }

  scrollTo(highlightObject){
    let thePage = document.getElementById('pdfCanvas' + highlightObject.page);
    let rect: any = thePage.getBoundingClientRect();
    let scrollVal = window.scrollY + rect.y + highlightObject.coordinates[1] - 100;
    window.scrollTo(0, scrollVal);
  }

  edit(highlightObject, ngForm){
    highlightObject.formMode = true;
  }

  delete(highlightObject){
    //need to have a part of service that deletes one and call linearize again...
    this.pdfOverlayService.deleteUserHighlight(highlightObject);
    this.linearHighlights = this.pdfOverlayService.getLinearUserHighlights();
    this.redrawCanvass();
  }

  loadNewPDF(e){//from file input to input
    let argsObj = {
      target: e.target,
      newPDF: true
    }
    //userService adds references to the user's data
    //pass to load-pdf service which saves to db
    this.userService.addPdf(argsObj).then(this.initiatePdfRendering)
  }

  downloadDocument(userFileData){//from the db
    //userService loads highlights to pdf-overlay-service
    //pass to load-pdf service which just let's pdfjs read and get it ready for painting onto an html canvas
    this.userService.loadDocument(userFileData).then(this.initiatePdfRendering);
  }

  initiatePdfRendering = (doc: any)=>{
    //array for ngFor to loop over and make pdf-page.component.ts
    this.pages = new Array(doc.numPages);
    //change array values so that angular change-detection re-initializes the pdf-page component.
    if(this.changeDetectionHack === null){
      for(let i=0; i<this.pages.length; i++){
        this.pages[i] = 1;
      }
      this.changeDetectionHack = 1;
    }
    else{
      this.changeDetectionHack = null;
    }
  }

  //on the addition of a new highlight event from pdf-page component
  updateHighlights(highlight){
    //1 get new highlights
    this.linearHighlights = this.pdfOverlayService.getLinearUserHighlights();
    if(this.expandedHighlight !== undefined){
      //2 submit and collapse other open sidebar element
      if(this.expandedHighlight.formMode) this.onSubmit(this.expandedHighlight);
      this.expandedHighlight.expanded = false;
    }

    //3 this highlight is now expanded (set in pdf-page new highlight)
    this.expandedHighlight = highlight;
  }

  expandField(highlight, ngForm){
    if(this.expandedHighlight !== undefined){
      //1 submit and collapse the previously expanded field
      if(this.expandedHighlight.formMode) this.onSubmit(this.expandedHighlight);
      //collapse and reset
      if(this.expandedHighlight !== highlight) {//without this you can never collapse a field
        this.expandedHighlight.expanded = false;
        this.expandedHighlight = undefined;
      }
    }
    //2 toggle the expanded value
    highlight.expanded = !highlight.expanded;

    //3 set expanded field to this one
    if(highlight.expanded) {this.expandedHighlight = highlight}
  }

  onSubmit(highlight, ngForm?){
    //1 close form
    highlight.formMode = false;
    //2 delete highlight if no user input, or submit
    if(highlight.field.length === 0){ //todo improve this... if none of the fields are touched i guess. use ngForm?
      //need to do this becuase the pdf-page component creates a highlight and updates the service with itf
      this.delete(highlight);
    }
    else{
      this.pdfOverlayService.setUserHighlights(highlight);
    }
  }

  onFavourite(){
    this.favourite = !this.favourite;
  }

  signout(){
    this.userService.signOut();
  }
}
