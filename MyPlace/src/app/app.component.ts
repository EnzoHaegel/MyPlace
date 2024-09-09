import { Component, HostListener } from '@angular/core';
import { GridService } from './services/grid.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Pixel } from './models/models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AppComponent {
  title = 'Pixel Place';
  grid: any[][] = [];
  selectedColor: string = '#000000';
  scale: number = 1;
  isDragging: boolean = false;
  dragStartX: number = 0;
  dragStartY: number = 0;
  translateX: number = 0;
  translateY: number = 0;
  isSpacePressed: boolean = false;

  constructor(private gridService: GridService) {
    this.gridService.listenConnection().subscribe((change: Pixel) => {
      console.log('Received change:', change);
      this.grid[change.row][change.col].color = change.color;
    });
  }

  ngOnInit(): void {
    this.gridService.getGrid().subscribe((data) => {
      this.grid = data;
    });
  }

  changePixelColor(row: number, col: number): void {
    this.gridService.updatePixel(row, col, this.selectedColor).subscribe({
      next: (pixel: Pixel) => {
        console.log('Pixel updated:',
          `row: ${pixel.row}, col: ${pixel.col}, color: ${pixel.color}`);
      },
      error: (err) => console.error('Error updating pixel:', err)
    });
    this.gridService.emitToServer(row, col, this.selectedColor);
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    const zoomSpeed = 0.1;
    const oldScale = this.scale;

    if (event.deltaY > 0) {
      this.scale = Math.max(0.5, this.scale - zoomSpeed);
    } else {
      this.scale = Math.min(5, this.scale + zoomSpeed);
    }

    const scaleChangeRatio = this.scale / oldScale;
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    const gridRect = (event.target as HTMLElement).getBoundingClientRect();
    const offsetX = mouseX - gridRect.left;
    const offsetY = mouseY - gridRect.top;

    this.translateX -= (offsetX * (scaleChangeRatio - 1));
    this.translateY -= (offsetY * (scaleChangeRatio - 1));
  }

  onMouseDown(event: MouseEvent): void {
    if (event.button === 0 && this.isSpacePressed) {
      this.isDragging = true;
      this.dragStartX = event.clientX - this.translateX;
      this.dragStartY = event.clientY - this.translateY;
      document.body.style.cursor = 'grabbing';
    }
  }

  onMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      this.translateX = event.clientX - this.dragStartX;
      this.translateY = event.clientY - this.dragStartY;
    }
  }

  onMouseUp(): void {
    this.isDragging = false;
    document.body.style.cursor = 'default';
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.code === 'Space') {
      this.isSpacePressed = true;
      document.body.style.cursor = 'grab';
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    if (event.code === 'Space') {
      this.isSpacePressed = false;
      document.body.style.cursor = 'default';
    }
  }
}
