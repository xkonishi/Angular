import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  display = false;

  showDialog() {
    this.display = true;
  }

  onCloseDialog(event: string) {
    console.log('onComplete:' + event);
    this.display = false;
  }
}
