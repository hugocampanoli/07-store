import type { CartItem } from "@/interfaces";
import Cookies from "js-cookie";

export class CartCookiesClient {
  //verificar la existencia del carrito
  static getCart(): CartItem[] {
    const cart = JSON.parse(Cookies.get("cart") ?? "[]");
    return cart;
  }
  //agregar item al carrito
  static addItem(cartItem: CartItem): CartItem[] {
    const cart = CartCookiesClient.getCart();
    const itemInCart = cart.find(
      (item) =>
        item.productId === cartItem.productId && item.size === cartItem.size
    );

    if (itemInCart) {
      itemInCart.quantity += cartItem.quantity;
    } else {
      cart.push(cartItem);
    }
    Cookies.set("cart", JSON.stringify(cart));
    return cart;
  }
  //quitar item del carrito
  static removeItem(productId: string, size: string): CartItem[] {
    const cart = CartCookiesClient.getCart();
    const updateCart = cart.filter(
      (item) => !(item.productId === productId && item.size === size)
    );
    Cookies.set("cart", JSON.stringify(updateCart));
    return updateCart;
  }
}
