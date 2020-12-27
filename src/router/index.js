import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/* Router Modules */
// import componentsRouter from './modules/components'
// import chartsRouter from './modules/charts'
// import tableRouter from './modules/table'
// import nestedRouter from './modules/nested'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/cate',
    component: Layout,
    redirect: '/cate/main-cate',
    name: '分类',
    meta: {
      title: '分类管理',
      icon: 'component'
    },
    children: [
      {
        path: 'main-cate',
        component: () => import('@/views/cate/main-cate'),
        name: '主分类',
        meta: { title: '主分类管理', icon: 'list' }
      },
      {
        path: 'sub-cate',
        component: () => import('@/views/cate/sub-cate'),
        name: '次分类',
        meta: { title: '次分类管理', icon: 'nested' }
      }
    ]
  },
  {
    path: '/post',
    component: Layout,
    redirect: '/post/post',
    name: '帖子管理',
    meta: {
      title: '帖子管理',
      icon: 'guide'
    },
    children: [
      {
        path: 'post',
        component: () => import('@/views/post/post'),
        name: '帖子',
        meta: { title: '帖子列表', icon: 'form', noCache: true }
      },
      {
        path: 'comment',
        component: () => import('@/views/post/comment'),
        name: '评论',
        meta: { title: '评论管理', icon: 'message', noCache: true }
      },
      {
        path: 'reply',
        component: () => import('@/views/post/reply'),
        name: '回复',
        meta: { title: '回复管理', icon: 'message', noCache: true }
      }
    ]
  },
  {
    path: '/profile',
    component: Layout,
    redirect: '/profile/index',
    hidden: true,
    children: [
      {
        path: 'index',
        component: () => import('@/views/profile/index'),
        name: '个人信息',
        meta: { title: '个人信息', icon: 'user', noCache: true }
      }
    ]
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  {
    path: '/user',
    component: Layout,
    name: '用户管理',
    meta: {
      title: '用户管理',
      icon: 'peoples'
    },
    redirect: '/user/user',
    children: [
      {
        path: 'user',
        component: () => import('@/views/user/user'),
        name: '用户',
        meta: { title: '用户列表', icon: 'peoples', noCache: true }
      },
      {
        path: 'feedback',
        component: () => import('@/views/user/feedback'),
        name: '反馈',
        meta: { title: '反馈列表', icon: 'bug', noCache: true }
      }
    ]
  },

  {
    path: '/admin',
    component: Layout,
    children: [
      {
        path: 'index',
        component: () => import('@/views/admin/index'),
        name: '管理员',
        meta: { title: '管理员管理', icon: 'user', roles: ['admin'] }
      }
    ]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
