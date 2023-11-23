import { Injectable } from '@angular/core';
import { Order } from '../models/data-types';
import { FilterService } from './filter.service';

@Injectable({
  providedIn: 'root'
})
export class StatisticService {

  constructor(private filterSrv: FilterService) { }

  getDataToday = (data: any[]) => {
    let currentDate = new Date();
    return data.filter(item => {
      let convertDate = new Date(item.createdAt!.toString());
      return convertDate.toLocaleDateString() === currentDate.toLocaleDateString();
    });
  }

  private getOrdersByYear = (orders: Order[], year: number) => {
    return orders.filter(order => {
      let convertDate = new Date(order.createdAt!.toString());
      return convertDate.getUTCFullYear() === year;
    })
  }

  getOrdersByStatus = (orders: Order[], status: string) => {
    return orders.filter(order => {
      return order.status === status;
    })
  }

  getOrdersRecent = async () => {
    const queryString = 'orders?sort=-createdAt';
    let result = await this.filterSrv.filter(queryString);

    if (result && result.EC === 0) {
      return result.data
    } else {
      console.log(result?.errorMessage);
      return [];
    }
  }

  processTotalMonthly = (data: any[]) => {
    let currentDate = new Date();
    return data.reduce((previousValue, currentValue) => {
      let convertDate = new Date(currentValue.createdAt!.toString());
      if (currentDate.getUTCFullYear() === convertDate.getUTCFullYear() && currentDate.getUTCMonth() === convertDate.getUTCMonth()) {
        return previousValue += currentValue.totalPrice;
      }
      return 0;
    }, 0)
  }

  getDatasetLineChartByYear = (orders: Order[], year?: number) => {
    let selectedYear = year ? year : new Date().getFullYear();
    let ordersByYear = this.getOrdersByYear(orders, selectedYear);
    let data = this.processDatasetLineChart(ordersByYear, selectedYear);

    let datasets = [
      {
        data: data.incomeArray,
        label: 'Tổng thu nhập',
        fill: true,
        tension: 0.5,
        borderColor: '#0aad0a',
        backgroundColor: 'rgba(102, 255, 102, 0.3)'
      },
      {
        data: data.expenseArray,
        label: 'Tổng chi phí',
        fill: true,
        tension: 0.5,
        borderColor: '#ffc107',
        backgroundColor: 'rgba(255, 255, 102, 0.3)'
      }
    ]

    return datasets;
  }

  processDatasetLineChart = (orders: Order[], year: number) => {
    let incomeArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let expenseArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    orders.forEach((order: Order) => {
      let convertDate = new Date(order.createdAt!.toString());
      let monthItem = convertDate.getUTCMonth() + 1; // handle Month VietNamese
      let incomePrice = order.totalPrice;
      let discount = order.voucher ? order.voucher.discount : 0;
      let exprensePrice = discount + order.shippingCost;

      switch (monthItem) {
        case 1:
          incomeArray[0] += incomePrice;
          expenseArray[0] += exprensePrice;
          break;
        case 2:
          incomeArray[1] += incomePrice;
          expenseArray[1] += exprensePrice;
          break;
        case 3:
          incomeArray[2] += incomePrice;
          expenseArray[2] += exprensePrice;
          break;
        case 4:
          incomeArray[3] += incomePrice;
          expenseArray[3] += exprensePrice;
          break;
        case 5:
          incomeArray[4] += incomePrice;
          expenseArray[4] += exprensePrice;
          break;
        case 6:
          incomeArray[5] += incomePrice;
          expenseArray[5] += exprensePrice;
          break;
        case 7:
          incomeArray[6] += incomePrice;
          expenseArray[6] += exprensePrice;
          break;
        case 8:
          incomeArray[7] += incomePrice;
          expenseArray[7] += exprensePrice;
          break;
        case 9:
          incomeArray[8] += incomePrice;
          expenseArray[8] += exprensePrice;
          break;
        case 10:
          incomeArray[9] += incomePrice;
          expenseArray[9] += exprensePrice;
          break;
        case 11:
          incomeArray[10] += incomePrice;
          expenseArray[10] += exprensePrice;
          break;
        case 12:
          incomeArray[11] += incomePrice;
          expenseArray[11] += exprensePrice;
          break;
      }
    });

    return { incomeArray, expenseArray };
  }

  private processTotalProfitOrders = (orders: Order[]) => {
    return orders.reduce((previousValue, currentValue) => {
      let discount = currentValue.voucher ? currentValue.voucher.discount : 0;
      return previousValue + currentValue.totalPrice - discount - currentValue.shippingCost;
    }, 0);
  }

  private processTotalOrders = (orders: Order[]) => {
    return orders.reduce((previousValue, currentValue) => {
      return previousValue + currentValue.totalPrice;
    }, 0);
  }

  getTotalAVGPriceByYear = (orders: Order[], year?: number) => {
    let selectedYear = year ? year : new Date().getFullYear();
    let ordersByYear = this.getOrdersByYear(orders, selectedYear);
    let ordersLength = ordersByYear.length;
    let avgIncome = this.processTotalOrders(ordersByYear) / ordersLength;
    let avgProfit = this.processTotalProfitOrders(ordersByYear) / ordersLength;
    let avgExpensive = avgIncome - avgProfit;
    return { avgIncome, avgProfit, avgExpensive };
  }

  getDataPieChartByYear = (data: any[], year?: number) => {
    let selectedYear = year ? year : new Date().getFullYear();
    let orders = this.getOrdersByYear(data, selectedYear);
    let ordersStatusCancel = this.getOrdersByStatus(orders, "Hủy đơn hàng");
    let ordersStatusDone = this.getOrdersByStatus(orders, "Hoàn thành");
    let totalPrice = '$' + this.processTotalOrders(orders).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
    let totalPriceOrdersCancel = '$' + this.processTotalOrders(ordersStatusCancel).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
    let totalPriceOrdersDone = '$' + this.processTotalOrders(ordersStatusDone).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");

    let labels = [`Tổng đơn hàng - ${totalPrice}`, `Đơn hàng bị hủy - ${totalPriceOrdersCancel}`, `Đơn hàng thành công - ${totalPriceOrdersDone}`];
    let datasets = {
      data: [orders.length, ordersStatusCancel.length, ordersStatusDone.length]
    }; // {data: ['']}
    return {
      labels,
      datasets
    };
  }

}