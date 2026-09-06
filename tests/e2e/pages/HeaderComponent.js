export class HeaderComponent {
  constructor(page) {
    this.page = page
    this.cartLink = page.getByRole('link', { name: /cart/i })
    this.cartBadge = this.cartLink.locator('.cart-badge')
    this.signInLink = page.getByRole('link', { name: 'Sign in' })
    this.signOutButton = page.getByRole('button', { name: 'Sign out' })
    this.userLabel = page.locator('.nav__user')
    this.ordersLink = page.getByRole('link', { name: 'Orders' })
  }

  async cartCount() {
    if (await this.cartBadge.count() === 0) return 0
    return Number(await this.cartBadge.innerText())
  }

  async signOut() {
    await this.signOutButton.click()
  }
}
