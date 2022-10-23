export const Menu = [
  {
    title: 'Dashboard',
    link: '/dashboard',
    icon: 'fa-dashboard',
  },
  {
    title: 'Users',
    link: '/users',
    icon: 'fa-user',
  },
  {
    title: 'Players',
    link: '/players',
    icon: 'fa-user',
  },
  // {
  //   title: 'Events',
  //   link: '/events',
  //   icon: 'fa-book',
  // },
  // {
  //   title: 'Chat Archive',
  //   link: '/archive',
  //   icon: 'fa-archive',
  // },
  {
    title: 'FAQs',
    link: '/faqs',
    icon: 'fa-question',
  },
  {
    title: 'Log Out',
    callback: 'onLoggedout',
    icon: 'fa-power-off',
    class: 'logout',
  },
];
