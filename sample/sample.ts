import { Component, OnInit, Renderer2, Inject, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormGroup, FormArray, FormControl, Validators, AbstractControl } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { PageComponentBaseReacive } from '../../../common/base/page-component-base-reactive';
import { PageFrameService } from '../../../page/page-frame.service';
import { MessageToastService } from '../../../core/message-toast.service';
import { TableReactiveService } from './table-reactive.service';
import { ExPaginatorComponent } from '../../../shared/component/ex-paginator/ex-paginator.component';
import { ConfirmDialogService } from '../../../core/confirm-dialog.service';
import { HttpUtility } from '../../../common/http-utility';
import { ExFormControl } from '../../../common/reactive-form/ex-form-control';
import { ExRowFormGroup } from '../../../common/reactive-form/ex-row-form-group';
import { Anken } from './anken';

@Component({
  selector: 'app-table-reactive',
  templateUrl: './table-reactive.component.html',
  styleUrls: ['./table-reactive.component.scss']
})
export class TableReactiveComponent extends PageComponentBaseReacive implements OnInit {

  @ViewChild(ExPaginatorComponent) private paginator: ExPaginatorComponent;

  // 検索結果
  private ankens: Anken[];

  // 条件部フォーム
  private ankenSearchForm: FormGroup;
  // 明細部フォーム
  private ankensForm: FormGroup;

  locale: any = super.getCalendarLocale();

  get ankenList(): FormArray {
    return this.ankensForm.controls.ankenList as FormArray;
  }

  get sortCurrentPageRows(): AbstractControl[] {
    return this.ankenList.controls.filter((row: FormGroup) => {
      return !row.controls.deleted.value;
    }).filter((_row: FormGroup, index: number) => {
      return this.paginator.isCurrentPage(index);
    }).sort((row1: FormGroup, row2: FormGroup) => {
      return row1.controls.ankenId.value - row2.controls.ankenId.value;
      }).map((row: FormGroup, index: number) => {
        if (row instanceof ExRowFormGroup) {
          row.rowNo = (this.paginator.first + index + 1).toString();
        }
        return row;
      });
  }

  get editRows(): AbstractControl[] {
    return this.ankenList.controls.filter((row: FormGroup) => {
      return row.dirty && !row.controls.deleted.value;
    });
  }

  get deleteRows(): AbstractControl[] {
    return this.ankenList.controls.filter((row: FormGroup) => {
      return row.controls.deleted.value;
    });
  }

  get selectRows(): AbstractControl[] {
    return this.ankenList.controls.filter((row: FormGroup) => {
      return row.controls.checked.value;
    });
  }

  get isSelected(): boolean {
    return this.selectRows.length > 0;
  }

  get isUpdated(): boolean {
    return this.ankensForm.dirty;
  }

  get isValid(): boolean {
    const delRows = this.deleteRows;
    for (let i = 0; i < this.ankenList.controls.length; i++) {
      if (this.paginator.isCurrentPage(i)) {
        const row = this.ankenList.get(i.toString()) as FormGroup;
        if (row.invalid && delRows.indexOf(row) === -1) {
          return false;
        }
      }
    }
    return true;
  }

  constructor(
    protected messageToast: MessageToastService,
    private confirmDialogService: ConfirmDialogService,
    protected renderer: Renderer2,
    @Inject(DOCUMENT) protected document: any,
    private pageFrame: PageFrameService,
    private tableReactiveService: TableReactiveService) {
    super(messageToast, renderer, document);
  }

  ngOnInit() {
    super.ngOnInit();
    this.pageFrame.setPageTitle('案件一覧');
    this.createForm();
  }

  private createForm() {
    // 条件部
    this.ankenSearchForm = new FormGroup({
      ankenId: new FormControl(''),
      ankenMei: new FormControl(''),
      shinchokuKbn: new FormControl(''),
      eigyouTantoCd: new FormControl(''),
      juchuBiFrom: new FormControl(''),
      juchuBiTo: new FormControl('')
    }, {updateOn: 'blur'});

    // 明細部
    this.ankensForm = new FormGroup({
      ankenList: new FormArray([])
    });
  }

  private addRow(anken: Anken) {
    const row = new ExRowFormGroup({
      checked: new FormControl(false, {updateOn: 'change'}),
      ankenId: new FormControl(anken.ankenId),
      ankenKbn: new FormControl(anken.ankenKbn, {updateOn: 'change'}),
      eigyoKbn: new FormControl(anken.eigyoKbn, {updateOn: 'change'}),
      shinchokuKbn: new FormControl(anken.shinchokuKbn, {updateOn: 'change'}),
      ankenMei: new ExFormControl(anken.ankenMei, Validators.required),
      eigyoTantoCd: new FormControl(anken.eigyoTantoCd),
      eigyoTantoMei: new FormControl({value: anken.eigyoTantoMei, disabled: true}),
      juchuBiDate: new FormControl(anken.juchuBiDate),
      juchuKingaku: new ExFormControl(anken.juchuKingaku, Validators.min(10000)),
      deleted: new FormControl(false, {updateOn: 'change'})
    }, {updateOn: 'blur'});

    // 選択列は編集項目ではないので、クリックされてもdirtyにしない
    row.controls.checked.valueChanges.subscribe(() => {
      row.controls.checked.markAsPristine();
    });

    const index = this.ankenList.length;
    this.ankenList.insert(index, row);
  }

  searchAnkens() {
    const params = HttpUtility.toHttpParams(this.ankenSearchForm.value);
    this.tableReactiveService.searchAnkens(params).subscribe(
      (ankens) => {
        this.ankens = ankens;
        this.ankens.forEach(anken => {
          this.addRow(anken);
        });
        this.paginator.first = 0;
        this.messageToast.showSuccess(ankens.length + '件のデータが該当しました。');
      });
  }

  clearAnkens() {
    if (this.isUpdated) {
      this.confirmDialogService.confirmYesNo({
        header: '編集キャンセル確認',
        message: '明細部に未保存の変更があります。変更内容を破棄してもよろしいですか？',
        accept: () => {
          this.clearRows();
        }
      });
    } else {
      this.clearRows();
    }
  }

  private clearRows() {
    this.ankens = [];
    while (this.ankenList.length > 0) {
      this.ankenList.removeAt(0);
    }
//    this.paginator.first = 0;
    this.ankensForm.markAsPristine();
    this.messageToast.clear();
  }

  removeAnkens() {
    let changed = false;
    for (let i = 0; i < this.selectRows.length; i++) {
      const row = this.selectRows[i] as FormGroup;
      if (row.dirty) {
        changed = true;
        break;
      }
    }

    if (changed) {
      this.confirmDialogService.confirmYesNo({
        header: '削除確認',
        message: '選択行は変更されています。変更内容を破棄してもよろしいですか？',
        accept: () => {
          this.markAsDeleted();
        }
      });
    } else {
      this.markAsDeleted();
    }
  }

  private markAsDeleted() {
    this.selectRows.forEach((row: FormGroup) => {
      row.controls.checked.setValue(false);
      row.controls.deleted.setValue(true);
      row.controls.deleted.markAsDirty();
    });
  }

  commit() {
    this.messageToast.clear();

    if (this.isValid) {
      // 更新処理
      forkJoin(
        this.tableReactiveService.updateAnkens(this.editRows.map((row: FormGroup) => row.value)),
        this.tableReactiveService.deleteAnkens(this.deleteRows.map((row: FormGroup) => row.value))
      ).subscribe(
        ([res1, res2]) => {
          if (res1.length > 0) {
            this.messageToast.showSuccess('案件情報を更新しました。(' + res1 + ')');
          }
          if (res2.length > 0) {
            this.messageToast.showSuccess('案件情報を削除しました。(' + res2 + ')');
          }
        },
        (err) => {
          console.error(err);
        },
        () => {
          this.editRows.forEach((row) => {
            const index = this.ankenList.controls.indexOf(row);
            this.ankens[index] = row.value;
          });
          this.ankensForm.markAsPristine();
        });
    } else {
      super.showValidationError(this.ankensForm);
    }
  }

  onPageChange(event: any) {
    // 変更キャンセル時は値を元に戻す
    if (event.editCancel) {
      this.ankenList.controls.forEach(row => {
        if (row.dirty || (<FormGroup>row).controls.checked.value) {
          const index = this.ankenList.controls.indexOf(row);
          this.ankenList.at(index).reset(this.ankens[index]);
        }
      });
    }
  }
}
