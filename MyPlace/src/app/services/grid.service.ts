import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GridService {
  private apiUrl = 'http://localhost:3000';
  private webSocket: WebSocket | null = null;

  constructor(private http: HttpClient) {
    if (this.isBrowser()) {
      this.connect();
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof WebSocket !== 'undefined';
  }

  connect(): void {
    if (!this.isBrowser()) return;

    this.webSocket = new WebSocket(this.apiUrl.replace('http', 'ws'));

    this.webSocket.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    this.webSocket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    this.webSocket.onerror = (error) => {
      console.error('WebSocket error: ', error);
    };
  }

  getGrid(): Observable<any> {
    return this.http.get(`${this.apiUrl}/grid`);
  }

  updatePixel(row: number, col: number, color: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/grid`, { row, col, color });
  }

  listenConnection(): Observable<any> {
    return new Observable(subscribe => {
      if (this.webSocket) {
        this.webSocket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          subscribe.next(data);
        };
      }
    });
  }

  emitToServer(row: number, col: number, color: string): void {
    if (this.webSocket) {
      const data = { type: 'ChangePixel', row, col, color };
      this.webSocket.send(JSON.stringify(data));
    }
  }
}
