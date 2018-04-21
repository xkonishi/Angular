import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  display = false;

  showDialog() {
    this.display = true;
  }

  onComplete(event) {
    console.log('onComplete');
    this.display = false;
  }
}
