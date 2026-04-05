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
    
    
    // التحقق من وجود اشتراك سابق
    const { data: existing } = await supabase_server
      .from('push_subscriptions')
      .select('id')
      .eq('user_id', jwt_user.id)
      .eq('restaurant_id', jwt_user.restaurantId)
      .single();
    
    let result;
    
    if (existing) {
      // تحديث الاشتراك الموجود
      result = await supabase_server
        .from('push_subscriptions')
        .update({
          subscription: subscription,
          active: true,
          updated_at: new Date()
        })
        .eq('id', existing.id);
    } else {
      // إدراج اشتراك جديد
      result = await supabase_server
        .from('push_subscriptions')
        .insert({
          subscription: subscription,
          restaurant_id: jwt_user.restaurantId,
          user_id: jwt_user.id,
          active: true,
          created_at: new Date(),
          updated_at: new Date()
        });
    }
    
    if (result.error) {
      throw result.error;
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}