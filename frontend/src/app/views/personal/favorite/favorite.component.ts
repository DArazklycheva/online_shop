import { Component, Input, OnInit } from '@angular/core';
import { CartService } from 'src/app/shared/services/cart.service';
import { FavoriteService } from 'src/app/shared/services/favorite.service';
import { environment } from 'src/environments/environment';
import { CartType } from 'src/types/cart.type';
import { DefaultResponseType } from 'src/types/default-response.type';
import { FavoriteType } from 'src/types/favorite.type';

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.scss']
})
export class FavoriteComponent implements OnInit {

  products: FavoriteType[] = [];
  serverStaticPath = environment.serverStaticPath;
  cart: CartType | null = null;

  constructor(private favoriteService: FavoriteService,
    private cartService: CartService,
  ) { }

  ngOnInit(): void {
    this.cartService.getCart()
    .subscribe((cartData: CartType | DefaultResponseType) => {
      if ((cartData as DefaultResponseType).error !== undefined) {
        throw new Error ((cartData as DefaultResponseType).message);
      }
      this.cart = cartData as CartType;
      this.favoriteService.getFavorites()
      .subscribe((data: FavoriteType[] | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          const error = (data as DefaultResponseType).message;
          throw new Error(error);
        }
        this.products = data as FavoriteType[];
        if (this.cart && this.cart.items.length > 0) {
          this.products = this.products.map((product) => {
            if (this.cart) {
              const productInCart = this.cart.items.find(
                (item) => item.product.id === product.id
              );
              if (productInCart) {
                product.countInCart = productInCart.quantity;
              }
            }
            return product;
          });
        }
      })
    })

  }

  addToCart(id: string) {
    this.cartService.updateCart(id, 1)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }

        this.setProductCount(id, 1);
      });
  }

  updateCount(id: string, value: number) {
    if (this.cart) {
      this.cartService.updateCart(id, value)
        .subscribe((data: CartType | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }

          this.setProductCount(id, value);
        })
    }
  }

  setProductCount(id: string, count: number) {
    const currentProductIndex =
    this.products.findIndex(product => product.id === id);
    if (currentProductIndex > -1) {
      this.products[currentProductIndex].countInCart = count;
    }
  }

  removeFromFavorites(id: string) {
    this.favoriteService.removeFavorite(id)
      .subscribe((data: DefaultResponseType) => {
        if (data.error) {
          //...
          throw new Error(data.message);
        }

        this.products = this.products.filter(item => item.id !== id);
      })
  }

}
