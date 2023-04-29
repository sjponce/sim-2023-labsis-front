import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class RowService {
  constructor(private http: HttpClient) {}

  public getAll(limit = 10, skip = 0): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:3000/api/rows', {
      params: {
        limit,
        skip
      },
    })
  }

  public generate(n = 100) {
    return this.http.get('http://localhost:3000/api/generate', {
      params: {
        n
      },
    })
  }
}
