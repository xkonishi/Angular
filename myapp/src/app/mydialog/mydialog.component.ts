import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-mydialog',
  templateUrl: './mydialog.component.html',
  styleUrls: ['./mydialog.component.css']
})
export class MydialogComponent implements OnInit {
  @Input() display = false;
  @Output() completeEvent = new EventEmitter<string>();

  constructor() {}

  ngOnInit() {
  }

  showDialog() {
    this.display = true;
  }

  onOK() {
    console.log('onOK');
    this.display = false;
    this.completeEvent.emit('USER01');
  }

  onCancel() {
    console.log('onCancel');
    this.display = false;
    this.completeEvent.emit('');
  }
}
