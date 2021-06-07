const routes = [
  {
    path: '/',
    redirect: () => {
      return { path: '/products/index' }
    }
  },
  {
    path: '/products',
    component: () => import('layouts/Main'),
    children: [
      {
        path: 'index',
        component: () => import('pages/products/Index')
      },
      {
        path: 'create',
        component: () => import('pages/products/Create')
      }
    ]
  },
  {
    path: '/products/:id',
    component: () => import('layouts/Main'),
    children: [
      {
        path: '',
        component: () => import('pages/products/Show')
      },
      {
        path: 'edit',
        component: () => import('pages/products/Edit')
      }
    ]
  },
  {
    path: '/questions',
    component: () => import('layouts/Main'),
    children: [
      {
        path: 'index',
        component: () => import('pages/questions/Index')
      },
      {
        path: 'create',
        component: () => import('pages/questions/Create')
      }
    ]
  },
  {
    path: '/questions/:id',
    component: () => import('layouts/Main'),
    children: [
      {
        path: '',
        component: () => import('pages/questions/ShowResults')
      },
      {
        path: 'edit',
        component: () => import('pages/questions/Edit')
      }
    ]
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
