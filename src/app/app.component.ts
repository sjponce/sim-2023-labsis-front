import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
  BehaviorSubject,
  combineLatest,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { RowService } from './row.service';

type Paginator = {
  limit: number;
  skip: number;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  public constructor(
    private rowService: RowService,
    private fb: FormBuilder,  
  ) {}

  protected totalCount = 0;

  protected configForm = this.fb.group({
    count: [100, Validators.required]
  })

  protected paginator$ = new BehaviorSubject<Paginator>({
    limit: 10,
    skip: 0,
  });
  protected readonly reload$ = new BehaviorSubject<null>(null);
  protected readonly rows$ = combineLatest([
    this.paginator$,
    this.reload$,
  ]).pipe(
    switchMap(([paginator]) =>
      this.rowService.getAll(paginator.limit, paginator.skip),
      ),
      tap(()=> this.totalCount = this.configForm.controls.count.value ?? 0),
    startWith([])
  );
  protected displayedColumns = ['name', 'i'];

  public generate() {
    this.rowService.generate(this.configForm.controls.count.value ?? 0).subscribe();
  }

  public populate() {    
    this.paginator$.next({
      limit: 10,
      skip: 0,
    })
  }

  public handlePageEvent(event: any) {
    this.paginator$.next({
      limit: event.pageSize,
      skip: event.pageSize * event.pageIndex,
    })
    
  }
}
