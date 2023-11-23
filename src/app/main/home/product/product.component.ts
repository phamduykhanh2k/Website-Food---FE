import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartItem, Order } from 'src/app/models/data-types';
import { Product } from 'src/app/models/product';
import { CartService } from 'src/app/services/cart.service';
import { OrderService } from 'src/app/services/order.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  productList: Product[] | undefined;

  constructor(private productSrv: ProductService,
    private cartSrv: CartService,
    private router: Router,
    private orderSrv: OrderService) {
  }

  async ngOnInit(): Promise<void> {
    this.productSrv.getAllProduct();

    this.productSrv.productsEmit.subscribe(result => {
      this.productList = result.slice(0, 7);
    })
  }

  singleAddToCart(item: Product) {
    const isAdd = this.cartSrv.addItemToCart(item, 1);

    if (!isAdd)
      this.router.navigate(["authentication"]);
  }
}
