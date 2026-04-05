import { decodeJWT } from "@/server/jwt";
import { supabase_server } from "@/server/supabase-server";
import { Restaurant, RestaurantEmployeeJwt } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
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
    const returantId = jwt_user.restaurantId;
    const requestBody :Omit<Restaurant, 'menu' | 'averagePreparationTime'> = await request.json();
    if(returantId !== requestBody.id){
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const resturantData = {
        name: requestBody.name,
        address: requestBody.address,
        phone: requestBody.phone,
        primary_color: requestBody.primaryColor,
        number_of_tables: requestBody.numberOfTables,
        categories: requestBody.categories,
        logo_link : requestBody.logo,
        currency : requestBody.currency,
        service_fee : requestBody.serviceFee,
        isActive : requestBody.isActive || true
    }
    const {data,error} = await supabase_server.from("restaurants").update(resturantData).eq("id", returantId).select().single();
    if(error){
        console.error("Supabase error:", error);
        return NextResponse.json({ error: "Failed to update restaurant" }, { status: 500 });
    }
    return NextResponse.json({ message: "Restaurant updated successfully", data });

}

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
    const returantId = jwt_user.restaurantId;
    const {data,error} = await supabase_server.from("restaurants").select("*").eq("id", returantId).single();
    if(error){
        console.error("Supabase error:", error);
        return NextResponse.json({ error: "Failed to fetch restaurant data" }, { status: 500 });
    }
    return NextResponse.json({ data });
}