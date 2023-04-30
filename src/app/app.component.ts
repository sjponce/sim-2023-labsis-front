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
  protected displayedColumns = ['n', 'reloj', 'evento', 'rndProxLlegada', 'proxLlegada', 'rndTipoTrabajo', 'tipoTrabajo', 'rndVariacion', 'variacionTiempoTrabajo', 'cola', 'estadoT1', 'inicioTrabajoT1', 'tiempoTrabajoT1', 'finTrabajoT1', 'estadoT2', 'inicioTrabajoT2', 'tiempoTrabajoT2', 'finTrabajoT2'];

  protected configForm = this.fb.group({
    n: [100, [Validators.required, Validators.min(0)]],
    cotaInfLlegada: [30, [Validators.required, Validators.min(0)]],
    cotaSupLlegada: [90, [Validators.required, Validators.min(0)]],
    probA: [0.3, [Validators.required, Validators.min(0), Validators.max(1)]],
    probB: [0.3, [Validators.required, Validators.min(0), Validators.max(1)]],
    probC: [0.15, [Validators.required, Validators.min(0), Validators.max(1)]],
    probD: [0.1, [Validators.required, Validators.min(0), Validators.max(1)]],
    probE: [0.15, [Validators.required, Validators.min(0), Validators.max(1)]],
    tiempoTrabajoA: [150, [Validators.required, Validators.min(0)]],
    tiempoTrabajoB: [60, [Validators.required, Validators.min(0)]],
    tiempoTrabajoC: [180, [Validators.required, Validators.min(0)]],
    tiempoTrabajoD: [60, [Validators.required, Validators.min(0)]],
    tiempoTrabajoE: [30, [Validators.required, Validators.min(0)]],
    cotaInfVariacionTrabajo: [-5, [Validators.required]],
    cotaSupVariacionTrabajo: [5, [Validators.required]],
    tiempoTrabajoInicialC: [25, [Validators.required, Validators.min(0)]],
    tiempoTrabajoFinalC: [10, [Validators.required, Validators.min(0)]],
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
      tap(()=> this.totalCount = this.configForm.controls.n.value ?? 0),
    startWith([])
  );

  public generate() {
    this.rowService.generate(this.configForm.getRawValue()).subscribe();
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
