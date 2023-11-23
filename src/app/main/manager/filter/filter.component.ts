import { Component } from '@angular/core';
import { FilterService } from 'src/app/services/filter.service';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent {

  isShowFilterBox = true;
  sort = null;
  listOfOption: Array<{ label: string; value: string }> = [
    { label: 'Hoàn thành', value: 'Hoàn thành' },
    { label: 'Bị hủy', value: 'Bị hủy' },
    { label: 'Chờ thanh toán', value: 'Chờ thanh toán' },
    { label: 'Giá tiền > 0đ - 199.999đ', value: 'totalPrice < 200000' },
    { label: 'Giá tiền 200.000đ - 499.999đ', value: 'totalPrice > 200000&totalPrice < 499999' },
  ];
  keysFilter = [];


  constructor(private filterSrv: FilterService) { }

  openFilterBox = () => {
    this.isShowFilterBox = this.isShowFilterBox === true ? false : true;
  }

  onFilter = () => {


    let queryParams = {
      ...this.keysFilter,
      sort: this.sort
    }
    let queryString = this.filterSrv.BuildQueryString(queryParams);

    console.log(queryParams);
  }
}
