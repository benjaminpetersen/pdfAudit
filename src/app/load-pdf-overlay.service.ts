import { Injectable } from '@angular/core';
import { UserHighlightsInterface } from '../public/interfaces';

@Injectable({
  providedIn: 'root'
})
export class LoadPdfOverlayService {
  // private _userHighlights: UserHighlights[][] = new Array(35);
  private _userHighlights: UserHighlightsInterface[][] = [[{count: 1,coordinates:[137.09999084472656,56,533,90],field:"title",value:"how pdf works",comments:"it's a title",author:"bpetersen123@hotmail.com",page:1}],null,null,null,[{count: 2,coordinates:[232.09999084472656,71.19999694824219,332,46],field:"file structure",value:"",comments:"describes teh structure",author:"bpetersen123@hotmail.com",page:5}],null,null,null,null,null,null,null,null,null,null,null,null,[{count: 3,coordinates:[147.09999084472656,64.19999694824219,490,87],field:"file structure",value:"examining document structure",comments:"this shit's oimportant man",author:"bpetersen123@hotmail.com",page:18}],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];
  private _count: number = 3;
  private _linearArray: UserHighlightsInterface[] = [];

  constructor() {
    this.linearizeUserHighlights();
  }

  setUserHighlights(h: UserHighlightsInterface){//change this to update... the code will find location and add/replace sort by y val, and somehow use count...
    //todo: test if linearArray is just an array of pointers to _userhighlight objs -> change the _userHighlights object, and check if it also changes in linear array without re-linearizing. it should 
    // h.count = ++this._count; 
    let arrayPoint = this._userHighlights[h.page - 1];

    if(h.count === 0){
      h.count = ++this._count;
    };

    if(arrayPoint){//if the page has any highlights
      //check if this one is the same as the previous one. sort by y. if same value check count val.
      let length = arrayPoint.length;
      for(let i=0; i<=length; i++){
        if (i === length){//if there are no more items to compare
          arrayPoint.push(h);
        }
        else if(h.coordinates[1] > arrayPoint[i].coordinates[1]){
          //do nothing - skip this iteration
        }
        else {
          //check if it's new, then add to that position, or update that position, and leave the for loop
          if(arrayPoint[i].count === h.count){
            arrayPoint.splice(i, 1, h);
          }
          else{
            arrayPoint.splice(i, 0, h);
          }
          break;
        }
      };
    }
    else{
      this._userHighlights[h.page - 1] = [h]
    };
    this.linearizeUserHighlights();
  }
  
  linearizeUserHighlights(){
    //todo -> maybe take a bit less processor by finding new part and adding it normally.. should only be one at atime. 
    this._linearArray = [];
    for(let i=0; i<this._userHighlights.length; i++){
      if(!(this._userHighlights[i] === undefined)) {
        this._linearArray.push(...this._userHighlights[i]);
      }
    };
  }
  
  getUserHighlights(page): any{
    return this._userHighlights[page-1];
  }

  getLinearUserHighlights(): any{
    return this._linearArray;
  }

  deleteUserHighlight(h: UserHighlightsInterface){
    //find and remove
    let arrayPoint = this._userHighlights[h.page - 1];
    arrayPoint.forEach((highlight, index)=>{
      if(highlight.count === h.count){
        arrayPoint.splice(index, 1);
      }
    });
    this.linearizeUserHighlights();
  }
}