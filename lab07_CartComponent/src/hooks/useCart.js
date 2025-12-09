import { useMemo, useState, useCallback } from 'react';

const useCart = (initial = [], options = {}) => {
  const { apiUrl = '/api/cart', authToken = null } = options;
  const [items, setItems] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync with backend
  const syncWithBackend = useCallback(async () => {
    if (!authToken) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch cart');

      const data = await response.json();
      setItems(data.items || data || []);
    } catch (err) {
      setError(err.message);
      console.error('Cart sync error:', err);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, authToken]);

  // Validate apartment availability
  const validateItem = useCallback(async (apartmentId, mode) => {
    if (!authToken) return { valid: true };

    try {
      const response = await fetch(`/api/apartments/${apartmentId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to validate apartment');

      const apartment = await response.json();

      // Check availability based on mode
      if (mode === 'rent' && !apartment.isListedForRent) {
        return { valid: false, reason: 'Apartment is not available for rent' };
      }

      if (mode === 'buy' && !apartment.isListedForSale) {
        return { valid: false, reason: 'Apartment is not available for sale' };
      }

      if (!['vacant', 'for_rent', 'for_sale'].includes(apartment.status)) {
        return { valid: false, reason: `Apartment is ${apartment.status}` };
      }

      return { valid: true, apartment };
    } catch (err) {
      return { valid: false, reason: err.message };
    }
  }, [authToken]);

  // Calculate detailed totals including deposit and maintenance
  const calculateTotal = useCallback((item) => {
    const basePrice = item.price || 0;
    const months = item.months || 1;

    let subtotal = 0;
    let deposit = 0;
    let maintenance = 0;

    if (item.mode === 'rent') {
      subtotal = basePrice * months;
      deposit = item.deposit || (basePrice * 2); // 2 months deposit
      maintenance = (item.maintenanceFee || 0) * months;
    } else {
      subtotal = basePrice;
      deposit = 0;
      maintenance = (item.maintenanceFee || 0) * 12; // Annual maintenance
    }

    const total = subtotal + deposit + maintenance;

    return {
      subtotal,
      deposit,
      maintenance,
      total,
      breakdown: {
        basePrice,
        months,
        mode: item.mode
      }
    };
  }, []);

  // Add item with backend sync
  const addItem = useCallback(async (item) => {
    // Validate first
    const validation = await validateItem(item.apartmentId, item.mode);
    if (!validation.valid) {
      setError(validation.reason);
      return { success: false, error: validation.reason };
    }

    // Update local state
    setItems((prev) => {
      const exists = prev.find((p) => p.apartmentId === item.apartmentId && p.mode === item.mode);
      if (exists) {
        return prev.map((p) =>
          p.apartmentId === item.apartmentId && p.mode === item.mode
            ? { ...p, ...item }
            : p
        );
      }
      return [...prev, { ...item, id: item.id || Date.now(), selected: true }];
    });

    // Sync with backend if available
    if (authToken) {
      try {
        const response = await fetch(`${apiUrl}/add`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(item)
        });

        if (!response.ok) throw new Error('Failed to add item to cart');

        const data = await response.json();

        // Update with server response (includes ID)
        setItems((prev) => prev.map((p) =>
          p.apartmentId === item.apartmentId && p.mode === item.mode
            ? { ...p, ...data.item }
            : p
        ));

        return { success: true, item: data.item };
      } catch (err) {
        setError(err.message);
        return { success: false, error: err.message };
      }
    }

    return { success: true, item };
  }, [authToken, apiUrl, validateItem]);

  // Update item with backend sync
  const updateItem = useCallback(async (id, patch) => {
    setItems((prev) => prev.map((p) => p.id === id ? { ...p, ...patch } : p));

    if (authToken) {
      try {
        await fetch(`${apiUrl}/${id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(patch)
        });
      } catch (err) {
        setError(err.message);
      }
    }
  }, [authToken, apiUrl]);

  // Remove item with backend sync
  const removeItem = useCallback(async (id) => {
    setItems((prev) => prev.filter((p) => p.id !== id));

    if (authToken) {
      try {
        await fetch(`${apiUrl}/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (err) {
        setError(err.message);
      }
    }
  }, [authToken, apiUrl]);

  const toggleSelect = useCallback((id) => {
    setItems((prev) => prev.map((p) => p.id === id ? { ...p, selected: !p.selected } : p));
  }, []);

  const selectAll = useCallback((value = true) => {
    setItems((prev) => prev.map((p) => ({ ...p, selected: value })));
  }, []);

  const clear = useCallback(async () => {
    setItems([]);

    if (authToken) {
      try {
        await fetch(`${apiUrl}/clear`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (err) {
        setError(err.message);
      }
    }
  }, [authToken, apiUrl]);

  // Enhanced totals with deposit and maintenance
  const totals = useMemo(() => {
    let rent = 0, buy = 0, count = 0;
    let depositTotal = 0, maintenanceTotal = 0;

    items.forEach((item) => {
      if (item.selected) {
        count += 1;
        const calculation = calculateTotal(item);

        if (item.mode === 'rent') {
          rent += calculation.subtotal;
        } else {
          buy += calculation.subtotal;
        }

        depositTotal += calculation.deposit;
        maintenanceTotal += calculation.maintenance;
      }
    });

    const grandTotal = rent + buy + depositTotal + maintenanceTotal;

    return {
      rentTotal: rent,
      buyTotal: buy,
      depositTotal,
      maintenanceTotal,
      grandTotal,
      selectedCount: count
    };
  }, [items, calculateTotal]);

  return {
    items,
    addItem,
    updateItem,
    removeItem,
    toggleSelect,
    selectAll,
    clear,
    syncWithBackend,
    validateItem,
    calculateTotal,
    totals,
    loading,
    error
  };
};

export default useCart;
