import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
  BehaviorSubject,
  combineLatest,
  map,
  shareReplay,
  skip,
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
    'rndTipoCola1Meta',
    'tipoCola1Meta',
    'rndTipoCola2Meta',
    'tipoCola2Meta',
    'rndTipoCola3Meta',
    'tipoCola3Meta',
    'colaGratuitaMeta',
    'estadoEGMeta',
    'inicioAtencionEGMeta',
    'tiempoAtencionEGMeta',
    'finAtencionEGMeta',
    'colaPagaMeta',
    'estadoEPMeta',
    'inicioAtencionEPMeta',
    'tiempoAtencionEPMeta',
    'finAtencionEPMeta',
    'contadorTiempoOciosoPagaMeta',
  ];
  protected displayedColumns = [
    'n',
    'reloj',
    'evento',
    'rndProxLlegada',
    'tiempoEntreLlegadas',
    'proxLlegada',
    'rndTipoCola1',
    'tipoCola1',
    'rndTipoCola2',
    'tipoCola2',
    'rndTipoCola3',
    'tipoCola3',
    'colaGratuita',
    'estadoEG',
    'inicioAtencionEG',
    'tiempoAtencionEG',
    'finAtencionEG',
    'colaPaga',
    'estadoEP',
    'inicioAtencionEP',
    'tiempoAtencionEP',
    'finAtencionEP',
    'contadorTiempoOciosoPaga',
  ];

  protected configForm = this.fb.group({
    probPasajeGratuito: [
      0.65,
      [Validators.required, Validators.min(0), Validators.max(1)],
    ],
    segundosPorLlegada: [60, [Validators.required, Validators.min(0)]],
    tiempoDemoraVenta: [60, [Validators.required, Validators.min(0)]],
    tiempoFinSimulacion: [480, [Validators.required, Validators.min(0)]],
    colaPagaInicial: [0, [Validators.min(0), Validators.pattern('^[0-9]*$')]],
    colaGratuitaInicial: [2, [Validators.min(0), Validators.pattern('^[0-9]*$')]],
    largoColaAuxiliar: [4, [Validators.min(0), Validators.pattern('^[0-9]*$')]],
    finTrabajoEmpleadaGratuitaInicial: [45, [Validators.required, Validators.min(0)]],
    finTrabajoEmpleadaPagaInicial: [0, [Validators.required, Validators.min(0)]],
    proximaLlegadaInicial: [30, [Validators.required, Validators.min(0)]],
    duracionAuxiliarGratuita: [120, [Validators.required, Validators.min(0)]],
    reduccionTiempoAuxiliar: [0.4, [Validators.required, Validators.min(0), Validators.max(1)]],
  });

  protected pageNumber = 0;
  protected isLoading$ = new BehaviorSubject(false);
  protected stats: any;

  protected paginator$ = new BehaviorSubject<Paginator>({
    limit: 500000,
    skip: 0,
  });
  protected readonly reload$ = new BehaviorSubject<null>(null);
  protected readonly rows$ = combineLatest([
    this.paginator$,
    this.reload$,
  ]).pipe(
    skip(1),
    switchMap(([paginator]: any[]) =>
      this.rowService.getAll(paginator.limit, paginator.skip)
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
    startWith([])
  );

  protected readonly bounds$ = this.rows$.pipe(
    map((rows: any) => {
      let min = 0;
      let max = 0;
      
      rows.forEach((row: any) => {
        if (row.personas) {
          Object.keys(row.personas).forEach((trabajo: any) => {
            max =
            row.personas[trabajo].id >= max ? row.personas[trabajo].id : max;
          });
        }
      });
      max = max > 100 ? 100 : max; 
      return [min, max];
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  protected readonly jobHeaders$ = this.bounds$.pipe(
    map(([min, max]: any) => {
      const res: string[] = [];
      for (let i = min; i <= max; i++) {
        res.push(`T${i}Estado`);
        res.push(`T${i}Llegada`);
        res.push(`T${i}InicioAtencion`);
        res.push(`T${i}FinAtencion`);
      }
      return res;
    }),
    startWith([])
  );

  protected readonly jobMetaHeaders$ = this.bounds$.pipe(
    map(([min, max]: any) => {
      const res: string[] = [];
      for (let i = min; i <= max; i++) {
        res.push(`T${i}EstadoMeta`);
        res.push(`T${i}LlegadaMeta`);
        res.push(`T${i}InicioAtencionMeta`);
        res.push(`T${i}FinAtencionMeta`);
      }
      return res;
    }),
    startWith([])
  );

  protected readonly displayedColumns$ = this.jobHeaders$.pipe(
    map((headers: any) => [...this.displayedColumns, ...headers])
  );

  protected readonly metaDisplayedColumns$ = this.jobMetaHeaders$.pipe(
    map((headers: any) => [...this.metaDisplayedColumns, ...headers])
  );

  public generate() {
    this.isLoading$.next(true);
    this.rowService
      .generate(this.configForm.getRawValue())
      .subscribe((stats: any) => {
        this.stats = stats;
        this.isLoading$.next(false);
        this.totalCount = stats.n;
      });
  }

  public populate() {
    this.paginator$.next({
      limit: 400,
      skip: 0,
    });
  }

  public handlePageEvent(event: any) {
    this.paginator$.next({
      limit: event.pageSize,
      skip: event.pageSize * event.pageIndex,
    });
  }

  goToPage() {
    const value = this.paginator$.value;
    this.paginator$.next({
      limit: value.limit,
      skip: value.limit * this.pageNumber,
    });
  }

  public getHeader(header: string) {
    if (header.includes('Estado')) {
      return 'Estado';
    } else if (header.includes('Llegada')) {
      return 'Llegada';
    } else if (header.includes('InicioAtencion')) {
      return 'Inicio atencion';
    } else if (header.includes('FinAtencion')) {
      return 'Fin atencion';
    }
  }

  public getMetaHeader(header: string) {
    if (header.includes('EstadoMeta')) {
      return `PERSONA ${header.match(/\d+/)?.shift()}`;
    } else {
      return '';
    }
  }

  public getRowValue(header: string, row: any) {
    let index = `T${header.match(/\d+/)?.shift()}`;
    if (!row?.personas || !row.personas[index]) return '';

    if (header.includes('Estado')) {
      return row.personas[index].estado;
    } else if (header.includes('Llegada')) {
      return row.personas[index].llegada?.toFixed(4);
    } else if (header.includes('InicioAtencion')) {
      return row.personas[index].tiempoFinTrabajoInicialC?.toFixed(4);
    } else if (header.includes('FinAtencion')) {
      return row.personas[index].tiempoFinTrabajoSolitarioC?.toFixed(4);
    }
  }
}
