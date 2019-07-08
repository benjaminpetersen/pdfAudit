import { Component, OnInit, Input, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { LoadPdfService } from '../load-pdf.service';
import { NgForm } from '@angular/forms';
import { environment } from '../../environments/environment';
import { LoadPdfOverlayService } from '../load-pdf-overlay.service';
import { UserHighlightsInterface, CanvasLocationInterface } from '../../public/interfaces';

@Component({
  selector: 'app-pdf-page',
  templateUrl: './pdf-page.component.html',
  styleUrls: ['./pdf-page.component.css']
})
export class PdfPageComponent implements OnInit, AfterViewInit {
  @Input() pageNum: number;
  private _zoom: number = 1;
  @Input() 
    // zoom: number;
    set zoom(zoom: number){
      this._zoom = zoom;
      if(this.page){
        this.renderPage();//and redraw highlight canvas?
        this.resetCanvas(); //i'm a fucking herro
      }
    }
    get zoom(){ return this._zoom};
  @Output() addHighlight = new EventEmitter<number>();

  canvasLocation: CanvasLocationInterface = { //just initialized to supress a stupid error
    left: 0,
    top: 0
  };
  xDown;
  yDown;
  xCurrent;
  yCurrent;
  xUp;
  yUp;

  mousedown: boolean;
  dragged: boolean = false;
  allHighlights: any[];
  prevHighlights: UserHighlightsInterface[];
  tempRect: number[];

  canvas: any;
  highlightCanvas: any;
  canvasContainer: any;
  page: any;//the value from pdfjs after getting the individual page. used later to render the page
  pagePromise: any; //will let you know when page is ready to be accessed -> pagePromise.then((foo)=>this.page);
  
  constructor(private pdfService: LoadPdfService, private pdfOverlayService: LoadPdfOverlayService) {
    this.allHighlights = pdfOverlayService.getUserHighlights(this.pageNum);
    // console.log(this.prevHighlights);//for some reason this the whole array and not the specfic potion i asked for. 
  }
  
  ngOnInit() {
    this.pageNum++;//just because the input is index, so plus one to get page number.//
    this.prevHighlights = this.allHighlights;//just to get the canvas to redraw the other squares when you add a new one in. 
    this.pagePromise = new Promise((res, rej) => {
      this.pdfService.getDocument().promise.then((doc)=>{
        doc.getPage(this.pageNum).then((p)=>{
          this.page = p;
          res(p);
        })
      });
    })
  }
  
  ngAfterViewInit() {
    this.canvas = document.getElementById('pdfCanvas' + this.pageNum);
    this.highlightCanvas = document.getElementById('highlightCanvas' + this.pageNum);
    this.canvasContainer= document.getElementById('canvasContainer'+this.pageNum);
    this.pagePromise.then((p)=>{
      this.renderPage();
      this.resetCanvas(); //wat not werkin
    })
  }

  renderPage = () => { //how to run on zoom change. . . jeez. resource intensive but wat evs. change in future. 
    var viewport = this.page.getViewport(this._zoom);

    this.canvas.height = viewport.height;
    this.highlightCanvas.height = viewport.height;
    this.canvas.width = viewport.width;
    this.highlightCanvas.width = viewport.width;
    this.canvasContainer.style.width = viewport.width + 'px';

    var ctx = this.canvas.getContext('2d');
    this.page.render({viewport: viewport, canvasContext: ctx}).promise.then(()=>console.log('page loaded'));
  }
  
  getCursorPositionDown(canvas, event){
    this.mousedown = true;
    this.canvasLocation = canvas.getBoundingClientRect();

    this.xDown = event.clientX - this.canvasLocation.left;
    this.yDown = event.clientY - this.canvasLocation.top;
  }

  getCursorPositionUp(canvas, event, highlightFormElement){
    this.mousedown = false;

    this.xUp = event.clientX - this.canvasLocation.left;
    this.yUp = event.clientY - this.canvasLocation.top;
    this.initializeHighlight();
  }

  onMove(canvas, event){
    // this.canvasLocation = canvas.getBoundingClientRect();
    this.xCurrent = event.clientX - this.canvasLocation.left;
    this.yCurrent = event.clientY - this.canvasLocation.top;
    if(this.mousedown){
      this.dragged = true;
      let rectWidth = this.xCurrent - this.xDown;
      let rectHeight = this.yCurrent - this.yDown;
      let ctx = canvas.getContext('2d');
      this.resetCanvas();
      this.tempRect = [this.xDown/this.zoom, this.yDown/this.zoom, rectWidth/this.zoom, rectHeight/this.zoom]; //here it's easy to modify with zoom
      this.drawRect(ctx, this.tempRect);
    }
  }
  
  drawRect(context, rectCoordinates){
    context.beginPath();
    let coordinatesOfThis = rectCoordinates.map(el=>el * this.zoom);
    context.fillStyle = "#FF0000";
    context.rect(...coordinatesOfThis);
    context.fill();
  }

  resetCanvas(){
    this.prevHighlights = this.pdfOverlayService.getUserHighlights(this.pageNum); // I can't seem to get this fn to work without this line. this.prevHighlights should be a reference to a service's array, but it isn't...
    const ctx = this.highlightCanvas.getContext('2d');
    ctx.globalAlpha = 0.3; //todo fixaroo
    ctx.clearRect(0, 0, this.highlightCanvas.width, this.highlightCanvas.height);
    //have a rectangle array with sub arrays. then iterate over and pass in the array each time. spread in ctx.rect(...rectaARasy)
    //alternatively i'd really like to have another canvas for temporary rectangles
    let iterations = this.prevHighlights ? this.prevHighlights.length : 0;
    for(let i=0; i<iterations; i++){
      this.drawRect(ctx, this.prevHighlights[i].coordinates);
    };
  }

  initializeHighlight(){
    //add validation
    let newHighlight: UserHighlightsInterface = {
      coordinates: this.tempRect,//how to avoid passing this as a reference or whatever
      author: environment.author,
      page: this.pageNum,
      expanded: true,
      formMode: true,
      count: 0
    }
    this.pdfOverlayService.setUserHighlights(newHighlight);
    this.addHighlight.emit(this.pageNum);
  }
}