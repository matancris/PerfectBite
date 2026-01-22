-- Atomic order creation function to prevent race conditions
-- This function creates an order with items in a single transaction
-- and atomically increments pickup slot and event item quantities

CREATE OR REPLACE FUNCTION create_order_atomic(
  p_business_id UUID,
  p_event_id UUID,
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_customer_email TEXT,
  p_fulfillment_type TEXT,
  p_pickup_slot_id UUID,
  p_notes TEXT,
  p_total_amount DECIMAL,
  p_items JSONB -- Array of {menu_item_id, name, price, quantity, notes}
) RETURNS UUID AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
  v_event_item_id UUID;
  v_current_qty INTEGER;
  v_max_qty INTEGER;
  v_slot_current INTEGER;
  v_slot_max INTEGER;
  v_is_event_slot BOOLEAN;
BEGIN
  -- Validate pickup slot availability if provided
  IF p_pickup_slot_id IS NOT NULL THEN
    -- Check if it's an event slot or regular slot
    v_is_event_slot := p_event_id IS NOT NULL;
    
    IF v_is_event_slot THEN
      SELECT current_orders, max_orders INTO v_slot_current, v_slot_max
      FROM event_pickup_slots
      WHERE id = p_pickup_slot_id
      FOR UPDATE; -- Lock the row
      
      IF v_slot_current >= v_slot_max THEN
        RAISE EXCEPTION 'Pickup slot is full' USING ERRCODE = 'P0001';
      END IF;
    ELSE
      SELECT current_orders, max_orders INTO v_slot_current, v_slot_max
      FROM pickup_slots
      WHERE id = p_pickup_slot_id
      FOR UPDATE; -- Lock the row
      
      IF v_slot_max IS NOT NULL AND v_slot_current >= v_slot_max THEN
        RAISE EXCEPTION 'Pickup slot is full' USING ERRCODE = 'P0001';
      END IF;
    END IF;
  END IF;

  -- Validate event item availability and lock rows
  IF p_event_id IS NOT NULL THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
      SELECT ei.id, ei.current_quantity, ei.max_quantity 
      INTO v_event_item_id, v_current_qty, v_max_qty
      FROM event_items ei
      WHERE ei.event_id = p_event_id 
        AND ei.menu_item_id = (v_item->>'menu_item_id')::UUID
      FOR UPDATE; -- Lock the row
      
      IF v_event_item_id IS NOT NULL AND v_max_qty IS NOT NULL THEN
        IF v_current_qty + (v_item->>'quantity')::INTEGER > v_max_qty THEN
          RAISE EXCEPTION 'Item % is out of stock. Only % remaining.', 
            v_item->>'name', 
            v_max_qty - v_current_qty
          USING ERRCODE = 'P0002';
        END IF;
      END IF;
    END LOOP;
  END IF;

  -- Create the order
  INSERT INTO orders (
    business_id,
    event_id,
    customer_name,
    customer_phone,
    customer_email,
    fulfillment_type,
    pickup_slot_id,
    notes,
    status,
    total_amount
  ) VALUES (
    p_business_id,
    p_event_id,
    p_customer_name,
    p_customer_phone,
    p_customer_email,
    p_fulfillment_type,
    p_pickup_slot_id,
    p_notes,
    'pending',
    p_total_amount
  ) RETURNING id INTO v_order_id;

  -- Create order items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO order_items (
      order_id,
      menu_item_id,
      name,
      price,
      quantity,
      notes
    ) VALUES (
      v_order_id,
      (v_item->>'menu_item_id')::UUID,
      v_item->>'name',
      (v_item->>'price')::DECIMAL,
      (v_item->>'quantity')::INTEGER,
      v_item->>'notes'
    );

    -- Increment event item quantity if this is an event order
    IF p_event_id IS NOT NULL THEN
      UPDATE event_items
      SET current_quantity = current_quantity + (v_item->>'quantity')::INTEGER
      WHERE event_id = p_event_id 
        AND menu_item_id = (v_item->>'menu_item_id')::UUID;
    END IF;
  END LOOP;

  -- Increment pickup slot order count
  IF p_pickup_slot_id IS NOT NULL THEN
    IF v_is_event_slot THEN
      UPDATE event_pickup_slots
      SET current_orders = current_orders + 1
      WHERE id = p_pickup_slot_id;
    ELSE
      UPDATE pickup_slots
      SET current_orders = current_orders + 1
      WHERE id = p_pickup_slot_id;
    END IF;
  END IF;

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users and anon (for customer orders)
GRANT EXECUTE ON FUNCTION create_order_atomic TO authenticated;
GRANT EXECUTE ON FUNCTION create_order_atomic TO anon;
