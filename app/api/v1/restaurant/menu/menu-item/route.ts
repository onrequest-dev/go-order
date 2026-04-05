import { decodeJWT } from "@/server/jwt";
import { supabase_server } from "@/server/supabase-server";
import { MenuItem, RestaurantEmployeeJwt } from "@/types";
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
    
    let menuItem: MenuItem;
    try {
        menuItem = await request.json();
    } catch (error) {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    
    if (!menuItem.name || !menuItem.name.trim()) {
        return NextResponse.json({ error: "Menu item name is required" }, { status: 400 });
    }
    
    if (!menuItem.price || menuItem.price <= 0) {
        return NextResponse.json({ error: "Valid price is required" }, { status: 400 });
    }
    
    if (!menuItem.category || !menuItem.category.trim()) {
        return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }
    
    const supabaseData = {
        restaurant_id: jwt_user.restaurantId, // ✅ تم التصحيح
        name: menuItem.name.trim(),
        description: menuItem.description || null,
        price: menuItem.price,
        image_link: menuItem.image || null,
        is_active: menuItem.isActive !== undefined ? menuItem.isActive : true,
        category: menuItem.category,
        preparationTime: menuItem.preparationTime || null
    };
    
    const { data, error } = await supabase_server
        .from("menu_items")
        .insert([supabaseData])
        .select()
        .single();
    
    if (error) {
        console.error("Supabase error:", error);
        
        if (error.code === '23503') {
            return NextResponse.json({ 
                error: "Restaurant not found or invalid" 
            }, { status: 404 });
        }
        
        if (error.code === '23505') {
            return NextResponse.json({ 
                error: "Menu item already exists" 
            }, { status: 409 });
        }
        
        if (error.code === '22001') {
            return NextResponse.json({ 
                error: "One or more fields exceed maximum length" 
            }, { status: 400 });
        }
        
        return NextResponse.json({ 
            error: "Failed to create menu item",
            details: error.message
        }, { status: 500 });
    }
    
    if (!data) {
        return NextResponse.json({ 
            error: "Failed to create menu item - No data returned" 
        }, { status: 500 });
    }
    
    const createdMenuItem: MenuItem = {
        id: data.id,
        name: data.name,
        description: data.description || "",
        price: data.price,
        image: data.image_link || "",
        isActive: data.is_active,
        category: data.category || undefined,
        preparationTime: data.preparationTime || undefined
    };
    
    return NextResponse.json({ 
        status: 200,
        message: "Menu item created successfully",
        data: createdMenuItem
    });
}

// ✅ PUT method
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
    
    let menuItem: Partial<MenuItem> & { id: string };
    try {
        menuItem = await request.json();
    } catch (error) {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    
    if (!menuItem.id) {
        return NextResponse.json({ error: "Menu item ID is required" }, { status: 400 });
    }
    
    // ✅ تم التصحيح من resturant_id إلى restaurant_id
    const { data: existingItem, error: checkError } = await supabase_server
        .from("menu_items")
        .select("restaurant_id")
        .eq("id", menuItem.id)
        .single();
    
    if (checkError || !existingItem) {
        return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }
    
    if (existingItem.restaurant_id !== jwt_user.restaurantId) {
        return NextResponse.json({ error: "Forbidden - Item doesn't belong to your restaurant" }, { status: 403 });
    }
    
    const updateData: any = {};
    if (menuItem.name !== undefined) updateData.name = menuItem.name.trim();
    if (menuItem.description !== undefined) updateData.description = menuItem.description;
    if (menuItem.price !== undefined) updateData.price = menuItem.price;
    if (menuItem.image !== undefined) updateData.image_link = menuItem.image;
    if (menuItem.isActive !== undefined) updateData.is_active = menuItem.isActive;
    if (menuItem.category !== undefined) updateData.category = menuItem.category;
    if (menuItem.preparationTime !== undefined) updateData.preparationTime = menuItem.preparationTime;
    
    const { data, error } = await supabase_server
        .from("menu_items")
        .update(updateData)
        .eq("id", menuItem.id)
        .select()
        .single();
    
    if (error) {
        console.error("Supabase update error:", error);
        return NextResponse.json({ error: "Failed to update menu item" }, { status: 500 });
    }
    
    const updatedMenuItem: MenuItem = {
        id: data.id,
        name: data.name,
        description: data.description || "",
        price: data.price,
        image: data.image_link || "",
        isActive: data.is_active,
        category: data.category || undefined,
        preparationTime: data.preparationTime || undefined
    };
    
    return NextResponse.json({ 
        status: 200,
        message: "Menu item updated successfully",
        data: updatedMenuItem
    });
}

// ✅ DELETE method
export async function DELETE(request: NextRequest) {
    const jwt = request.cookies.get("jwt")?.value;
    
    if (!jwt) {
        return NextResponse.json({ error: "Unauthorized - No token provided" }, { status: 401 });
    }
    
    const jwt_user = decodeJWT(jwt) as RestaurantEmployeeJwt | null;
    if (!jwt_user || typeof jwt_user === "string" || !jwt_user.user_name) {
        return NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 });
    }
    
    if (jwt_user.role !== 'admin' && jwt_user.role !== 'manager') {
        return NextResponse.json({ error: "Forbidden - Insufficient permissions" }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("id");
    
    if (!itemId) {
        return NextResponse.json({ error: "Menu item ID is required" }, { status: 400 });
    }
    
    // ✅ تم التصحيح من resturant_id إلى restaurant_id
    const { data: existingItem, error: checkError } = await supabase_server
        .from("menu_items")
        .select("restaurant_id")
        .eq("id", itemId)
        .single();
    
    if (checkError || !existingItem) {
        return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }
    
    if (existingItem.restaurant_id !== jwt_user.restaurantId) {
        return NextResponse.json({ error: "Forbidden - Item doesn't belong to your restaurant" }, { status: 403 });
    }
    
    const { error } = await supabase_server
        .from("menu_items")
        .delete()
        .eq("id", itemId);
    
    if (error) {
        console.error("Supabase delete error:", error);
        return NextResponse.json({ error: "Failed to delete menu item" }, { status: 500 });
    }
    
    return NextResponse.json({ 
        status: 200,
        message: "Menu item deleted successfully"
    });
}
