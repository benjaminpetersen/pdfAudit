import { Injectable, EventEmitter } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import { AngularFirestore } from '@angular/fire/firestore';
import { FileInterface } from 'src/public/interfaces';
import { LoadPdfService } from './load-pdf.service';
import { LoadPdfOverlayService } from './load-pdf-overlay.service';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  user: any;//user from auth
  userRef: any; //ref to firestore location
  userData: any;//data from firestore
  authStateChange: EventEmitter<any> = new EventEmitter();
  userDataChange: EventEmitter<any> = new EventEmitter();
  constructor(
    private afAuth: AngularFireAuth, 
    private afStore: AngularFirestore,
    private loadPdf: LoadPdfService,
    private loadPdfOverlay: LoadPdfOverlayService
    ) {
      this.user = afAuth.auth.currentUser;
      this.afAuth.auth.onAuthStateChanged((user) => {
        this.user = user;
        this.authStateChange.emit(user);
        if(user){
          this.getUserData();
        }
        //anything that needs user should use an event emmitter to get this
        this.userRef = this.afStore.collection('users').doc(this.user.uid);
      });
    }

  async login(form){
    await this.afAuth.auth.signInWithEmailAndPassword(form.value.email, form.value.password).catch((e)=>console.log(e));
    //get data
    this.getUserData();
  }
  
  async register(form){
    await this.afAuth.auth.createUserWithEmailAndPassword(form.value.emailRegister, form.value.passwordRegister).catch(e=>console.log(e));
    //create user in db as well but need to wait for ^ to be done.
    this.userData = {
      pdfs: [],
      activePdf: this.user.email
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

  addPdf(argsObj){//gonna need to pass something here. blob and file data. for now just pass the blob. we try twice and see what happens
    //and argsObj? w/ userFIledata info
    let filePath = argsObj.target.value;//value = C:\fakepath\fileName
    let fileName = filePath.split('\\')[2];
    let userFileData: FileInterface = {
      favourite: false,
      name: fileName,
      root: 'pdfs', //just for storage.ref(root).child(location). good god fix all this with better names
      location: this.user.uid +'/'+fileName,//todo generate unique id's for path, avoid overwrite
      highlights: this.user.uid,//plan is to save under collection called highlights. then each user's object has fileName keys with highlights as a value=.
      dateAccessed: new Date('7/19/2019'),
      zoom: 1
    }
    //save to user db
    //should check to see if this is loaded
    this.userData.pdfs.push(userFileData);
    this.userRef.update({
      pdfs: firebase.firestore.FieldValue.arrayUnion(userFileData)//todo: this requires 2 import statements. maybe better to just update whole user val at once instead
    });
    //init a highlights save
    this.loadPdfOverlay.initHighlights(userFileData);
    //save to filestorage
    argsObj.userFileData = userFileData;
    return this.loadPdf.getDocumentFromInput(argsObj);
  }

  loadDocument(userFileData){
    //pdfOverlay get
    this.loadPdfOverlay.loadPdfOverlays(userFileData);
    //pdf-doc get
    return this.loadPdf.loadDocument(userFileData.root, userFileData.location);
  }
}
