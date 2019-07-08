import { Component } from '@angular/core';

@Component({
  selector: 'app-canvas-playground',
  templateUrl: './canvas-playground.component.html',
  styleUrls: ['./canvas-playground.component.css']
})
export class CanvasPlaygroundComponent {
  title = 'pdfFront';
  xMouseDown;
  xMouseUp;
  yMouseDown;
  yMouseUp;
  xCurrent;
  yCurrent;

  getCursorPositionDown(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    this.xMouseDown = Math.round(event.clientX - rect.left);
    this.yMouseDown = Math.round(event.clientY - rect.top);
  }
  
  onMove(canvas, event){
    const rect = canvas.getBoundingClientRect();
    this.xCurrent = Math.round(event.clientX - rect.left);
    this.yCurrent = Math.round(event.clientY - rect.top);
  }
  
  getCursorPositionUp(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    this.xMouseUp = Math.round(event.clientX - rect.left);
    this.yMouseUp = Math.round(event.clientY - rect.top);

    const width = Math.round(this.xMouseUp - this.xMouseDown);
    const height = Math.round(this.yMouseUp - this.yMouseDown);
    this.drawRectangle(canvas, this.xMouseDown, this.yMouseDown, width, height)
  }

  drawRectangle(canvas, x, y, width, height){
    const can = canvas.getContext('2d');
    can.beginPath()
    can.rect(x, y, width, height);
    can.stroke();
  }

  // ngOnInit(){
  //   const pdf = document.getElementById('pdf');
  //   const cont = pdf.getContext('2d');

  //   cont.beginPath();
  //   cont.rect(250, 250, 50, 50);
  //   cont.stroke();
  //   console.log('done drawin yo');
  // }

}
