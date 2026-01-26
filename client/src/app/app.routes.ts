import { Routes } from '@angular/router';
import { Home } from '../features/home/home';
import { MemberList } from '../features/members/member-list/member-list';
import { MemberDetail } from '../features/members/member-detail/member-detail';
import { Lists } from '../features/lists/lists';
import { Messages } from '../features/messages/messages';
import { authGuard } from '../core/guards/auth-guard';
import { TestErrors } from '../features/test-errors/test-errors';
import { NotFound } from '../shared/not-found/not-found';
import { ServerError } from '../shared/server-error/server-error';
import { MemberProfile } from '../features/members/member-profile/member-profile';
import { MemberPhotos } from '../features/members/member-photos/member-photos';
import { MemberMessages } from '../features/members/member-messages/member-messages';
import { memberResolver } from '../features/members/member-resolver';

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
        resolve: {member: memberResolver},
        runGuardsAndResolvers: "always", 
        // Forces guards and resolvers to run on every navigation to this route,
        // even when Angular reuses the same route/component
        children: [
          {
            path: '',
            redirectTo: 'profile',
            pathMatch: 'full',
          },
          {
            path: 'profile',
            component: MemberProfile,
            title: 'Profile',
          },
          {
            path: 'photos',
            component: MemberPhotos,
            title: 'Photos',
          },
          {
            path: 'messages',
            component: MemberMessages,
            title: 'Messages',
          },
        ],
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
  {
    path: 'errors',
    component: TestErrors,
  },

  {
    path: 'server-error',
    component: ServerError,
  },

  {
    path: '**',
    component: NotFound,
    pathMatch: 'full',
  },
];

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
// },,
