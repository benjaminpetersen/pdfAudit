//delme > current user for testing : t2iL5Ljhx9TDHgS2hcC88NX47T83
//this holds all the data that needs to be changed on all the other changes.

import { Injectable, EventEmitter } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import { AngularFirestore } from '@angular/fire/firestore';
import { FileInterface } from 'src/public/interfaces';
import { UserHighlightsInterface } from '../public/interfaces';
import { LoadPdfService } from './load-pdf.service';
// import { LoadPdfOverlayService } from './load-pdf-overlay.service';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  user: any;//user from auth - don't worry
  userRef: any; //ref to firestore location
  userData: any;//data from firestore
  userSignedIn: boolean = false; //check before running saves - set to true on register, logina nd start up? c;ould have just used if(this.user)...
  filesList: string[];
  authStateChange: EventEmitter<any> = new EventEmitter();
  userDataChange: EventEmitter<any> = new EventEmitter();

  _userHighlights: {
    count: number, 
    highlights: {},
    new: boolean
  } = {
    count: 3,
    new: false,
    highlights: {
      page1: [{count: 1,coordinates:[137.09999084472656,56,533,90],field:"title",value:"how pdf works",comments:"just the document title",author:"bpetersen123@hotmail.com",page:1}], 
      page5: [{count: 2,coordinates:[232.09999084472656,71.19999694824219,332,46],field:"file structure",value:"",comments:"describes the structure in programming terms",author:"bpetersen123@hotmail.com",page:5}],
      page18: [{count: 3,coordinates:[147.09999084472656,64.19999694824219,490,87],field:"examining document structure",value:"examining document structure",comments:"Practical applicaiton side",author:"bpetersen123@hotmail.com",page:18}]
    }
  };
  _linearArray: UserHighlightsInterface[] = [];
  userFile; //info about the file -> name, highlights, and the like so basically it's 

  constructor(
    private afAuth: AngularFireAuth, 
    private afStore: AngularFirestore,
    private loadPdf: LoadPdfService
  ) {
      this.user = afAuth.auth.currentUser;
      this.afAuth.auth.onAuthStateChanged((user) => {
        this.user = user;
        if(user){
          this.userSignedIn = true;
          this.userRef = this.afStore.collection('users').doc(this.user.uid);
          this.getUserData();
        }
        else{
          this.userSignedIn = false;
        }
        this.authStateChange.emit(user);
      });
      this.linearizeUserHighlights();
    }

  async login(form){
    await this.afAuth.auth.signInWithEmailAndPassword(form.value.email, form.value.password).catch((e)=>console.log(e));
    //get data
    this.getUserData();
  }
  
  async register(form){
    await this.afAuth.auth.createUserWithEmailAndPassword(form.value.emailRegister, form.value.passwordRegister)
      .catch((e)=>{
        console.log(e)
        return;
      });
    //create user in db as well but need to wait for ^ to be done.
    this.userData = {
      pdfs: {}
    }
    this.userRef.set(this.userData);
  }
  
  signOut(){
    this.afAuth.auth.signOut();
  }

  getUserData(){
    this.afStore.collection('users').doc(this.user.uid).get().subscribe((doc)=>{
      this.userData = doc.data();
      this.userDataChange.emit();
    })
  }

  //do overlay stuff here! plan
  /**
   * change overlay calls from pdf-page and pdf component
   * whatever
   */

  //update the highlights in memory then 
  //totally save 'userData.highlights.docName' : userData.highlights[docName]
  setUserHighlights(h: UserHighlightsInterface){//change this to update... the code will find location and add/replace sort by y val, and somehow use count...
    //todo: test if linearArray is just an array of pointers to _userhighlight objs -> change the _userHighlights object, and check if it also changes in linear array without re-linearizing. it should 
    // h.count = ++this._count; 
    //if newHighlight instantiate length of array... i still don't have the page though. 
    if(h.count === 0){
      h.count = ++this._userHighlights.count;
    };
    // let highlights = this._userHighlights.highlights;//may not exist?
    if(this._userHighlights.highlights === undefined){
      this._userHighlights.highlights = {};
    }

    if(this._userHighlights.highlights['page'+h.page]){//if the page has any highlights
      //check if this one is the same as the previous one. sort by y. if same value check count val.
      let length = this._userHighlights.highlights['page'+h.page].length;
      for(let i=0; i<=length; i++){
        if (i === length){//if there are no more items to compare
          this._userHighlights.highlights['page'+h.page].push(h);
        }
        else if(h.coordinates[1] > this._userHighlights.highlights['page'+h.page][i].coordinates[1]){
          //do nothing - skip this iteration, should actually skip it though. with a command
        }
        else {
          //check if it's new, then add to that position, or update that position, and leave the for loop
          //how to figure out which on is new?
          if(this._userHighlights.highlights['page'+h.page][i].count === h.count){//not happening????
            this._userHighlights.highlights['page'+h.page].splice(i, 1, h);
          }
          else{
            this._userHighlights.highlights['page'+h.page].splice(i, 0, h);
          }
          break;
        }
      };
    }
    else{
      this._userHighlights.highlights['page'+h.page] = [h]
    };
    this.linearizeUserHighlights();
    this.saveHighlights();
    return h;
    //
  }

  deleteUserHighlight(h: UserHighlightsInterface){
    //find and remove
    let arrayPoint = this._userHighlights.highlights['page'+h.page];
    arrayPoint.forEach((highlight, index)=>{
      if(highlight.count === h.count){
        arrayPoint.splice(index, 1);
      }
    });
    this.linearizeUserHighlights();
    this.saveHighlights();
  }

  saveHighlights(){
    if(this.userSignedIn) this.userRef.update(this.userData);//maybe append it to userData and then send this.userData... not sure hy th eproblems are intermittent?i load a file. then load a new one and get this. 
  }
  
  linearizeUserHighlights(){//need to call this on every change :( 
    //runs twice on website load... why though?
    //todo -> fix: arr =  Object.keys(highlights). then sort and just compound it. however numbers don't sort right on magnitude changes. 9 is bigger than 10 with this sorting method. how do? 
    //sort by length first? and then each length set of lengths sort again. 
    this._linearArray = [];
    let highlights = this._userHighlights.highlights;
    
    if(highlights === null || highlights === undefined){return};//array is empty, and it's already declared empty

    //sort by the number pageNumber in object kesy
    let keysArray = Object.keys(highlights);
    keysArray = keysArray.sort((a, b) => {
      let aNumber = a.split('page')[1];
      let bNumber = b.split('page')[1];
      //@ts-ignore
      return aNumber-bNumber;
    });

    for(let i=0; i<keysArray.length; i++){
      this._linearArray.push(...highlights[keysArray[i]]);
    };
    this.userDataChange.emit();
  }
  
  //del all this. return gives a pointer to the array instead of a pointer to pointer... i think
  // getUserHighlights(page): any{
  //   return this._userHighlights.highlights[page-1];
  // }

  getLinearUserHighlights(): any{
    return this._linearArray;
  }
  
  
  //do pdf stuff here
  /**
   * 
   */
  addPdf(argsObj){
    //
    let filePath = argsObj.target.value;//value = C:\fakepath\fileName
    let fileName = filePath.split('\\')[2];
    let newHighlights = {
      count: 0,
      highlights: {},
      new: true
    }
    this._userHighlights = newHighlights;
    let userFileData: FileInterface = {
      favourite: false,
      name: fileName,
      root: 'pdfs', //just for storage.ref(root).child(location). good god fix all this with better names
      location: this.user.uid +'/'+fileName,//todo generate unique id's for path, avoid overwrite
      highlights: newHighlights,//plan is to save under collection called highlights. then each user's object has fileName keys with highlights as a value=.
      dateAccessed: new Date('7/19/2019'),
      zoom: 1
    }
    this.userFile = userFileData;
    argsObj.userFileData = userFileData;
    this.linearizeUserHighlights();
    //save to user db
    //should check to see if userData is alive before doing this
    this.userData.pdfs[fileName] = userFileData;

    //to update some fields update({field: data})... to access nested object 'thingo.thingo.thingo': data
    if(this.userSignedIn) this.userRef.update(this.userData);//here i need to add the key and resave teh whole object i think
    this.userDataChange.emit();

    //save to filestorage
    return this.loadPdf.getDocumentFromInput(argsObj);
  }

  loadDocument(fileName){
    let userFileData = this.userData.pdfs[fileName]; //i want to change this to a simple pdf name to use to select from all this
    this.userFile = userFileData;
    //pdfOverlay get
    this._userHighlights = userFileData.highlights;//didnt' work?
    this.linearizeUserHighlights();
    this.userDataChange.emit();
    //pdf-doc get
    return this.loadPdf.loadDocument(userFileData.root, userFileData.location);
  }
}
