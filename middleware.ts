import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher(['/', '/products(.*)', '/about']);
const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware((auth, req) => {
  // console.log(auth().userId);
  
  // Restrict the dashboard page for the admin user we alreadu set in .env
  const isAdminUser = auth().userId === process.env.ADMIN_USER_ID
  // console.log('testing kung anu ung isAdminUser', !isAdminUser);
  
  if(isAdminRoute(req) && !isAdminUser) {
    console.log('testing kung anu ung isAdminUser', !isAdminUser);
    return NextResponse.redirect(new URL('/', req.url))
  }


  if (!isPublicRoute(req)) auth().protect();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};