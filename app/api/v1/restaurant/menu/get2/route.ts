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
    if (!jwt_user || typeof jwt_user === "string" ) {
        return NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 });
    }
    
    
    if (jwt_user.role !== 'admin' && jwt_user.role !== 'manager') {
        return NextResponse.json({ error: "Forbidden - Insufficient permissions" }, { status: 403 });
    }
    const restaurantId = jwt_user.restaurantId;
    const { data, error } = await supabase_server.rpc('get_restaurant_by_id', {
      p_restaurant_id:  restaurantId.trim().toLowerCase()
    });
    if (error){
        return NextResponse.json({ error: "Failed to fetch restaurant data" }, { status: 500 });
    }
    return NextResponse.json({ 
        status: 200,
        data: data
    });
}



    