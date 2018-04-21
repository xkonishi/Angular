import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-mydialog',
  templateUrl: './mydialog.component.html',
  styleUrls: ['./mydialog.component.css']
})
export class MydialogComponent implements OnInit {

  @Input() display = false;
  @Output() complete = new EventEmitter<boolean>();

  constructor() {}

  ngOnInit() {
  }

  showDialog() {
    this.display = true;
  }

  onOK() {
    console.log('onOK');
    this.display = false;
    this.complete.emit(false);
  }
}
