// app/api/v1/restaurant/order/route.ts

import { supabase_server } from "@/server/supabase-server";
import { Order,} from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const order: Order = await request.json();
    const { data, error } = await supabase_server.rpc('create_order_with_items', {
    p_restaurant_id: order.restaurantId,
    p_table_number: order.tableNumber,
    p_status: order.status,
    p_order_type: order.orderType,
    p_items: order.items.map(item => ({
        menu_item_id: item.menuItemId,
        quantity: item.quantity,
        notes: item.notes || null
    })),
    p_customer_name: order.customerName || null,
    p_customer_phone: order.customerPhone || null,
    p_delivery_address: order.deliveryAddress || null,
    p_note: order.note || null
    });
    if(!data||error){
        console.error('Error creating order:', error);
        return NextResponse.json({ success: false, error: error?.message || 'Failed to create order' }, { status: 500 });
    }
    console.log('Order created with ID:', data);
    return NextResponse.json({ success: true, data: { id: data.id } }, { status: 201 });
}