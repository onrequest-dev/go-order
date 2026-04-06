import { decodeJWT } from "@/server/jwt";
import { supabase_server } from "@/server/supabase-server";
import { RestaurantEmployeeJwt } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const jwt = request.cookies.get("jwt")?.value;
    if (!jwt) {
        return NextResponse.json({ error: "Unauthorized - No token provided" }, { status: 401 });
    }
    
    const jwt_user = decodeJWT(jwt) as RestaurantEmployeeJwt | null;
    if (!jwt_user || typeof jwt_user === "string") {
        return NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 });
    }
    
    if (jwt_user.role !== 'admin' && jwt_user.role !== 'manager') {
        return NextResponse.json({ error: "Forbidden - Insufficient permissions" }, { status: 403 });
    }
    
    // استدعاء RPC مع تمرير restaurantId من JWT
    const { data, error } = await supabase_server
        .rpc('get_ready_orders', { p_restaurant_id: jwt_user.restaurantId });
    
    if (error) {
        console.error('Error fetching ready orders:', error);
        return NextResponse.json(
            { error: "Failed to fetch ready orders" }, 
            { status: 500 }
        );
    }
    
    return NextResponse.json({ orders: data }, { status: 200 });
}