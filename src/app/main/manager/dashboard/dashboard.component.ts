import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartOptions, ChartType, Color } from 'chart.js';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { BaseChartDirective } from 'ng2-charts';
import { Order } from 'src/app/models/data-types';
import { User } from 'src/app/models/user';
import { FilterService } from 'src/app/services/filter.service';
import { OrderService } from 'src/app/services/order.service';
import { StatisticService } from 'src/app/services/statistic.service';
import { UserAuthService } from 'src/app/services/user-auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective;
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
    ],
    datasets: []
  };
  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true
  };
  public lineChartLegend = true;

  public pieChartOptions: ChartConfiguration["options"] = {
    responsive: true,
    plugins: {
      tooltip: {
        enabled: true
      },
      legend: {
        display: true,
        position: "bottom",
        labels: {
          usePointStyle: true,
          font: {
            size: 13,
          },
          useBorderRadius: true,
          borderRadius: 20,
          padding: 20,
        },
        align: 'start',
        fullSize: true,
      },
      datalabels: {
        formatter: (value, ctx) => {
          let sum = 0;
          let dataArr: any[] = ctx.chart.data.datasets[0].data;
          dataArr.map((data: number) => {
            sum += data;
          });
          let percentage = (value * 100 / sum).toFixed(2) + "%";
          return percentage;
        },
        color: '#000000',
        font: {
          weight: 500,
          size: 10
        },
      }
    },
  };
  public pieChartLabels = ['Tổng đơn hàng - $xxxx', 'Đơn hàng bị hủy - $xxxx', 'Đơn hàng thành công - $xxxx'];
  public pieChartDatasets = [{
    data: [300, 500, 100],
  }];
  public pieChartPlugins = [DatalabelsPlugin];

  orders: Order[] = [];
  ordersSuccess: Order[] = [];
  ordersRecent: Order[] = [];
  statistic = {
    totalOrders: 0,
    totalCustomers: 0,
    totalOrdersToday: 0,
    totalCustomersToday: 0,
    totalMonthlyIncome: 0,
    avgIncome: 0,
    avgProfit: 0,
    avgExpensive: 0
  };

  selectedYear = new Date().getFullYear();

  constructor(
    private orderSrv: OrderService,
    private statisticSrv: StatisticService,
    private userSrv: UserAuthService,
  ) { }


  async ngOnInit(): Promise<void> {
    this.orders = await this.orderSrv.GetAllOrder();
    this.ordersSuccess = this.statisticSrv.getOrdersByStatus(this.orders, 'Hoàn thành');
    let customers: User[] = await this.userSrv.GetAll();

    let ordersToday = this.statisticSrv.getDataToday(this.orders);
    let customersToday = this.statisticSrv.getDataToday(customers);
    let totalMonthlyIncome = this.statisticSrv.processTotalMonthly(this.ordersSuccess);
    let lineChartDatasets = this.statisticSrv.getDatasetLineChartByYear(this.ordersSuccess);
    let avgTotal = this.statisticSrv.getTotalAVGPriceByYear(this.ordersSuccess);
    let pieChartData = this.statisticSrv.getDataPieChartByYear(this.orders);


    let ordersRecent: Order[] = await this.statisticSrv.getOrdersRecent();
    this.ordersRecent = ordersRecent.slice(0, 6);

    this.lineChartData.datasets = lineChartDatasets;
    this.pieChartLabels = pieChartData.labels;
    this.pieChartDatasets = [pieChartData.datasets];
    this.chart.update();

    this.statistic = {
      totalOrders: this.orders.length,
      totalCustomers: customers.length,
      totalOrdersToday: ordersToday.length,
      totalCustomersToday: customersToday.length,
      totalMonthlyIncome: totalMonthlyIncome,
      ...avgTotal
    }
  }

  onChangeYear = (event: any) => {
    let element = event as HTMLSelectElement;
    let year = +element.value;

    let lineChartDatasets = this.statisticSrv.getDatasetLineChartByYear(this.ordersSuccess, year);
    let avgTotal = this.statisticSrv.getTotalAVGPriceByYear(this.ordersSuccess, year);
    let pieChartData = this.statisticSrv.getDataPieChartByYear(this.orders, year);

    this.lineChartData.datasets = lineChartDatasets;
    this.pieChartLabels = pieChartData.labels;
    this.pieChartDatasets = [pieChartData.datasets];
    this.chart.update();
    this.statistic.avgIncome = avgTotal.avgIncome;
    this.statistic.avgProfit = avgTotal.avgProfit;
    this.statistic.avgExpensive = avgTotal.avgExpensive;
  }
}
