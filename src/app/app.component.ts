import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
  BehaviorSubject,
  combineLatest,
  map,
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
  public constructor(private rowService: RowService, private fb: FormBuilder) {}

  protected totalCount = 0;
  protected metaDisplayedColumns = [
    'nMeta',
    'relojMeta',
    'eventoMeta',
    'rndProxLlegadaMeta',
    'tiempoEntreLlegadasMeta',
    'proxLlegadaMeta',
    'rndTipoTrabajoMeta',
    'tipoTrabajoMeta',
    'rndVariacionMeta',
    'variacionTiempoTrabajoMeta',
    'colaMeta',
    'estadoT1Meta',
    'inicioTrabajoT1Meta',
    'tiempoTrabajoT1Meta',
    'finTrabajoT1Meta',
    'estadoT2Meta',
    'inicioTrabajoT2Meta',
    'tiempoTrabajoT2Meta',
    'finTrabajoT2Meta',
  ];
  protected displayedColumns = [
    'n',
    'reloj',
    'evento',
    'rndProxLlegada',
    'tiempoEntreLlegadas',
    'proxLlegada',
    'rndTipoTrabajo',
    'tipoTrabajo',
    'rndVariacion',
    'variacionTiempoTrabajo',
    'cola',
    'estadoT1',
    'inicioTrabajoT1',
    'tiempoTrabajoT1',
    'finTrabajoT1',
    'estadoT2',
    'inicioTrabajoT2',
    'tiempoTrabajoT2',
    'finTrabajoT2',
  ];

  protected configForm = this.fb.group({
    n: [1000, [Validators.required, Validators.min(0)]],
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
  });

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
      this.rowService.getAll(paginator.limit, paginator.skip)
    ),
    tap(() => (this.totalCount = this.configForm.controls.n.value ?? 0)),
    tap(console.log),
    startWith([])
  );

  protected readonly bounds$ = this.rows$.pipe(
    map((rows) => {
      let min = Infinity;
      let max = 0;
      rows.forEach((row: any) =>
        row.trabajos.forEach((trabajo: any) => {
          min = trabajo.id < min ? trabajo.id : min;
          max = trabajo.id > max ? trabajo.id : max;
        })
      );
      return [min, max];
    })
  );

  protected readonly jobHeaders$ = this.bounds$.pipe(
    map(([min, max]) => {
      const res: string[] = [];
      for (let i = min; i < max; i++) {
        res.push(`T${i}Estado`);
        res.push(`T${i}Llegada`);
        res.push(`T${i}InicioTrabajo`);
        res.push(`T${i}FinTrabajo`);
      }
      return res;
    }),
    startWith([])
  );

  protected readonly jobMetaHeaders$ = this.bounds$.pipe(
    map(([min, max]) => {
      const res: string[] = [];
      for (let i = min; i < max; i++) {
        res.push(`T${i}EstadoMeta`);
        res.push(`T${i}LlegadaMeta`);
        res.push(`T${i}InicioTrabajoMeta`);
        res.push(`T${i}FinTrabajoMeta`);
      }
      return res;
    }),
    startWith([])
  );

  protected readonly displayedColumns$ = this.jobHeaders$.pipe(
    map((headers) => [...this.displayedColumns, ...headers])
  );

  protected readonly metaDisplayedColumns$ = this.jobMetaHeaders$.pipe(
    map((headers) => [...this.metaDisplayedColumns, ...headers])
  );

  public generate() {
    this.rowService.generate(this.configForm.getRawValue()).subscribe();
  }

  public populate() {
    this.paginator$.next({
      limit: 10,
      skip: 0,
    });
  }

  public handlePageEvent(event: any) {
    this.paginator$.next({
      limit: event.pageSize,
      skip: event.pageSize * event.pageIndex,
    });
  }

  public getHeader(header: string) {
    if (header.includes('Estado')) {
      return 'Estado'; 
    } else if(header.includes('Llegada')) {
      return 'Llegada'
    } else if(header.includes('InicioTrabajo')) {
      return 'Inicio trabajo'
    } else {
      return 'Fin trabajo'
    }
  }

  public getMetaHeader(header: string, index: number) {
    if (header.includes('EstadoMeta')) {
      return `TRABAJO ${(index / 4) + 1}`; 
    } else {
      return ''
    }
  }
}
