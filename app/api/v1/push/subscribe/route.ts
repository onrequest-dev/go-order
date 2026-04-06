// app/api/push/subscribe/route.ts
import { decodeJWT } from '@/server/jwt';
import { supabase_server } from '@/server/supabase-server';
import { RestaurantEmployeeJwt } from '@/types';
import { NextRequest, NextResponse } from 'next/server';

// app/api/push/subscribe/route.ts
export async function POST(request: NextRequest) {
  try {
    const { subscription } = await request.json();
    const jwt = request.cookies.get("jwt")?.value;
    
    if (!jwt) {
        return NextResponse.json({ error: "Unauthorized - No token provided" }, { status: 401 });
    }
    
    const jwt_user = decodeJWT(jwt) as RestaurantEmployeeJwt | null;
    if (!jwt_user || typeof jwt_user === "string" ) {
        return NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 });
    }
    
    if (jwt_user.role !== 'admin' && jwt_user.role !== 'manager') {
        return NextResponse.json({ error: "Forbidden - Insufficient permissions" }, { status: 403 });
    }
    
    
    const {  error } = await supabase_server
      .from('push_subscriptions')
      .upsert({
        subscription: subscription,
        restaurant_id: jwt_user.restaurantId,
        user_id: jwt_user.device_id,
        active: true,
        updated_at: new Date()
      }, {
        onConflict: 'user_id', 
        ignoreDuplicates: false
      });
    
    if (error) {
      console.error('Upsert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Subscribed successfully' 
    });
    
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ 
      error: 'Failed to subscribe' 
    }, { status: 500 });
  }
}