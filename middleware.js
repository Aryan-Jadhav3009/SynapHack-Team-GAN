// middleware.js

import { NextResponse } from "next/server";

// This middleware does nothing, it just passes the request through
export function middleware(request) {
  return NextResponse.next();
}
