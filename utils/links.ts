type Navlink = {
    href: string;
    label: string;
}

export const links: Navlink[] = [
    {href: '/', label: 'home'},
    {href: '/about', label: 'about'},
    {href: '/products', label: 'products'},
    {href: '/favorites',label: 'favorites'},
    {href: '/cart', label: 'cart'},
    {href: '/orders', label:'orders' }
]