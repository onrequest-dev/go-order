
import { supabase_server } from "@/server/supabase-server";
import { MenuItem } from "@/types";
import { NextRequest, NextResponse } from "next/server";

// ✅ GET method
export async function GET(request: NextRequest) {
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const isActive = searchParams.get("isActive");
    const restaurantId = searchParams.get("restaurantId");
    
    if (!restaurantId) {
        return NextResponse.json({ error: "restaurantId query parameter is required" }, { status: 400 });
    }
    
    let query = supabase_server
        .from("menu_items")
        .select("*")
        .eq("restaurant_id", restaurantId);
    
    if (category) {
        query = query.eq("category", category);
    }
    
    if (isActive !== null) {
        query = query.eq("is_active", isActive === "true");
    }
    
    const { data, error } = await query.order("created_at", { ascending: false });
    
    if (error) {
        console.error("Supabase fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch menu items" }, { status: 500 });
    }
    
    const menuItems: MenuItem[] = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description || "",
        price: item.price,
        image: item.image_link || "",
        isActive: item.is_active,
        category: item.category || undefined,
        preparationTime: item.preparationTime || undefined
    }));
    
    return NextResponse.json({ 
        status: 200,
        data: menuItems
    });
}