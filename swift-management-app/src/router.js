import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  scrollBehavior() {
    return {
      x: 0,
      y: 0
    }
  },
  routes: [

    {
      //layout
      path: '',
      component: () => import('./layouts/main/Main.vue'),
      children: [
        //management views
        {
          path: '/',
          name: 'dashboard',
          component: () => import('./views/dashboard/DashboardView.vue')
        },
        {
          path: '/tables',
          name: 'tables',
          component: () => import('./views/tables/TablesListView.vue')
        },
        {
          path: '/stats',
          name: 'statistics',
          component: () => import('./views/stats/StatisticsView.vue')
        },
        {
          path: '/menu',
          name: 'menu items',
          component: () => import('./views/menu/MenuItemsListView.vue')
        },
        {
          path: '/add-menu-item',
          name: 'add menu item',
          component: () => import('./views/menu/AddMenuItemView.vue')
        },
        {
          path: '/employees',
          name: 'employees',
          component: () => import('./views/employees/EmployeesListView.vue')
        },
        {
          path: '/reviews',
          name: 'reviews',
          component: () => import('./views/reviews/ReviewsListView.vue')
        },
        {
          path: '/mybusiness',
          name: 'mybusiness',
          component: () => import('./views/mybusiness/MyBusinessView.vue')
        },
        {
          path: '/orders',
          name: 'orders',
          component: () => import('./views/orders/OrdersListView.vue')
        },
      ],
    },

    //full-pages
    {
      path: '',
      component: () => import('@/layouts/full-page/FullPage.vue'),
      children: [
       //TODO: login will come here
       {
        path: '/login',
        name: 'login',
        component: () => import('./views/usermanagement/UMView.vue')
      },
      {
        path: '/reset-password',
        name: 'reset-password',
        component: () => import('./views/usermanagement/UMResetPasswordView.vue')
      },
      ]
    },
    //404 redirects to home for now
    {
      path: '*',
      redirect: '/'
    }
  ],
})

router.afterEach(() => {

  const appLoading = document.getElementById('loading-bg')
  if (appLoading) {
    appLoading.style.display = "none";
  }
})

export default router