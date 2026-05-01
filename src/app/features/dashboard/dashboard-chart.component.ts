import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import Chart from 'chart.js/auto';
import { ChartDataset, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard-chart',
  template: '<div class="h-80"><canvas #canvas></canvas></div>'
})
export class DashboardChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('canvas') private canvas?: ElementRef<HTMLCanvasElement>;

  @Input({ required: true }) type: ChartType = 'bar';
  @Input() labels: string[] = [];
  @Input() values: number[] = [];
  @Input() datasets: ChartDataset[] | null = null;
  @Input() label = 'Tickets';
  @Input() horizontal = false;
  @Input() colors: string[] = ['#0f766e', '#0284c7', '#f59e0b', '#7c3aed', '#dc2626', '#059669', '#e11d48'];

  private chart: Chart | null = null;
  private viewReady = false;

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.renderChart();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    if (this.viewReady) {
      this.renderChart();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private renderChart(): void {
    const context = this.canvas?.nativeElement.getContext('2d');
    if (!context) return;

    this.chart?.destroy();

    const datasets = this.datasets ?? [
      {
        label: this.label,
        data: this.values,
        backgroundColor: this.type === 'line' ? 'rgba(15, 118, 110, 0.12)' : this.colors,
        borderColor: this.type === 'line' ? '#0f766e' : this.colors,
        borderWidth: this.type === 'line' ? 2 : 1,
        tension: 0.35,
        fill: this.type === 'line'
      }
    ];

    this.chart = new Chart(context, {
      type: this.type,
      data: {
        labels: this.labels,
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: this.horizontal ? 'y' : 'x',
        plugins: {
          legend: {
            display: this.type === 'doughnut' || (this.datasets?.length ?? 0) > 1,
            position: 'bottom',
            labels: {
              boxWidth: 10,
              boxHeight: 10,
              usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: '#0f172a',
            padding: 10
          }
        },
        scales: this.type === 'doughnut'
          ? {}
          : {
              x: {
                beginAtZero: true,
                grid: { color: '#e2e8f0' },
                ticks: { color: '#64748b', precision: 0 }
              },
              y: {
                beginAtZero: true,
                grid: { color: '#e2e8f0' },
                ticks: { color: '#64748b', precision: 0 }
              }
            }
      }
    });
  }
}
