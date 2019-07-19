import { Component, OnInit } from '@angular/core';
// import { AngularFireAuth } from '@angular/fire/auth';
import { UserService } from '../user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  expanded: boolean = false;

  constructor(private userService: UserService) {

  }

  ngOnInit() {
  }

  toggleExpand(){
    this.expanded = !this.expanded;
  }

  submitLogin(form){
    this.userService.login(form);
  }

  submitRegister(form){
    this.userService.register(form);
  }

  stopPropagation(event){
    event.stopPropagation();
  }
}
