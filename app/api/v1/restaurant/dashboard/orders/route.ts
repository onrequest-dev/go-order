import { decodeJWT } from "@/server/jwt";
import { supabase_server } from "@/server/supabase-server";
import { RestaurantEmployeeJwt } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
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
    const { orderId, newStatus="ready" } = await request.json();
    
    if (!orderId || !newStatus) {
        return NextResponse.json({ error: "Order ID and new status are required" }, { status: 400 });
    }
    const { data, error } = await supabase_server.from("orders").update({ status: newStatus, modified_at: new Date() }).eq("id", orderId).eq("restaurantId", jwt_user.restaurantId).single();
    
    if (error) {
        console.error('Error updating order status:', error);
        return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
    }
    //     if (!data) {
    //     return NextResponse.json({ error: "Order not found or doesn't belong to your restaurant" }, { status: 404 });
    // }
        return NextResponse.json({ 
        status: 200,
        message: "Order status updated successfully",
        data: data
    });
}

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
        .rpc('get_pending_orders', { p_restaurant_id: jwt_user.restaurantId });
    
    if (error) {
        console.error('Error fetching pending orders:', error);
        return NextResponse.json(
            { error: "Failed to fetch pending orders" }, 
            { status: 500 }
        );
    }
    
    return NextResponse.json({ orders: data }, { status: 200 });
}