import { Routes } from '@angular/router';
import { Home } from '../features/home/home';
import { MemberList } from '../features/members/member-list/member-list';
import { MemberDetail } from '../features/members/member-detail/member-detail';
import { Lists } from '../features/lists/lists';
import { Messages } from '../features/messages/messages';
import { authGuard } from '../core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [authGuard],
    children: [
      {
        path: 'members',
        component: MemberList,
        canActivate: [authGuard],
      },
      {
        path: 'members/:id',
        component: MemberDetail,
        canActivate: [authGuard],
      },
      {
        path: 'lists',
        component: Lists,
        canActivate: [authGuard],
      },
      {
        path: 'messages',
        component: Messages,
        canActivate: [authGuard],
      },
    ],
  },
  // {
  //   path: 'members',
  //   component: MemberList,
  //   canActivate: [authGuard],
  // },
  // {
  //   path: 'members/:id',
  //   component: MemberDetail,
  //   canActivate: [authGuard],
  // },
  // {
  //   path: 'lists',
  //   component: Lists,
  //   canActivate: [authGuard],
  // },
  // {
  //   path: 'messages',
  //   component: Messages,
  //   canActivate: [authGuard],
  // },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
